import threading
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.database import Base, engine, run_lightweight_migrations
from app.routers import auth, papers, analysis, dashboard, notes, chat

settings = get_settings()

# Create all tables, then patch any columns missing from tables that
# already existed from an earlier version of this project.
Base.metadata.create_all(bind=engine)
run_lightweight_migrations()

app = FastAPI(
    title="ResearchGenie API",
    description="AI-powered research paper analysis platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)


@app.on_event("startup")
def _warm_embedding_model():
    """Load the sentence-transformers model in a background thread on
    startup instead of lazily on the first chat/upload request. Without
    this, whoever sends the first message after a server restart eats a
    multi-second (sometimes 10-20s on a cold cache/first download) delay
    that looks like "the AI is slow" but is actually just model loading.
    """

    def _load():
        try:
            from app.ai.embeddings import get_embedding_model
            get_embedding_model()
        except Exception:
            pass  # non-fatal — it'll just lazy-load on first use instead

    threading.Thread(target=_load, daemon=True).start()


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(papers.router)
app.include_router(analysis.router)
app.include_router(dashboard.router)
app.include_router(notes.router)
app.include_router(chat.router)


@app.get("/")
def root():
    return {
        "app": "ResearchGenie API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {"status": "ok"}