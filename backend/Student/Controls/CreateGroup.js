import Group from "../Models/GroupSchema.js";
import mongoose from "mongoose";
import Student from "../../Admin/model/StudentSchema.js";

export const createGroup = async (req, res) => {


  try {
    const { groupName, topicName } = req.body;

    const { role, department } = req.user.id
    // console.log(department, "de");



    if (role !== "Student") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    // Accept both names safely
    const incomingMembers =
      req.body.selectedMembers || req.body.members;
    // console.log(incomingMembers, "mem");

    // console.log(req.body, "body");

    // 1️⃣ Basic validation
    if (!groupName || !topicName || !incomingMembers?.length) {
      return res.status(400).json({
        success: false,
        message: "Group name, topic name and members required"
      });
    }
    const membersIds = incomingMembers.map(m => m._id || m.id);


    // 2️⃣ Check duplicate group name
    const existing = await Group.findOne({
      $or: [
        { groupName: { $regex: `^${groupName}$`, $options: "i" } },
        { "selectedMembers._id": { $in: membersIds } }
      ]
    });




    if (existing) {

      return res.status(400).json({
        success: false,
        message: "Group name already exists"
      });
    }

    // 3️⃣ Normalize members
    const selectedMembers = incomingMembers
      .map(m => ({
        _id: m._id || m.id,
        name: m.name
      }))
      .filter(m => m._id); // remove invalid

    // 4️⃣ Validate ObjectIds
    const invalidMember = selectedMembers.find(
      m => !mongoose.Types.ObjectId.isValid(m._id)
    );

    if (invalidMember) {
      return res.status(400).json({
        success: false,
        message: `Invalid member id: ${invalidMember._id}`
      });
    }

    // 5️⃣ Check students exist
    const memberIds = selectedMembers.map(m => m._id);

    const students = await Student.find({
      _id: { $in: memberIds }
    });

    if (students.length !== memberIds.length) {
      return res.status(400).json({
        success: false,
        message: "Some students not found"
      });
    }

    // 6️⃣ Create group
    const newGroup = await Group.create({
      groupName,
      topicName,
      department,
      selectedMembers

    });

    // 7️⃣ Return response
    res.status(201).json({
      success: true,
      message: "Group created successfully",
      data: newGroup
    });

  } catch (error) {
    console.error("Create Group Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

export const GetGroups = async (req, res) => {
  try {
    // ✅ correct destructuring
    const { role, department, id } = req.user.id;
    // console.log("hell", role, "role");
    

    //   console.log(id,"id");
      
    let data;

    // 👨‍🎓 STUDENT → find groups where student exists in selectedMembers
    if (role === "Student") {
      data = await Group.find({
        "selectedMembers._id": id
      });
    }

    // 👨‍🏫 TEACHER / ADMIN → fetch by department
    else if (role === "Guide" ||role ==="admin") {
      data = await Group.find({
        department: department,

        // ✅ not accepted yet
        teacherId: id,

        // ✅ not rejected by this guide
        rejectedTeachers: { $ne: id }
      });
    }


    
    // console.log(data, "dtaa");


    return res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};


export const EditGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, topicName } = req.body;
    // console.log(id, " id", req.body, "body");


    const groupName = name
    const updates = {};

    // ✅ Check duplicate group name
    if (groupName) {
      const existingGroup = await Group.findOne({
        groupName: groupName.trim(),
        _id: { $ne: id }   // exclude current group
      });

      if (existingGroup) {
        return res.status(400).json({
          success: false,
          message: "Group name already exists"
        });
      }

      updates.groupName = groupName;
    }

    if (topicName) {
      updates.topicName = topicName;
    }

    // nothing to update
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields provided to update"
      });
    }

    const updatedGroup = await Group.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    );

    if (!updatedGroup) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Group updated successfully",
      data: updatedGroup
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

export const assignGroup = async (req, res) => {
  try {
    const { notificationId, guideId } = req.body;
    // console.log(req.body, "bodyy");

    const groupId = notificationId

    // ✅ Validation
    if (!groupId || !guideId) {
      return res.status(400).json({
        success: false,
        message: "Group ID and Guide ID are required",
      });
    }

    // ✅ Update group directly
    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      {
        teacherId: guideId,   // 👈 store guide id
        status: "Accepted"    // 👈 change status
      },
      { new: true }
    );

    if (!updatedGroup) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Group accepted successfully",
      data: updatedGroup,
    });

  } catch (error) {
    console.error("Assign Group Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const rejectGroup = async (req, res) => {
  try {

    // ✅ Correct param spelling
    const { id: groupId } = req.params;

    // ✅ Correct user extraction
    const guideId = req.user.id.id;

    if (!groupId) {
      return res.status(400).json({
        success: false,
        message: "Group ID is required"
      });
    }

    // ✅ Add guideId into rejectedTeachers array (no duplicates)
    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      {
        $addToSet: { rejectedTeachers: guideId }
      },
      { new: true }
    );

    if (!updatedGroup) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Group rejected successfully",
      data: updatedGroup
    });

  } catch (error) {
    console.error("Reject Group Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};