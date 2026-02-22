import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import StudentNotification from '../pages/student/StudentNotification'
// Create notification context
const NotificationContext = createContext()

const STORAGE_KEYS = {
  TEACHER_NOTIFICATIONS: 'capstone_teacher_notifications',
  STUDENT_NOTIFICATIONS: 'capstone_student_notifications'
}

// const loadFromStorage = (key, defaultValue = []) => {
//   try {
//     const item = localStorage.getItem(key)
//     return item ? JSON.parse(item) : defaultValue
//   } catch (e) {
//     return defaultValue
//   }
// }


// const saveToStorage = (key, data) => {
//   try {
//     localStorage.setItem(key, JSON.stringify(data))
//   } catch (e) {
//     console.error(`Error saving ${key}:`, e)
//   }
// }

// Notification provider component
export const NotificationProvider = ({ children }) => {
  // const [teacherNotifications, setTeacherNotifications] = useState(() =>
  //   loadFromStorage(STORAGE_KEYS.TEACHER_NOTIFICATIONS, [])
  // )
  // const [studentNotifications, setStudentNotifications] = useState(() =>
  //   loadFromStorage(STORAGE_KEYS.STUDENT_NOTIFICATIONS, [])
  // )

  // const [teacherNotifications, setTeacherNotifications] = useState([])
  // const [studentNotifications, setStudentNotifications] = useState([])


  const [Notifications, setNotifications] = useState([])

  // console.log(Notifications, "not");

  // fetch notifications

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(
          "/getNotification",
          {
            withCredentials: true
          }
        );

        console.log(response, "res222");


        setNotifications(response.data.data)
        // setStudentNotifications(response.data.data);
        // setTeacherNotifications(response.data.data)
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, []);

  // Save to storage when state changes
  // useEffect(() => {
  //   saveToStorage(STORAGE_KEYS.TEACHER_NOTIFICATIONS, teacherNotifications)
  // }, [teacherNotifications])

  // useEffect(() => {
  //   saveToStorage(STORAGE_KEYS.STUDENT_NOTIFICATIONS, studentNotifications)
  // }, [studentNotifications])



  // Function to send notification to all teachers
  const sendToAllTeachers = async (title, message) => {


    try {
      const res = await axios.post(
        "/createNotification", // your API route
        { title, message },
        {
          withCredentials: true, // ✅ sends cookies / JWT
        }
      );


      const notification = res.data.data;

      // Update UI state using backend response
      // setTeacherNotifications(prev => [
      //   ...prev,
      //   {
      //     id: notification._id,
      //     title: notification.title,
      //     message: notification.message,
      //     type: "admin",
      //     timestamp: notification.createdAt,
      //     read: false,
      //     sender: "Admin",
      //     priority: "high",
      //   },
      // ]);

      setNotifications(prev => [
        ...prev,
        {
          id: notification._id,
          title: notification.title,
          message: notification.message,
          type: "admin",
          timestamp: notification.createdAt,
          read: false,
          sender: "Admin",
          priority: "high",
        },
      ]);

      return notification;

    } catch (error) {
      console.error(
        "Send Notification Error:",
        error.response?.data || error.message
      );
    }
  };

  // Function to send notification to specific teachers


  const sendToSpecificTeachers = async (title, message, teacherIds) => {
    console.log(teacherIds, "teacherId");

    try {
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
      };

      // Send to backend
      const response = await axios.post(
        `/specificTeacherNotification`, // replace with your actual endpoint
        {
          newNotification,
          teacherIds
        },
        {
          withCredentials: true, // include cookies/auth credentials
        }
      );
      console.log(response, "res");


      // Update local state (if using React)
      setNotifications(prev => [...prev, response.data]);
      //  setTeacherNotifications(prev => [...prev, response.data]);
      return response.data;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error; // propagate error if needed
    }
  };

  // Function to send notification to all students


  const sendToAllStudents = async (title, message) => {
    try {
      const newNotification = {
        title,
        message,
        type: 'students', // type is always 'students'
      };

      // Send notification to backend
      const response = await axios.post(
        '/createStudentNotification', // replace with your backend endpoint
        newNotification,
        {
          withCredentials: true, // include cookies/auth
        }
      );

      // Update local state (React)
      setNotifications(currentNotifications => [
        ...currentNotifications,
        response.data, // use server response so IDs and timestamps are correct
      ]);
      //       setStudentNotifications(currentNotifications => [
      //   ...currentNotifications,
      //   response.data, // use server response so IDs and timestamps are correct
      // ]);

      return response.data;
    } catch (error) {
      console.error("Error sending notification to students:", error);
      throw error; // you can handle this in UI
    }
  };


  // Function to send notification to specific students


  const sendToSpecificStudents = async (title, message, studentIds) => {


    try {
      const response = await axios.post(
        "/createSpecificNotification",
        {
          title,
          message,
          studentIds,
        },
        {
          withCredentials: true, // VERY IMPORTANT
        }

      );



      const newNotification = response.data.notification;

      // update local state after DB success
      // setStudentNotifications(prev => [...prev, newNotification]);
      setNotifications(prev => [...prev, newNotification]);

      return newNotification;

    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  // Function to mark teacher notification as read
  const markTeacherNotificationAsRead = (id) => {
    setNotifications(prev => {
      const updated = prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
      return [...updated] // Ensure new array reference
    })
  }
  // const markTeacherNotificationAsRead = (id) => {
  //   setTeacherNotifications(prev => {
  //     const updated = prev.map(notification =>
  //       notification.id === id ? { ...notification, read: true } : notification
  //     )
  //     return [...updated] // Ensure new array reference
  //   })
  // }

  // Function to mark student notification as read
  // const markStudentNotificationAsRead = (id) => {
  //   setStudentNotifications(prev => {
  //     const updated = prev.map(notification =>
  //       notification.id === id ? { ...notification, read: true } : notification
  //     )
  //     return [...updated] // Ensure new array reference
  //   })
  // }

  // Function to mark all teacher notifications as read
  const markAllTeacherNotificationsAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(notification => ({ ...notification, read: true }))
      return [...updated]
    })
  }
  //   const markAllTeacherNotificationsAsRead = () => {
  //   setTeacherNotifications(prev => {
  //     const updated = prev.map(notification => ({ ...notification, read: true }))
  //     return [...updated]
  //   })
  // }

  // // Function to mark all student notifications as read
  // const markAllStudentNotificationsAsRead = () => {
  //   setStudentNotifications(prev => {
  //     const updated = prev.map(notification => ({ ...notification, read: true }))
  //     return [...updated]
  //   })
  // }

  // Function to send message from guide to student (creates notification for student)
  const sendGuideMessageToStudent = async (studentId, message) => {
    try {
      const res = await axios.post(
        "/createNotificationByTeacher",
        {
         studentIds: [studentId],
          message,
        },
        {
          withCredentials: true, // ✅ required for auth cookies
        }
      );

      // ✅ Add new notification to state after DB success
      if (res.data.success) {
        setNotifications(prev => [res.data.data, ...prev]);
      }

      return res.data.data;

    } catch (error) {
      console.error(
        "Send Message Error:",
        error.response?.data || error.message
      );
    }
  };

  const value = {
    // teacherNotifications,
    // studentNotifications,
    Notifications,
    StudentNotification,
    sendToAllTeachers,
    sendToSpecificTeachers,
    sendToAllStudents,
    sendToSpecificStudents,
    markTeacherNotificationAsRead,
    // markStudentNotificationAsRead,
    markAllTeacherNotificationsAsRead,
    // markAllStudentNotificationsAsRead,
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