import React, { useState } from "react";
import Navbar from "../components/Navbar.jsx";
import StudentsPanel from "../components/StudentsPanel.jsx";
import FeesPanel from "../components/FeesPanel.jsx";
import LoginHistoryPanel from "../components/LoginHistoryPanel.jsx";

export default function Dashboard() {
  const [tab, setTab] = useState("students");

  return (
    <main className="page">
      <Navbar tab={tab} setTab={setTab} />
      {tab === "students" && <StudentsPanel />}
      {tab === "fees" && <FeesPanel />}
      {tab === "history" && <LoginHistoryPanel />}
    </main>
  );
}
