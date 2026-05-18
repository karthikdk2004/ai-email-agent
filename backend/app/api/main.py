from datetime import datetime
from typing import Dict

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.agent.graph import process_email
from app.agent.memory import add_to_sent_log, get_agent_logs, get_sent_log
from app.agent.mock_data import get_mock_emails

app = FastAPI(title="AI Email Agent", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-process email store — seeded from mock data on first request
_store: Dict[str, dict] = {}


def _init():
    if not _store:
        for e in get_mock_emails():
            _store[e["id"]] = e


# ── Root ──────────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "AI Email Agent API", "version": "1.0.0", "status": "running"}


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


# ── Process ───────────────────────────────────────────────────────────────────

@app.post("/process/{email_id}")
async def process(email_id: str):
    _init()
    if email_id not in _store:
        raise HTTPException(404, "Email not found")

    email = _store[email_id]
    if email.get("status") not in ("unprocessed", None):
        return {"message": "Already processed", "email": email}

    _store[email_id]["status"] = "processing"

    try:
        result = await process_email(email)
    except Exception as exc:
        _store[email_id]["status"] = "error"
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
    return {
        "message": "Processed successfully",
        "email": _store[email_id],
        "processing_logs": result.get("logs", []),
    }


# ── Approve / Reject / Edit ───────────────────────────────────────────────────

@app.post("/approve/{email_id}")
def approve(email_id: str):
    _init()
    if email_id not in _store:
        raise HTTPException(404, "Email not found")
    email = _store[email_id]
    if not email.get("draft_reply"):
        raise HTTPException(400, "No draft reply to approve — process the email first")

    add_to_sent_log(email, email["draft_reply"])
    _store[email_id]["status"] = "sent"
    _store[email_id]["sent_at"] = datetime.now().isoformat()
    return {"message": "Reply sent", "email": _store[email_id]}


@app.post("/reject/{email_id}")
def reject(email_id: str):
    _init()
    if email_id not in _store:
        raise HTTPException(404, "Email not found")
    _store[email_id]["status"] = "rejected"
    _store[email_id]["rejected_at"] = datetime.now().isoformat()
    return {"message": "Email rejected", "email": _store[email_id]}


class EditBody(BaseModel):
    draft_reply: str


@app.post("/edit/{email_id}")
def edit(email_id: str, body: EditBody):
    _init()
    if email_id not in _store:
        raise HTTPException(404, "Email not found")
    _store[email_id]["draft_reply"] = body.draft_reply
    _store[email_id]["draft_edited"] = True
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
