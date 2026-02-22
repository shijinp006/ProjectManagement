import express from "express";
import { verifyToken } from "../../middleware/verifyToken.js";

import {createGuide,updateGuide,deleteGuide,getGuideById} from "../controls/Guide/guid.js"

const router = express.Router();


router.post("/createGuid",verifyToken,createGuide)
router.get("/getGuids",verifyToken,getGuideById)
router.put("/updateGuids/:id",verifyToken,updateGuide)
router.delete("/deleteGuids/:id",verifyToken,deleteGuide)

export default router;