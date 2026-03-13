from sqlmodel import Session, select, func
from app.models.debate import DebateTopic, DebateStatus
from app.models.participation import DebateParticipation, DebateSide
from app.models.post import Post
from app.models.score import UserDebateScore
from app.models.user import User

def finalize_debate(session: Session, debate_id: int):
    debate = session.get(DebateTopic, debate_id)
    if not debate or debate.status != DebateStatus.ACTIVE:
        return None
    
    # Calculate side scores
    pro_likes = session.exec(select(func.sum(Post.upvotes - Post.downvotes)).where(Post.topic_id == debate_id, Post.side == DebateSide.PRO)).one() or 0
    con_likes = session.exec(select(func.sum(Post.upvotes - Post.downvotes)).where(Post.topic_id == debate_id, Post.side == DebateSide.CON)).one() or 0
    
    winning_side = None
    if pro_likes > con_likes:
        winning_side = DebateSide.PRO
    elif con_likes > pro_likes:
        winning_side = DebateSide.CON
    
    # Process users
    participations = session.exec(select(DebateParticipation).where(DebateParticipation.topic_id == debate_id)).all()
    for part in participations:
        # User net votes received on their posts
        user_likes = session.exec(select(func.sum(Post.upvotes - Post.downvotes)).where(Post.topic_id == debate_id, Post.user_id == part.user_id)).one() or 0
        
        win_bonus = 10 if winning_side and part.side == winning_side else 0
        total_points = user_likes + win_bonus
        
        score = UserDebateScore(
            user_id=part.user_id,
            topic_id=debate_id,
            points=total_points,
            like_points=user_likes,
            win_bonus=win_bonus
        )
        session.add(score)
        
        # Update user total score
        user = session.get(User, part.user_id)
        if user:
            user.total_score += total_points
            session.add(user)
    
    debate.status = DebateStatus.CLOSED
    session.add(debate)
    session.commit()
    return winning_side
