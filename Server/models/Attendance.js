import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  employee_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  date: { 
    type: String, // Format: YYYY-MM-DD
    required: true 
  },
  clock_in: { 
    type: Date,
    required: true 
  },
  clock_out: Date,
  status: {
    type: String,
    enum: ["Online", "Offline", "On Break"],
    default: "Online"
  },
  location: {
    type: String,
    enum: ["office", "remote", "client-site"],
    default: "office"
  },
  work_from_type: {
    type: String,
    enum: ["office", "home", "hybrid"],
    default: "office"
  },
  total_hours: Number
}, { timestamps: true });

// Index for faster queries
attendanceSchema.index({ employee_id: 1, date: 1 });

export default mongoose.model("Attendance", attendanceSchema);