from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, func

from app.api import deps
from app.core.database import get_session
from app.models.user import User
from app.models.post import Notification
from app.schemas.user import UserRead

router = APIRouter()

@router.get("/me", response_model=UserRead)
def get_me(current_user: User = Depends(deps.get_current_user)) -> Any:
    return current_user

@router.get("/leaderboard", response_model=List[UserRead])
def get_leaderboard(
    session: Session = Depends(get_session),
    limit: int = 20
) -> Any:
    statement = select(User).order_by(User.total_score.desc()).limit(limit)
    users = session.exec(statement).all()
    return users

@router.get("/notifications", response_model=List[Any])
def get_notifications(
    current_user: User = Depends(deps.get_current_user),
    session: Session = Depends(get_session)
) -> Any:
    # Join with User to get sender username
    statement = select(Notification, User.username).join(
        User, Notification.sender_id == User.id
    ).where(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).limit(20)
    
    results = session.exec(statement).all()
    notifications = []
    for notif, sender_name in results:
        n_data = notif.model_dump()
        n_data["sender_username"] = sender_name
        notifications.append(n_data)
        
    return notifications

@router.post("/notifications/read")
def mark_notifications_read(
    current_user: User = Depends(deps.get_current_user),
    session: Session = Depends(get_session)
) -> Any:
    statement = select(Notification).where(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    )
    notifs = session.exec(statement).all()
    for n in notifs:
        n.is_read = True
        session.add(n)
    session.commit()
    return {"status": "success"}

@router.get("/{username}/profile", response_model=UserRead)
def get_user_profile(
    username: str,
    session: Session = Depends(get_session)
) -> Any:
    statement = select(User).where(User.username == username)
    user = session.exec(statement).first()
    if not user:
        raise HTTPException(status_code=404, detail="User found")
    return user
