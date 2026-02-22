import mongoose from "mongoose";

const guideSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"],
    },

    username: {
      type: String,
      required: true,
      unique: true,
      minlength: 2,
      trim: true,
    },

    department: {
      type: String,
      required: true,
      trim: true,
    },

    specialization: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    // ✅ NEW ROLE FIELD
    role: {
      type: String,
      enum: ["Guide", "Admin", "HOD"], // you can change roles
      default: "Guide",
      required: true,
    },

    notificationId: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Notification",
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Guide", guideSchema);
