// routes/adminRoutes.js
import express from "express";
import { createAdmin, loginAdmin, logoutAdmin } from "../controls/auth/login&signup.js";

const router = express.Router();

// Admin signup
router.post("/signup", createAdmin);

// Admin login
router.post("/login", loginAdmin);

// Admin logout
router.post("/logout", logoutAdmin);

export default router;
