import Notification from "../../model/NotifactionSchema.js";
import Guide from "../../model/GuidSchema.js";
import mongoose from "mongoose";
import Student from "../../model/StudentSchema.js";

const requireAdmin = (req, res) => {


  const { role } = req.user.id;
  if (role !== "admin") {
    res.status(403).json({ message: "Access denied. Admins only." });
    return false;
  }
  return true;
};

/* ================= CREATE ================= */


//Teacher Notificatiom
export const createNotification = async (req, res) => {
  // Ensure admin
  if (!requireAdmin(req, res)) return;

  try {
    let { title, message } = req.body;

    let type = "teachers"
    // Trim inputs safely
    title = title?.trim();
    message = message?.trim();
    type = type?.trim() || "admin"; // default type

    // Validation
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required",
      });
    }

    if (!["admin", "teachers", "students"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification type",
      });
    }

    // Create notification
    const notification = await Notification.create({ title, message, type });

    // Send to all guides/teachers
    const result = await Guide.updateMany(
      {}, // all guides
      { $addToSet: { notificationId: notification._id } }
    );

    res.status(201).json({
      success: true,
      message: "Notification sent to all teachers successfully",
      teachersUpdated: result.modifiedCount,
      data: notification,
    });
  } catch (error) {
    console.error("Notification Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating notification",
    });
  }
};


export const createNotificationByTeacherId = async (req, res) => {

  if (!requireAdmin(req, res)) return;

  try {
    const { teacherIds, newNotification } = req.body;

    // console.log(req.body,"body for notification");


    let { title, message } = newNotification;



    // 🔴 Validate teacherIds array
    if (!Array.isArray(teacherIds) || teacherIds.length === 0) {


      return res.status(400).json({
        success: false,
        message: "teacherIds must be a non-empty array",
      });
    }

    // 🔴 Validate ObjectIds
    const invalidIds = teacherIds.filter(
      id => !mongoose.Types.ObjectId.isValid(id)
    );

    if (invalidIds.length > 0) {


      return res.status(400).json({
        success: false,
        message: "Some teacher IDs are invalid",
        invalidIds,
      });
    }

    // Trim inputs
    title = title?.trim();
    message = message?.trim();




    if (!title || !message) {


      return res.status(400).json({
        success: false,
        message: "Title and message are required",
      });
    }

    if (title.length < 3 || title.length > 100) {


      return res.status(400).json({
        success: false,
        message: "Title must be 3 to 100 characters",
      });
    }

    if (message.length < 5 || message.length > 500) {


      return res.status(400).json({
        success: false,
        message: "Message must be 5 to 500 characters",
      });
    }

    // 🟢 Create notification once
    const notification = await Notification.create({
      title,
      message,
      type: "teachers",
    });

    // 🟢 Attach to multiple teachers
    const result = await Guide.updateMany(
      { _id: { $in: teacherIds } },
      { $addToSet: { notificationId: notification._id } }
    );

    res.status(201).json({
      success: true,
      message: "Notification sent successfully",
      notification,
      updatedCount: result.modifiedCount,
    });

  } catch (error) {
    console.error("Error creating teacher notification:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};






// Send a notification to a specific student
export const createNotificationForStudent = async (req, res) => {
  try {

    let { title, message, type } = req.body;



    // Trim inputs safely
    title = title?.trim();
    message = message?.trim();
    // type is always 'students' for this controller

    // Validate title and message
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required",
      });
    }

    if (title.length < 3 || title.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Title must be 3 to 100 characters",
      });
    }

    if (message.length < 5 || message.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Message must be 5 to 500 characters",
      });
    }

    // Create notification in DB
    const notification = await Notification.create({ title, message, type });


    await Student.updateMany(
      { notificationId: { $exists: true, $not: { $type: "array" } } },
      { $set: { notificationId: [] } }
    );

    // Add notification to the student's array without duplicates
    const result = await Student.updateMany(
      {}, // all guides
      { $addToSet: { notificationId: notification._id } }
    );


    res.status(201).json({
      success: true,
      message: "Notification sent to student successfully",
      data: notification,
    });

  } catch (error) {
    console.error("Error creating student notification:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating notification",
    });
  }
};


// Send a notification to a specific student by Id

export const createNotificationByStudentId = async (req, res) => {
  if (!requireAdmin(req, res)) return;

  try {
    let { title, message, studentIds } = req.body;


  
    



    // 🔴 Validate array
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "studentIds must be a non-empty array",
      });
    }

    // 🔴 Validate each ObjectId
    const invalidIds = studentIds.filter(
      id => !mongoose.Types.ObjectId.isValid(id)
    );

    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Some student IDs are invalid",
        invalidIds,
      });
    }

    // 🔴 Trim input
    title = title?.trim();
    message = message?.trim();

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required",
      });
    }

    if (title.length < 3 || title.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Title must be 3 to 100 characters",
      });
    }

    if (message.length < 5 || message.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Message must be 5 to 500 characters",
      });
    }

    // 🟢 Create notification ONCE
    const notification = await Notification.create({
      title,
      message,
      type: "students",
    });

    // 🟢 Update multiple students
    const result = await Student.updateMany(
      { _id: { $in: studentIds } },
      { $addToSet: { notificationId: notification._id } }
    );

    res.status(201).json({
      success: true,
      message: "Notification sent successfully",
      notification,
      updatedCount: result.modifiedCount,
    });

  } catch (error) {
    console.error("Error creating student notification:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};




/* ================= GET ALL ================= */

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user?.id?.id;
    const role = req.user?.id?.role;


    // ✅ ADMIN → get all notifications
    if (role === "admin") {
      const allNotifications = await Notification.find()
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        data: allNotifications,
      });
    }

    // ===================================================
    // ✅ GUIDE → fetch guide notifications
    // ===================================================
    if (role === "Guide") {
      const guide = await Guide.findById(userId);

      if (!guide) {
        return res.status(404).json({
          success: false,
          message: "Guide not found",
        });
      }

      const notificationIds = guide.notificationId || [];

      const notifications = await Notification.find({
        _id: { $in: notificationIds },
      }).sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        data: notifications,
      });
    }

    // ===================================================
    // ✅ STUDENT → fetch student notifications
    // ===================================================
    if (role === "Student") {
      const student = await Student.findById(userId);

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      const notificationIds = student.notificationId || [];

      const notifications = await Notification.find({
        _id: { $in: notificationIds },
      }).sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        data: notifications,
      });
    }

    // ===================================================
    // ❌ Unknown role
    // ===================================================
    return res.status(403).json({
      success: false,
      message: "Unauthorized role",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= GET SINGLE ================= */

// export const getSingleNotification = async (req, res) => {
//   try {
//     const { teacherId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(teacherId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid teacher ID",
//       });
//     }

//     const teacher = await Guide.findById(teacherId)
//       .populate({
//         path: "notifications",
//         options: { sort: { createdAt: -1 } },
//       });

//     if (!teacher) {
//       return res.status(404).json({
//         success: false,
//         message: "Teacher not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: teacher.notificationId,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

/* ================= UPDATE ================= */

// export const updateNotification = async (req, res) => {
//   if (!requireAdmin(req, res)) return;

//   try {
//     const { id } = req.params;
//     let { title, message } = req.body;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid notification ID",
//       });
//     }

//     // Optional validation if fields exist
//     if (title) {
//       title = title.trim();
//       if (title.length < 3 || title.length > 100) {
//         return res.status(400).json({
//           success: false,
//           message: "Title must be between 3 and 100 characters",
//         });
//       }
//     }

//     if (message) {
//       message = message.trim();
//       if (message.length < 5 || message.length > 500) {
//         return res.status(400).json({
//           success: false,
//           message: "Message must be between 5 and 500 characters",
//         });
//       }
//     }

//     const notification = await Notification.findByIdAndUpdate(
//       id,
//       { title, message },
//       { new: true, runValidators: true }
//     );

//     if (!notification) {
//       return res.status(404).json({
//         success: false,
//         message: "Notification not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Notification updated",
//       data: notification,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// /* ================= DELETE ================= */

// export const deleteNotification = async (req, res) => {
//   if (!requireAdmin(req, res)) return;

//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid notification ID",
//       });
//     }

//     const notification = await Notification.findByIdAndDelete(id);

//     if (!notification) {
//       return res.status(404).json({
//         success: false,
//         message: "Notification not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Notification deleted",
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


export const createStudentNotificationByTeacher = async (req, res) => {
  // if (!requireAdmin(req, res)) return;

  try {
    let { message, studentIds } = req.body;
      console.log(req.body,"body");
      
    // 🔴 Validate array
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      console.log("id validation");
      
      return res.status(400).json({
        success: false,
        message: "studentIds must be a non-empty array",
      });
    }

    // 🔴 Validate each ObjectId
    const invalidIds = studentIds.filter(
      id => !mongoose.Types.ObjectId.isValid(id)
    );

    if (invalidIds.length > 0) {
      console.log("invalid length");
      
      return res.status(400).json({
        success: false,
        message: "Some student IDs are invalid",
        invalidIds,
      });
    }

    // 🔴 Trim input

    message = message?.trim();

    if (!message) {
      console.log("!message");
      
      return res.status(400).json({
        success: false,
        message: "Title and message are required",
      });
    }



    if (message.length < 3 || message.length > 500) {
      console.log("message length");
      
      return res.status(400).json({
        success: false,
        message: "Message must be 5 to 500 characters",
      });
    }

    // 🟢 Create notification ONCE
    const notification = await Notification.create({
      title:"",
      message,
      type: "students",
    });

    // 🟢 Update multiple students
    const result = await Student.updateMany(
      { _id: { $in: studentIds } },
      { $addToSet: { notificationId: notification._id } }
    );

    res.status(201).json({
      success: true,
      message: "Notification sent successfully",
      notification,
      updatedCount: result.modifiedCount,
    });

  } catch (error) {
    console.error("Error creating student notification:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};