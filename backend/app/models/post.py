from typing import Optional
from datetime import datetime
from enum import Enum
from sqlmodel import SQLModel, Field
from app.models.participation import DebateSide

class PostType(str, Enum):
    ARGUMENT = "argument"
    REBUTTAL = "rebuttal"

class Post(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    topic_id: int = Field(foreign_key="debatetopic.id", index=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    parent_post_id: Optional[int] = Field(default=None, foreign_key="post.id", index=True)
    side: DebateSide
    type: PostType
    title: Optional[str] = None
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    upvotes: int = Field(default=0)
    downvotes: int = Field(default=0)
    hot_score: float = Field(default=0.0, index=True)

class Vote(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    post_id: int = Field(foreign_key="post.id", index=True)
    value: int = Field(default=1) # 1 for upvote, -1 for downvote
    created_at: datetime = Field(default_factory=datetime.utcnow)

class NotificationType(str, Enum):
    REPLY = "reply"
    VOTE = "vote"
    MENTION = "mention"

class Notification(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    type: NotificationType
    sender_id: int = Field(foreign_key="user.id")
    post_id: Optional[int] = Field(default=None, foreign_key="post.id")
    is_read: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Bookmark(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    post_id: int = Field(foreign_key="post.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
