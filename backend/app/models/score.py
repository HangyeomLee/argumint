from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field

class UserDebateScore(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    topic_id: int = Field(foreign_key="debatetopic.id", index=True)
    points: int
    like_points: int
    win_bonus: int
    created_at: datetime = Field(default_factory=datetime.utcnow)
