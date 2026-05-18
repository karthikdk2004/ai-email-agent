import { useState } from "react";
import AgentLogs from "./components/AgentLogs";
import EmailDetail from "./components/EmailDetail";
import Inbox from "./components/Inbox";
import Navbar from "./components/Navbar";
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
    <div className="min-h-screen bg-gray-50">
      <Navbar currentView={navView} onViewChange={handleNavChange} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
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
  );
}
