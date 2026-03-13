from typing import Any, List
import json
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from datetime import datetime

from app.api import deps
from app.core.database import get_session
from app.models.debate import DebateTopic, DebateStatus
from app.models.participation import DebateParticipation, DebateSide
from app.models.user import User
from app.schemas.debate import DebateTopicRead, DebateParticipationRead
from app.schemas.scoreboard import ScoreboardRead
from app.services.websockets import manager
from app.services.debate_service import get_scoreboard_data

router = APIRouter()

@router.get("/active", response_model=DebateTopicRead)
def get_active_debate(
    session: Session = Depends(get_session)
) -> Any:
    statement = select(DebateTopic).where(DebateTopic.status == DebateStatus.ACTIVE)
    debate = session.exec(statement).first()
    if not debate:
        raise HTTPException(status_code=404, detail="No active debate found")
    return debate

@router.get("/history", response_model=List[DebateTopicRead])
def get_history(
    session: Session = Depends(get_session)
) -> Any:
    statement = select(DebateTopic).where(DebateTopic.status == DebateStatus.CLOSED).order_by(DebateTopic.end_time.desc())
    debates = session.exec(statement).all()
    return debates

@router.get("/{debate_id}/scoreboard", response_model=ScoreboardRead)
def get_scoreboard(
    debate_id: int,
    session: Session = Depends(get_session)
) -> Any:
    return get_scoreboard_data(session, debate_id)

@router.post("/{debate_id}/join", response_model=DebateParticipationRead)
async def join_debate(
    debate_id: int,
    side: DebateSide = Query(...),
    current_user: User = Depends(deps.get_current_user),
    session: Session = Depends(get_session)
) -> Any:
    debate = session.get(DebateTopic, debate_id)
    if not debate:
        raise HTTPException(status_code=404, detail="Debate not found")
    
    # Check if already joined
    statement = select(DebateParticipation).where(
        DebateParticipation.user_id == current_user.id,
        DebateParticipation.topic_id == debate_id
    )
    existing_participation = session.exec(statement).first()
    if existing_participation:
        raise HTTPException(status_code=400, detail="Already joined this debate")

    participation = DebateParticipation(
        user_id=current_user.id,
        topic_id=debate_id,
        side=side
    )
    session.add(participation)
    session.commit()
    session.refresh(participation)
    
    # Broadcast scoreboard update
    sb = get_scoreboard_data(session, debate_id)
    event = {
        "type": "scoreboard_updated",
        "payload": sb
    }
    await manager.broadcast(debate_id, json.dumps(event))
    
    return participation

@router.get("/{debate_id}/participation", response_model=DebateParticipationRead)
def get_participation(
    debate_id: int,
    current_user: User = Depends(deps.get_current_user),
    session: Session = Depends(get_session)
) -> Any:
    statement = select(DebateParticipation).where(
        DebateParticipation.user_id == current_user.id,
        DebateParticipation.topic_id == debate_id
    )
    participation = session.exec(statement).first()
    if not participation:
         raise HTTPException(status_code=404, detail="Not participating")
    return participation
