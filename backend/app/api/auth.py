import logging
from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select

from app.api import deps
from app.core import security
from app.core.config import settings
from app.core.database import get_session
from app.models.user import User
from app.schemas.auth import Token
from app.schemas.user import UserCreate, UserRead

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/login", response_model=Token)
def login_access_token(
    session: Session = Depends(get_session), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    # OAuth2PasswordRequestForm expects username field, but we treat it as email
    statement = select(User).where(User.email == form_data.username)
    user = session.exec(statement).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        user.id, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register", response_model=UserRead)
def register_user(
    *,
    session: Session = Depends(get_session),
    user_in: UserCreate,
) -> Any:
    logger.info(f"Register attempt: username={user_in.username}, email={user_in.email}")
    statement = select(User).where(User.email == user_in.email)
    existing_user = session.exec(statement).first()
    if existing_user:
        logger.warning(f"Registration failed: User with email {user_in.email} already exists")
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system",
        )
    statement = select(User).where(User.username == user_in.username)
    existing_username = session.exec(statement).first()
    if existing_username:
        logger.warning(f"Registration failed: User with username {user_in.username} already exists")
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system",
        )
    
    try:
        user = User(
            username=user_in.username,
            email=user_in.email,
            hashed_password=security.get_password_hash(user_in.password),
        )
        session.add(user)
        session.commit()
        session.refresh(user)
        logger.info(f"Registration successful: user_id={user.id}")
        return user
    except Exception as e:
        logger.error(f"Unexpected error during registration: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Registration failed due to server error: {str(e)}"
        )

@router.get("/me", response_model=UserRead)
def read_users_me(
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    return current_user
