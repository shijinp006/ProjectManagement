// controllers/adminController.js
import Admin from "../../model/AdminSchema.js";
import Guide from "../../model/GuidSchema.js";
import Student from "../../model/StudentSchema.js";
import jwt from "jsonwebtoken";

// Generate JWT
const generateToken = (adminId, role) => {
  return jwt.sign({ id: adminId, role: role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

//Create Admin
export const createAdmin = async (req, res) => {
  // const { userName, email } = req.body;

  const userName = "Nabeel"
  const email = "n@gmail.com"
  try {
    // Validation: check userName
    if (!userName || userName.trim().length < 3) {
      return res.status(400).json({ message: "User name is required and must be at least 3 characters" });
    }

    // Validation: check email
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists with this email" });
    }

    // Create new admin
    const admin = await Admin.create({ userName, email });

    // Generate token
    const token = generateToken(admin._id);

    // Send token in HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Respond with admin info
    res.status(201).json({
      message: "Admin created successfully",
      admin: { id: admin._id, userName: admin.userName, email: admin.email }
    });

  } catch (error) {
    console.error("Create Admin error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Login Admin
export const loginAdmin = async (req, res) => {
  const { email, username } = req.body;



  try {
    if (!email && !username) {
      return res.status(400).json({ message: "Email or Username required" });
    }

    let user = null;
    let role = "";
    let department = undefined;

    // 1️⃣ Check Admin first
    user = await Admin.findOne({
      $or: [{ email }]
    });



    if (user) {
      role = "admin";
    } else {
      // 2️⃣ Check Guide
      user = await Guide.findOne({
        $or: [{ email }]
      });


      if (user) {
        role = "Guide";
      } else {
        // 3️⃣ Check Student
        user = await Student.findOne({
          $or: [{ email }]
        });

        if (user) {
          role = "Student";


        }
      }
    }

    // ❌ If not found anywhere
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    // ✅ Generate token
    const token = generateToken({
      id: user._id,
      role: user.role,
      department: user.department
    });

    // ✅ Send cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name || user.userName,
        email: user.email,
        role,
        department: user.department
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};



// Logout Admin
export const logoutAdmin = async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0)
  });
  res.status(200).json({ message: "Logged out successfully" });
};
