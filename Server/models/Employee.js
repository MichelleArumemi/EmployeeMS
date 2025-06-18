import mongoose from "mongoose";

const EmployeeSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    default: 'Employee' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  // Optional fields that can be added later
  address: String,
  salary: Number,
  image: String,
  category_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Category" 
  }
});

EmployeeSchema.index({ email: 1 }, { unique: true });

// Check if model already exists before creating it
const Employee = mongoose.models.Employee || mongoose.model("Employee", EmployeeSchema);

export default Employee;