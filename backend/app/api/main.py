import json
import os
from datetime import datetime
from typing import Dict

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.agent.graph import process_email
from app.agent.memory import add_to_sent_log, get_agent_logs, get_sent_log
from app.agent.mock_data import get_mock_emails

load_dotenv()

# ── CORS (FIX 16) ─────────────────────────────────────────────────────────────
allowed_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000",
).split(",")

# ── Rate limiting (FIX 12) ────────────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="AI Email Agent", version="1.0.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Persistence (FIX 6) ───────────────────────────────────────────────────────
_HERE = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(_HERE, "..", "data")
_EMAIL_STATE_FILE = os.path.join(DATA_DIR, "emails_state.json")
_CONFIG_FILE = os.path.join(DATA_DIR, "config.json")

_store: Dict[str, dict] = {}

_DEFAULT_CONFIG = {
    "model": "llama-3.3-70b-versatile",
    "temperature": 0.7,
    "max_tokens": 1000,
}


def _save_store():
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(_EMAIL_STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(_store, f, indent=2, default=str)


def _init():
    if not _store:
        os.makedirs(DATA_DIR, exist_ok=True)
        if os.path.exists(_EMAIL_STATE_FILE):
            with open(_EMAIL_STATE_FILE, "r", encoding="utf-8") as f:
                loaded = json.load(f)
            _store.update(loaded)
        else:
            for e in get_mock_emails():
                _store[e["id"]] = e
            _save_store()


# ── Root ──────────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "AI Email Agent API", "version": "1.0.0", "status": "running"}


# ── Health (FIX 15) ───────────────────────────────────────────────────────────

@app.get("/health")
def health():
    _init()
    api_key_set = bool(os.getenv("GROQ_API_KEY", ""))
    return {
        "status": "healthy",
        "api_key_set": api_key_set,
        "total_emails": len(_store),
        "version": "1.0.0",
    }


# ── Stats (FIX 1) ─────────────────────────────────────────────────────────────

@app.get("/stats")
def stats():
    _init()
    sent_count = sum(1 for e in _store.values() if e.get("status") == "sent")
    rejected_count = sum(1 for e in _store.values() if e.get("status") == "rejected")
    processed_count = sum(
        1 for e in _store.values()
        if e.get("status") in ("processed", "sent", "rejected")
    )
    scored = [
        e for e in _store.values()
        if e.get("status") in ("processed", "sent", "rejected") and e.get("priority_score")
    ]
    avg_priority = sum(e["priority_score"] for e in scored) / len(scored) if scored else 0
    return {
        "total_emails": len(_store),
        "processed": processed_count,
        "sent": sent_count,
        "rejected": rejected_count,
        "approval_rate": round(sent_count / processed_count * 100, 1) if processed_count > 0 else 0,
        "avg_priority": round(avg_priority, 1) if scored else 0,
    }


# ── Config (FIX 7) ────────────────────────────────────────────────────────────

class ConfigBody(BaseModel):
    model: str = "llama-3.3-70b-versatile"
    temperature: float = 0.7
    max_tokens: int = 1000


@app.get("/config")
def get_config():
    os.makedirs(DATA_DIR, exist_ok=True)
    if os.path.exists(_CONFIG_FILE):
        with open(_CONFIG_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return _DEFAULT_CONFIG


@app.post("/config")
def save_config(body: ConfigBody):
    os.makedirs(DATA_DIR, exist_ok=True)
    cfg = body.model_dump()
    with open(_CONFIG_FILE, "w", encoding="utf-8") as f:
        json.dump(cfg, f, indent=2)
    return {"message": "Config saved", "config": cfg}


# ── Emails ────────────────────────────────────────────────────────────────────

@app.get("/emails")
def get_emails():
    _init()
    emails = sorted(_store.values(), key=lambda x: x.get("timestamp", ""), reverse=True)
    return {"emails": emails, "total": len(emails)}


@app.get("/emails/{email_id}")
def get_email(email_id: str):
    _init()
    if email_id not in _store:
        raise HTTPException(404, "Email not found")
    return _store[email_id]


# ── Process (FIX 12, 13) ──────────────────────────────────────────────────────

@app.post("/process/{email_id}")
@limiter.limit("10/minute")
async def process(request: Request, email_id: str):
    _init()
    if email_id not in _store:
        raise HTTPException(404, "Email not found")

    email = _store[email_id]
    if email.get("status") not in ("unprocessed", None):
        return {"message": "Already processed", "email": email}

    # Input validation (FIX 13)
    if len(email.get("body", "").strip()) < 10:
        raise HTTPException(400, "Email body is too short (minimum 10 characters)")
    if not email.get("subject", "").strip():
        raise HTTPException(400, "Email subject is missing")
    if not email.get("from", "").strip():
        raise HTTPException(400, "Email sender address is missing")

    _store[email_id]["status"] = "processing"
    _save_store()

    try:
        result = await process_email(email)
    except Exception as exc:
        _store[email_id]["status"] = "error"
        _save_store()
        raise HTTPException(500, f"Agent error: {exc}") from exc

    _store[email_id].update(
        {
            "status": "processed",
            "category": result["category"],
            "priority_score": result["priority_score"],
            "priority_reasoning": result["priority_reasoning"],
            "draft_reply": result["draft_reply"],
            "processed_at": datetime.now().isoformat(),
        }
    )
    _save_store()
    return {
        "message": "Processed successfully",
        "email": _store[email_id],
        "processing_logs": result.get("logs", []),
    }


# ── Approve / Reject / Edit (FIX 12) ─────────────────────────────────────────

@app.post("/approve/{email_id}")
@limiter.limit("30/minute")
def approve(request: Request, email_id: str):
    _init()
    if email_id not in _store:
        raise HTTPException(404, "Email not found")
    email = _store[email_id]
    if not email.get("draft_reply"):
        raise HTTPException(400, "No draft reply to approve — process the email first")

    add_to_sent_log(email, email["draft_reply"])
    _store[email_id]["status"] = "sent"
    _store[email_id]["sent_at"] = datetime.now().isoformat()
    _save_store()
    return {"message": "Reply sent", "email": _store[email_id]}


@app.post("/reject/{email_id}")
@limiter.limit("30/minute")
def reject(request: Request, email_id: str):
    _init()
    if email_id not in _store:
        raise HTTPException(404, "Email not found")
    _store[email_id]["status"] = "rejected"
    _store[email_id]["rejected_at"] = datetime.now().isoformat()
    _save_store()
    return {"message": "Email rejected", "email": _store[email_id]}


class EditBody(BaseModel):
    draft_reply: str


@app.post("/edit/{email_id}")
@limiter.limit("30/minute")
def edit(request: Request, email_id: str, body: EditBody):
    _init()
    if email_id not in _store:
        raise HTTPException(404, "Email not found")
    _store[email_id]["draft_reply"] = body.draft_reply
    _store[email_id]["draft_edited"] = True
    _save_store()
    return {"message": "Draft updated", "email": _store[email_id]}


# ── Logs & Sent ───────────────────────────────────────────────────────────────

@app.get("/logs")
def logs():
    data = get_agent_logs()
    return {"logs": data, "total": len(data)}


@app.get("/sent")
def sent():
    data = get_sent_log()
    return {"sent": data, "total": len(data)}
