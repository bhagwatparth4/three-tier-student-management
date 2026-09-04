import { useEffect, useState } from "react";
import axios from "axios";

const api = axios.create({ baseURL: "/api", timeout: 8000 });

export default function App() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", email: "", course: "", age: "" });
  const [message, setMessage] = useState("");

  const loadStudents = async (query = "") => {
    try {
      const { data } = await api.get("/students", { params: { search: query } });
      setStudents(data);
    } catch {
      setMessage("Could not connect to backend.");
    }
  };

  useEffect(() => { loadStudents(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/students", { ...form, age: Number(form.age) });
      setForm({ name: "", email: "", course: "", age: "" });
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
    <main className="page">
      <header>
        <div>
          <p className="eyebrow">3-TIER • DOCKER • MONGODB</p>
          <h1>Student Management</h1>
          <p className="sub">A production-style containerized application.</p>
        </div>
        <span className="status">● System Online</span>
      </header>

      <section className="grid">
        <form className="card form" onSubmit={submit}>
          <h2>Add Student</h2>
          {["name", "email", "course", "age"].map((field) => (
            <label key={field}>
              {field[0].toUpperCase() + field.slice(1)}
              <input
                required
                type={field === "age" ? "number" : field === "email" ? "email" : "text"}
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                placeholder={`Enter ${field}`}
              />
            </label>
          ))}
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
              onChange={(e) => { setSearch(e.target.value); loadStudents(e.target.value); }}
              placeholder="Search..."
            />
          </div>

          <div className="tableWrap">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Course</th><th>Age</th><th>Action</th></tr></thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s._id}>
                    <td>{s.name}</td><td>{s.email}</td><td>{s.course}</td><td>{s.age}</td>
                    <td><button className="danger" onClick={() => remove(s._id)}>Delete</button></td>
                  </tr>
                ))}
                {!students.length && <tr><td colSpan="5" className="empty">No students found.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}
