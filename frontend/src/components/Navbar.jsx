export default function Navbar({ currentView, onViewChange }) {
  const items = [
    { id: "inbox", label: "Inbox", icon: "📥" },
    { id: "sent", label: "Sent Log", icon: "📤" },
    { id: "logs", label: "Agent Logs", icon: "📋" },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <button
            onClick={() => onViewChange("inbox")}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-lg shadow-sm">
              🤖
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-900 leading-tight text-sm">AI Email Agent</p>
              <p className="text-xs text-gray-400">LangGraph · Groq · LLaMA 3.3-70B</p>
            </div>
          </button>

          {/* Nav links */}
          <div className="flex items-center gap-1">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentView === item.id
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span>{item.icon}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
