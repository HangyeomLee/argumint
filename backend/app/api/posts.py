from typing import Any, List, Optional
import json
from fastapi import APIRouter, Depends, HTTPException, Path, Query
from sqlmodel import Session, select, func

from app.api import deps
from app.core.database import get_session
from app.models.debate import DebateTopic, DebateStatus
from app.models.participation import DebateParticipation
from app.models.post import Post, PostType, Vote, Notification, NotificationType
from app.models.user import User
from app.schemas.post import PostCreate, PostRead
from app.services.websockets import manager
from app.services.debate_service import get_scoreboard_data
from app.services.ranking_service import update_post_scores

router = APIRouter()

@router.get("/{debate_id}/posts", response_model=List[PostRead])
def get_posts(
    debate_id: int = Path(...),
    sort: str = Query("hot"),
    current_user: Optional[User] = Depends(deps.get_current_user_optional),
    session: Session = Depends(get_session)
) -> Any:
    # Basic posts selection
    statement = select(Post, User.username, User.total_score).join(User).where(Post.topic_id == debate_id)
    
    if sort == "hot":
        statement = statement.order_by(Post.hot_score.desc())
    elif sort == "top":
        statement = statement.order_by((Post.upvotes - Post.downvotes).desc())
    else:
        statement = statement.order_by(Post.created_at.desc())
        
    results = session.exec(statement).all()
    
    posts = []
    for post, username, total_score in results:
        p = PostRead.model_validate(post)
        p.username = username
        p.author_score = total_score
        
        # Check current user's vote
        if current_user:
            vote_statement = select(Vote).where(
                Vote.post_id == post.id,
                Vote.user_id == current_user.id
            )
            user_vote = session.exec(vote_statement).first()
            if user_vote:
                p.user_vote = user_vote.value
                
        posts.append(p)
    
    return posts

@router.post("/{debate_id}/posts", response_model=PostRead)
async def create_post(
    post_in: PostCreate,
    debate_id: int = Path(...),
    current_user: User = Depends(deps.get_current_user),
    session: Session = Depends(get_session)
) -> Any:
    # Validate topic active
    topic = session.get(DebateTopic, debate_id)
    if not topic or topic.status != DebateStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="Debate is not active")
    
    # Validate participation side
    statement = select(DebateParticipation).where(
        DebateParticipation.user_id == current_user.id,
        DebateParticipation.topic_id == debate_id
    )
    participation = session.exec(statement).first()
    if not participation:
        raise HTTPException(status_code=400, detail="You must join the debate first")
    
    # Validate parent post if exists
    parent = None
    if post_in.parent_post_id:
        parent = session.get(Post, post_in.parent_post_id)
        if not parent:
            raise HTTPException(status_code=404, detail="Parent post not found")
        if parent.topic_id != debate_id:
             raise HTTPException(status_code=400, detail="Parent post belongs to another debate")
    
    post = Post(
        topic_id=debate_id,
        user_id=current_user.id,
        side=participation.side,
        **post_in.model_dump()
    )
    session.add(post)
    session.commit()
    session.refresh(post)
    
    # Create notification for parent author if it's a rebuttal
    if parent:
        notif = Notification(
            user_id=parent.user_id,
            type=NotificationType.REPLY,
            sender_id=current_user.id,
            post_id=post.id
        )
        session.add(notif)
        session.commit()
    
    # Prepare response with username
    p_read = PostRead.model_validate(post)
    p_read.username = current_user.username
    
    # Broadcast
    event = {
        "type": "post_created",
        "payload": json.loads(p_read.model_dump_json())
    }
    await manager.broadcast(debate_id, json.dumps(event))
    
    return p_read

@router.post("/{debate_id}/posts/{post_id}/vote")
async def vote_post(
    value: int = Query(..., ge=-1, le=1),
    debate_id: int = Path(...),
    post_id: int = Path(...),
    current_user: User = Depends(deps.get_current_user),
    session: Session = Depends(get_session)
) -> Any:
    post = session.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Author of the post
    author = session.get(User, post.user_id)
    
    # Check if already voted
    statement = select(Vote).where(
        Vote.user_id == current_user.id,
        Vote.post_id == post_id
    )
    existing_vote = session.exec(statement).first()
    
    score_delta = 0 # How much to change author's total_score
    
    if existing_vote:
        # Remove old vote effect from author
        if existing_vote.value == 1:
            post.upvotes -= 1
            score_delta -= 5 # Remove upvote bonus
        else:
            post.downvotes -= 1
            score_delta += 2 # Remove downvote penalty
            
        if existing_vote.value == value:
            session.delete(existing_vote)
            action = "removed"
        else:
            old_val = existing_vote.value
            existing_vote.value = value
            if value == 1:
                post.upvotes += 1
                score_delta += 5
                # Create notification if changed to upvote
                notif = Notification(
                    user_id=author.id,
                    type=NotificationType.VOTE,
                    sender_id=current_user.id,
                    post_id=post.id
                )
                session.add(notif)
            elif value == -1:
                post.downvotes += 1
                score_delta -= 2
            session.add(existing_vote)
            action = "changed"
    else:
        if value != 0:
            new_vote = Vote(user_id=current_user.id, post_id=post_id, value=value)
            session.add(new_vote)
            if value == 1:
                post.upvotes += 1
                score_delta += 5
                # Create notification for upvote
                notif = Notification(
                    user_id=author.id,
                    type=NotificationType.VOTE,
                    sender_id=current_user.id,
                    post_id=post.id
                )
                session.add(notif)
            elif value == -1:
                post.downvotes += 1
                score_delta -= 2
            action = "added"
        else:
            action = "none"

    # Update author's reputation
    if author and score_delta != 0:
        author.total_score += score_delta
        session.add(author)

    session.add(post)
    session.commit()
    
    # Update ranking score
    update_post_scores(session, post.id)
    
    # Broadcast Vote Update
    event = {
        "type": "post_voted",
        "payload": {
            "post_id": post_id,
            "upvotes": post.upvotes,
            "downvotes": post.downvotes,
            "score_delta": score_delta,
            "author_id": post.user_id
        }
    }
    await manager.broadcast(debate_id, json.dumps(event))
    
    # Broadcast Live Activity
    activity = {
        "type": "live_activity",
        "payload": {
            "username": current_user.username,
            "action": "upvoted" if value == 1 else "downvoted" if value == -1 else "removed vote from",
            "target": f"{author.username}'s post"
        }
    }
    await manager.broadcast(debate_id, json.dumps(activity))
    
    return {"action": action, "upvotes": post.upvotes, "downvotes": post.downvotes}
