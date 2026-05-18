import { useState } from "react";

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 transition-colors duration-200 focus:outline-none ${
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      } ${
        checked
          ? "bg-indigo-600 border-indigo-600"
          : "bg-zinc-700 border-zinc-700"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default function Settings() {
  const [autoProcess, setAutoProcess] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-white text-xl font-bold">Settings</h1>
        <p className="text-zinc-500 text-sm mt-1">Agent behavior and integration settings.</p>
      </div>

      {/* Behavior toggles */}
      <div className="bg-[#111113] border border-zinc-800 rounded-xl overflow-hidden mb-4">
        <div className="px-6 py-4 border-b border-zinc-800">
          <span className="text-zinc-300 text-sm font-semibold">Behavior</span>
        </div>

        <div className="divide-y divide-zinc-800/60">
          {/* Auto-process */}
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-zinc-200 text-sm font-medium">Auto-process emails</p>
              <p className="text-zinc-600 text-xs mt-0.5">Automatically run the agent pipeline on new emails</p>
            </div>
            <Toggle checked={autoProcess} onChange={setAutoProcess} />
          </div>

          {/* Send without approval */}
          <div className="px-6 py-4 flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-zinc-400 text-sm font-medium">Send without approval</p>
                <span className="px-2 py-0.5 bg-red-950/50 border border-red-800/40 rounded text-[10px] font-semibold text-red-400 uppercase tracking-wide">
                  Locked
                </span>
              </div>
              <p className="text-zinc-600 text-xs mt-0.5">Bypass the human-approval step and send replies automatically</p>
              <p className="text-red-500/70 text-xs mt-1.5 flex items-center gap-1">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3 h-3 flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                Disabled for safety — requires admin override in v2.0
              </p>
            </div>
            <Toggle checked={false} onChange={() => {}} disabled />
          </div>

          {/* Email notifications */}
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-zinc-200 text-sm font-medium">Email notifications</p>
              <p className="text-zinc-600 text-xs mt-0.5">Receive a summary email when the agent processes a batch</p>
            </div>
            <Toggle checked={emailNotifications} onChange={setEmailNotifications} />
          </div>
        </div>
      </div>

      {/* API Keys */}
      <div className="bg-[#111113] border border-zinc-800 rounded-xl overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-zinc-800">
          <span className="text-zinc-300 text-sm font-semibold">API Credentials</span>
        </div>

        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-zinc-200 text-sm font-medium font-mono">GROQ_API_KEY</p>
            <p className="text-zinc-600 text-xs mt-0.5">Groq inference API key</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-zinc-500 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg tracking-wider select-none">
              sk-**********************
            </span>
            <span className="flex items-center gap-1 text-emerald-400 text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              Set
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-indigo-900/30">
          Save Settings
        </button>
      </div>
    </div>
  );
}
