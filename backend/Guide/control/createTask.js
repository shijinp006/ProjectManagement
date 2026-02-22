import Task from "../models/TaskSchema.js";
import Group from "../../Student/Models/GroupSchema.js";

export const addTask = async (req, res) => {
  try {
    let {
      taskName,
      groupId,
      submissionDate,
      type,
      marks,
      status,
    } = req.body;

    // ✅ Basic validation
    if (!taskName || !groupId || !submissionDate) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    // ✅ Auto change type for special task
    if (taskName === "Final Report Submission") {
      type = "Final Task";
    }

    // ✅ Logged-in teacher ID
    const assignedBy = req.user?.id.id;

    if (!assignedBy) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    // 🔹 1. Check group exists
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // 🔹 2. Extract student IDs safely
    const students =
      group.selectedMembers?.map((student) => student._id) || [];

    if (students.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No students found in group",
      });
    }

    // 🔹 3. Create task
    const task = await Task.create({
      taskName,
      groupId,
      assignedBy,
      students,
      submissionDate,
      type,
      marks: marks || 0,
      status: status || "Pending",
    });

    res.status(201).json({
      success: true,
      message: "Task added successfully",
      data: task,
    });
  } catch (error) {
    console.error("Add Task Error:", error);

    res.status(500).json({
      success: false,
      message: "Error adding task",
      error: error.message,
    });
  }
};


export const getTasks = async (req, res) => {
  try {
    // const { groupId, type, status } = req.query;

    // 🔹 Extract logged-in user info safely
    const userId = req.user?.id?.id || req.user?.id;
    const role = req.user?.id?.role;


    let filter = {};

    // ✅ Role based filtering
    if (role === "Student") {
      // Match inside ObjectId array
      filter.students = { $in: [userId] };
    }

    if (role === "Guide") {
      filter.assignedBy = userId;
    }

    // ✅ Optional filters
    // if (groupId) filter.groupId = groupId;
    // if (type) filter.type = type;
    // if (status) filter.status = status;

    const tasks = await Task.find(filter)
      .sort({ createdAt: -1 })
      .lean();   // return plain JSON with only IDs

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });

  } catch (error) {
    console.error("Get Tasks Error:", error);

    res.status(500).json({
      success: false,
      message: "Error fetching tasks",
      error: error.message,
    });
  }
};


export const reviewTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const { status, remark } = req.body;


    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // ✅ Update fields
    if (status) task.status = status;
    if (remark !== undefined) task.reviewRemark = remark;

    task.reviewedAt = new Date();

    await task.save();

    res.status(200).json({
      success: true,
      message: "Task reviewed successfully",
      data: task,
    });

  } catch (error) {
    console.error("Review Task Error:", error);

    res.status(500).json({
      success: false,
      message: "Error reviewing task",
      error: error.message,
    });
  }
};


export const submitTaskFile = async (req, res) => {
  try {
    const taskId = req.params.id;
    const file = req.file; // Multer stores uploaded file here

    if (!file) {
      return res.status(400).json({ success: false, message: "File is required" });
    }

    // Store **file path** relative to uploads folder
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        submittedFileName: `uploads/${file.filename}`, // optional: original name
        submittedFilePath: `uploads/${file.filename}`, // store the relative path
        submittedFileType: file.mimetype,
        status: "Submitted",
      },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    res.status(200).json({
      success: true,
      message: "File submitted successfully",
      data: updatedTask,
    });
  } catch (error) {
    console.error("Submit Task File Error:", error);
    res.status(500).json({
      success: false,
      message: "File submission failed",
      error: error.message,
    });
  }
};


export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    // console.log(id, "delete id");


    // ✅ Logged in user
    const userId = req.user?.id?.id || req.user?.id;
    const role = req.user?.id?.role;

    // 🔹 Check task exists
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    /*
      ✅ Permission Rules:

      Guide → can delete only their tasks
      Admin → can delete any task
    */

    if (role === "Guide" && task.assignedBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this task",
      });
    }

    // 🔹 Delete task
    await Task.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });

  } catch (error) {
    console.error("Delete Task Error:", error);

    res.status(500).json({
      success: false,
      message: "Error deleting task",
      error: error.message,
    });
  }
};


export const publishFinalMarks = async (req, res) => {
  try {
    const taskId = req.params.id;
    const finalMark = Number(req.body.finalMark); 
    // console.log(req.body, "body mark", taskId, "id");


    // ✅ Correct role extraction
    const role = req.user?.id?.role;
    // console.log(role,"role");
    

    // ✅ Role check
    if (role !== "Guide") {
      return res.status(403).json({
        success: false,
        message: "Only Guide can publish final marks",
      });
    }

    // ✅ Basic validation
    if (!taskId || finalMark === undefined) {
      return res.status(400).json({
        success: false,
        message: "Task ID and final mark are required",
      });
    }

    // ✅ Validate mark number
    if (isNaN(finalMark) || finalMark < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid mark value",
      });
    }

    const task = await Task.findById(taskId);

    if (!task) {
      // console.log("task not deifined");

      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // ✅ Prevent re-publish
    if (task.status === "Verified") {
      return res.status(400).json({
        success: false,
        message: "Final mark already published",
      });
    }

    // ✅ Save final mark
    task.marks = finalMark;
    task.status = "Verified";
    task.submissionDate = new Date(); // optional but useful

    await task.save();

    res.status(200).json({
      success: true,
      message: "Final mark published successfully",
      data: task,
    });

  } catch (error) {
    console.error("Publish Final Mark Error:", error);

    res.status(500).json({
      success: false,
      message: "Error publishing final mark",
      error: error.message,
    });
  }
};