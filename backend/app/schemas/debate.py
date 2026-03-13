from pydantic import BaseModel
from datetime import datetime
from app.models.debate import DebateStatus
from app.models.participation import DebateSide

class DebateTopicBase(BaseModel):
    title: str
    description: str
    start_time: datetime
    end_time: datetime

class DebateTopicCreate(DebateTopicBase):
    pass

class DebateTopicRead(DebateTopicBase):
    id: int
    status: DebateStatus
    created_at: datetime

class DebateParticipationRead(BaseModel):
    side: DebateSide
    joined_at: datetime
