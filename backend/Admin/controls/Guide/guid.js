  import mongoose from "mongoose";
  import Guide from "../../model/GuidSchema.js";
  import Student from "../../model/StudentSchema.js"

  const requireAdmin = (req, res) => {
  
    
    const { role } = req.user.id;
    if (role !== "admin") {
      res.status(403).json({ message: "Access denied. Admins only." });
      return false;
    }
    return true;
  };
  // CREATE GUIDE
  export const createGuide = async (req, res) => {
    try {
      if (!requireAdmin(req, res)) return;
      let { name, email, username, department, specialization, status } = req.body;
      // console.log(req.body, "b");


      // ✅ Trim inputs
      name = name?.trim();
      email = email?.trim().toLowerCase();
      username = username?.trim();
      department = department?.trim();
      specialization = specialization?.trim();

      // ✅ Required validation
      if (!name || !email || !username || !department || !specialization) {
        // console.log("11");

        return res.status(400).json({ message: "All fields are required." });
      }

      // ✅ Name validation
      if (name.length <= 2) {
        // console.log("name");

        return res.status(400).json({ message: "Name must be at least 3 characters." });
      }

      // ✅ Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format." });
      }

      // ✅ Username validation
      if (username.length <= 2) {
        return res.status(400).json({ message: "Username must be at least 4 characters." });
      }

      // ✅ Department validation
      if (department.length < 2) {
        return res.status(400).json({ message: "Department name is too short." });
      }

      // ✅ Specialization validation
      if (specialization.length < 2) {
        return res.status(400).json({ message: "Specialization is too short." });
      }

      // ✅ Status validation
      const allowedStatus = ["Active", "Inactive"];
      if (status && !allowedStatus.includes(status)) {
        return res.status(400).json({ message: "Invalid status value." });
      }

      // ✅ Check duplicate email/username separately for better error
      const emailExists = await Guide.findOne({ email });
      if (emailExists) {
        // console.log("exist guid");
        

        return res.status(400).json({ message: "Email already exists." });
      }

      const StudentemailExists = await Student.findOne({ email });
      if (StudentemailExists) {
        // console.log("exist student");
        

        return res.status(400).json({ message: "Email already exists." });
      }
      const usernameExists = await Guide.findOne({ username });
      if (usernameExists) {
        // console.log("exis");

        return res.status(400).json({ message: "Username already exists." });
      }

      // ✅ Create guide
      const guide = await Guide.create({
        name,
        email,
        username,
        department,
        specialization,
        status: status || "Active",
      });

      res.status(201).json(guide);

    } catch (error) {
      console.error("Create Guide Error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

  // export const getGuides = async (req, res) => {
  //   try {
  //     if (!requireAdmin(req, res)) return;
  //     const guides = await Guide.find().sort({ createdAt: -1 });
  //     res.json(guides);
  //   } catch (error) {
  //     res.status(500).json({ message: "Server error" });
  //   }
  // };

  export const getGuideById = async (req, res) => {
    try {
      const {id,role} = req.user?.id;


      // ✅ CASE 1: If ID exists → fetch single guide
      if (id &&role === "Guide") {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            
          return res.status(400).json({
            success: false,
            message: "Invalid Guide ID"
          });
      
          
        }
      
        

        const guide = await Guide.findById(id).lean();
        // console.log(guide,"asdsadsa");
        
      
        
        if (!guide) {
          return res.status(404).json({
            success: false,
            message: "Guide not found"
          });
        }

        return res.status(200).json({
          success: true,
          data: guide
        });
      }

      // ✅ CASE 2: If NO ID → fetch all guides
      const guides = await Guide.find().sort({ createdAt: -1 }).lean();
  
        
      res.status(200).json({
        success: true,
        count: guides.length,
        data: guides
      });

    } catch (error) {
      console.error("Get Guide Error:", error);

      res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  };


  export const updateGuide = async (req, res) => {
    const { id } = req.params;



    try {
      // ✅ Validate ID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid Guide ID." });
      }

      const updateFields = {};
      const { name, email, username, department, specialization, status } = req.body;

      // ✅ Name validation
      if (name !== undefined) {
        if (name.trim().length < 3) {
          return res.status(400).json({ message: "Name must be at least 3 characters." });
        }
        updateFields.name = name.trim();
      }

      // ✅ Email validation
      if (email !== undefined) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({ message: "Invalid email format." });
        }

        const existingEmail = await Guide.findOne({
          email,
          _id: { $ne: id },
        });

        if (existingEmail) {
          return res.status(400).json({ message: "Email already exists." });
        }

        updateFields.email = email.toLowerCase();
      }

      // ✅ Username validation
      if (username !== undefined) {
        if (username.length < 4) {
          return res.status(400).json({ message: "Username must be at least 4 characters." });
        }

        const existingUser = await Guide.findOne({
          username,
          _id: { $ne: id },
        });

        if (existingUser) {
          return res.status(400).json({ message: "Username already exists." });
        }

        updateFields.username = username.trim();
      }

      // ✅ Department validation
      if (department !== undefined) {
        if (department.trim().length < 2) {
          return res.status(400).json({ message: "Department is too short." });
        }
        updateFields.department = department.trim();
      }

      // ✅ Specialization validation
      if (specialization !== undefined) {
        if (specialization.trim().length < 2) {
          return res.status(400).json({ message: "Specialization is too short." });
        }
        updateFields.specialization = specialization.trim();
      }

      // ✅ Status validation
      if (status !== undefined) {
        const allowedStatus = ["Active", "Inactive"];
        if (!allowedStatus.includes(status)) {
          return res.status(400).json({ message: "Invalid status value." });
        }
        updateFields.status = status;
      }

      // ✅ Check if nothing to update
      if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({ message: "No valid fields provided for update." });
      }

      // ✅ Update guide
      const updatedGuide = await Guide.findByIdAndUpdate(
        id,
        { $set: updateFields },
        { returnDocument: "after", runValidators: true }
      );

      if (!updatedGuide) {
        return res.status(404).json({ message: "Guide not found." });
      }

      res.json(updatedGuide);

    } catch (error) {
      console.error("Update Guide Error:", error);
      res.status(500).json({ message: "Server error." });
    }
  };

  export const deleteGuide = async (req, res) => {
    if (!requireAdmin(req, res)) return;
    const { id } = req.params;

    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      const guide = await Guide.findByIdAndDelete(id);

      if (!guide) {
        return res.status(404).json({ message: "Guide not found" });
      }

      res.json({ message: "Guide deleted successfully" });

    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  };
