import express from "express";
import { verifyToken } from "../../middleware/verifyToken.js";
 
import {addStudent, getStudents, editStudent ,deleteStudent } from "../../Admin/controls/Students/student.js"

const router = express.Router();

router.post("/addStudent",verifyToken,addStudent)
router.get("/getStudents",verifyToken,getStudents)
router.put("/editStudents/:id",verifyToken,editStudent)
router.delete("/deleteStudents/:id",verifyToken,deleteStudent)


export default router;