import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    department: {
      type: String,
      default: "",
      trim: true,
    },

    rollNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    year: {
      type: String,
      enum: ["First Year", "Second Year", "Third Year", "Final Year"],
      default: "First Year",
    },

    status: {
      type: String,
      enum: ["Active", "Inactive", "Graduated"],
      default: "Active",
    },

    // ✅ NEW ROLE FIELD
    role: {
      type: String,
      enum: ["Student", "CR", "Admin"], // customize as needed
      default: "Student",
      required: true,
    },

    notificationId: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Notification",
      default: []
    }
  },
  { timestamps: true }
);

const Student = mongoose.model("Student", studentSchema);

export default Student;
