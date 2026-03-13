import time
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import auth, debates, posts, websockets, users
from app.core.database import create_db_and_tables
from app import models
from apscheduler.schedulers.background import BackgroundScheduler
from generate_daily_topic import update_daily_debate

app = FastAPI(title=settings.PROJECT_NAME)

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 스케줄러 설정
scheduler = BackgroundScheduler()
scheduler.add_job(update_daily_debate, 'cron', hour=6, minute=0)
scheduler.start()

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000
    formatted_process_time = "{0:.2f}ms".format(process_time)
    logger.info(f"Method: {request.method} Path: {request.url.path} Status: {response.status_code} Time: {formatted_process_time}")
    return response

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

# CORS 설정
origins = []
if settings.BACKEND_CORS_ORIGINS:
    origins = [str(origin).strip() for origin in settings.BACKEND_CORS_ORIGINS]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True if "*" not in origins else False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(debates.router, prefix="/api/debates", tags=["debates"])
app.include_router(posts.router, prefix="/api/debates", tags=["posts"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(websockets.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Debate Arena API"}
