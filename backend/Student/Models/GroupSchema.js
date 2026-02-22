import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    groupName: {
      type: String,
      required: true,
      trim: true
    },

    topicName: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      // required: true,
      trim: true,
      default: " Pending acceptance"
    },

    department: {
      type: String,
      required: true,
      trim: true
    },

    // ✅ NEW FIELD
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      // ref: "Teacher",   // reference collection name
      // required: true
      default: null
    },
    rejectedTeachers: [
      {
        type: mongoose.Schema.Types.ObjectId,

      }
    ],


    selectedMembers: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          required: true
        },
        name: {
          type: String,
          required: true,
          trim: true
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Group", groupSchema);
