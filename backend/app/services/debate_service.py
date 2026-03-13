from sqlmodel import Session, select, func
from app.models.participation import DebateParticipation, DebateSide
from app.models.post import Post

def get_scoreboard_data(session: Session, debate_id: int):
    pro_score = session.exec(select(func.sum(Post.upvotes - Post.downvotes)).where(Post.topic_id == debate_id, Post.side == DebateSide.PRO)).one() or 0
    con_score = session.exec(select(func.sum(Post.upvotes - Post.downvotes)).where(Post.topic_id == debate_id, Post.side == DebateSide.CON)).one() or 0
    pro_count = session.exec(select(func.count(DebateParticipation.id)).where(DebateParticipation.topic_id == debate_id, DebateParticipation.side == DebateSide.PRO)).one() or 0
    con_count = session.exec(select(func.count(DebateParticipation.id)).where(DebateParticipation.topic_id == debate_id, DebateParticipation.side == DebateSide.CON)).one() or 0
    
    return {
        "pro_score": pro_score,
        "con_score": con_score,
        "pro_count": pro_count,
        "con_count": con_count
    }
