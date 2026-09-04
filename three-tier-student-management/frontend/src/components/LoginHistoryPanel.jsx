import React, { useEffect, useState } from "react";
import api from "../api/client.js";

export default function LoginHistoryPanel() {
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get("/auth/login-history")
      .then(({ data }) => setHistory(data))
      .catch(() => setMessage("Could not load login history."));
  }, []);

  return (
    <section className="card">
      <div className="toolbar">
        <div>
          <h2>Login History</h2>
          <p>Last {history.length} sign-in(s)</p>
        </div>
      </div>

      {message && <p className="message">{message}</p>}

      <div className="tableWrap">
        <table>
          <thead>
            <tr><th>Date &amp; Time</th><th>IP Address</th><th>Device / Browser</th></tr>
          </thead>
          <tbody>
            {history.map((h) => (
              <tr key={h._id}>
                <td>{new Date(h.loginAt).toLocaleString()}</td>
                <td>{h.ip}</td>
                <td className="ua-cell">{h.userAgent}</td>
              </tr>
            ))}
            {!history.length && (
              <tr><td colSpan="3" className="empty">No login history yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
