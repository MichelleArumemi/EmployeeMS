import mongoose from 'mongoose';

const FileSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  name: { type: String, required: true },
  type: { type: String },
  uploadDate: { type: Date, default: Date.now },
  url: { type: String, required: true }
});

export default mongoose.model('File', FileSchema);
