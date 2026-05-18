import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const CAT_COLOR = {
  urgent: "bg-red-100 text-red-800",
  "follow-up": "bg-yellow-100 text-yellow-800",
  "action-required": "bg-orange-100 text-orange-800",
  newsletter: "bg-gray-100 text-gray-700",
};

function priorityColor(s) {
  if (!s) return "text-gray-300";
  if (s >= 9) return "text-red-600";
  if (s >= 7) return "text-orange-500";
  if (s >= 5) return "text-yellow-500";
  return "text-green-500";
}

function PriorityBar({ score }) {
  const pct = ((score || 0) / 10) * 100;
  const color =
    score >= 9
      ? "bg-red-500"
      : score >= 7
      ? "bg-orange-500"
      : score >= 5
      ? "bg-yellow-500"
      : "bg-green-500";
  return (
    <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
      <div
        className={`h-2 rounded-full transition-all ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div
      className={`fixed bottom-6 right-6 px-5 py-3 rounded-xl shadow-lg text-sm font-medium z-50 ${
        msg.type === "error"
          ? "bg-red-600 text-white"
          : "bg-green-600 text-white"
      }`}
    >
      {msg.text}
    </div>
  );
}

export default function EmailDetail({ email: init, onBack, onUpdate }) {
  const [email, setEmail] = useState(init);
  const [processing, setProcessing] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState(init?.draft_reply || "");
  const [toast, setToast] = useState(null);

  const showToast = (text, type = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  const update = (e) => {
    setEmail(e);
    onUpdate?.(e);
  };

  const processEmail = async () => {
    setProcessing(true);
    try {
      const r = await fetch(`${API_URL}/process/${email.id}`, { method: "POST" });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${r.status}`);
      }
      const d = await r.json();
      update(d.email);
      setDraft(d.email.draft_reply || "");
      showToast("AI analysis complete — review the draft below.");
    } catch (e) {
      showToast(`Processing failed: ${e.message}`, "error");
    } finally {
      setProcessing(false);
    }
  };

  const approve = async () => {
    try {
      const r = await fetch(`${API_URL}/approve/${email.id}`, { method: "POST" });
      if (!r.ok) throw new Error((await r.json()).detail);
      const d = await r.json();
      update(d.email);
      showToast("Reply approved and sent!");
    } catch (e) {
      showToast(`Failed: ${e.message}`, "error");
    }
  };

  const reject = async () => {
    try {
      const r = await fetch(`${API_URL}/reject/${email.id}`, { method: "POST" });
      const d = await r.json();
      update(d.email);
      showToast("Email rejected.");
    } catch (e) {
      showToast(`Failed: ${e.message}`, "error");
    }
  };

  const saveDraft = async () => {
    try {
      const r = await fetch(`${API_URL}/edit/${email.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft_reply: draft }),
      });
      const d = await r.json();
      update(d.email);
      setEditMode(false);
      showToast("Draft updated.");
    } catch (e) {
      showToast(`Failed: ${e.message}`, "error");
    }
  };

  const fmt = (iso) => (iso ? new Date(iso).toLocaleString() : "");

  const isProcessed = email.status === "processed";
  const isSent = email.status === "sent";
  const isRejected = email.status === "rejected";

  return (
    <div className="max-w-6xl mx-auto">
      <Toast msg={toast} />

      {/* Top bar */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors text-sm font-medium"
        >
          ← Back
        </button>
        <h1 className="text-lg font-bold text-gray-900 flex-1 truncate">{email.subject}</h1>
        {isSent && (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
            Sent
          </span>
        )}
        {isRejected && (
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
            Rejected
          </span>
        )}
      </div>

      {/* Split pane */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Left: Email Content ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
          {/* Sender */}
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg flex-shrink-0">
              {email.from_name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900">{email.from_name}</p>
              <p className="text-sm text-gray-500 truncate">{email.from}</p>
            </div>
            <p className="text-xs text-gray-400 flex-shrink-0">{fmt(email.timestamp)}</p>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-auto">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
              {email.body}
            </pre>
          </div>
        </div>

        {/* ── Right: AI Panel ── */}
        <div className="flex flex-col gap-4">
          {/* CTA when unprocessed */}
          {email.status === "unprocessed" && !processing && (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200 p-7 text-center">
              <div className="text-5xl mb-3">🤖</div>
              <h3 className="font-bold text-indigo-900 text-lg mb-1">AI Analysis</h3>
              <p className="text-indigo-600 text-sm mb-5">
                Run the 4-node LangGraph workflow to classify, score priority, and draft a reply.
              </p>
              <button
                onClick={processEmail}
                className="px-7 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold transition-colors shadow-sm"
              >
                Process with AI
              </button>
              <p className="text-xs text-indigo-400 mt-3">
                classifier → priority → draft → memory
              </p>
            </div>
          )}

          {/* Processing spinner */}
          {processing && (
            <div className="bg-blue-50 rounded-2xl border border-blue-200 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 flex-shrink-0" />
                <p className="font-semibold text-blue-900">Running LangGraph Workflow…</p>
              </div>
              <div className="flex flex-col gap-1.5 pl-8">
                {["classifier_node", "priority_node", "draft_node", "memory_node"].map((n) => (
                  <div key={n} className="flex items-center gap-2 text-xs text-blue-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                    {n}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Analysis card */}
          {email.category && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>🧠</span> AI Analysis
              </h3>
              <div className="space-y-4">
                {/* Category */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Category</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                      CAT_COLOR[email.category] || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {email.category?.replace(/-/g, " ")}
                  </span>
                </div>

                {/* Priority */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-500">Priority Score</span>
                    <span className={`text-3xl font-black ${priorityColor(email.priority_score)}`}>
                      {email.priority_score}
                      <span className="text-base font-normal text-gray-400">/10</span>
                    </span>
                  </div>
                  <PriorityBar score={email.priority_score} />
                </div>

                {/* Reasoning */}
                {email.priority_reasoning && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Reasoning
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">{email.priority_reasoning}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Draft reply */}
          {email.draft_reply && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <span>✉️</span> Draft Reply
                  {email.draft_edited && (
                    <span className="text-xs text-indigo-500 font-normal">(edited)</span>
                  )}
                </h3>
                {isProcessed && !editMode && (
                  <button
                    onClick={() => {
                      setEditMode(true);
                      setDraft(email.draft_reply);
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                  >
                    Edit
                  </button>
                )}
              </div>

              {editMode ? (
                <div>
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    rows={10}
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-700 font-sans focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={saveDraft}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setEditMode(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 rounded-xl p-4 font-sans leading-relaxed">
                  {email.draft_reply}
                </pre>
              )}
            </div>
          )}

          {/* Action buttons */}
          {isProcessed && !editMode && (
            <div className="flex gap-3">
              <button
                onClick={approve}
                className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-sm"
              >
                Approve & Send
              </button>
              <button
                onClick={reject}
                className="flex-1 py-3 bg-red-50 text-red-700 border border-red-200 rounded-xl font-semibold hover:bg-red-100 transition-colors"
              >
                Reject
              </button>
            </div>
          )}

          {isSent && (
            <div className="bg-green-50 rounded-2xl border border-green-200 p-4 text-center">
              <p className="text-green-700 font-semibold">Reply sent ✓</p>
              <p className="text-green-500 text-xs mt-0.5">{fmt(email.sent_at)}</p>
            </div>
          )}

          {isRejected && (
            <div className="bg-red-50 rounded-2xl border border-red-200 p-4 text-center">
              <p className="text-red-700 font-semibold">Email rejected</p>
              <p className="text-red-400 text-xs mt-0.5">{fmt(email.rejected_at)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
