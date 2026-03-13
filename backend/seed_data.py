from sqlmodel import Session, select
from app.core.database import engine, create_db_and_tables
from app.models.user import User
from app.models.debate import DebateTopic, DebateStatus
from app.core.security import get_password_hash
from datetime import datetime, timedelta

def create_seed_data():
    create_db_and_tables()
    with Session(engine) as session:
        # Check for user
        user = session.exec(select(User).where(User.username == "testuser")).first()
        if not user:
            user = User(
                username="testuser",
                email="test@example.com",
                hashed_password=get_password_hash("password123"),
            )
            session.add(user)
            print("Created test user")
        
        # Check for active debate
        debate = session.exec(select(DebateTopic).where(DebateTopic.status == DebateStatus.ACTIVE)).first()
        if not debate:
            debate = DebateTopic(
                title="Is AI beneficial for humanity?",
                description="Artificial Intelligence is rapidly advancing. Will it lead to a utopian future or pose existential risks?",
                start_time=datetime.utcnow(),
                end_time=datetime.utcnow() + timedelta(hours=24),
                status=DebateStatus.ACTIVE
            )
            session.add(debate)
            print("Created active debate topic")
        
        session.commit()

if __name__ == "__main__":
    create_seed_data()
