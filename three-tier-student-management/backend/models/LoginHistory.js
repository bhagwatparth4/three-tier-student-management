import mongoose from "mongoose";

const loginHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  ip: { type: String, trim: true, maxlength: 100 },
  userAgent: { type: String, trim: true, maxlength: 300 },
  loginAt: { type: Date, default: Date.now }
});

export default mongoose.model("LoginHistory", loginHistorySchema);
