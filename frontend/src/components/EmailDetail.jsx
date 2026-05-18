import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const CAT_STYLE = {
  urgent: { badge: "bg-red-500/10 text-red-400 border border-red-500/20", label: "Urgent" },
  "follow-up": { badge: "bg-amber-500/10 text-amber-400 border border-amber-500/20", label: "Follow Up" },
  "action-required": { badge: "bg-blue-500/10 text-blue-400 border border-blue-500/20", label: "Action Required" },
  newsletter: { badge: "bg-zinc-700/50 text-zinc-400 border border-zinc-700", label: "Newsletter" },
};

function priorityTextColor(s) {
  if (!s) return "text-zinc-600";
  if (s >= 9) return "text-red-400";
  if (s >= 7) return "text-orange-400";
  if (s >= 5) return "text-amber-400";
  return "text-green-400";
}

function priorityBarColor(s) {
  if (!s) return "bg-zinc-700";
  if (s >= 9) return "bg-red-500";
  if (s >= 7) return "bg-orange-500";
  if (s >= 5) return "bg-amber-500";
  return "bg-green-500";
}

function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl border shadow-2xl text-sm font-medium ${
      msg.type === "error"
        ? "bg-red-500/10 border-red-500/20 text-red-400"
        : "bg-green-500/10 border-green-500/20 text-green-400"
    }`}>
      {msg.type === "error" ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4 flex-shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4 flex-shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      )}
      {msg.text}
    </div>
  );
}

function PriorityBar({ score }) {
  return (
    <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-2">
      <div
        className={`h-1.5 rounded-full transition-all ${priorityBarColor(score)}`}
        style={{ width: `${((score || 0) / 10) * 100}%` }}
      />
    </div>
  );
}

export default function EmailDetail({ email: init, onBack, onUpdate }) {
  const [email, setEmail] = useState(init);
  const [processing, setProcessing] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [draftText, setDraftText] = useState(init?.draft_reply || "");
  const [toast, setToast] = useState(null);

  const showToast = (text, type = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  const update = (e) => { setEmail(e); onUpdate?.(e); };

  const processEmail = async () => {
    setProcessing(true);
    try {
      const r = await fetch(`${API_URL}/process/${email.id}`, { method: "POST" });
      if (!r.ok) { const err = await r.json().catch(() => ({})); throw new Error(err.detail || `HTTP ${r.status}`); }
      const d = await r.json();
      update(d.email);
      setDraftText(d.email.draft_reply || "");
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
      const d = await r.json(); update(d.email); showToast("Reply approved and sent!");
    } catch (e) { showToast(`Failed: ${e.message}`, "error"); }
  };

  const reject = async () => {
    try {
      const r = await fetch(`${API_URL}/reject/${email.id}`, { method: "POST" });
      const d = await r.json(); update(d.email); showToast("Email rejected.");
    } catch (e) { showToast(`Failed: ${e.message}`, "error"); }
  };

  const saveDraft = async () => {
    try {
      const r = await fetch(`${API_URL}/edit/${email.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft_reply: draftText }),
      });
      const d = await r.json(); update(d.email); setEditMode(false); showToast("Draft updated.");
    } catch (e) { showToast(`Failed: ${e.message}`, "error"); }
  };

  const fmt = (iso) => (iso ? new Date(iso).toLocaleString() : "");
  const catStyle = CAT_STYLE[email.category] || { badge: "bg-zinc-700/50 text-zinc-400 border border-zinc-700", label: email.category };
  const isProcessed = email.status === "processed";
  const isSent = email.status === "sent";
  const isRejected = email.status === "rejected";
  const initials = email.from_name?.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";

  return (
    <div className="max-w-5xl mx-auto">
      <Toast msg={toast} />

      {/* Back bar */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-200 text-sm font-medium transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to Inbox
        </button>
        <span className="text-zinc-700">/</span>
        <span className="text-zinc-400 text-sm truncate">{email.subject}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* ── Left: Email Content ── */}
        <div className="bg-[#16161a] border border-zinc-800 rounded-2xl flex flex-col overflow-hidden">
          {/* Card header */}
          <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-zinc-800">
            <div className="flex-1 min-w-0 pr-3">
              <h1 className="text-base font-bold text-white leading-snug">{email.subject}</h1>
            </div>
            {email.category && (
              <span className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide ${catStyle.badge}`}>
                {catStyle.label}
              </span>
            )}
          </div>

          {/* Sender */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-zinc-800/60">
            <div className="w-9 h-9 rounded-full bg-indigo-500/15 text-indigo-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm">{email.from_name}</p>
              <p className="text-zinc-500 text-xs truncate">{email.from}</p>
            </div>
            <p className="text-zinc-600 text-xs flex-shrink-0 font-mono">{fmt(email.timestamp)}</p>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-auto px-5 py-4">
            <pre className="whitespace-pre-wrap text-sm text-zinc-300 font-sans leading-relaxed">
              {email.body}
            </pre>
          </div>
        </div>

        {/* ── Right: AI Panel ── */}
        <div className="flex flex-col gap-4">
          {/* CTA when unprocessed */}
          {email.status === "unprocessed" && !processing && (
            <div className="bg-[#16161a] border border-zinc-800 rounded-2xl p-8 text-center">
              <div className="w-14 h-14 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7 text-indigo-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                </svg>
              </div>
              <h3 className="font-bold text-white text-lg mb-1.5">AI Analysis</h3>
              <p className="text-zinc-500 text-sm mb-6">
                Run the 4-node LangGraph workflow to classify, score priority, and draft a reply.
              </p>
              <button
                onClick={processEmail}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-900/30 text-sm"
              >
                Process with AI
              </button>
              <div className="flex items-center justify-center gap-1.5 mt-4">
                {["classifier", "priority", "draft", "memory"].map((n, i) => (
                  <span key={n} className="flex items-center gap-1.5">
                    <span className="text-zinc-600 text-xs font-mono">{n}</span>
                    {i < 3 && <span className="text-zinc-700 text-xs">→</span>}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Processing */}
          {processing && (
            <div className="bg-[#16161a] border border-indigo-500/20 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white text-sm">Running LangGraph Workflow…</p>
                  <p className="text-zinc-500 text-xs">This may take 5–10 seconds</p>
                </div>
              </div>
              <div className="space-y-2 pl-8">
                {[
                  { n: "classifier", c: "text-purple-400" },
                  { n: "priority", c: "text-orange-400" },
                  { n: "draft", c: "text-blue-400" },
                  { n: "memory", c: "text-green-400" },
                ].map(({ n, c }) => (
                  <div key={n} className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${c.replace("text", "bg")} animate-pulse`} />
                    <span className={`text-xs font-mono ${c}`}>{n}_node</span>
                    <span className="text-zinc-700 text-xs">invoking groq…</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analysis card */}
          {email.category && (
            <div className="bg-[#16161a] border border-zinc-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4 text-indigo-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
                <h3 className="font-bold text-white text-sm">AI Analysis</h3>
              </div>

              <div className="space-y-4">
                {/* Category */}
                <div className="flex items-center justify-between py-2 border-b border-zinc-800/60">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Priority Status</span>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${catStyle.badge}`}>
                    {catStyle.label}
                  </span>
                </div>

                {/* Priority score */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Priority Score</span>
                    <span className={`text-3xl font-black font-mono ${priorityTextColor(email.priority_score)}`}>
                      {email.priority_score}
                      <span className="text-lg text-zinc-600 font-normal">/10</span>
                    </span>
                  </div>
                  <PriorityBar score={email.priority_score} />
                </div>

                {/* Reasoning */}
                {email.priority_reasoning && (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-semibold mb-2">Reasoning</p>
                    <p className="text-sm text-zinc-300 leading-relaxed">{email.priority_reasoning}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Draft reply */}
          {email.draft_reply && (
            <div className="bg-[#16161a] border border-zinc-800 rounded-2xl p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4 text-zinc-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                  <h3 className="font-bold text-white text-sm">Draft Reply</h3>
                  {email.draft_edited && (
                    <span className="text-[10px] text-amber-500 font-semibold uppercase tracking-wide">Edited</span>
                  )}
                </div>
                {isProcessed && !editMode && (
                  <button
                    onClick={() => { setEditMode(true); setDraftText(email.draft_reply); }}
                    className="text-xs text-zinc-500 hover:text-zinc-200 font-semibold transition-colors"
                  >
                    Edit
                  </button>
                )}
              </div>

              {editMode ? (
                <div className="flex flex-col gap-2">
                  <textarea
                    value={draftText}
                    onChange={(e) => setDraftText(e.target.value)}
                    rows={10}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-sm text-zinc-200 font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 resize-none leading-relaxed"
                  />
                  <div className="flex gap-2">
                    <button onClick={saveDraft} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors">
                      Save Changes
                    </button>
                    <button onClick={() => setEditMode(false)} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-lg transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <pre className="whitespace-pre-wrap text-sm text-zinc-300 bg-zinc-900 rounded-xl p-4 font-mono leading-relaxed border border-zinc-800">
                    {email.draft_reply}
                  </pre>
                  <span className="absolute bottom-3 right-3 text-zinc-600 text-[10px] font-mono">
                    {email.draft_reply?.length} chars
                  </span>
                </div>
              )}

              {/* Action buttons */}
              {isProcessed && !editMode && (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={approve}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-colors shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <path d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                    Approve & Send
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditMode(true); setDraftText(email.draft_reply); }}
                      className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-xl transition-colors"
                    >
                      Edit Draft
                    </button>
                    <button
                      onClick={reject}
                      className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-sm font-medium rounded-xl transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )}

              {isSent && (
                <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-green-400 flex-shrink-0"><path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <div>
                    <p className="text-green-400 font-semibold text-sm">Reply Sent</p>
                    <p className="text-green-600 text-xs font-mono">{fmt(email.sent_at)}</p>
                  </div>
                </div>
              )}

              {isRejected && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-red-400 flex-shrink-0"><path d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <div>
                    <p className="text-red-400 font-semibold text-sm">Rejected</p>
                    <p className="text-red-600 text-xs font-mono">{fmt(email.rejected_at)}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
