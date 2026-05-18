import json
import os
from datetime import datetime
from typing import Any, Dict, List

_HERE = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(_HERE, "..", "data")

MEMORY_FILE = os.path.join(DATA_DIR, "memory.json")
SENT_LOG_FILE = os.path.join(DATA_DIR, "sent_log.json")
AGENT_LOGS_FILE = os.path.join(DATA_DIR, "agent_logs.json")


def _ensure_dir():
    os.makedirs(DATA_DIR, exist_ok=True)


def _read(filepath: str, default: Any) -> Any:
    _ensure_dir()
    if not os.path.exists(filepath):
        return default
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def _write(filepath: str, data: Any):
    _ensure_dir()
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, default=str)


# ── Memory ──────────────────────────────────────────────────────────────────

def get_memory() -> Dict:
    return _read(MEMORY_FILE, {})


def update_memory(email: Dict, category: str, priority_score: int) -> Dict:
    memory = get_memory()
    sender = email.get("from", "")

    memory.setdefault("senders", {})
    memory.setdefault("patterns", {"category_counts": {}, "total_processed": 0})

    senders = memory["senders"]
    if sender not in senders:
        senders[sender] = {
            "name": email.get("from_name", ""),
            "email_count": 0,
            "categories": {},
            "avg_priority": 0.0,
            "last_seen": None,
        }

    s = senders[sender]
    s["email_count"] += 1
    s["categories"][category] = s["categories"].get(category, 0) + 1
    n = s["email_count"]
    s["avg_priority"] = round(((s["avg_priority"] * (n - 1)) + priority_score) / n, 2)
    s["last_seen"] = datetime.now().isoformat()

    memory["patterns"]["category_counts"][category] = (
        memory["patterns"]["category_counts"].get(category, 0) + 1
    )
    memory["patterns"]["total_processed"] += 1

    _write(MEMORY_FILE, memory)
    return memory


# ── Sent Log ─────────────────────────────────────────────────────────────────

def get_sent_log() -> List:
    return _read(SENT_LOG_FILE, [])


def add_to_sent_log(email: Dict, draft_reply: str):
    log = get_sent_log()
    log.append(
        {
            "email_id": email["id"],
            "to": email["from"],
            "to_name": email.get("from_name", ""),
            "subject": f"Re: {email['subject']}",
            "original_subject": email["subject"],
            "body": draft_reply,
            "sent_at": datetime.now().isoformat(),
            "category": email.get("category", ""),
            "priority_score": email.get("priority_score", 0),
        }
    )
    _write(SENT_LOG_FILE, log)


# ── Agent Logs ───────────────────────────────────────────────────────────────

def get_agent_logs() -> List:
    return _read(AGENT_LOGS_FILE, [])


def add_agent_log(
    email_id: str,
    node: str,
    decision: str,
    reasoning: str,
    data: Dict = None,
):
    logs = get_agent_logs()
    logs.append(
        {
            "email_id": email_id,
            "node": node,
            "decision": decision,
            "reasoning": reasoning,
            "data": data or {},
            "timestamp": datetime.now().isoformat(),
        }
    )
    _write(AGENT_LOGS_FILE, logs)
