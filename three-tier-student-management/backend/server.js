import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";

const app = express();
const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/student_db";

app.disable("x-powered-by");
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "100kb" }));

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 150 },
    course: { type: String, required: true, trim: true, maxlength: 100 },
    age: { type: Number, required: true, min: 5, max: 100 }
  },
  { timestamps: true }
);

const Student = mongoose.model("Student", studentSchema);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "student-api",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

app.get("/api/students", async (req, res) => {
  try {
    const search = String(req.query.search || "").trim();
    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { course: { $regex: search, $options: "i" } }
          ]
        }
      : {};
    const students = await Student.find(filter).sort({ createdAt: -1 }).limit(100);
    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch students" });
  }
});

app.post("/api/students", async (req, res) => {
  try {
    const { name, email, course, age } = req.body;
    if (!name || !email || !course || age === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const student = await Student.create({ name, email, course, age });
    res.status(201).json(student);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Invalid student data" });
  }
});

app.delete("/api/students/:id", async (req, res) => {
  try {
    const deleted = await Student.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Student not found" });
    res.json({ message: "Student deleted" });
  } catch {
    res.status(400).json({ message: "Invalid student ID" });
  }
});

app.use((req, res) => res.status(404).json({ message: "Route not found" }));

async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Student API running on port ${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

start();
