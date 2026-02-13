import express from "express";
import { verifyToken } from "../../middleware/verifyToken";
import {createDepartment} from "../../Admin/controls/Departments/departments.js"
const router = express.Router();

router.post ("/addDepartment",verifyToken,createDepartment)

export default router;
