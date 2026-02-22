import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from "axios";
const AdminContext = createContext()


const STORAGE_KEYS = {
  DEPARTMENTS: 'fyp_departments',
  STUDENTS: 'fyp_students',
  GUIDES: 'fyp_guides',
  PROJECT_GROUPS: 'fyp_project_groups',
  NOTIFICATIONS: 'fyp_notifications',
  TASKS: 'fyp_tasks',
  PROFILES: 'fyp_profiles'
}


const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.error(`Error saving ${key}:`, e)
  }
}

export const AdminProvider = ({ children }) => {
  const [departments, setDepartments] = useState([])
  const [students, setStudents] = useState([])
  const [department, setDepartment] = useState("")
  const [studentId, setStudentId] = useState()
  const [guides, setGuides] = useState([])
  const [projectGroups, setProjectGroups] = useState([])
  const [notifications, setNotifications] = useState([])
  const [tasks, setTasks] = useState([])
  const [profiles, setProfiles] = useState([])
  const [reload, setReload] = useState(false)




  useEffect(() => { saveToStorage(STORAGE_KEYS.DEPARTMENTS, departments) }, [departments])
  // useEffect(() => { saveToStorage(STORAGE_KEYS.STUDENTS, students) }, [students])
  // useEffect(() => { saveToStorage(STORAGE_KEYS.GUIDES, guides) }, [guides])
  // useEffect(() => { saveToStorage(STORAGE_KEYS.PROJECT_GROUPS, projectGroups) }, [projectGroups])
  useEffect(() => { saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications) }, [notifications])
  // useEffect(() => { saveToStorage(STORAGE_KEYS.TASKS, tasks) }, [tasks])
  useEffect(() => { saveToStorage(STORAGE_KEYS.PROFILES, profiles) }, [profiles])

  const getCurrentAcademicYear = () => {
    const y = new Date().getFullYear()
    return `${y}-${y + 1}`
  }



  const clearAllData = () => {
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k))
    setDepartments([])
    setStudents([])
    setGuides([])
    setProjectGroups([])
    setNotifications([])
    setTasks([])
    setProfiles({})
  }


  const addDepartment = async (deptData) => {
    try {
      const response = await axios.post(
        "/addDepartment", // your backend endpoint
        deptData,
        {
          withCredentials: true, // important for sending cookies
        }
      );

      if (response) {
        setReload(true)
      }


      // Return the newly created department from server
      return response.data.department;

    } catch (error) {
      console.error("Add Department Error:", error.response?.data || error.message);
      throw error; // rethrow so caller can handle it
    }
  };

  // Get Departments 

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        // setLoading(true);
        const res = await axios.get("/getDepartment", {
          withCredentials: true, // ✅ send cookies (JWT) with request
        });



        setDepartments(res.data);
      } catch (err) {
        console.error("Error fetching departments:", err.response?.data || err.message);
        // setError(err.response?.data?.message || "Failed to fetch departments");
      } finally {
        // setLoading(false);
      }
    };

    fetchDepartments();
  }, [reload]);


  const updateDepartment = async (id, deptData) => {
    console.log(id, "dep id");

    try {
      // 1️⃣ Send update request to backend
      const res = await axios.put(
        `/updateDepartment/${id}`,
        deptData,
        { withCredentials: true } // ✅ send JWT cookie
      );
      if (res) {
        setReload(true)
      }

      // 2️⃣ Update local state with response from backend
      setDepartments(prev =>
        prev.map(d => (d._id === id ? { ...d, ...res.data } : d))
      );


      console.log("Department updated successfully:", res.data);
    } catch (error) {
      console.error(
        "Error updating department:",
        error.response?.data || error.message
      );
    }
  }

  const deleteDepartment = async (id) => {
    try {


      // 1️⃣ Find the department name for clearing references
      const deptName = departments.find(d => d._id === id)?.name;

      // 2️⃣ Send DELETE request to backend
      const res = await axios.delete(`/deleteDepartment/${id}`, {
        withCredentials: true // ✅ send JWT cookie
      });

      if (res) {
        setReload(true)
      }

      // 3️⃣ Update local state
      setDepartments(prev => prev.filter(d => d._id !== id));

      if (deptName) {
        setStudents(prev =>
          prev.map(s => (s.department === deptName ? { ...s, department: "" } : s))
        );
        setGuides(prev =>
          prev.map(g => (g.department === deptName ? { ...g, department: "" } : g))
        );
      }

      console.log(`Department "${deptName}" deleted successfully`);
    } catch (error) {
      console.error(
        "Error deleting department:",
        error.response?.data || error.message
      );
    }
  };

  const addStudent = async (studentData) => {
    try {
      const academicYear = getCurrentAcademicYear();

      const newStudent = {
        id: Date.now(),
        ...studentData,
        year: "Final Year",
        academicYear,
        status: studentData.status ?? "Active",
        createdAt: new Date().toISOString(),
      };

      // 🔹 Send to backend using axios
      const response = await axios.post(
        "/addStudent", // change to your API
        newStudent,
        {
          withCredentials: true, // ⭐ important
        }
      );
      console.log(response, "student res");


      // 🔹 Update state after success
      setStudents((prev) => [...prev, response.data]);

      return response.data;
    } catch (error) {
      console.error("Error adding student:", error);
    }
  };

  const updateStudent = async (id, studentData) => {


    try {
      const res = await axios.put(
        `/editStudents/${id}`,   // your backend route
        studentData,
        {
          withCredentials: true, // 👈 sends cookies / session
        }
      );



      const updatedStudent = res.data;

      // update state after success
      setStudents(prev =>
        prev.map(s =>
          s._id === id ? updatedStudent : s
        )
      );

    } catch (error) {
      console.error("Update failed:", error.response?.data || error.message);
    }
  };
  const deleteStudent = async (id) => {
    try {
      await axios.delete(`/deleteStudents/${id}`, {
        withCredentials: true, // 👈 send cookies/session
      });

      // Update UI after successful delete
      setStudents(prev =>
        prev.filter(s => s._id !== id)
      );

    } catch (error) {
      console.error("Delete failed:", error.response?.data || error.message);
    }
  };

  const toggleStudentStatus = (id) => {
    setStudents(prev =>
      prev.map(s =>
        s.id === id
          ? { ...s, status: s.status === 'Active' ? 'Inactive' : 'Active', updatedAt: new Date().toISOString() }
          : s
      )
    )
  }




  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await axios.get("/getStudents", {
          withCredentials: true, // 👈 important
        });


        console.log(res, "student");


        setDepartment(res.data.department)
        setStudentId(res.data.studentId)
        setStudents(res.data.data);


      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    fetchStudent();
  }, []);


  // Fetch Guid Form backend

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const res = await axios.get("/getGuids", {
          withCredentials: true, // 👈 important for cookies/session
        });

        // console.log(res.data.data, "Guid res");

        setGuides(res.data.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch guides");
      }
    };

    fetchGuides();
  }, []);


  // Fetch Student From Backend

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // setLoading(true);
        // setError("");

        const response = await axios.get("/getStudents", {
          withCredentials: true, // ✅ send cookies/session
        });

        setStudents(response.data.data || []);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to fetch students");
      } finally {
        // setLoading(false);
      }
    };

    fetchStudents();
  }, []);


  //Fetch project Groups From backend

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const res = await axios.get("/getGroup", {
          withCredentials: true   // ✅ send cookies/session
        });

        console.log(res, "group res");

        if (res?.data) {
          setProjectGroups(res.data?.data);
          setNotifications(res.data?.data)
        }
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };

    fetchGroup(); // ✅ IMPORTANT: call the function
  }, []);



  const importStudentsFromCSV = (csvData) => {
    const academicYear = getCurrentAcademicYear()
    const imported = csvData.map((row, i) => ({
      id: Date.now() + i,
      ...row,
      year: 'Final Year',
      academicYear: row.academicYear || academicYear,
      status: row.status || 'Active',
      createdAt: new Date().toISOString()
    }))
    setStudents(prev => [...prev, ...imported])
    return imported.length
  }

  const exportStudentsToCSV = () => {
    const headers = ['Name', 'Email', 'Username', 'Department', 'Roll No', 'Academic Year', 'Status']
    const rows = students.map(s =>
      [s.name, s.email, s.username, s.department, s.rollNo, s.academicYear, s.status].join(',')
    )
    const blob = new Blob([headers.join(','), '\n', rows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'final_year_students.csv'
    a.click()
    URL.revokeObjectURL(url)
  }
  const addGuide = async (guideData) => {
    try {
      const res = await axios.post(
        "/createGuid",   // your backend route
        guideData,
        {
          withCredentials: true, // 👈 sends cookies/session
        }
      );

      const newGuide = res.data;

      // Update state after successful save
      setGuides(prev => [...prev, newGuide]);

      return newGuide;

    } catch (error) {
      console.error("Create Guide Error:", error.response?.data || error.message);
    }
  };


  useEffect(() => {
    const fetchGuid = async () => {
      try {
        const res = await axios.get("/getGuids", {
          withCredentials: true, // 👈 send cookies/session
        });



        setGuides(Array.isArray(res.data.data) ? res.data.data : [res.data.data]);


      } catch (error) {
        console.error("Fetch Guides Error:", error.response?.data || error.message);
      }
    };

    fetchGuid();
  }, []);

  const updateGuide = async (id, guideData) => {
    try {
      const res = await axios.put(
        `/updateGuids/${id}`,
        guideData,
        {
          withCredentials: true, // 👈 send cookies/session
        }
      );

      const updatedGuide = res.data;

      // Update state with DB response
      setGuides(prev =>
        prev.map(g =>
          g._id === id ? updatedGuide : g
        )
      );

      return updatedGuide;

    } catch (error) {
      console.error("Update Guide Error:", error.response?.data || error.message);
    }
  };

  const deleteGuide = async (id) => {
    try {
      await axios.delete(
        `/deleteGuids/${id}`,
        {
          withCredentials: true, // 👈 send cookies/session
        }
      );

      // Remove from UI after successful delete
      setGuides(prev =>
        prev.filter(g => g._id !== id)
      );

    } catch (error) {
      console.error("Delete Guide Error:", error.response?.data || error.message);
    }
  };
  const toggleGuideStatus = (id) => {
    setGuides(prev =>
      prev.map(g =>
        g.id === id
          ? { ...g, status: g.status === 'Active' ? 'Inactive' : 'Active', updatedAt: new Date().toISOString() }
          : g
      )
    )
  }

  const importGuidesFromCSV = (csvData) => {
    const imported = csvData.map((row, i) => ({
      id: Date.now() + i,
      ...row,
      status: row.status || 'Active',
      supervisedGroups: [],
      createdAt: new Date().toISOString()
    }))
    setGuides(prev => [...prev, ...imported])
    return imported.length
  }

  const exportGuidesToCSV = () => {
    const headers = ['Name', 'Email', 'Username', 'Department', 'Specialization', 'Status']
    const rows = guides.map(g =>
      [g.name, g.email, g.username, g.department, g.specialization, g.status].join(',')
    )
    const blob = new Blob([headers.join(','), '\n', rows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'guides.csv'
    a.click()
    URL.revokeObjectURL(url)
  }



  const createProjectGroup = async (groupName, members, topicName = '') => {
    console.log(members, "membres");

    try {
      const payload = {
        groupName,
        topicName,
        members
      };

      const response = await axios.post(
        "/createGroup",   // your backend route
        payload,
        {
          withCredentials: true   // ⭐ REQUIRED for cookies/JWT
        }
      );

      const newGroup = response.data.data;

      // Update local state after success
      setProjectGroups(prev => [...prev, newGroup]);

      return newGroup;

    } catch (error) {
      console.error("Create group error:", error);
    }
  };

  const updateProjectGroup = async (id, updates) => {
    try {
      const res = await axios.put(
        `/editGroup/${id}`,
        updates,
        {
          withCredentials: true
        }
      );

      // ✅ update state only after backend success
      setProjectGroups(prev =>
        prev.map(g =>
          g._id === id ? res.data.data : g
        )
      );

    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const deleteProjectGroup = (id) => {
    setProjectGroups(prev => prev.filter(g => g.id !== id))
    setNotifications(prev => prev.filter(n => n.groupId !== id))
  }

  const addNotification = (data) => {


    const n = { id: data.id ?? Date.now(), ...data, createdAt: data.createdAt ?? new Date().toISOString() }
    setNotifications(prev => [...prev, n])
    return n
  }

  const removeNotification = async (id) => {

    try {
      const res = await axios.put(
        `/rejectGroup/${id}`,
        {},
        {
          withCredentials: true
        }
      );

      if (res.data.success) {
        setNotifications(prev =>
          prev.filter(n => n._id !== id)
        );
      }

    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const acceptGroupNotification = async (notificationId, groupId, guideId) => {
    try {
      // 👉 Call backend API
      const res = await axios.put(
        "/assignGroup",   // change to your real route
        {
          notificationId,
          groupId,
          guideId
        },
        {
          withCredentials: true   // ✅ VERY IMPORTANT for cookies/session
        }
      );

      // 👉 If success, update frontend state
      if (res.data.success) {
        setNotifications(prev =>
          prev.filter(n => n._id !== notificationId)
        );

        // Optional state updates if needed
        // setProjectGroups(...)
        // setGuides(...)
      }

    } catch (error) {
      console.error("Error accepting group:", error);
    }
  };
  // Task Functions
  const addTask = async (taskData) => {
    try {
      const response = await axios.post(
        "/addTask",   // adjust base URL if needed
        taskData,
        {
          withCredentials: true,
        }
      );

      const newTask = response.data.data;

      setTasks((prev) => [...prev, newTask]);

      return newTask;
    } catch (error) {
      console.error("Error adding task:", error);
      throw error;
    }
  };

  const updateTask = async (id, taskData) => {
    try {
      const res = await axios.put(
        `/publishFinalMarks/${id}`,   // your backend route
        taskData,
        {
          withCredentials: true,     // ✅ important for cookies / auth
        }
      );

      if (res.data.success) {
        // update frontend state after DB update
        setTasks(prev =>
          prev.map(t =>
            t._id === id
              ? { ...t, ...res.data.data } // use updated data from server
              : t
          )
        );
      }
    } catch (error) {
      console.error("Update Task Error:", error.response?.data || error.message);
    }
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const getTasksByGroup = async () => {
    try {
      const res = await axios.get(
        `/getTask`,
        {
          withCredentials: true
        }
      );
      console.log(res, "task");

      setTasks(res.data.data)
      return res.data.data; // assuming backend returns tasks array
    } catch (error) {
      console.error("Error fetching tasks:", error);
      return [];
    }
  };


  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get("/getTask", {
          withCredentials: true,
        });

        console.log(res, "task");

        setTasks(res.data.data);

      } catch (error) {
        console.error("Error fetching tasks:", error);
        setTasks([]);
      }
    };

    fetchTasks();
  }, []);
  const submitTaskFile = async (taskId, file) => {
    try {
      console.log(file, "file");

      if (!file) throw new Error("No file selected");

      // Create FormData
      const formData = new FormData();
      formData.append("file", file); // append the file
      formData.append("fileName", file.fileName); // optional, if you want to store fileName separately

      const res = await axios.put(
        `/submitTaskFile/${taskId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      console.log("Upload Success:", res.data);
      return res.data;

    } catch (error) {
      console.error("File Upload Error:", error);
      throw error;
    }
  };

  const reviewTask = async (taskId, { status, remark }) => {
    try {
      const res = await axios.put(
        `/reviewTask/${taskId}`,
        { status, remark },
        { withCredentials: true }
      );

      // ✅ Update UI instantly after backend success
      setTasks(prev =>
        prev.map(t =>
          t._id === taskId ? res.data.data : t
        )
      );

      alert("Task reviewed successfully ✅");

    } catch (error) {
      console.error("Review Task Error:", error);
      alert("Failed to review task ❌");
    }
  };
  // Profile Functions
  const updateProfile = (userId, profileData) => {
    setProfiles(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        ...profileData,
        updatedAt: new Date().toISOString()
      }
    }))
  }

  const getProfile = (userId) => {
    return profiles[userId] || null
  }

  const value = {
    departments,
    students,
    department,
    studentId,
    guides,
    projectGroups,
    notifications,
    tasks,
    profiles,
    getCurrentAcademicYear,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    addStudent,
    updateStudent,
    deleteStudent,
    toggleStudentStatus,
    importStudentsFromCSV,
    exportStudentsToCSV,
    addGuide,
    updateGuide,
    deleteGuide,
    toggleGuideStatus,
    importGuidesFromCSV,
    exportGuidesToCSV,
    createProjectGroup,
    updateProjectGroup,
    deleteProjectGroup,
    addNotification,
    removeNotification,
    acceptGroupNotification,
    addTask,
    updateTask,
    deleteTask,
    getTasksByGroup,
    submitTaskFile,
    reviewTask,
    updateProfile,
    getProfile,
    clearAllData
  }

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

export const useAdmin = () => {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider')
  return ctx
}
