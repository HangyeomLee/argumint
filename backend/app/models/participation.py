from typing import Optional
from datetime import datetime
from enum import Enum
from sqlmodel import SQLModel, Field

class DebateSide(str, Enum):
    PRO = "PRO"
    CON = "CON"

class DebateParticipation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    topic_id: int = Field(foreign_key="debatetopic.id", index=True)
    side: DebateSide
    joined_at: datetime = Field(default_factory=datetime.utcnow)

    # Unique constraint logic will be handled via application or db migration uniqueness
