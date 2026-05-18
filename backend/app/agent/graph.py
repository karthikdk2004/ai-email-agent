from typing import Dict, List, Optional

from langgraph.graph import END, StateGraph
from typing_extensions import TypedDict

from .nodes import classifier_node, draft_node, memory_node, priority_node


class EmailState(TypedDict):
    email_id: str
    email: dict
    category: Optional[str]
    priority_score: Optional[int]
    priority_reasoning: Optional[str]
    draft_reply: Optional[str]
    processing_complete: bool
    logs: List[dict]


def _build_graph():
    wf = StateGraph(EmailState)

    wf.add_node("classifier", classifier_node)
    wf.add_node("priority", priority_node)
    wf.add_node("draft", draft_node)
    wf.add_node("memory", memory_node)

    wf.set_entry_point("classifier")
    wf.add_edge("classifier", "priority")
    wf.add_edge("priority", "draft")
    wf.add_edge("draft", "memory")
    wf.add_edge("memory", END)

    return wf.compile()


email_graph = _build_graph()


async def process_email(email: Dict) -> Dict:
    initial: EmailState = {
        "email_id": email["id"],
        "email": email,
        "category": None,
        "priority_score": None,
        "priority_reasoning": None,
        "draft_reply": None,
        "processing_complete": False,
        "logs": [],
    }
    return await email_graph.ainvoke(initial)
