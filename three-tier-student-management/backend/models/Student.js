import mongoose from "mongoose";
import { ENGINEERING_COURSES } from "../utils/courses.js";

const paymentSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true, min: 0 },
    note: { type: String, trim: true, maxlength: 200 },
    date: { type: Date, default: Date.now }
  },
  { _id: false }
);

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 150 },
    course: { type: String, required: true, enum: ENGINEERING_COURSES },
    age: { type: Number, required: true, min: 5, max: 100 },
    fees: {
      total: { type: Number, required: true, min: 0, default: 0 },
      paid: { type: Number, required: true, min: 0, default: 0 }
    },
    payments: { type: [paymentSchema], default: [] }
  },
  { timestamps: true }
);

export default mongoose.model("Student", studentSchema);
