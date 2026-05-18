import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const NODE_STYLE = {
  classifier: {
    badge: "bg-purple-100 text-purple-800 border border-purple-200",
    icon: "🔍",
    label: "Classifier",
  },
  priority: {
    badge: "bg-orange-100 text-orange-800 border border-orange-200",
    icon: "⚡",
    label: "Priority",
  },
  draft: {
    badge: "bg-blue-100 text-blue-800 border border-blue-200",
    icon: "✍️",
    label: "Draft",
  },
  memory: {
    badge: "bg-green-100 text-green-800 border border-green-200",
    icon: "🧠",
    label: "Memory",
  },
};

function fmt(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString();
}

const NODES = ["all", "classifier", "priority", "draft", "memory"];

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

  useEffect(() => {
    fetch_();
  }, []);

  const toggle = (i) => {
    const next = new Set(expanded);
    next.has(i) ? next.delete(i) : next.add(i);
    setExpanded(next);
  };

  const filtered = filter === "all" ? logs : logs.filter((l) => l.node === filter);

  const counts = NODES.reduce((acc, n) => {
    acc[n] = n === "all" ? logs.length : logs.filter((l) => l.node === n).length;
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agent Logs</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {logs.length} decision entries · newest first
          </p>
        </div>
        <button
          onClick={fetch_}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4">
        {Object.entries(NODE_STYLE).map(([k, v]) => (
          <div key={k} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${v.badge}`}>
            <span>{v.icon}</span> {v.label}
          </div>
        ))}
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        {NODES.map((n) => (
          <button
            key={n}
            onClick={() => setFilter(n)}
            className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-all ${
              filter === n
                ? "bg-indigo-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {NODE_STYLE[n]?.icon || ""} {n}
            <span className={`ml-1.5 ${filter === n ? "text-indigo-300" : "text-gray-400"}`}>
              {counts[n]}
            </span>
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          <span className="ml-3 text-gray-500">Loading logs…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 text-gray-400">
          <p className="text-5xl mb-3">📋</p>
          <p className="font-medium text-gray-500">No logs yet</p>
          <p className="text-sm mt-1">Process emails from the Inbox to generate agent decisions.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((log, i) => {
            const ns = NODE_STYLE[log.node] || {
              badge: "bg-gray-100 text-gray-700",
              icon: "📝",
              label: log.node,
            };
            const open = expanded.has(i);
            return (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
              >
                {/* Summary row */}
                <div
                  className="flex items-start gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggle(i)}
                >
                  <span className="text-xl flex-shrink-0 mt-0.5">{ns.icon}</span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${ns.badge}`}>
                        {ns.label}
                      </span>
                      <code className="text-xs text-gray-400 font-mono truncate">
                        {log.email_id}
                      </code>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{log.decision}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{log.reasoning}</p>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-gray-400">{fmt(log.timestamp)}</span>
                    <span className="text-gray-400 text-xs">{open ? "▲" : "▼"}</span>
                  </div>
                </div>

                {/* JSON detail */}
                {open && (
                  <div className="border-t border-gray-100 bg-gray-950 p-4">
                    <p className="text-xs text-gray-500 font-mono mb-2">// Full log entry</p>
                    <pre className="text-xs text-green-400 font-mono overflow-x-auto leading-relaxed">
                      {JSON.stringify(log, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
