import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Hero from './components/Hero'
import PublicProjects from './components/Projects'
import AdminLayout from './pages/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import AcademicSetup from './pages/admin/AcademicSetup'
import StudentManagement from './pages/admin/StudentManagement'
import GuideManagement from './pages/admin/GuideManagement'
import ProjectGroups from './pages/admin/ProjectGroups'
import Analytics from './pages/admin/Analytics'
import Notifications from './pages/admin/Notifications'
import AddTask from './pages/guide/AddTask'
import NotificationGuide from './pages/guide/NotificationGuide'
import GuideLayout from './pages/guide/GuideLayout'
import StudentLayout from './pages/student/StudentLayout'
import StudentDashboard from './pages/student/StudentDashboard'
import Profile from './pages/student/Profile'
import Login from './components/Login'
import { AdminProvider } from './contexts/AdminContext'
import Group from './pages/student/Group'
import ManageGroups from './pages/guide/ManageGroups'
import Tasks from './pages/student/Tasks'
import StudentNotification from './pages/student/StudentNotification'
import MessageGuide from './pages/guide/MessageGuide'
import { NotificationProvider } from './contexts/NotificationContext'
import GuideDashboard from './pages/guide/GuideDashboard'
import GuideProfile from './pages/guide/GuideProfile'
import StudentProfile from './pages/student/StudentProfile'
import ChatBot from './pages/student/ChatBot'

const App = () => {
  // useEffect(() => {
  //   localStorage.clear();
  // }, []);

  return (
    <NotificationProvider>
      <AdminProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Hero />} />
          <Route path="/projects" element={<PublicProjects />} />
          <Route path="/login" element={<Login />} />

          {/* Admin routes with layout */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="academic-setup" element={<AcademicSetup />} />
            <Route path="students" element={<StudentManagement />} />
            <Route path="guides" element={<GuideManagement />} />
            <Route path="project-groups" element={<ProjectGroups />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>

          <Route path="/guide" element={<GuideLayout />}>
            <Route index element={<GuideDashboard />} />
            <Route path="notifications" element={<NotificationGuide />} />
            <Route path="assigntask" element={<AddTask />} />
            <Route path="managegroup" element={<ManageGroups />} />
            <Route path="message-guide" element={<MessageGuide />} />
            <Route path="guide-profile" element={<GuideProfile />} />
          </Route>

          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<StudentDashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="group" element={<Group />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="student-notification" element={<StudentNotification />} />
            <Route path="student-profile" element={<StudentProfile />} />
            <Route path="student-chatbot" element={<ChatBot />} />
          </Route>
        </Routes>
      </AdminProvider>
    </NotificationProvider>
  )
}

export default App