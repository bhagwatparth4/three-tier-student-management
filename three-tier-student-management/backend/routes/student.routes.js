import { Router } from "express";
import Student from "../models/Student.js";
import { requireAuth } from "../middleware/auth.js";
import { ENGINEERING_COURSES } from "../utils/courses.js";

const router = Router();

// Every route below requires a signed-in user.
router.use(requireAuth);

router.get("/courses", (req, res) => {
  res.json(ENGINEERING_COURSES);
});

router.get("/", async (req, res) => {
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
    const students = await Student.find(filter).sort({ createdAt: -1 }).limit(200);
    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch students" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, email, course, age, feesTotal } = req.body;
    if (!name || !email || !course || age === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!ENGINEERING_COURSES.includes(course)) {
      return res.status(400).json({ message: "Invalid course selected" });
    }

    const student = await Student.create({
      name,
      email,
      course,
      age,
      fees: { total: Number(feesTotal) || 0, paid: 0 }
    });
    res.status(201).json(student);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Invalid student data" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Student.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Student not found" });
    res.json({ message: "Student deleted" });
  } catch {
    res.status(400).json({ message: "Invalid student ID" });
  }
});

router.post("/:id/payments", async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    const note = req.body.note || "";
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Enter a valid payment amount" });
    }

    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const remaining = student.fees.total - student.fees.paid;
    if (amount > remaining) {
      return res.status(400).json({ message: `Payment exceeds remaining due (${remaining})` });
    }

    student.fees.paid += amount;
    student.payments.push({ amount, note });
    await student.save();

    res.json(student);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Could not record payment" });
  }
});

export default router;
