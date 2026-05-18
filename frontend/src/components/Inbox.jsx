import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const CAT = {
  urgent: {
    badge: "bg-red-500/10 text-red-400 border border-red-500/20",
    dot: "●",
    label: "URGENT",
    borderColor: "#ef4444",
  },
  "follow-up": {
    badge: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    dot: "●",
    label: "FOLLOW UP",
    borderColor: "#f59e0b",
  },
  "action-required": {
    badge: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    dot: "●",
    label: "ACTION",
    borderColor: "#3b82f6",
  },
  newsletter: {
    badge: "bg-zinc-700/50 text-zinc-400 border border-zinc-700",
    dot: "●",
    label: "NEWS",
    borderColor: "#71717a",
  },
  unprocessed: {
    badge: "bg-transparent text-zinc-500 border border-zinc-700",
    dot: "",
    label: "UNPROCESSED",
    borderColor: "#6366f1",
  },
};

const AVATAR_PALETTE = [
  "bg-red-500/20 text-red-400",
  "bg-orange-500/20 text-orange-400",
  "bg-amber-500/20 text-amber-400",
  "bg-green-500/20 text-green-400",
  "bg-teal-500/20 text-teal-400",
  "bg-cyan-500/20 text-cyan-400",
  "bg-blue-500/20 text-blue-400",
  "bg-indigo-500/20 text-indigo-400",
  "bg-violet-500/20 text-violet-400",
  "bg-purple-500/20 text-purple-400",
  "bg-pink-500/20 text-pink-400",
  "bg-rose-500/20 text-rose-400",
];

function avatarColor(name) {
  if (!name) return AVATAR_PALETTE[7];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length];
}

const PRIORITY_COLOR = (s) => {
  if (!s) return null;
  if (s >= 9) return "bg-red-500/15 text-red-400 border border-red-500/20";
  if (s >= 7) return "bg-orange-500/15 text-orange-400 border border-orange-500/20";
  if (s >= 5) return "bg-amber-500/15 text-amber-400 border border-amber-500/20";
  return "bg-green-500/15 text-green-400 border border-green-500/20";
};

const STATUS_COLOR = {
  sent: "bg-green-500/10 text-green-400 border border-green-500/20",
  rejected: "bg-red-500/10 text-red-400 border border-red-500/20",
  processing: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  processed: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
};

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
  const [search, setSearch] = useState("");
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
      setError(`Cannot reach backend: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch_(); }, []);

  const counts = FILTERS.reduce((acc, f) => {
    acc[f] =
      f === "all"
        ? emails.length
        : f === "unprocessed"
        ? emails.filter((e) => !e.category).length
        : emails.filter((e) => e.category === f).length;
    return acc;
  }, {});

  let filtered = filter === "all"
    ? emails
    : filter === "unprocessed"
    ? emails.filter((e) => !e.category)
    : emails.filter((e) => e.category === filter);

  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.subject?.toLowerCase().includes(q) ||
        e.from_name?.toLowerCase().includes(q) ||
        e.body?.toLowerCase().includes(q)
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Inbox</h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            {emails.length} emails · click any to open
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search emails…"
              className="pl-9 pr-4 py-2 bg-[#16161a] border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 w-52 transition-all"
            />
          </div>
          <button
            onClick={fetch_}
            className="p-2 bg-[#16161a] border border-zinc-800 rounded-lg text-zinc-400 hover:text-white hover:border-zinc-600 transition-all"
            title="Refresh"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
              filter === f
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-900/30"
                : "bg-[#16161a] border border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600"
            }`}
          >
            {f.replace(/-/g, " ")}
            <span className={`ml-1.5 text-xs ${filter === f ? "text-indigo-300" : "text-zinc-600"}`}>
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm font-mono">
          {error}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
            <p className="text-zinc-500 text-sm font-mono">Loading emails…</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-zinc-600">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="w-12 h-12 mb-3 opacity-40">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z" />
          </svg>
          <p className="font-medium text-zinc-500">No emails found</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {filtered.map((email) => {
            const key = email.category || "unprocessed";
            const cfg = CAT[key] || CAT.unprocessed;
            const isUnread = email.status === "unprocessed" || !email.status;
            const pColor = PRIORITY_COLOR(email.priority_score);
            const initials = email.from_name
              ?.split(" ")
              .map((w) => w[0])
              .slice(0, 2)
              .join("")
              .toUpperCase() || "?";

            return (
              <div
                key={email.id}
                onClick={() => onSelect(email)}
                style={{ borderLeft: `4px solid ${cfg.borderColor}` }}
                className={`group flex items-center gap-4 px-4 py-3.5 bg-[#16161a] border border-zinc-800 rounded-xl cursor-pointer hover:border-zinc-600 hover:bg-[#1c1c21] transition-all ${
                  email.status === "sent" || email.status === "rejected" ? "opacity-50" : ""
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${avatarColor(email.from_name)}`}>
                    {initials}
                  </div>
                  {isUnread && (
                    <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#16161a]" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-sm font-semibold truncate ${isUnread ? "text-white" : "text-zinc-300"}`}>
                      {email.from_name}
                    </span>
                    <span className="text-zinc-600 text-xs flex-shrink-0">{timeAgo(email.timestamp)}</span>
                  </div>
                  <p className={`text-sm truncate mb-0.5 ${isUnread ? "text-zinc-200 font-medium" : "text-zinc-400"}`}>
                    {email.subject}
                  </p>
                  <p className="text-zinc-600 text-xs truncate">
                    {email.body?.substring(0, 100).replace(/\n/g, " ")}…
                  </p>
                </div>

                {/* Badges */}
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  {pColor && (
                    <span className={`px-2 py-0.5 rounded-md text-xs font-bold font-mono ${pColor}`}>
                      P{email.priority_score}
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.badge}`}>
                    {cfg.dot && <span className="mr-1 text-[10px]">{cfg.dot}</span>}
                    {cfg.label}
                  </span>
                  {email.status && !["unprocessed", null].includes(email.status) && STATUS_COLOR[email.status] && (
                    <span className={`px-2 py-0.5 rounded-md text-xs font-medium capitalize ${STATUS_COLOR[email.status]}`}>
                      {email.status}
                    </span>
                  )}
                </div>

                {/* Arrow */}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4 text-zinc-700 group-hover:text-zinc-500 flex-shrink-0 transition-colors">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
