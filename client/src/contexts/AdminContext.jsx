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

const loadFromStorage = (key, defaultValue = []) => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (e) {
    return defaultValue
  }
}

const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.error(`Error saving ${key}:`, e)
  }
}

export const AdminProvider = ({ children }) => {
  const [departments, setDepartments] = useState(() => loadFromStorage(STORAGE_KEYS.DEPARTMENTS, []))
  const [students, setStudents] = useState(() => loadFromStorage(STORAGE_KEYS.STUDENTS, []))
  const [guides, setGuides] = useState(() => loadFromStorage(STORAGE_KEYS.GUIDES, []))
  const [projectGroups, setProjectGroups] = useState(() => loadFromStorage(STORAGE_KEYS.PROJECT_GROUPS, []))
  const [notifications, setNotifications] = useState(() => loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, []))
  const [tasks, setTasks] = useState(() => loadFromStorage(STORAGE_KEYS.TASKS, []))
  const [profiles, setProfiles] = useState(() => loadFromStorage(STORAGE_KEYS.PROFILES, {}))

  useEffect(() => { saveToStorage(STORAGE_KEYS.DEPARTMENTS, departments) }, [departments])
  useEffect(() => { saveToStorage(STORAGE_KEYS.STUDENTS, students) }, [students])
  useEffect(() => { saveToStorage(STORAGE_KEYS.GUIDES, guides) }, [guides])
  useEffect(() => { saveToStorage(STORAGE_KEYS.PROJECT_GROUPS, projectGroups) }, [projectGroups])
  useEffect(() => { saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications) }, [notifications])
  useEffect(() => { saveToStorage(STORAGE_KEYS.TASKS, tasks) }, [tasks])
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
      "/api/departments", // your backend endpoint
      deptData,
      {
        withCredentials: true, // important for sending cookies
      }
    );

    // Return the newly created department from server
    return response.data.department;

  } catch (error) {
    console.error("Add Department Error:", error.response?.data || error.message);
    throw error; // rethrow so caller can handle it
  }
};

  const updateDepartment = (id, deptData) => {
    setDepartments(prev => prev.map(d => (d.id === id ? { ...d, ...deptData } : d)))
  }

  const deleteDepartment = (id) => {
    const name = departments.find(d => d.id === id)?.name
    setDepartments(prev => prev.filter(d => d.id !== id))
    if (name) {
      setStudents(prev => prev.map(s => (s.department === name ? { ...s, department: '' } : s)))
      setGuides(prev => prev.map(g => (g.department === name ? { ...g, department: '' } : g)))
    }
  }

  const addStudent = (studentData) => {
    const academicYear = getCurrentAcademicYear()
    const newStudent = {
      id: Date.now(),
      ...studentData,
      year: 'Final Year',
      academicYear,
      status: studentData.status ?? 'Active',
      createdAt: new Date().toISOString()
    }
    setStudents(prev => [...prev, newStudent])
    return newStudent
  }

  const updateStudent = (id, studentData) => {
    const academicYear = getCurrentAcademicYear()
    setStudents(prev =>
      prev.map(s =>
        s.id === id
          ? { ...s, ...studentData, year: 'Final Year', academicYear, updatedAt: new Date().toISOString() }
          : s
      )
    )
  }

  const deleteStudent = (id) => {
    setStudents(prev => prev.filter(s => s.id !== id))
  }

  const toggleStudentStatus = (id) => {
    setStudents(prev =>
      prev.map(s =>
        s.id === id
          ? { ...s, status: s.status === 'Active' ? 'Inactive' : 'Active', updatedAt: new Date().toISOString() }
          : s
      )
    )
  }

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

  const addGuide = (guideData) => {
    const newGuide = {
      id: Date.now(),
      ...guideData,
      status: guideData.status ?? 'Active',
      supervisedGroups: [],
      createdAt: new Date().toISOString()
    }
    setGuides(prev => [...prev, newGuide])
    return newGuide
  }

  const updateGuide = (id, guideData) => {
    setGuides(prev =>
      prev.map(g =>
        g.id === id ? { ...g, ...guideData, updatedAt: new Date().toISOString() } : g
      )
    )
  }

  const deleteGuide = (id) => {
    setGuides(prev => prev.filter(g => g.id !== id))
  }

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

  const createProjectGroup = (groupName, members, topicName = '') => {
    const newGroup = {
      id: Date.now(),
      name: groupName,
      topicName: topicName,
      members: members.map(m => ({
        id: m.id,
        name: m.name,
        email: m.email,
        username: m.username,
        department: m.department
      })),
      createdAt: new Date().toISOString()
    }
    setProjectGroups(prev => [...prev, newGroup])

    const dept = members[0]?.department
    const sender = members[0]?.name ?? 'Student'
    const departmentGuides = guides.filter(g => g.department === dept)
    const baseId = Date.now() + 100000
    const newNotifications = departmentGuides.map((guide, i) => ({
      id: baseId + i,
      type: 'GROUP_REQUEST',
      groupId: newGroup.id,
      groupName: newGroup.name,
      sender,
      department: dept,
      recipientId: guide.id,
      createdAt: new Date().toISOString()
    }))
    setNotifications(prev => [...prev, ...newNotifications])

    return newGroup
  }

  const updateProjectGroup = (id, updates) => {
    setProjectGroups(prev =>
      prev.map(g => (g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g))
    )
  }

  const deleteProjectGroup = (id) => {
    setProjectGroups(prev => prev.filter(g => g.id !== id))
    setNotifications(prev => prev.filter(n => n.groupId !== id))
  }

  const addNotification = (data) => {
    const n = { id: data.id ?? Date.now(), ...data, createdAt: data.createdAt ?? new Date().toISOString() }
    setNotifications(prev => [...prev, n])
    return n
  }

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const acceptGroupNotification = (notificationId, groupId, guideId) => {
    setNotifications(prev => prev.filter(n => n.groupId !== groupId))

    setProjectGroups(prev =>
      prev.map(g =>
        g.id === groupId
          ? { ...g, status: 'Accepted', assignedGuide: guideId, updatedAt: new Date().toISOString() }
          : g
      )
    )

    setGuides(prev =>
      prev.map(g =>
        g.id === guideId
          ? {
            ...g,
            supervisedGroups: [...(g.supervisedGroups || []), groupId],
            updatedAt: new Date().toISOString()
          }
          : g
      )
    )
  }

  // Task Functions
  const addTask = (taskData) => {
    const newTask = {
      id: Date.now(),
      ...taskData,
      createdAt: new Date().toISOString()
    }
    setTasks(prev => [...prev, newTask])
    return newTask
  }

  const updateTask = (id, taskData) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === id ? { ...t, ...taskData, updatedAt: new Date().toISOString() } : t
      )
    )
  }

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const getTasksByGroup = (groupId) => {
    return tasks.filter(t => t.groupId === groupId)
  }

  const submitTaskFile = (taskId, fileData) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === taskId
          ? {
            ...t,
            submittedFile: {
              fileName: fileData.fileName,
              fileSize: fileData.fileSize,
              fileType: fileData.fileType,
              fileContent: fileData.fileContent, // base64 encoded
              submittedAt: new Date().toISOString(),
              submittedBy: fileData.submittedBy
            },
            status: 'Submitted',
            updatedAt: new Date().toISOString()
          }
          : t
      )
    )
  }

  const reviewTask = (taskId, { status, remark }) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === taskId
          ? {
            ...t,
            status: status || t.status,
            reviewRemark: remark ?? t.reviewRemark,
            reviewedAt: new Date().toISOString()
          }
          : t
      )
    )
  }

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
