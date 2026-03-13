from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.participation import DebateSide
from app.models.post import PostType

class PostBase(BaseModel):
    content: str
    title: Optional[str] = None
    parent_post_id: Optional[int] = None
    type: PostType

class PostCreate(PostBase):
    pass

class PostRead(PostBase):
    id: int
    topic_id: int
    user_id: int
    side: DebateSide
    created_at: datetime
    updated_at: datetime
    upvotes: int
    downvotes: int
    hot_score: float
    username: Optional[str] = None
    author_score: Optional[int] = 0
    user_vote: Optional[int] = None # 1, -1, or None for current user

    class Config:
        from_attributes = True
