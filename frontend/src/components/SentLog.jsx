import { Fragment, useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const CAT_BADGE = {
  urgent: "bg-red-500/10 text-red-400 border border-red-500/20",
  "follow-up": "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  "action-required": "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  newsletter: "bg-zinc-700/50 text-zinc-400 border border-zinc-700",
};

function fmtTs(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const PAGE_SIZE = 10;

export default function SentLog() {
  const [sent, setSent] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);

  const loadSentLog = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sentRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/sent`),
        fetch(`${API_URL}/stats`),
      ]);
      if (!sentRes.ok) throw new Error(`HTTP ${sentRes.status}`);
      const sentData = await sentRes.json();
      setSent(sentData.sent || []);
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSentLog(); }, []);

  const totalPages = Math.max(1, Math.ceil(sent.length / PAGE_SIZE));
  const paginated = sent.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Real success rate from stats (FIX 1)
  const successRate = (() => {
    if (!stats) return "—";
    const total = (stats.sent || 0) + (stats.rejected || 0);
    if (total === 0) return "—";
    return `${((stats.sent / total) * 100).toFixed(1)}%`;
  })();

  const avgPriority = sent.length
    ? `${(sent.reduce((a, s) => a + (s.priority_score || 0), 0) / sent.length).toFixed(1)}/10`
    : "—";

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Sent Log</h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            Complete record of all automated communications dispatched by your AI agent
          </p>
        </div>
        <button
          onClick={loadSentLog}
          className="p-2 bg-[#16161a] border border-zinc-800 rounded-lg text-zinc-400 hover:text-white hover:border-zinc-600 transition-all"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm font-mono">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
            <p className="text-zinc-500 text-sm font-mono">Loading…</p>
          </div>
        </div>
      ) : sent.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-[#16161a] border border-zinc-800 rounded-2xl text-zinc-600">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="w-12 h-12 mb-3 opacity-40">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
          <p className="font-medium text-zinc-500">No replies sent yet</p>
          <p className="text-sm mt-1">Process and approve emails from the Inbox.</p>
        </div>
      ) : (
        <>
          {/* Table with horizontal scroll on mobile (FIX 11) */}
          <div className="bg-[#16161a] border border-zinc-800 rounded-2xl overflow-hidden mb-4">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-zinc-800">
                    {["SUBJECT", "TO", "SENT AT", "CATEGORY", "STATUS"].map((h) => (
                      <th
                        key={h}
                        className="text-left px-5 py-3.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((item, i) => (
                    <Fragment key={i}>
                      <tr
                        onClick={() => setExpanded(expanded === i ? null : i)}
                        className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/30 cursor-pointer transition-colors"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4 text-indigo-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                              </svg>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-zinc-200 truncate max-w-[200px]">{item.subject}</p>
                              <p className="text-[10px] text-zinc-600">Priority {item.priority_score}/10</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-zinc-300">{item.to_name}</p>
                          <p className="text-xs text-zinc-600 font-mono truncate max-w-[160px]">{item.to}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-xs font-mono text-zinc-400">{fmtTs(item.sent_at)}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-0.5 rounded-md text-xs font-semibold capitalize ${CAT_BADGE[item.category] || "bg-zinc-700/50 text-zinc-400 border border-zinc-700"}`}>
                            {item.category?.replace(/-/g, " ")}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            <span className="text-xs font-semibold text-green-400">Sent</span>
                          </div>
                        </td>
                      </tr>
                      {expanded === i && (
                        <tr>
                          <td colSpan={5} className="px-5 py-5 bg-zinc-950 border-b border-zinc-800">
                            <div className="mb-2 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                              <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Reply Body</span>
                            </div>
                            <pre className="text-sm text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed bg-[#16161a] rounded-xl p-4 border border-zinc-800">
                              {item.body}
                            </pre>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-zinc-800 bg-zinc-900/30">
              <p className="text-xs text-zinc-500 font-mono">
                Showing {Math.min((page - 1) * PAGE_SIZE + 1, sent.length)}–{Math.min(page * PAGE_SIZE, sent.length)} of {sent.length} entries
              </p>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-7 h-7 rounded-md text-xs font-semibold transition-all ${
                      page === p
                        ? "bg-indigo-600 text-white"
                        : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom stats — responsive grid (FIX 11) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Success Rate", value: successRate, sub: "Sent vs rejected ratio" },
              { label: "Total Dispatched", value: String(sent.length), sub: "Approved by human review" },
              { label: "Avg Priority", value: avgPriority, sub: "Across all sent emails" },
            ].map((s) => (
              <div key={s.label} className="bg-[#16161a] border border-zinc-800 rounded-xl p-4">
                <p className="text-2xl font-black text-white font-mono">{s.value}</p>
                <p className="text-xs font-semibold text-zinc-400 mt-0.5">{s.label}</p>
                <p className="text-[10px] text-zinc-600 mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
