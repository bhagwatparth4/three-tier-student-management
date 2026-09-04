import React, { useEffect, useState } from "react";
import api from "../api/client.js";

export default function FeesPanel() {
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState({});
  const [message, setMessage] = useState("");

  const load = async () => {
    try {
      const { data } = await api.get("/students");
      setStudents(data);
    } catch {
      setMessage("Could not load fee records.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const totals = students.reduce(
    (acc, s) => {
      acc.total += s.fees?.total ?? 0;
      acc.paid += s.fees?.paid ?? 0;
      return acc;
    },
    { total: 0, paid: 0 }
  );

  const recordPayment = async (id) => {
    const amount = Number(payments[id]);
    if (!amount || amount <= 0) return;
    try {
      await api.post(`/students/${id}/payments`, { amount });
      setPayments({ ...payments, [id]: "" });
      setMessage("Payment recorded.");
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not record payment.");
    }
  };

  return (
    <section className="card">
      <div className="toolbar">
        <div>
          <h2>Fees Overview</h2>
          <p>{students.length} student(s)</p>
        </div>
      </div>

      <div className="stat-row">
        <div className="stat">
          <span className="stat-label">Total Fees</span>
          <span className="stat-value">₹{totals.total.toLocaleString()}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Collected</span>
          <span className="stat-value good">₹{totals.paid.toLocaleString()}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Outstanding</span>
          <span className="stat-value bad">₹{(totals.total - totals.paid).toLocaleString()}</span>
        </div>
      </div>

      {message && <p className="message">{message}</p>}

      <div className="tableWrap">
        <table>
          <thead>
            <tr>
              <th>Name</th><th>Course</th><th>Total</th><th>Paid</th><th>Due</th><th>Record Payment</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => {
              const due = (s.fees?.total ?? 0) - (s.fees?.paid ?? 0);
              return (
                <tr key={s._id}>
                  <td>{s.name}</td>
                  <td>{s.course}</td>
                  <td>₹{(s.fees?.total ?? 0).toLocaleString()}</td>
                  <td>₹{(s.fees?.paid ?? 0).toLocaleString()}</td>
                  <td className={due > 0 ? "bad" : "good"}>₹{due.toLocaleString()}</td>
                  <td className="payment-cell">
                    <input
                      type="number"
                      min="0"
                      placeholder="Amount"
                      value={payments[s._id] || ""}
                      onChange={(e) => setPayments({ ...payments, [s._id]: e.target.value })}
                      disabled={due <= 0}
                    />
                    <button className="ghost small" onClick={() => recordPayment(s._id)} disabled={due <= 0}>
                      Pay
                    </button>
                  </td>
                </tr>
              );
            })}
            {!students.length && (
              <tr><td colSpan="6" className="empty">No fee records yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
