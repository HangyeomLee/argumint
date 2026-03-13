import random
from datetime import datetime, timedelta
from sqlmodel import Session, select
from app.core.database import engine, create_db_and_tables
from app.models.debate import DebateTopic, DebateStatus

def fetch_trending_issue():
    # 실제로는 여기서 외부 뉴스 API나 LLM을 호출할 수 있습니다.
    # 지금은 검색된 실제 2026년 3월 13일 이슈를 바탕으로 구성합니다.
    today_issues = [
        {
            "title": "Should Social Media Algorithms be Banned for Minors?",
            "description": "A new global bill proposes forcing social media platforms to turn off recommender algorithms for users under 18 to combat addiction. Is this necessary protection or government overreach?"
        },
        {
            "title": "Is Modern Luxury Fashion becoming a Social Experiment?",
            "description": "With brands like Balenciaga selling 'trash bag' handbags for $1,700, experts debate if high fashion is still about aesthetics or if it's just testing the limits of consumer absurdity."
        },
        {
            "title": "Should Geopolitics be barred from Global Sports?",
            "description": "Following Iran's claim that it cannot participate in the 2026 World Cup due to political conflicts, many are debating if international sports organizations should remain strictly neutral or take a stand."
        }
    ]
    return random.choice(today_issues)

def update_daily_debate():
    create_db_and_tables()
    issue = fetch_trending_issue()
    
    with Session(engine) as session:
        # 1. 기존 활성 토론 종료
        existing_active = session.exec(select(DebateTopic).where(DebateTopic.status == DebateStatus.ACTIVE)).all()
        for t in existing_active:
            t.status = DebateStatus.CLOSED
            session.add(t)
        
        # 2. 신규 이슈 등록
        new_topic = DebateTopic(
            title=issue["title"],
            description=issue["description"],
            start_time=datetime.utcnow(),
            end_time=datetime.utcnow() + timedelta(hours=24),
            status=DebateStatus.ACTIVE
        )
        session.add(new_topic)
        session.commit()
        print(f"--- [TODAY'S HOT ISSUE DEPLOYED] ---")
        print(f"Topic: {new_topic.title}")

if __name__ == "__main__":
    update_daily_debate()
