import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 150 },
    passwordHash: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
