import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: "admin" }
});

AdminSchema.index({ email: 1 }, { unique: true });

export default mongoose.model("Admin", AdminSchema);

