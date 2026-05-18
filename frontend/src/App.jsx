import { useState } from "react";
import AgentLogs from "./components/AgentLogs";
import EmailDetail from "./components/EmailDetail";
import Inbox from "./components/Inbox";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import SentLog from "./components/SentLog";

export default function App() {
  const [view, setView] = useState("inbox");
  const [selectedEmail, setSelectedEmail] = useState(null);

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
  };

  const navView = view === "detail" ? "inbox" : view;

  return (
    <div className="flex h-full overflow-hidden bg-[#0d0d0f]">
      {/* Left Sidebar */}
      <Sidebar currentView={navView} onViewChange={handleNavChange} />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar currentView={navView} onViewChange={handleNavChange} />

        <main className="flex-1 overflow-y-auto p-6">
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
        </main>
      </div>
    </div>
  );
}
