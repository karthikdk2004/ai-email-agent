import json
import os
import re
from typing import Dict

from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage

from .memory import add_agent_log, get_memory, update_memory

load_dotenv()


def _llm() -> ChatGroq:
    api_key = os.getenv("GROQ_API_KEY", "")
    if not api_key:
        raise RuntimeError("GROQ_API_KEY is not set. Add it to backend/.env")
    return ChatGroq(
        api_key=api_key,
        model_name="llama-3.3-70b-versatile",
        temperature=0.2,
    )


def _parse_json(text: str) -> dict:
    """Strip optional markdown fences and parse JSON."""
    text = re.sub(r"```(?:json)?\s*", "", text).strip().rstrip("`").strip()
    return json.loads(text)


# ── Node 1: Classifier ───────────────────────────────────────────────────────

def classifier_node(state: Dict) -> Dict:
    email = state["email"]
    llm = _llm()

    prompt = f"""You are an expert email classifier. Classify this email into EXACTLY one category.

Valid categories:
  urgent          — requires immediate action (outages, deadlines today/tomorrow, emergencies)
  follow-up       — a follow-up or reminder about a prior interaction
  action-required — requires a specific action (sign, approve, attend, submit)
  newsletter      — automated newsletters, digests, or marketing emails

Email:
  From:    {email["from_name"]} <{email["from"]}>
  Subject: {email["subject"]}
  Body:
{email["body"][:1800]}

Respond with ONLY valid JSON — no extra text:
{{"category": "urgent|follow-up|action-required|newsletter", "reasoning": "one concise sentence"}}"""

    response = llm.invoke([HumanMessage(content=prompt)])

    try:
        result = _parse_json(response.content)
        category = result["category"]
        reasoning = result["reasoning"]
    except Exception:
        body_lower = (email.get("subject", "") + " " + email.get("body", "")).lower()
        if any(w in body_lower for w in ["urgent", "immediate", "critical", "asap", "emergency"]):
            category = "urgent"
        elif any(w in body_lower for w in ["follow", "following up", "reminder", "checking in"]):
            category = "follow-up"
        elif any(w in body_lower for w in ["action required", "sign", "approve", "rsvp", "submit"]):
            category = "action-required"
        else:
            category = "newsletter"
        reasoning = "Classified via keyword fallback"

    add_agent_log(
        email_id=state["email_id"],
        node="classifier",
        decision=f"Category: {category}",
        reasoning=reasoning,
        data={"category": category},
    )

    logs = list(state.get("logs", []))
    logs.append({"node": "classifier", "category": category, "reasoning": reasoning})
    return {"category": category, "logs": logs}


# ── Node 2: Priority ─────────────────────────────────────────────────────────

def priority_node(state: Dict) -> Dict:
    email = state["email"]
    category = state["category"]
    llm = _llm()

    # Enrich with sender history if available
    memory = get_memory()
    sender_data = memory.get("senders", {}).get(email["from"], {})
    history_ctx = ""
    if sender_data:
        history_ctx = (
            f"\nSender history: {sender_data['email_count']} prior emails, "
            f"avg priority {sender_data['avg_priority']:.1f}"
        )

    prompt = f"""You are an expert email priority assessor. Score this email's urgency from 1 to 10.

Category: {category}
From:     {email["from_name"]} <{email["from"]}>
Subject:  {email["subject"]}{history_ctx}
Body:
{email["body"][:1800]}

Scoring rubric:
  9–10  Critical — immediate business impact, outage, financial/legal risk
  7–8   High     — deadline within 48 h, important stakeholder, blocking issue
  5–6   Medium   — needs attention this week, moderate consequence if delayed
  3–4   Low      — informational, non-blocking follow-up
  1–2   Minimal  — newsletter, automated notification, no action needed

Respond with ONLY valid JSON — no extra text:
{{"priority_score": <integer 1-10>, "reasoning": "two concise sentences explaining the key factors"}}"""

    response = llm.invoke([HumanMessage(content=prompt)])

    try:
        result = _parse_json(response.content)
        priority_score = int(result["priority_score"])
        reasoning = result["reasoning"]
    except Exception:
        defaults = {"urgent": 9, "action-required": 7, "follow-up": 5, "newsletter": 2}
        priority_score = defaults.get(category, 5)
        reasoning = f"Default score for {category} category (LLM parse error)"

    priority_score = max(1, min(10, priority_score))

    add_agent_log(
        email_id=state["email_id"],
        node="priority",
        decision=f"Priority Score: {priority_score}/10",
        reasoning=reasoning,
        data={"priority_score": priority_score, "category": category},
    )

    logs = list(state.get("logs", []))
    logs.append({"node": "priority", "score": priority_score, "reasoning": reasoning})
    return {"priority_score": priority_score, "priority_reasoning": reasoning, "logs": logs}


# ── Node 3: Draft ────────────────────────────────────────────────────────────

def draft_node(state: Dict) -> Dict:
    email = state["email"]
    category = state["category"]
    priority_score = state["priority_score"]
    llm = _llm()

    skip = category == "newsletter" and priority_score <= 3

    if skip:
        draft = "No reply needed — this is an automated newsletter."
        add_agent_log(
            email_id=state["email_id"],
            node="draft",
            decision="Draft skipped — newsletter with low priority",
            reasoning="Newsletters and automated digests do not warrant a direct reply.",
            data={"draft_generated": False},
        )
    else:
        tone_guide = {
            "urgent": "Acknowledge the urgency immediately, confirm you are taking action, give a concrete ETA.",
            "follow-up": "Provide a status update, apologise for any delay, give clear next steps and timeline.",
            "action-required": "Confirm receipt, state exactly what action you will take and by when.",
            "newsletter": "Brief, friendly acknowledgment if a reply is truly needed.",
        }

        prompt = f"""You are an expert professional email writer.

Email to reply to:
  From:     {email["from_name"]} <{email["from"]}>
  Subject:  {email["subject"]}
  Category: {category}  |  Priority: {priority_score}/10
  Body:
{email["body"][:2200]}

Tone guidance: {tone_guide.get(category, "Professional and concise.")}

Rules:
  • 3–6 sentences unless the context genuinely needs more
  • Start with an appropriate greeting (Dear / Hi [Name])
  • End with: Best regards,\n[Your Name]
  • Do NOT include a subject line
  • Do NOT add meta-commentary — write the reply body only

Write the reply now:"""

        response = llm.invoke([HumanMessage(content=prompt)])
        draft = response.content.strip()

        add_agent_log(
            email_id=state["email_id"],
            node="draft",
            decision=f"Draft generated ({len(draft)} chars)",
            reasoning=f"Professional reply for {category} email (priority {priority_score}/10)",
            data={"draft_preview": draft[:200] + ("..." if len(draft) > 200 else "")},
        )

    logs = list(state.get("logs", []))
    logs.append({"node": "draft", "generated": not skip, "length": len(draft)})
    return {"draft_reply": draft, "logs": logs}


# ── Node 4: Memory ───────────────────────────────────────────────────────────

def memory_node(state: Dict) -> Dict:
    email = state["email"]
    category = state["category"]
    priority_score = state["priority_score"]

    updated = update_memory(email, category, priority_score)
    sender = email.get("from", "")
    s = updated.get("senders", {}).get(sender, {})

    add_agent_log(
        email_id=state["email_id"],
        node="memory",
        decision=f"Memory updated for {sender}",
        reasoning=(
            f"Saved category={category}, priority={priority_score}. "
            f"Sender total: {s.get('email_count', 1)} email(s), "
            f"avg priority {s.get('avg_priority', priority_score):.1f}"
        ),
        data={
            "sender": sender,
            "sender_email_count": s.get("email_count", 1),
            "sender_avg_priority": s.get("avg_priority", priority_score),
            "global_patterns": updated.get("patterns", {}),
        },
    )

    logs = list(state.get("logs", []))
    logs.append(
        {
            "node": "memory",
            "sender": sender,
            "sender_total": s.get("email_count", 1),
        }
    )
    return {"processing_complete": True, "logs": logs}
