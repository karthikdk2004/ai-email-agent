const DOCS = [
  {
    name: "Email Style Guide.pdf",
    size: "142 KB",
    ext: "pdf",
    color: "text-red-400",
  },
  {
    name: "Company Communication Policy.md",
    size: "38 KB",
    ext: "md",
    color: "text-blue-400",
  },
  {
    name: "Sender Profiles.json",
    size: "91 KB",
    ext: "json",
    color: "text-yellow-400",
  },
];

function FileIcon({ ext, color }) {
  return (
    <div className={`w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0`}>
      <span className={`text-[10px] font-bold font-mono uppercase ${color}`}>{ext}</span>
    </div>
  );
}

export default function KnowledgeBase() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-white text-xl font-bold">Knowledge Base</h1>
        <p className="text-zinc-500 text-sm mt-1">Documents used by the agent for context and decision-making.</p>
      </div>

      <div className="bg-[#111113] border border-zinc-800 rounded-xl overflow-hidden mb-4">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <span className="text-zinc-300 text-sm font-semibold">Active Documents</span>
          <span className="text-zinc-600 text-xs font-mono">{DOCS.length} files</span>
        </div>

        <div className="divide-y divide-zinc-800/60">
          {DOCS.map((doc) => (
            <div key={doc.name} className="px-6 py-4 flex items-center gap-4 group hover:bg-zinc-800/20 transition-colors">
              <FileIcon ext={doc.ext} color={doc.color} />
              <div className="flex-1 min-w-0">
                <p className="text-zinc-200 text-sm font-medium truncate">{doc.name}</p>
                <p className="text-zinc-600 text-xs mt-0.5 font-mono">{doc.size}</p>
              </div>
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/50 border border-emerald-700/40 rounded-full text-[11px] font-semibold text-emerald-400 flex-shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                Active
              </span>
            </div>
          ))}
        </div>
      </div>

      <button
        disabled
        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium rounded-lg hover:bg-indigo-600/20 transition-colors cursor-not-allowed opacity-60"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        Upload Document
      </button>
      <p className="text-zinc-700 text-xs mt-2 ml-1">Document uploads available in v2.0</p>
    </div>
  );
}
