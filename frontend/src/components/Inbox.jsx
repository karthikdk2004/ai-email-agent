import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const CAT = {
  urgent: {
    badge: "bg-red-100 text-red-800 border border-red-200",
    bar: "border-l-red-500",
    dot: "bg-red-500",
  },
  "follow-up": {
    badge: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    bar: "border-l-yellow-500",
    dot: "bg-yellow-500",
  },
  "action-required": {
    badge: "bg-orange-100 text-orange-800 border border-orange-200",
    bar: "border-l-orange-500",
    dot: "bg-orange-500",
  },
  newsletter: {
    badge: "bg-gray-100 text-gray-600 border border-gray-200",
    bar: "border-l-gray-400",
    dot: "bg-gray-400",
  },
  unprocessed: {
    badge: "bg-blue-50 text-blue-700 border border-blue-200",
    bar: "border-l-blue-300",
    dot: "bg-blue-400",
  },
};

function priorityChip(score) {
  if (!score) return null;
  const color =
    score >= 9
      ? "bg-red-600 text-white"
      : score >= 7
      ? "bg-orange-500 text-white"
      : score >= 5
      ? "bg-yellow-500 text-white"
      : "bg-green-500 text-white";
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${color}`}>
      P{score}
    </span>
  );
}

function timeAgo(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(iso).toLocaleDateString();
}

const FILTERS = ["all", "unprocessed", "urgent", "follow-up", "action-required", "newsletter"];

export default function Inbox({ onSelect }) {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState(null);

  const fetch_ = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`${API_URL}/emails`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const d = await r.json();
      setEmails(d.emails || []);
    } catch (e) {
      setError(`Cannot reach backend: ${e.message}. Is it running on ${API_URL}?`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch_();
  }, []);

  const filtered =
    filter === "all"
      ? emails
      : filter === "unprocessed"
      ? emails.filter((e) => !e.category)
      : emails.filter((e) => e.category === filter);

  const counts = FILTERS.reduce((acc, f) => {
    acc[f] =
      f === "all"
        ? emails.length
        : f === "unprocessed"
        ? emails.filter((e) => !e.category).length
        : emails.filter((e) => e.category === f).length;
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {emails.length} emails · click any to open
          </p>
        </div>
        <button
          onClick={fetch_}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-all ${
              filter === f
                ? "bg-indigo-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f.replace(/-/g, " ")}
            <span
              className={`ml-1.5 ${filter === f ? "text-indigo-200" : "text-gray-400"}`}
            >
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          <span className="ml-3 text-gray-500">Loading emails…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-3">📭</p>
          <p className="font-medium">No emails in this category</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((email) => {
            const key = email.category || "unprocessed";
            const cfg = CAT[key] || CAT.unprocessed;
            const dimmed = ["sent", "rejected"].includes(email.status);
            return (
              <div
                key={email.id}
                onClick={() => onSelect(email)}
                className={`group bg-white rounded-xl border border-gray-100 border-l-4 ${cfg.bar} p-4 cursor-pointer hover:shadow-md transition-all ${dimmed ? "opacity-60" : ""}`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0 group-hover:bg-indigo-200 transition-colors">
                    {email.from_name?.[0]?.toUpperCase() || "?"}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-gray-900 text-sm truncate">
                        {email.from_name}
                      </span>
                      <span className="text-gray-400 text-xs flex-shrink-0">
                        {timeAgo(email.timestamp)}
                      </span>
                    </div>
                    <p className="text-gray-800 text-sm font-medium truncate">{email.subject}</p>
                    <p className="text-gray-400 text-xs truncate mt-0.5">
                      {email.body?.substring(0, 110).replace(/\n/g, " ")}…
                    </p>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    {priorityChip(email.priority_score)}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${cfg.badge}`}>
                      {key.replace(/-/g, " ")}
                    </span>
                    {email.status && !["unprocessed", null].includes(email.status) && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                          email.status === "sent"
                            ? "bg-green-100 text-green-700"
                            : email.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : email.status === "processing"
                            ? "bg-blue-100 text-blue-700 animate-pulse"
                            : email.status === "processed"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {email.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
