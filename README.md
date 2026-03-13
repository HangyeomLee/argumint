# ⚔️ Argumint: Real-Time Daily Debate Arena

**Argumint**는 전 세계의 뜨거운 이슈를 바탕으로 매일 새로운 논쟁이 펼쳐지는 실시간 토론 플랫폼입니다. 세련된 UI와 고도화된 랭킹 알고리즘, 실시간 상호작용을 통해 단순한 댓글 창을 넘어선 지적 전투의 장을 제공합니다.

---

## 🚀 Key Features

### 1. Intelligent Daily Topic
- **Automated Issue Tracking**: 매일 아침 6시, Google 검색 트렌드를 분석하여 사회/테크/문화 분야의 가장 핫한 이슈를 토론 주제로 자동 선정합니다.
- **Dynamic Context**: 주제에 대한 배경 설명과 함께 찬성(PRO) vs 반대(CON) 진영을 선택하여 참여합니다.

### 2. Reddit-Inspired Ranking System
- **Hot Algorithm**: `score / (hours + 2)^1.5` 공식을 적용하여, 최신성과 대중성을 동시에 고려한 스마트한 게시글 정렬을 제공합니다.
- **Upvote/Downvote**: 유저들의 실시간 투표를 통해 논리적인 주장이 상단에 노출됩니다.

### 3. Progressive Evolution (Tier System)
- **Visual Identity**: 유저의 활동 점수(Reputation)에 따라 5단계 티어로 진화합니다.
- **Dynamic Logos**: `Novice`부터 `Arena Legend`까지, 고유의 컬러와 화려한 애니메이션(Framer Motion)이 적용된 전용 로고가 프로필과 피드에 표시됩니다.

### 4. Advanced Visualizations
- **Argument Combat Map**: 토론의 흐름을 한눈에 볼 수 있는 인터랙티브 그래프 뷰(React Flow)를 제공합니다.
- **Real-time Analytics**: 진영별 기여도, 모멘텀, 참여도 등을 Recharts 기반의 차트로 시각화합니다.

### 5. Real-Time Interaction
- **WebSocket Engine**: 새로운 주장, 반박, 투표 결과가 페이지 새로고침 없이 실시간으로 반영됩니다.
- **Instant Alerts**: 내 글에 대한 반응(추천, 반박)을 실시간 알림 벨을 통해 즉시 확인하고 해당 위치로 바로 이동할 수 있습니다.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Data Fetching**: TanStack Query (React Query)
- **Visuals**: React Flow (Graph), Recharts (Charts)

### Backend
- **Framework**: FastAPI (Python 3.11)
- **Database**: PostgreSQL with SQLModel (SQLAlchemy + Pydantic)
- **Real-time**: WebSockets
- **Automation**: APScheduler (Daily Issue Crawler)
- **Security**: JWT Authentication, Bcrypt Hashing

### DevOps
- **Containerization**: Docker, Docker Compose
- **Deployment**: Vercel (Frontend), AWS/DigitalOcean (Backend)

---

## 🚦 Getting Started

### Prerequisites
- Docker & Docker Compose 설치

### Installation & Run
1. 레포지토리 클론 및 환경 변수 설정
```bash
git clone https://github.com/your-repo/argumint.git
cp .env.example .env  # 환경 변수 수정 필요
```

2. 서비스 시작 (Docker)
```bash
docker-compose up --build -d
```

3. 테스트 데이터 생성 (선택 사항)
```bash
# 풍부한 논쟁 데이터와 가상 유저 생성
docker-compose exec backend python generate_test_data.py
```

### Management Commands
- **주제 즉시 갱신**: `docker-compose exec backend python generate_daily_topic.py`
- **전체 초기화**: `docker-compose down -v`

---

## 🛡️ Security & Scalability
- **CORS Management**: 프로독션 환경에서의 엄격한 도메인 허용 정책 적용.
- **Optimistic UI**: 사용자 경험을 극대화하기 위한 클라이언트 측 선반영 로직.
- **Modular Architecture**: 서비스별(Ranking, Scoring, WebSocket) 로직 분리로 유지보수 용이성 확보.

---
**Argumint** - Forge your arguments, Conquer the Arena.
