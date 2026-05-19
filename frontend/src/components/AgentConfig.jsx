import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const DEFAULTS = {
  model: "llama-3.3-70b-versatile",
  temperature: 0.7,
  maxTokens: 1000,
};

const MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-70b-versatile",
  "llama-3.1-8b-instant",
  "mixtral-8x7b-32768",
];

export default function AgentConfig() {
  const [config, setConfig] = useState(DEFAULTS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch(`${API_URL}/config`);
        if (r.ok) {
          const d = await r.json();
          setConfig({
            model: d.model || DEFAULTS.model,
            temperature: d.temperature ?? DEFAULTS.temperature,
            maxTokens: d.max_tokens || DEFAULTS.maxTokens,
          });
          return;
        }
      } catch (_) {}
      const stored = localStorage.getItem("agentConfig");
      if (stored) {
        try { setConfig(JSON.parse(stored)); } catch (_) {}
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    localStorage.setItem("agentConfig", JSON.stringify(config));
    try {
      await fetch(`${API_URL}/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: config.model,
          temperature: config.temperature,
          max_tokens: config.maxTokens,
        }),
      });
    } catch (_) {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setConfig(DEFAULTS);
    localStorage.removeItem("agentConfig");
  };

  const tempPct = Math.round(config.temperature * 100);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-white text-xl font-bold">Agent Configuration</h1>
        <p className="text-zinc-500 text-sm mt-1">Model and inference settings for the active agent.</p>
      </div>

      <div className="bg-[#111113] border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <span className="text-zinc-300 text-sm font-semibold">Model Parameters</span>
          <span className="px-2.5 py-1 bg-indigo-900/40 border border-indigo-700/40 rounded-full text-[10px] text-indigo-400 font-mono font-semibold tracking-wide uppercase">
            Editable
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
              value={config.model}
              onChange={(e) => setConfig((c) => ({ ...c, model: e.target.value }))}
              className="bg-zinc-900 border border-zinc-700/80 text-zinc-300 text-sm rounded-lg px-3 py-2 pr-8 font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-colors cursor-pointer"
            >
              {MODELS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Temperature */}
          <div className="px-6 py-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-zinc-200 text-sm font-medium">Temperature</p>
                <p className="text-zinc-600 text-xs mt-0.5">Controls output randomness (0 = deterministic, 1 = creative)</p>
              </div>
              <span className="text-indigo-400 text-sm font-mono font-semibold">{config.temperature.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={config.temperature}
              onChange={(e) => setConfig((c) => ({ ...c, temperature: parseFloat(e.target.value) }))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer focus:outline-none"
              style={{
                background: `linear-gradient(to right, #6366f1 ${tempPct}%, #3f3f46 ${tempPct}%)`,
              }}
            />
          </div>

          {/* Max tokens */}
          <div className="px-6 py-5 flex items-center justify-between">
            <div>
              <p className="text-zinc-200 text-sm font-medium">Max Tokens</p>
              <p className="text-zinc-600 text-xs mt-0.5">Maximum tokens in the generated response</p>
            </div>
            <input
              type="number"
              min={100}
              max={8000}
              step={100}
              value={config.maxTokens}
              onChange={(e) => setConfig((c) => ({ ...c, maxTokens: parseInt(e.target.value, 10) || 1000 }))}
              className="w-24 bg-zinc-900 border border-zinc-700/80 text-zinc-300 text-sm rounded-lg px-3 py-2 text-right font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Save / Reset */}
      <div className="mt-5 flex items-center justify-between">
        <button
          onClick={handleReset}
          className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
        >
          Reset to defaults
        </button>
        <button
          onClick={handleSave}
          className={`px-5 py-2.5 text-white text-sm font-semibold rounded-lg transition-all shadow-lg ${
            saved
              ? "bg-green-600 shadow-green-900/30"
              : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/30"
          }`}
        >
          {saved ? "✓ Saved" : "Save Configuration"}
        </button>
      </div>
    </div>
  );
}
