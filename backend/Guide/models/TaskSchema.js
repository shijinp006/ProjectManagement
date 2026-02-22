import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
    {
        taskName: {
            type: String,
            required: true,
            trim: true,
        },

        groupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            required: true,
        },

        assignedBy: {
            type: mongoose.Schema.Types.ObjectId,
            //   ref: "User",
            required: true,
        },

        // Students assigned to task
        students: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        submissionDate: {
            type: Date,
            required: true,
        },

        // ✅ NEW FIELD: Task Type
        type: {
            type: String,
            enum: ["Normal Task", "Final Task"],
            default: "Normal Task",
        },

        // ✅ NEW FIELD: Marks
        marks: {
            type: Number,
            default: 0,
            min: 0,
        },
        remark: {
            type: String,
            trim: true,
            default: "",
        },
        
        submittedFileName: {
            type: String,
            default: "",
        },
          submittedFile: {
            type: String,
            default: "",
        },

        status: {
            type: String,
            enum: ["Pending", "Submitted", "Needs Resubmit", "Verified"],
            default: "Pending",
        },
    },
    { timestamps: true }
);

export default mongoose.model("Task", taskSchema);