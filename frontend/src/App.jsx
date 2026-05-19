import { useState } from "react";
import AgentConfig from "./components/AgentConfig";
import AgentLogs from "./components/AgentLogs";
import EmailDetail from "./components/EmailDetail";
import ErrorBoundary from "./components/ErrorBoundary";
import Inbox from "./components/Inbox";
import KnowledgeBase from "./components/KnowledgeBase";
import Navbar from "./components/Navbar";
import Settings from "./components/Settings";
import Sidebar from "./components/Sidebar";
import SentLog from "./components/SentLog";

export default function App() {
  const [view, setView] = useState("inbox");
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openEmail = (email) => {
    setSelectedEmail(email);
    setView("detail");
  };

  const goBack = () => {
    setSelectedEmail(null);
    setView("inbox");
  };

  const handleNavChange = (v) => {
    if (v !== "detail") setSelectedEmail(null);
    setView(v);
    setSidebarOpen(false);
  };

  const navView = view === "detail" ? "inbox" : view;

  return (
    <div className="flex h-full overflow-hidden bg-[#0d0d0f]">
      {/* Sidebar (desktop: flex child; mobile: fixed overlay) */}
      <Sidebar
        currentView={navView}
        onViewChange={handleNavChange}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          currentView={navView}
          onViewChange={handleNavChange}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <ErrorBoundary>
            {view === "inbox" && <Inbox onSelect={openEmail} />}
            {view === "detail" && selectedEmail && (
              <EmailDetail
                email={selectedEmail}
                onBack={goBack}
                onUpdate={(updated) => setSelectedEmail(updated)}
              />
            )}
            {view === "sent" && <SentLog />}
            {view === "logs" && <AgentLogs />}
            {view === "agent-config" && <AgentConfig />}
            {view === "knowledge-base" && <KnowledgeBase />}
            {view === "settings" && <Settings />}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
