import random
from datetime import datetime, timedelta
from sqlmodel import Session, select
from app.core.database import engine, create_db_and_tables
from app.models.user import User
from app.models.debate import DebateTopic, DebateStatus
from app.models.post import Post, PostType, Vote, Notification, NotificationType
from app.models.participation import DebateParticipation, DebateSide
from app.core.security import get_password_hash
from app.services.ranking_service import calculate_hot_score

def generate_full_production_test_data():
    create_db_and_tables()
    with Session(engine) as session:
        # 1. Fun Topic Selection
        fun_topics = [
            ("Pineapple on Pizza: Culinary Masterpiece or Crime?", "The debate that has divided humanity for decades. Is the sweet and savory combination a stroke of genius or a mistake?"),
            ("Is a Hotdog a Sandwich?", "One of the most intense legal and culinary debates of our time. Define your terms and pick a side."),
            ("Cats vs Dogs: Who is the Superior Companion?", "The ultimate pet showdown. Loyalty and energy vs independence and mystery."),
            ("Should we replace all world leaders with Golden Retrievers?", "They are friendly, loyal, and unlikely to start wars. But can they handle economic policy?")
        ]
        
        topic_title, topic_desc = random.choice(fun_topics)
        
        # Deactivate previous active topics
        existing_active = session.exec(select(DebateTopic).where(DebateTopic.status == DebateStatus.ACTIVE)).all()
        for t in existing_active:
            t.status = DebateStatus.CLOSED
            session.add(t)
        
        # Create new fun topic
        debate = DebateTopic(
            title=topic_title,
            description=topic_desc,
            start_time=datetime.utcnow(),
            end_time=datetime.utcnow() + timedelta(hours=24),
            status=DebateStatus.ACTIVE
        )
        session.add(debate)
        session.commit()
        session.refresh(debate)
        print(f"--- Created active debate topic: {debate.title} ---")

        # 2. 가상 사용자들 생성
        usernames = ["Socrates", "GordonRamsay", "Nietzsche", "PizzaLover", "Aristotle", "CatWorshipper", "LogicExpert", "ChaosMaker"]
        users = []
        for name in usernames:
            user = session.exec(select(User).where(User.username == name)).first()
            if not user:
                user = User(
                    username=name,
                    email=f"{name.lower()}@arena.com",
                    hashed_password=get_password_hash("password123"),
                    total_score=random.randint(50, 500)
                )
                session.add(user)
                session.commit()
                session.refresh(user)
            users.append(user)

        # 3. 사용자 참여
        for user in users:
            side = random.choice([DebateSide.PRO, DebateSide.CON])
            participation = session.exec(select(DebateParticipation).where(
                DebateParticipation.user_id == user.id,
                DebateParticipation.topic_id == debate.id
            )).first()
            if not participation:
                participation = DebateParticipation(user_id=user.id, topic_id=debate.id, side=side)
                session.add(participation)
        session.commit()

        # 4. 메인 주장 생성 (Level 0)
        main_arguments = []
        pro_quotes = ["It's a revolution of taste.", "Efficiency is everything.", "Loyalty is the highest virtue.", "Peace would finally be achieved."]
        con_quotes = ["It's a direct insult to tradition.", "Categories exist for a reason.", "Independence is better than blind loyalty.", "Who will bark at the UN?"]

        for user in users:
            part = session.exec(select(DebateParticipation).where(
                DebateParticipation.user_id == user.id,
                DebateParticipation.topic_id == debate.id
            )).first()
            
            quote = random.choice(pro_quotes if part.side == DebateSide.PRO else con_quotes)
            post = Post(
                topic_id=debate.id,
                user_id=user.id,
                side=part.side,
                type=PostType.ARGUMENT,
                title=f"Why {part.side} is the only logical choice",
                content=f"{quote} As {user.username}, I believe this is non-negotiable.",
                upvotes=random.randint(20, 100),
                downvotes=random.randint(0, 20),
                created_at=datetime.utcnow() - timedelta(hours=random.randint(5, 10))
            )
            post.hot_score = calculate_hot_score(post.upvotes, post.downvotes, post.created_at)
            session.add(post)
            session.commit()
            session.refresh(post)
            main_arguments.append(post)

        # 5. 반박 생성 (Level 1)
        rebuttals = []
        for _ in range(15):
            parent = random.choice(main_arguments)
            parent_author = session.get(User, parent.user_id)
            opposite_side = DebateSide.CON if parent.side == DebateSide.PRO else DebateSide.PRO
            
            eligible_users = session.exec(select(User).join(DebateParticipation).where(
                DebateParticipation.topic_id == debate.id,
                DebateParticipation.side == opposite_side,
                User.id != parent.user_id
            )).all()
            
            if not eligible_users: continue
            user = random.choice(eligible_users)
            
            rebuttal = Post(
                topic_id=debate.id,
                user_id=user.id,
                side=opposite_side,
                type=PostType.REBUTTAL,
                parent_post_id=parent.id,
                content=f"Wait, {parent_author.username}, your logic is flawed. If we follow that path, it leads to total chaos!",
                upvotes=random.randint(10, 50),
                downvotes=random.randint(0, 10),
                created_at=datetime.utcnow() - timedelta(hours=random.randint(1, 4))
            )
            rebuttal.hot_score = calculate_hot_score(rebuttal.upvotes, rebuttal.downvotes, rebuttal.created_at)
            session.add(rebuttal)
            
            # Create notification
            notif = Notification(
                user_id=parent.user_id,
                type=NotificationType.REPLY,
                sender_id=user.id,
                post_id=rebuttal.id
            )
            session.add(notif)
            session.commit()
            session.refresh(rebuttal)
            rebuttals.append(rebuttal)

        # 6. 2차 반박 생성 (Level 2)
        for _ in range(10):
            parent = random.choice(rebuttals)
            parent_author = session.get(User, parent.user_id)
            opposite_side = DebateSide.CON if parent.side == DebateSide.PRO else DebateSide.PRO
            
            eligible_users = session.exec(select(User).join(DebateParticipation).where(
                DebateParticipation.topic_id == debate.id,
                DebateParticipation.side == opposite_side,
                User.id != parent.user_id
            )).all()
            
            if not eligible_users: continue
            user = random.choice(eligible_users)
            
            deep_rebuttal = Post(
                topic_id=debate.id,
                user_id=user.id,
                side=opposite_side,
                type=PostType.REBUTTAL,
                parent_post_id=parent.id,
                content=f"You claim chaos, {parent_author.username}? That's a classic strawman fallacy. Let's look at the actual data.",
                upvotes=random.randint(5, 30),
                downvotes=random.randint(0, 5),
                created_at=datetime.utcnow() - timedelta(minutes=random.randint(10, 60))
            )
            deep_rebuttal.hot_score = calculate_hot_score(deep_rebuttal.upvotes, deep_rebuttal.downvotes, deep_rebuttal.created_at)
            session.add(deep_rebuttal)
            
            # Create notification
            notif = Notification(
                user_id=parent.user_id,
                type=NotificationType.REPLY,
                sender_id=user.id,
                post_id=deep_rebuttal.id
            )
            session.add(notif)
            session.commit()

        # 7. 실제 투표 데이터 생성
        all_posts = session.exec(select(Post).where(Post.topic_id == debate.id)).all()
        for p in all_posts:
            for _ in range(3):
                v_user = random.choice(users)
                existing_v = session.exec(select(Vote).where(Vote.post_id == p.id, Vote.user_id == v_user.id)).first()
                if not existing_v:
                    vote = Vote(user_id=v_user.id, post_id=p.id, value=random.choice([1, 1, 1, -1]))
                    session.add(vote)
        
        session.commit()
        print(f"Success! Generated nested rebuttals and notifications for '{debate.title}'.")

if __name__ == "__main__":
    generate_full_production_test_data()
