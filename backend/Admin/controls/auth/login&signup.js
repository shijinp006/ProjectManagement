// controllers/adminController.js
import Admin from "../../model/AdminSchema.js";
import jwt from "jsonwebtoken";

// Generate JWT
const generateToken = (adminId ,role) => {
  return jwt.sign({ id: adminId , role:role }, process.env.JWT_SECRET, {
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
  const { email } = req.body;
  console.log(req.body,"body");
  

  try {
    // Validation: Check if email is provided
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Validation: Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Admin not found with this email" });
    }

    console.log(admin.role,"role");
    

    // Generate JWT token
    const token = generateToken(admin._id ,admin.role);

    // Send token in HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Respond with admin info
    res.status(200).json({
      message: "Login successful",
      admin: { id: admin._id, userName: admin.userName, email: admin.email , role:admin.role }
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
