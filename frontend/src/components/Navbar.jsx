import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const NAV_ITEMS = [
  { id: "inbox", label: "Inbox" },
  { id: "sent", label: "Sent Log" },
  { id: "logs", label: "Agent Logs" },
];

export default function Navbar({ currentView, onViewChange, onToggleSidebar }) {
  const [agentStatus, setAgentStatus] = useState("checking"); // "online" | "offline" | "checking"

  useEffect(() => {
    const check = async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);
      try {
        const r = await fetch(`${API_URL}/health`, { signal: controller.signal });
        setAgentStatus(r.ok ? "online" : "offline");
      } catch {
        setAgentStatus("offline");
      } finally {
        clearTimeout(timeout);
      }
    };

    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  const statusColors = {
    online: {
      wrapper: "bg-green-500/10 border-green-500/20",
      ping: "bg-green-400",
      dot: "bg-green-500",
      text: "text-green-400",
      label: "Agent Online",
    },
    offline: {
      wrapper: "bg-red-500/10 border-red-500/20",
      ping: "bg-red-400",
      dot: "bg-red-500",
      text: "text-red-400",
      label: "Agent Offline",
    },
    checking: {
      wrapper: "bg-zinc-500/10 border-zinc-500/20",
      ping: "bg-zinc-400",
      dot: "bg-zinc-500",
      text: "text-zinc-400",
      label: "Checking…",
    },
  };

  const sc = statusColors[agentStatus];

  return (
    <header className="flex-shrink-0 h-14 bg-[#111113] border-b border-zinc-800 flex items-center px-4 lg:px-6 gap-3 lg:gap-6">
      {/* Hamburger (mobile only) */}
      <button
        onClick={onToggleSidebar}
        className="lg:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-all flex-shrink-0"
        aria-label="Toggle sidebar"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </button>

      {/* Logo */}
      <button
        onClick={() => onViewChange("inbox")}
        className="flex items-center gap-2.5 hover:opacity-80 transition-opacity flex-shrink-0"
      >
        <div className="w-7 h-7 bg-indigo-600 rounded-md flex items-center justify-center shadow-sm">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
            <path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>
        <span className="text-white font-bold text-sm tracking-tight hidden sm:block">AI Email Agent</span>
      </button>

      {/* Center nav */}
      <nav className="flex items-center gap-1 flex-1 justify-center">
        {NAV_ITEMS.map((item) => {
          const active = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`relative px-3 lg:px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                active ? "text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {item.label}
              {active && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-0.5 bg-indigo-500 rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Right: status + avatar */}
      <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
        <div className={`flex items-center gap-2 px-3 py-1.5 border rounded-full ${sc.wrapper}`}>
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${sc.ping}`} />
            <span className={`relative inline-flex rounded-full h-2 w-2 ${sc.dot}`} />
          </span>
          <span className={`text-xs font-medium hidden sm:block ${sc.text}`}>{sc.label}</span>
        </div>

        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
          AI
        </div>
      </div>
    </header>
  );
}
