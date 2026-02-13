// models/Department.js
import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Department name is required"],
    trim: true,
    minlength: [2, "Department name must be at least 2 characters"]
  },
  code: {
    type: String,
    required: [true, "Department code is required"],
    unique: true,
    trim: true,
    uppercase: true, // optional: store code in uppercase
    minlength: [2, "Department code must be at least 2 characters"]
  },
  description: {
    type: String,
    trim: true,
    default: ""
  }
}, {
  timestamps: true // adds createdAt and updatedAt automatically
});

// Create model
const Department = mongoose.model("Department", departmentSchema);

export default Department;
