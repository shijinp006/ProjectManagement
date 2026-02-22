import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { OpenRouter } from "@openrouter/sdk";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


import AdminRoutes from "./Admin/routes/login&signup.js";
import DepartmentRoutes from "./Admin/routes/departments.js"
import StudentsRoutes from "./Admin/routes/students.js"
import GuidRoutes from "./Admin/routes/guid.js"
import NotificationRoutes from "./Admin/routes/notifications.js"
import GroupRoutes from "./Student/Routes/GroupRoutes.js"
import TaskRouts from "./Guide/routes/taskRoutes.js"
// Middlewares

app.use(express.json({ limit: '50mb' })); // default is 100kb
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(cors({
    origin: "http://localhost:5173", // your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],

    credentials: true // allow cookies
}));
// MongoDB Connection



mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected Successfully");
    })
    .catch((err) => {
        console.error("MongoDB Connection Error:", err);
    });



// Initialize OpenRouter
console.log("OpenRouter import type:", typeof OpenRouter);

const openrouter = new OpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY
});

// AI Chat endpoint
app.post("/api/chat", async (req, res) => {
    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: "Messages are required." });
        }

        // Get only the last user message
        const lastUserMessage = messages
            .filter(msg => msg.role === "user")
            .slice(-1);

        const response = await openrouter.chat.send({
            chatGenerationParams: {
                model: "openrouter/free",
                messages: lastUserMessage,
            }
        });

        const content = response.choices[0]?.message?.content;
        res.json({ content });

    } catch (error) {
        console.error("FULL AI ERROR:", error);
        res.status(500).json({
            error: error.message || "AI request failed"
        });
    }
});



app.use("/api", AdminRoutes)
app.use("/api", DepartmentRoutes)
app.use("/api", StudentsRoutes)
app.use("/api", GuidRoutes)
app.use("/api", NotificationRoutes)
app.use("/api", GroupRoutes)
app.use("/api", TaskRouts)

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
