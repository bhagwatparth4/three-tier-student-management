import React, { useEffect, useState } from "react";
import api from "../api/client.js";
import { ENGINEERING_COURSES } from "../constants/courses.js";

export default function StudentsPanel() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    course: ENGINEERING_COURSES[0],
    age: "",
    feesTotal: ""
  });
  const [message, setMessage] = useState("");

  const loadStudents = async (query = "") => {
    try {
      const { data } = await api.get("/students", { params: { search: query } });
      setStudents(data);
    } catch {
      setMessage("Could not load students.");
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/students", {
        ...form,
        age: Number(form.age),
        feesTotal: Number(form.feesTotal) || 0
      });
      setForm({ name: "", email: "", course: ENGINEERING_COURSES[0], age: "", feesTotal: "" });
      setMessage("Student added successfully.");
      loadStudents(search);
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not add student.");
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this student?")) return;
    try {
      await api.delete(`/students/${id}`);
      loadStudents(search);
    } catch {
      setMessage("Could not delete student.");
    }
  };

  return (
    <section className="grid">
      <form className="card form" onSubmit={submit}>
        <h2>Add Student</h2>
        <label>
          Name
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Enter name"
          />
        </label>
        <label>
          Email
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Enter email"
          />
        </label>
        <label>
          Course
          <select
            required
            value={form.course}
            onChange={(e) => setForm({ ...form, course: e.target.value })}
          >
            {ENGINEERING_COURSES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Age
          <input
            required
            type="number"
            value={form.age}
            onChange={(e) => setForm({ ...form, age: e.target.value })}
            placeholder="Enter age"
          />
        </label>
        <label>
          Total fees (₹)
          <input
            required
            type="number"
            min="0"
            value={form.feesTotal}
            onChange={(e) => setForm({ ...form, feesTotal: e.target.value })}
            placeholder="e.g. 120000"
          />
        </label>
        <button>Add Student</button>
        {message && <p className="message">{message}</p>}
      </form>

      <section className="card">
        <div className="toolbar">
          <div>
            <h2>Students</h2>
            <p>{students.length} record(s)</p>
          </div>
          <input
            className="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              loadStudents(e.target.value);
            }}
            placeholder="Search..."
          />
        </div>

        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Course</th><th>Age</th><th>Fees Due</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => {
                const due = (s.fees?.total ?? 0) - (s.fees?.paid ?? 0);
                return (
                  <tr key={s._id}>
                    <td>{s.name}</td>
                    <td>{s.email}</td>
                    <td>{s.course}</td>
                    <td>{s.age}</td>
                    <td className={due > 0 ? "bad" : "good"}>₹{due.toLocaleString()}</td>
                    <td><button className="danger" onClick={() => remove(s._id)}>Delete</button></td>
                  </tr>
                );
              })}
              {!students.length && (
                <tr><td colSpan="6" className="empty">No students found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
