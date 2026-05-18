import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const CAT_COLOR = {
  urgent: "bg-red-100 text-red-800",
  "follow-up": "bg-yellow-100 text-yellow-800",
  "action-required": "bg-orange-100 text-orange-800",
  newsletter: "bg-gray-100 text-gray-600",
};

function fmt(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

export default function SentLog() {
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [error, setError] = useState(null);

  const fetch_ = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`${API_URL}/sent`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const d = await r.json();
      setSent(d.sent || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch_();
  }, []);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sent Log</h1>
          <p className="text-gray-500 text-sm mt-0.5">{sent.length} replies sent</p>
        </div>
        <button
          onClick={fetch_}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          <span className="ml-3 text-gray-500">Loading…</span>
        </div>
      ) : sent.length === 0 ? (
        <div className="text-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <p className="text-5xl mb-3">📤</p>
          <p className="font-medium text-gray-500">No replies sent yet</p>
          <p className="text-sm mt-1 text-gray-400">
            Process and approve emails from the Inbox to see them here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Recipient", "Subject", "Category", "Priority", "Sent At", "Reply"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sent.map((item, i) => (
                <>
                  <tr
                    key={i}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setExpanded(expanded === i ? null : i)}
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-gray-900">{item.to_name}</p>
                      <p className="text-xs text-gray-400 truncate max-w-[160px]">{item.to}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-700 truncate max-w-[200px]">{item.subject}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                          CAT_COLOR[item.category] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {item.category?.replace(/-/g, " ")}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-bold text-gray-800">
                        {item.priority_score}
                        <span className="text-gray-400 font-normal">/10</span>
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs text-gray-500">{fmt(item.sent_at)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs text-indigo-600 font-semibold">
                        {expanded === i ? "Hide ▲" : "View ▼"}
                      </span>
                    </td>
                  </tr>
                  {expanded === i && (
                    <tr key={`${i}-exp`} className="bg-indigo-50">
                      <td colSpan={6} className="px-5 py-4">
                        <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-2">
                          Reply Body
                        </p>
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed bg-white rounded-xl p-4 border border-indigo-100">
                          {item.body}
                        </pre>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
