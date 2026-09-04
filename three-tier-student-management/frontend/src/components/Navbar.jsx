import React from "react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar({ tab, setTab }) {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div>
        <p className="eyebrow">3-TIER • DOCKER • MONGODB</p>
        <h1>Student Management</h1>
      </div>

      <nav className="tabs">
        <button className={tab === "students" ? "active" : ""} onClick={() => setTab("students")}>
          Students
        </button>
        <button className={tab === "fees" ? "active" : ""} onClick={() => setTab("fees")}>
          Fees
        </button>
        <button className={tab === "history" ? "active" : ""} onClick={() => setTab("history")}>
          Login History
        </button>
      </nav>

      <div className="navbar-user">
        <span className="status">● Online</span>
        <div className="user-chip">
          <span className="avatar">{user?.name?.[0]?.toUpperCase() || "?"}</span>
          <span>{user?.name}</span>
        </div>
        <button className="ghost" onClick={logout}>Log out</button>
      </div>
    </header>
  );
}
