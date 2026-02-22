import express from "express";
import { verifyToken } from "../../middleware/verifyToken.js";
import {createGroup , GetGroups,EditGroup , assignGroup ,rejectGroup} from "../../Student/Controls/CreateGroup.js"
const router = express.Router();

router.post("/createGroup",verifyToken,createGroup)
router.get("/getGroup",verifyToken,GetGroups)
router.put("/editGroup/:id",verifyToken,EditGroup)
router.put("/assignGroup",verifyToken,assignGroup)
router.put("/rejectGroup/:id",verifyToken,rejectGroup)


export default router;