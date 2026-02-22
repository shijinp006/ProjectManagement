import express from "express";
import { verifyToken } from "../../middleware/verifyToken.js";
import {createDepartment,getDepartments,updateDepartment,deleteDepartment } from "../../Admin/controls/Departments/departments.js"
const router = express.Router();

router.post ("/addDepartment",verifyToken,createDepartment)
router.get("/getDepartment",verifyToken,getDepartments)
router.put("/updateDepartment/:id",verifyToken,updateDepartment)
router.delete("/deleteDepartment/:id",verifyToken,deleteDepartment)


export default router;
