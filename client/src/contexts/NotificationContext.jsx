import React, { createContext, useContext, useState, useEffect } from 'react'

// Create notification context
const NotificationContext = createContext()

const STORAGE_KEYS = {
  TEACHER_NOTIFICATIONS: 'capstone_teacher_notifications',
  STUDENT_NOTIFICATIONS: 'capstone_student_notifications'
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

// Notification provider component
export const NotificationProvider = ({ children }) => {
  const [teacherNotifications, setTeacherNotifications] = useState(() =>
    loadFromStorage(STORAGE_KEYS.TEACHER_NOTIFICATIONS, [])
  )
  const [studentNotifications, setStudentNotifications] = useState(() =>
    loadFromStorage(STORAGE_KEYS.STUDENT_NOTIFICATIONS, [])
  )

  // Save to storage when state changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.TEACHER_NOTIFICATIONS, teacherNotifications)
  }, [teacherNotifications])

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.STUDENT_NOTIFICATIONS, studentNotifications)
  }, [studentNotifications])

  // Function to send notification to all teachers
  const sendToAllTeachers = (title, message) => {
    const newNotification = {
      id: Date.now(),
      title,
      message,
      type: 'admin',
      timestamp: new Date(),
      read: false,
      sender: 'Admin',
      priority: 'high'
    }

    setTeacherNotifications(prev => [...prev, newNotification])
    return newNotification
  }

  // Function to send notification to specific teachers
  const sendToSpecificTeachers = (title, message, teacherIds) => {
    const newNotification = {
      id: Date.now(),
      title,
      message,
      type: 'admin',
      timestamp: new Date(),
      read: false,
      sender: 'Admin',
      priority: 'high',
      recipientIds: teacherIds
    }

    setTeacherNotifications(prev => [...prev, newNotification])
    return newNotification
  }

  // Function to send notification to all students
  const sendToAllStudents = (title, message) => {
    const newNotification = {
      id: Date.now(),
      title,
      message,
      type: 'important',
      timestamp: new Date(),
      read: false,
      sender: 'Admin'
    }

    setStudentNotifications(currentNotifications => {
      // Ensure a new array reference to trigger re-render
      return [...currentNotifications, newNotification]
    })
    return newNotification
  }

  // Function to send notification to specific students
  const sendToSpecificStudents = (title, message, studentIds) => {
    const newNotification = {
      id: Date.now(),
      title,
      message,
      type: 'important',
      timestamp: new Date(),
      read: false,
      sender: 'Admin',
      recipientIds: studentIds
    }

    setStudentNotifications(prev => [...prev, newNotification])
    return newNotification
  }

  // Function to mark teacher notification as read
  const markTeacherNotificationAsRead = (id) => {
    setTeacherNotifications(prev => {
      const updated = prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
      return [...updated] // Ensure new array reference
    })
  }

  // Function to mark student notification as read
  const markStudentNotificationAsRead = (id) => {
    setStudentNotifications(prev => {
      const updated = prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
      return [...updated] // Ensure new array reference
    })
  }

  // Function to mark all teacher notifications as read
  const markAllTeacherNotificationsAsRead = () => {
    setTeacherNotifications(prev => {
      const updated = prev.map(notification => ({ ...notification, read: true }))
      return [...updated]
    })
  }

  // Function to mark all student notifications as read
  const markAllStudentNotificationsAsRead = () => {
    setStudentNotifications(prev => {
      const updated = prev.map(notification => ({ ...notification, read: true }))
      return [...updated]
    })
  }

  // Function to send message from guide to student (creates notification for student)
  const sendGuideMessageToStudent = (studentId, message) => {
    const newNotification = {
      id: Date.now(),
      title: 'Message from Guide',
      message,
      type: 'guide',
      timestamp: new Date(),
      read: false,
      sender: 'Guide',
      studentId: studentId
    }

    setStudentNotifications(prev => [...prev, newNotification])
    return newNotification
  }

  const value = {
    teacherNotifications,
    studentNotifications,
    sendToAllTeachers,
    sendToSpecificTeachers,
    sendToAllStudents,
    sendToSpecificStudents,
    markTeacherNotificationAsRead,
    markStudentNotificationAsRead,
    markAllTeacherNotificationsAsRead,
    markAllStudentNotificationsAsRead,
    sendGuideMessageToStudent
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

// Custom hook to use notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}