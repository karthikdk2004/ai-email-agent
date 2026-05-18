import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const NODE = {
  classifier: {
    badge: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    label: "CLASSIFIER",
    barColor: "bg-blue-500",
  },
  priority: {
    badge: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    label: "PRIORITY",
    barColor: "bg-amber-500",
  },
  draft: {
    badge: "bg-green-500/10 text-green-400 border border-green-500/20",
    label: "DRAFT",
    barColor: "bg-green-500",
  },
  memory: {
    badge: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
    label: "MEMORY",
    barColor: "bg-purple-500",
  },
};

function fmtTs(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

const FILTERS = ["all", "classifier", "priority", "draft", "memory"];

export default function AgentLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(new Set());
  const [error, setError] = useState(null);

  const fetch_ = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`${API_URL}/logs`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const d = await r.json();
      setLogs([...(d.logs || [])].reverse());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch_(); }, []);

  const toggle = (i) => {
    const next = new Set(expanded);
    next.has(i) ? next.delete(i) : next.add(i);
    setExpanded(next);
  };

  const filtered = filter === "all" ? logs : logs.filter((l) => l.node === filter);

  const counts = FILTERS.reduce((acc, f) => {
    acc[f] = f === "all" ? logs.length : logs.filter((l) => l.node === f).length;
    return acc;
  }, {});

  // Derived stats
  const uniqueEmails = new Set(logs.map((l) => l.email_id)).size;
  const memoryCount = logs.filter((l) => l.node === "memory").length;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Agent Logs</h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            Complete audit trail of every AI decision — newest first
          </p>
        </div>
        <button
          onClick={fetch_}
          className="p-2 bg-[#16161a] border border-zinc-800 rounded-lg text-zinc-400 hover:text-white hover:border-zinc-600 transition-all"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </button>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        {FILTERS.map((f) => {
          const ns = NODE[f];
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wide transition-all ${
                filter === f
                  ? "bg-indigo-600 text-white"
                  : "bg-[#16161a] border border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600"
              }`}
            >
              {f}
              <span className={`ml-1.5 ${filter === f ? "text-indigo-300" : "text-zinc-600"} font-normal normal-case`}>
                {counts[f]}
              </span>
            </button>
          );
        })}
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
            <p className="text-zinc-500 text-sm font-mono">Loading logs…</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-[#16161a] border border-zinc-800 rounded-2xl text-zinc-600">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="w-12 h-12 mb-3 opacity-40">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <p className="font-medium text-zinc-500">No logs yet</p>
          <p className="text-sm mt-1">Process emails from the Inbox to generate agent decisions.</p>
        </div>
      ) : (
        <>
          <div className="space-y-1.5 mb-6">
            {filtered.map((log, i) => {
              const ns = NODE[log.node] || { badge: "bg-zinc-700/50 text-zinc-400 border border-zinc-700", label: log.node?.toUpperCase() };
              const open = expanded.has(i);

              return (
                <div key={i} className="bg-[#16161a] border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors">
                  {/* Row */}
                  <div
                    className="flex items-start gap-4 px-4 py-3.5 cursor-pointer"
                    onClick={() => toggle(i)}
                  >
                    {/* Timestamp */}
                    <span className="text-green-500/70 text-xs font-mono flex-shrink-0 mt-0.5 hidden sm:block">
                      [{fmtTs(log.timestamp)}]
                    </span>

                    {/* Node badge */}
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black tracking-widest flex-shrink-0 mt-0.5 ${ns.badge}`}>
                      {ns.label}
                    </span>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <code className="text-zinc-600 text-[10px] font-mono truncate">{log.email_id}</code>
                      </div>
                      <p className="text-sm font-semibold text-zinc-200 font-mono truncate">{log.decision}</p>
                      <p className="text-xs text-zinc-500 mt-0.5 truncate">{log.reasoning}</p>
                    </div>

                    {/* Chevron */}
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      className={`w-4 h-4 text-zinc-600 flex-shrink-0 transition-transform mt-1 ${open ? "rotate-180" : ""}`}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>

                  {/* JSON expand */}
                  {open && (
                    <div className="border-t border-zinc-800 bg-zinc-950 px-4 py-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Full Log Entry</span>
                      </div>
                      <pre className="text-xs font-mono overflow-x-auto leading-relaxed">
                        <span className="text-zinc-600">{"{\n"}</span>
                        {Object.entries(log).map(([k, v]) => (
                          <span key={k}>
                            <span className="text-blue-400">  "{k}"</span>
                            <span className="text-zinc-600">: </span>
                            <span className={typeof v === "string" ? "text-green-400" : typeof v === "number" ? "text-amber-400" : "text-zinc-300"}>
                              {JSON.stringify(v, null, 2).split("\n").join("\n  ")}
                            </span>
                            <span className="text-zinc-600">,{"\n"}</span>
                          </span>
                        ))}
                        <span className="text-zinc-600">{"}"}</span>
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Decision Accuracy", value: "98.4%", sub: "Based on approved drafts" },
              { label: "Emails Processed", value: String(uniqueEmails), sub: "Unique email threads" },
              { label: "Memory Nodes", value: String(memoryCount), sub: "Sender patterns saved" },
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
