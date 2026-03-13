# Debate Arena

A polished, real-time daily debate platform built with FastAPI and Next.js.

## Tech Stack

- **Frontend**: Next.js (App Router), React, TypeScript, Tailwind CSS, TanStack Query, React Flow.
- **Backend**: FastAPI, Python 3.11+, SQLModel (SQLAlchemy+Pydantic), WebSockets.
- **Database**: PostgreSQL.
- **Infrastructure**: Docker, Docker Compose.

## Key Features

- **Daily Debate**: One curated topic every 24 hours.
- **Real-time Interaction**: Live updates for new posts and likes via WebSockets.
- **Side Selection**: Users choose PRO or CON and lock in their perspective.
- **Threaded Arguments**: Support for top-level arguments and nested rebuttals.
- **Scoring System**: Points earned based on community likes and winning team bonus.
- **Visualizations**: Switch between a traditional threaded feed and an interactive graph view using React Flow.
- **Leaderboard**: Global rankings based on cumulative performance.

## Getting Started

### Prerequisites

- Docker and Docker Compose

### Running the App

1. Clone the repository.
2. Create a `.env` file in the root directory (use the provided `.env` as a template).
3. Start the services:
   ```bash
   docker-compose up --build
   ```
4. Seed the database with a test user and an active debate:
   ```bash
   docker-compose exec backend python seed_data.py
   ```
5. Open your browser:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

## Test Data Management

### Generate Test Data
Use this command to generate a full production-style debate with multiple users, nested rebuttals, upvotes/downvotes, and real-time activities. This is perfect for testing the Graph View and Sidebar.
```bash
docker-compose exec backend python generate_test_data.py
```
*Note: Running this command will automatically close the previous active debate and start a new "fun" topic.*

### Clear All Data
To completely wipe the database (including users, posts, and settings) and start from scratch:
```bash
# 1. Stop containers and remove volumes
docker-compose down -v

# 2. Start fresh
docker-compose up -d
```

## Architecture

The project follows a modular production-style architecture:

### Backend (`/backend`)
- `app/api`: REST and WebSocket endpoints.
- `app/models`: SQLModel database entities.
- `app/schemas`: Pydantic validation models.
- `app/services`: Business logic (scoring, websocket management).
- `app/core`: Configuration and security (JWT).

### Frontend (`/frontend`)
- `app/dashboard`: Main debate arena with feed and graph views.
- `components/debate`: Reusable debate-specific UI components.
- `hooks/`: Custom React hooks for WebSockets and API interaction.
- `lib/api.ts`: Axios client with interceptors for authentication.

## Development

- **Migrations**: Uses SQLModel's metadata creation for MVP.
- **Authentication**: JWT-based auth with secure password hashing (bcrypt).
- **Styling**: Modern, responsive design using Tailwind CSS.
