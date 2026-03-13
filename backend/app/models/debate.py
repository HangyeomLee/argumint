from typing import Optional
from datetime import datetime
from enum import Enum
from sqlmodel import SQLModel, Field

class DebateStatus(str, Enum):
    SCHEDULED = "scheduled"
    ACTIVE = "active"
    CLOSED = "closed"

class DebateTopic(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: str
    start_time: datetime
    end_time: datetime
    status: DebateStatus = Field(default=DebateStatus.SCHEDULED)
    created_at: datetime = Field(default_factory=datetime.utcnow)
