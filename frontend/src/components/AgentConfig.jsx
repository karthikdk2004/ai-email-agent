export default function AgentConfig() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-white text-xl font-bold">Agent Configuration</h1>
        <p className="text-zinc-500 text-sm mt-1">Model and inference settings for the active agent.</p>
      </div>

      <div className="bg-[#111113] border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <span className="text-zinc-300 text-sm font-semibold">Model Parameters</span>
          <span className="px-2.5 py-1 bg-zinc-900 border border-zinc-700/80 rounded-full text-[10px] text-zinc-500 font-mono font-semibold tracking-wide uppercase">
            Read-only
          </span>
        </div>

        <div className="divide-y divide-zinc-800/60">
          {/* Model */}
          <div className="px-6 py-5 flex items-center justify-between">
            <div>
              <p className="text-zinc-200 text-sm font-medium">Model</p>
              <p className="text-zinc-600 text-xs mt-0.5">Base language model used for inference</p>
            </div>
            <select
              disabled
              className="bg-zinc-900 border border-zinc-700/80 text-zinc-400 text-sm rounded-lg px-3 py-2 pr-8 font-mono cursor-not-allowed opacity-70"
              defaultValue="llama-3.3-70b-versatile"
            >
              <option>llama-3.3-70b-versatile</option>
            </select>
          </div>

          {/* Temperature */}
          <div className="px-6 py-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-zinc-200 text-sm font-medium">Temperature</p>
                <p className="text-zinc-600 text-xs mt-0.5">Controls output randomness (0 = deterministic, 1 = creative)</p>
              </div>
              <span className="text-indigo-400 text-sm font-mono font-semibold">0.7</span>
            </div>
            <div className="relative">
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                defaultValue={0.7}
                disabled
                className="w-full h-1.5 rounded-full appearance-none cursor-not-allowed opacity-60"
                style={{
                  background: "linear-gradient(to right, #6366f1 70%, #3f3f46 70%)",
                }}
              />
            </div>
          </div>

          {/* Max tokens */}
          <div className="px-6 py-5 flex items-center justify-between">
            <div>
              <p className="text-zinc-200 text-sm font-medium">Max Tokens</p>
              <p className="text-zinc-600 text-xs mt-0.5">Maximum tokens in the generated response</p>
            </div>
            <input
              type="number"
              disabled
              defaultValue={1000}
              className="w-24 bg-zinc-900 border border-zinc-700/80 text-zinc-400 text-sm rounded-lg px-3 py-2 text-right font-mono cursor-not-allowed opacity-70"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-3 px-4 py-3 bg-amber-950/30 border border-amber-800/30 rounded-lg">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <p className="text-amber-400/80 text-xs leading-relaxed">
          Configuration locked in <span className="font-mono font-semibold text-amber-400">v1.0</span>. Parameters will be fully editable in <span className="font-mono font-semibold text-amber-400">v2.0</span>.
        </p>
      </div>
    </div>
  );
}
