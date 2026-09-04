import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.routes.js";
import studentRoutes from "./routes/student.routes.js";

const app = express();
const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/student_db";

app.disable("x-powered-by");
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "100kb" }));

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "student-api",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);

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
