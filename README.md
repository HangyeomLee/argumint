# ⚔️ Argumint: Real-Time Daily Debate Arena

**Argumint**는 매일 새로운 주제로 논쟁이 펼쳐지는 실시간 토론 플랫폼입니다. 세련된 UI와 Reddit 스타일 랭킹 알고리즘, Supabase Realtime 기반의 실시간 상호작용을 통해 단순한 댓글 창을 넘어선 지적 전투의 장을 제공합니다.

> **Live Demo**: (Vercel 배포 URL)
> 서버리스 아키텍처(Next.js + Supabase)로 별도의 백엔드 서버 없이 동작합니다.

---

## 🚀 Key Features

### 1. Daily Topic Rotation

- **Vercel Cron**이 매일 아침 6시(KST)에 토픽 풀에서 새 주제를 활성화하고 이전 토론을 아카이브합니다.
- 활성 토론이 없으면 API가 자동으로 다음 주제를 활성화하는 **self-healing** 로직을 갖췄습니다.

### 2. Reddit-Inspired Ranking System

- **Hot Algorithm**: `score / (hours + 2)^1.5` 공식으로 최신성과 대중성을 동시에 반영한 정렬을 제공합니다.
- **Upvote/Downvote**: 투표·카운터·명성 점수·알림 생성이 Postgres 함수(`cast_vote`) 안에서 **원자적으로** 처리되어 레이스 컨디션이 없습니다.

### 3. Progressive Evolution (Tier System)

- 유저의 활동 점수(Reputation)에 따라 `Novice`부터 `Arena Legend`까지 5단계 티어로 진화합니다.
- 추천 +5점 / 비추천 -2점이 작성자 명성에 실시간 반영됩니다.

### 4. Advanced Visualizations

- **Argument Combat Map**: React Flow 기반 인터랙티브 그래프로 토론의 흐름(주장 → 반박)을 시각화합니다.
- **Real-time Scoreboard**: 진영별 점수, 참여자 수, 남은 시간을 실시간으로 표시합니다.

### 5. Real-Time Interaction (Supabase Realtime)

- 새로운 주장, 반박, 투표 결과가 **Postgres Changes 구독**을 통해 새로고침 없이 반영됩니다.
- 내 글에 대한 반응(추천, 반박)은 알림 벨로 확인하고 해당 글 위치로 바로 이동할 수 있습니다.
- 지난 토론은 **Archives**에서 읽기 전용으로 열람할 수 있습니다.

---

## 🏗 Architecture

```text
┌─────────────────────────────┐        ┌──────────────────────────┐
│  Next.js 14 (Vercel)        │        │  Supabase                │
│                             │        │                          │
│  App Router UI (React 18)   │        │  Auth (JWT)              │
│   ├─ TanStack Query ────────┼──REST──▶  Postgres                │
│   └─ Realtime hook ─────────┼──WSS───▶   ├─ RLS (read-only)     │
│                             │        │   ├─ cast_vote() RPC     │
│  Route Handlers (/api/*)    │        │   └─ Realtime publication│
│   └─ service-role client ───┼────────▶                          │
│  Vercel Cron (daily topic)  │        │                          │
└─────────────────────────────┘        └──────────────────────────┘
```

- **쓰기 경로**: 브라우저 → `/api/*` Route Handler → 서비스 롤 키로 Supabase 접근 (RLS 우회, 서버 전용)
- **읽기 경로(실시간)**: 브라우저 → anon 키로 Realtime 구독 (RLS 읽기 전용 정책)
- **투표 로직**: `cast_vote` Postgres 함수에서 트랜잭션으로 처리 (카운터 + hot score + 명성 + 알림 + 활동 피드)

## 🛠 Tech Stack

| 영역 | 기술 |
| --- | --- |
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion |
| Data Fetching | TanStack Query, Axios |
| Visualization | React Flow (그래프), Recharts (차트) |
| Backend | Next.js Route Handlers (서버리스) |
| Database / Auth / Realtime | Supabase (PostgreSQL, GoTrue, Realtime) |
| Scheduling | Vercel Cron |
| Deployment | Vercel |

---

## 🚦 Getting Started

### 1. Supabase 프로젝트 설정

1. [supabase.com](https://supabase.com)에서 새 프로젝트를 생성합니다.
2. **SQL Editor**에서 [`supabase/schema.sql`](supabase/schema.sql) 전체를 실행합니다.
   (테이블 + RLS 정책 + Realtime 퍼블리케이션 + `cast_vote` 함수 + 토픽 시드가 한 번에 생성됩니다.)

### 2. 환경 변수

```bash
cd frontend
cp .env.example .env.local
```

`.env.local`에 Supabase 대시보드(**Settings → API**)의 값을 채웁니다:

| 변수 | 설명 |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public 키 (Realtime 구독용) |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role 키 (서버 전용, 절대 노출 금지) |
| `CRON_SECRET` | 데일리 토픽 크론 보호용 임의 문자열 |

### 3. 실행

```bash
npm install
npm run dev
# http://localhost:3000
```

### 4. 배포 (Vercel)

1. `frontend/`를 루트로 Vercel 프로젝트를 생성합니다.
2. 위 환경 변수 4개를 Vercel에 등록합니다.
3. `vercel.json`의 크론(`0 21 * * *` UTC = 매일 06:00 KST)이 자동으로 등록되어 매일 새 토픽이 배포됩니다.

---

## 📂 Project Structure

```text
argumint/
├── frontend/                  # Next.js 앱 (배포 단위)
│   ├── app/
│   │   ├── api/               # Route Handlers (서버리스 백엔드)
│   │   │   ├── auth/          #   로그인·회원가입 (Supabase Auth)
│   │   │   ├── debates/       #   토론·게시글·투표·스코어보드
│   │   │   ├── users/         #   프로필·리더보드·알림
│   │   │   └── cron/          #   데일리 토픽 로테이션
│   │   ├── dashboard/         # 메인 아레나 (피드 + 그래프 뷰)
│   │   ├── history/           # 지난 토론 아카이브
│   │   └── leaderboard/       # 글로벌 랭킹
│   ├── hooks/
│   │   └── useDebateRealtime.ts  # Supabase Realtime 구독 훅
│   └── lib/
│       ├── supabase/          # server(service-role)·browser(anon) 클라이언트
│       └── server/            # 인증 헬퍼, 토픽 로테이션 로직
├── supabase/
│   └── schema.sql             # 전체 DB 스키마 (테이블·RLS·RPC·시드)
└── backend/                   # (legacy) 초기 FastAPI 구현 — 참고용
```

> `backend/`와 `docker-compose.yml`은 초기 버전(FastAPI + 자체 PostgreSQL + WebSocket)의 흔적으로, 현재 서비스는 Supabase 기반 서버리스 구조로 전환되어 더 이상 사용되지 않습니다.
