import express from "express";
import { verifyToken } from "../../middleware/verifyToken.js";
import upload from "../../middleware/multer.js";
import { addTask, getTasks, deleteTask, reviewTask, submitTaskFile, publishFinalMarks } from "../control/createTask.js";
const router = express.Router();

router.post("/addTask", verifyToken, addTask)
router.get("/getTask", verifyToken, getTasks)
router.delete("/deleteTask/:id", verifyToken, deleteTask)
router.put("/reviewTask/:id", verifyToken, reviewTask)
router.put("/submitTaskFile/:id", verifyToken, upload.single("file"), submitTaskFile)
router.put("/publishFinalMarks/:id", verifyToken, publishFinalMarks)


export default router;