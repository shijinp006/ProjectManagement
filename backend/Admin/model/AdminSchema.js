// models/Admin.js
import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: [true, "User name is required"],
    trim: true,
    minlength: [3, "User name must be at least 3 characters"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/.+\@.+\..+/, "Please fill a valid email address"]
  },
  role: {
    type: String,
    enum: ["admin", "superadmin"], // you can add other roles if needed
    default: "admin",
  
  }
}, {
  timestamps: true // automatically adds createdAt and updatedAt
});

// Create model
const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
