// controllers/departmentController.js
import Department from "../../model/DepartmentSchema.js";

// Helper: check if user is admin
const requireAdmin = (req, res) => {
 
  
  const { role } = req.user.id.id;
  if (role !== "admin") {
    res.status(403).json({ message: "Access denied. Admins only." });
    return false;
  }
  return true;
};

// Create a new department
export const createDepartment = async (req, res) => {
  if (!requireAdmin(req, res)) return;

  const { name, code, description } = req.body;



  try {
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ message: "Department name must be at least 2 characters" });
    }
    if (!code || code.trim().length < 2) {
      return res.status(400).json({ message: "Department code must be at least 2 characters" });
    }

    const existingDept = await Department.findOne({
      $or: [
        { code: code.trim().toUpperCase() },
        { name: { $regex: `^${name.trim()}$`, $options: "i" } }
      ]
    });

    if (existingDept) {



      return res.status(400).json({ message: "Department code already exists" });
    }

    const department = await Department.create({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description ? description.trim() : ""
    });

    res.status(201).json({
      message: "Department created successfully",
      department
    });

  } catch (error) {
    console.error("Create Department error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// Get all departments
export const getDepartments = async (req, res) => {


  if (!requireAdmin(req, res)) return;

  try {
    const departments = await Department.find().sort({ name: 1 });
    res.status(200).json(departments);
  } catch (error) {
    console.error("Get Departments error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// Get a single department by ID
export const getDepartmentById = async (req, res) => {
  if (!requireAdmin(req, res)) return;



  const { id } = req.params;
  try {
    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }
    res.status(200).json(department);
  } catch (error) {
    console.error("Get Department error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// Update a department by ID
export const updateDepartment = async (req, res) => {
  if (!requireAdmin(req, res)) return;

  const { id } = req.params;
  const { name, code, description } = req.body;

  try {
    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    if (name && name.trim().length < 2) {
      return res.status(400).json({ message: "Department name must be at least 2 characters" });
    }
    if (code && code.trim().length < 2) {
      return res.status(400).json({ message: "Department code must be at least 2 characters" });
    }

    if (code && code.toUpperCase() !== department.code) {
      const existingDept = await Department.findOne({ code: code.toUpperCase() });
      if (existingDept) {
        return res.status(400).json({ message: "Department code already exists" });
      }
    }

    if (name) department.name = name.trim();
    if (code) department.code = code.trim().toUpperCase();
    if (description !== undefined) department.description = description.trim();

    await department.save();

    res.status(200).json({
      message: "Department updated successfully",
      department
    });

  } catch (error) {
    console.error("Update Department error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// Delete a department by ID
export const deleteDepartment = async (req, res) => {
  // Check if admin
  if (!requireAdmin(req, res)) return;

  const { id } = req.params;
  // console.log("Deleting department id:", id);

  try {
    // Delete department in one step
    const department = await Department.findByIdAndDelete(id);

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    // Optional: clear references in students/guides if needed
    // await Student.updateMany({ department: department.name }, { department: "" });
    // await Guide.updateMany({ department: department.name }, { department: "" });

    res.status(200).json({ message: "Department deleted successfully" });
  } catch (error) {
    console.error("Delete Department error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};