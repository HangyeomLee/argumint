from datetime import datetime, timedelta
from sqlmodel import Session, select, func
from app.models.post import Post

def calculate_hot_score(upvotes: int, downvotes: int, created_at: datetime) -> float:
    score = upvotes - downvotes
    # Hours since post (min 0.1 to avoid division by zero/very small numbers)
    hours_since = max(0.1, (datetime.utcnow() - created_at).total_seconds() / 3600)
    # Hot ranking formula: score / (hours + 2)^1.5
    return score / pow(hours_since + 2, 1.5)

def update_post_scores(session: Session, post_id: int):
    post = session.get(Post, post_id)
    if post:
        post.hot_score = calculate_hot_score(post.upvotes, post.downvotes, post.created_at)
        session.add(post)
        session.commit()

def get_sorted_posts(session: Session, topic_id: int, sort: str = "hot"):
    statement = select(Post).where(Post.topic_id == topic_id)
    
    if sort == "hot":
        statement = statement.order_by(Post.hot_score.desc())
    elif sort == "top":
        statement = statement.order_by((Post.upvotes - Post.downvotes).desc())
    elif sort == "new":
        statement = statement.order_by(Post.created_at.desc())
    elif sort == "debated":
        # Sort by rebuttal count (simplified: just showing basic sort here)
        statement = statement.order_by(Post.created_at.desc())
        
    return session.exec(statement).all()
