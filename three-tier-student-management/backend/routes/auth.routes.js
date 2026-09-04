import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import LoginHistory from "../models/LoginHistory.js";
import { requireAuth, JWT_SECRET } from "../middleware/auth.js";

const router = Router();

function signToken(user) {
  return jwt.sign({ sub: user._id.toString() }, JWT_SECRET, { expiresIn: "7d" });
}

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: "An account with that email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email: normalizedEmail, passwordHash });
    const token = signToken(user);

    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Could not create account" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    await LoginHistory.create({
      user: user._id,
      ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown",
      userAgent: req.headers["user-agent"] || "unknown"
    });

    const token = signToken(user);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Could not log in" });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.userId).select("name email createdAt");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

router.get("/login-history", requireAuth, async (req, res) => {
  const history = await LoginHistory.find({ user: req.userId }).sort({ loginAt: -1 }).limit(50);
  res.json(history);
});

export default router;
