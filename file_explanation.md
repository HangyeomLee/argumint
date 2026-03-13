# 📄 Argumint Project Deep-Dive

이 문서는 Argumint 플랫폼의 전체 코드 구조, 주요 로직, 그리고 각 파일의 역할을 상세히 설명합니다.

---

## 🏗 Project Structure

### 1. Backend (`/backend`) - FastAPI Powered
백엔드는 모듈화된 아키텍처를 따라 유지보수와 확장성을 극대화했습니다.

- **`app/main.py`**: 서비스의 엔트리 포인트.
    - FastAPI 앱 초기화 및 미들웨어(CORS, Logging) 설정.
    - `APScheduler`를 통한 매일 아침 6시 토픽 갱신 작업 등록.
- **`app/api/`**: 각 기능별 API 엔드포인트.
    - `auth.py`: JWT 기반 로그인/회원가입.
    - `posts.py`: 게시글 작성, **Reddit 스타일 투표(Up/Down)**, 알림 생성 로직.
    - `users.py`: 리더보드 조회, 알림 목록, 유저 프로필 및 티어 정보 제공.
    - `websockets.py`: 실시간 데이터 전송을 위한 WebSocket 연결 관리.
- **`app/services/`**: 핵심 비즈니스 로직.
    - `ranking_service.py`: **Hot Ranking Algorithm** (`score / (time+2)^1.5`) 구현.
    - `websockets.py`: 특정 토론방(Topic)별 브로드캐스팅 관리.
- **`app/models/`**: SQLModel 기반 DB 스키마.
    - `post.py`: Post, Vote, Notification, Bookmark 등 핵심 엔티티 정의.
- **`generate_daily_topic.py`**: 외부 이슈를 크롤링하여 매일 새로운 토론 주제를 생성하는 핵심 스크립트.
- **`generate_test_data.py`**: 가상 유저(철학자 등)와 계층형 반박 데이터를 생성하여 시스템을 테스트하는 도구.

### 2. Frontend (`/frontend`) - Next.js Modern UI
프론트엔드는 사용자 경험(UX)과 시각적 피드백에 집중했습니다.

- **`app/dashboard/`**: 메인 토론 아레나.
    - `page.tsx`: 피드와 그래프 뷰를 전환하며 실시간 데이터를 처리하는 대시보드.
    - `GraphView.tsx`: `React Flow`를 사용하여 논쟁의 흐름을 네트워크 지도로 시각화.
- **`app/components/debate/`**: 토론 관련 전용 UI.
    - `PostCard.tsx`: 게시글 카드. 투표 버튼, 티어 로고, 작성자 정보 포함.
    - `Scoreboard.tsx`: **실시간 모멘텀 바** 및 대형 카운트다운 타이머 구현.
    - `ArgumentComposer.tsx`: 플로팅 모달 형태의 글쓰기 컴포넌트.
- **`app/components/TierIcon.tsx`**: `Framer Motion`을 사용한 5단계 티어 로고 시스템.
    - 마스터/레전드 티어의 오로라 광택 및 파티클 효과 구현.
- **`lib/tiers.ts`**: 점수별 티어 정의 및 시각 효과 상수 관리.
- **`hooks/useWebSocket.ts`**: 백엔드와 연결하여 실시간 게시글/투표 업데이트를 수신하는 커스텀 훅.

---

## ⚙️ Core Logic Flow

### 1. Reputation & Tier System
- **점수 획득**: 타인으로부터 Upvote 시 **+5**, Downvote 시 **-2**.
- **티어 갱신**: 유저가 투표를 받을 때마다 백엔드에서 `total_score`를 계산하고, 프론트엔드는 `lib/tiers.ts`의 기준에 따라 즉시 로고를 변경합니다.

### 2. Real-Time Sync (WebSocket)
- 유저 A가 글을 쓰면 백엔드 `posts.py`에서 `manager.broadcast()` 호출.
- 해당 토론장에 접속한 모든 유저의 `useWebSocket` 훅이 이벤트를 감지.
- 프론트엔드 상태(State)가 업데이트되어 화면이 즉시 갱신됨.

### 3. Notification & Deep Linking
- 알림 데이터에 `post_id`를 저장.
- 유저가 알림을 클릭하면 `dashboard?scrollTo={id}`로 이동.
- 대시보드 진입 시 `useEffect`가 해당 ID의 엘리먼트를 찾아 **Smooth Scroll & Highlight** 수행.

---

## 🛡 Security Highlights
- **CORS Strictly Defined**: 프로덕션 배포 시 허용된 도메인 외의 접근을 원천 차단.
- **PII Protection**: API 응답에서 유저의 이메일 등 민감 정보를 제거하는 스키마 필터링.
- **Password Hashing**: `bcrypt 3.2.0`을 통한 안전한 비밀번호 저장.

---
이 아키텍처는 수만 명의 유저가 동시에 토론에 참여해도 견딜 수 있는 확장성과, 실시간 상호작용이 주는 높은 몰입감을 목표로 설계되었습니다.
