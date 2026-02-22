// middleware/verifyToken.js
import jwt from "jsonwebtoken";

// Middleware to verify JWT token from cookies
export const verifyToken = (req, res, next) => {
  try {
    const token = req.cookies?.token; // get token from cookie


    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    

    // Attach decoded payload to request
    req.user = decoded; // now you can access req.user.id in routes
    next();

  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ message: "Invalid or expired token." });
  }
};
