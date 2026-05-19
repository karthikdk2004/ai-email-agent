import { useEffect, useRef, useState } from "react";

const INITIAL_DOCS = [
  { name: "Email Style Guide.pdf", size: "142 KB", ext: "pdf", color: "text-red-400", fixed: true },
  { name: "Company Communication Policy.md", size: "38 KB", ext: "md", color: "text-blue-400", fixed: true },
  { name: "Sender Profiles.json", size: "91 KB", ext: "json", color: "text-yellow-400", fixed: true },
];

function extColor(ext) {
  const map = { pdf: "text-red-400", md: "text-blue-400", json: "text-yellow-400", txt: "text-zinc-400", docx: "text-blue-300", csv: "text-green-400" };
  return map[ext?.toLowerCase()] || "text-zinc-400";
}

function FileIcon({ ext, color }) {
  return (
    <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0">
      <span className={`text-[10px] font-bold font-mono uppercase ${color}`}>{ext}</span>
    </div>
  );
}

function fmtSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function KnowledgeBase() {
  const [docs, setDocs] = useState(() => {
    try {
      const stored = localStorage.getItem("knowledgeBaseDocs");
      if (stored) return JSON.parse(stored);
    } catch (_) {}
    return INITIAL_DOCS;
  });
  const fileInputRef = useRef(null);

  const persist = (next) => {
    setDocs(next);
    localStorage.setItem("knowledgeBaseDocs", JSON.stringify(next));
  };

  const handleRemove = (index) => {
    persist(docs.filter((_, i) => i !== index));
  };

  const handleUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newDocs = files.map((f) => {
      const parts = f.name.split(".");
      const ext = parts.length > 1 ? parts[parts.length - 1] : "bin";
      return {
        name: f.name,
        size: fmtSize(f.size),
        ext,
        color: extColor(ext),
        fixed: false,
      };
    });
    persist([...docs, ...newDocs]);
    e.target.value = "";
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-white text-xl font-bold">Knowledge Base</h1>
        <p className="text-zinc-500 text-sm mt-1">Documents used by the agent for context and decision-making.</p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 px-4 py-3 bg-indigo-950/30 border border-indigo-800/30 rounded-lg mb-4">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
        <p className="text-indigo-400/80 text-xs leading-relaxed">
          Documents are used for agent context in future versions. Uploaded files are stored locally for reference.
        </p>
      </div>

      <div className="bg-[#111113] border border-zinc-800 rounded-xl overflow-hidden mb-4">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <span className="text-zinc-300 text-sm font-semibold">Active Documents</span>
          <span className="text-zinc-600 text-xs font-mono">{docs.length} files</span>
        </div>

        {docs.length === 0 ? (
          <div className="px-6 py-10 text-center text-zinc-600">
            <p className="text-sm">No documents yet. Upload one below.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/60">
            {docs.map((doc, i) => (
              <div key={`${doc.name}-${i}`} className="px-6 py-4 flex items-center gap-4 group hover:bg-zinc-800/20 transition-colors">
                <FileIcon ext={doc.ext} color={doc.color} />
                <div className="flex-1 min-w-0">
                  <p className="text-zinc-200 text-sm font-medium truncate">{doc.name}</p>
                  <p className="text-zinc-600 text-xs mt-0.5 font-mono">{doc.size}</p>
                </div>
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/50 border border-emerald-700/40 rounded-full text-[11px] font-semibold text-emerald-400 flex-shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  Active
                </span>
                {!doc.fixed && (
                  <button
                    onClick={() => handleRemove(i)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    title="Remove document"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                      <path d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                {doc.fixed && (
                  <div className="w-7 h-7 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleUpload}
        accept="*/*"
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium rounded-lg hover:bg-indigo-600/20 hover:border-indigo-500/40 transition-colors"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        Upload Document
      </button>
    </div>
  );
}
