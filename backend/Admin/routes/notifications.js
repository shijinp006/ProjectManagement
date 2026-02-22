import express from "express";
import {
  createNotification,
  createNotificationByTeacherId ,
   createNotificationForStudent ,
   createNotificationByStudentId,
   createStudentNotificationByTeacher,
  getNotifications,
  // getSingleNotification,
  // updateNotification,
  // deleteNotification,
} from "../../Admin/controls/Notification/notification.js";

import { verifyToken } from "../../middleware/verifyToken.js"; 
// 👆 your JWT middleware that sets req.user

const router = express.Router();

/* ================= ROUTES ================= */

/* CREATE (Admin only) */
router.post("/createNotification",verifyToken, createNotification);

router.post("/specificTeacherNotification", verifyToken, createNotificationByTeacherId );

router.post("/createStudentNotification", verifyToken,createNotificationForStudent)

router.post("/createSpecificNotification", verifyToken,createNotificationByStudentId)

router.post("/createNotificationByTeacher",verifyToken,createStudentNotificationByTeacher)


/* GET ALL (User/Admin) */
router.get("/getNotification", verifyToken, getNotifications);

/* GET SINGLE */
// router.get("/getNotification/:id", verifyToken, getSingleNotification);

/* UPDATE (Admin only) */
// router.put("updateNotification/:id", verifyToken, updateNotification);

// /* DELETE (Admin only) */
// router.delete("deleteNotification/:id", verifyToken, deleteNotification);

export default router;
