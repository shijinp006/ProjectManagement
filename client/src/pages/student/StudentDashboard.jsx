import React, { useState, useEffect } from 'react'
import { FiBell, FiBookOpen, FiCheckCircle, FiClock, FiTrendingUp, FiUsers, FiCalendar, FiAlertCircle } from 'react-icons/fi'
import { useAdmin } from '../../contexts/AdminContext'
import { useNotifications } from '../../contexts/NotificationContext'
import { Link } from 'react-router-dom'

const StudentDashboard = () => {
  const { students, projectGroups, tasks } = useAdmin()
  const { studentNotifications } = useNotifications()
  const [currentStudent, setCurrentStudent] = useState(null)
  const [studentProjects, setStudentProjects] = useState([])
  const [studentTasks, setStudentTasks] = useState([])
  const [recentNotifications, setRecentNotifications] = useState([])

  useEffect(() => {
    // Get current student from localStorage (you might want to get this from auth context)
    const userData = localStorage.getItem('user')
    if (userData && students.length > 0) {
      try {
        const user = JSON.parse(userData)
        const student = students.find(s => s.email === user.email || s.username === user.username)
        if (student) {
          setCurrentStudent(student)

          // Get student's projects
          const projects = projectGroups.filter(group =>
            group.members && group.members.some(member => member.email === student.email)
          )
          setStudentProjects(projects)

          // Get student's tasks from all projects they belong to
          const studentTasksData = tasks.filter(task => {
            // Check if task belongs to any of student's projects
            return projects.some(project => project.id === task.groupId)
          })
          setStudentTasks(studentTasksData)
        } else {
          // If no student found, try to show data for first student (for demo purposes)
          console.log('No matching student found, showing first student data for demo')
          if (students.length > 0) {
            const demoStudent = students[0]
            setCurrentStudent(demoStudent)

            const projects = projectGroups.filter(group =>
              group.members && group.members.some(member => member.email === demoStudent.email)
            )
            setStudentProjects(projects)

            const studentTasksData = tasks.filter(task =>
              projects.some(project => project.id === task.groupId)
            )
            setStudentTasks(studentTasksData)
          }
        }
      } catch (error) {
        console.error('Error parsing user data:', error)
        // For demo purposes, show first student if there's an error
        if (students.length > 0) {
          const demoStudent = students[0]
          setCurrentStudent(demoStudent)

          const projects = projectGroups.filter(group =>
            group.members && group.members.some(member => member.email === demoStudent.email)
          )
          setStudentProjects(projects)

          const studentTasksData = tasks.filter(task =>
            projects.some(project => project.id === task.groupId)
          )
          setStudentTasks(studentTasksData)
        }
      }
    }

    // Get recent notifications (last 3) - these are general notifications for all students
    const recent = studentNotifications
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 3)
    setRecentNotifications(recent)
  }, [students, projectGroups, tasks, studentNotifications])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getTaskStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-700'
      case 'In Progress': return 'bg-blue-100 text-blue-700'
      case 'Submitted': return 'bg-yellow-100 text-yellow-700'
      case 'Pending': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'important': return <FiAlertCircle className="w-4 h-4 text-red-500" />
      case 'guide': return <FiUsers className="w-4 h-4 text-blue-500" />
      default: return <FiBell className="w-4 h-4 text-gray-500" />
    }
  }

  const unreadNotifications = studentNotifications.filter(n => !n.read).length

  if (!currentStudent) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiUsers className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Dashboard</h2>
          <p className="text-gray-600">Please wait while we load your data...</p>
          {students.length === 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <strong>Note:</strong> No students found in the system. Please add students through the admin panel first.
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {currentStudent.name}!
            </h1>
            <p className="text-blue-100 text-lg">
              {currentStudent.rollNo} • {currentStudent.department} • Final Year
            </p>
            <p className="text-blue-100 mt-2">
              Academic Year: {currentStudent.academicYear}
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <FiUsers className="w-10 h-10" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">My Projects</p>
              <p className="text-3xl font-bold text-slate-900">{studentProjects.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiBookOpen className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Active Tasks</p>
              <p className="text-3xl font-bold text-slate-900">
                {studentTasks.filter(task => task.status !== 'Completed').length}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {studentTasks.filter(task => task.status === 'Completed').length} completed
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FiCheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Notifications</p>
              <p className="text-3xl font-bold text-slate-900">{unreadNotifications}</p>
              <p className="text-xs text-slate-500">unread</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <FiBell className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Completed Tasks</p>
              <p className="text-3xl font-bold text-slate-900">
                {studentTasks.filter(task => task.status === 'Completed').length}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {studentTasks.length > 0
                  ? `${Math.round((studentTasks.filter(task => task.status === 'Completed').length / studentTasks.length) * 100)}% done`
                  : 'No tasks yet'
                }
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiTrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Notifications */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center">
              <FiBell className="w-5 h-5 mr-2" />
              Recent Notifications
            </h2>
            <Link
              to="/student/student-notification"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All →
            </Link>
          </div>

          <div className="space-y-4">
            {recentNotifications.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <FiBell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="mb-2">No notifications yet</p>
                <p className="text-sm">You'll receive notifications from your guide and admin here.</p>
              </div>
            ) : (
              recentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-sm ${
                    notification.read ? 'bg-slate-50 border-slate-200' : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${
                        notification.read ? 'text-slate-700' : 'text-slate-900'
                      }`}>
                        {notification.title}
                      </p>
                      {notification.message && (
                        <p className={`text-xs mt-1 line-clamp-2 ${
                          notification.read ? 'text-slate-500' : 'text-slate-600'
                        }`}>
                          {notification.message}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-slate-500">
                          {new Date(notification.timestamp).toLocaleDateString()} • {notification.sender}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          notification.type === 'important' ? 'bg-red-100 text-red-700' :
                          notification.type === 'guide' ? 'bg-blue-100 text-blue-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {notification.type === 'important' ? 'Important' :
                           notification.type === 'guide' ? 'Guide' : 'System'}
                        </span>
                      </div>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Current Tasks */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center">
              <FiCheckCircle className="w-5 h-5 mr-2" />
              Current Tasks
            </h2>
            <Link
              to="/student/tasks"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All →
            </Link>
          </div>

          <div className="space-y-4">
            {studentTasks.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <FiCheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="mb-2">No tasks assigned yet</p>
                <p className="text-sm">Tasks will appear here once your guide assigns them to your project.</p>
              </div>
            ) : studentTasks.filter(task => task.status !== 'Completed').length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <FiCheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="mb-2">All tasks completed!</p>
                <p className="text-sm">Great job! All your tasks are finished.</p>
              </div>
            ) : (
              studentTasks
                .filter(task => task.status !== 'Completed')
                .sort((a, b) => {
                  // Sort by priority: overdue first, then by deadline
                  const aOverdue = a.deadline && new Date(a.deadline) < new Date()
                  const bOverdue = b.deadline && new Date(b.deadline) < new Date()
                  if (aOverdue && !bOverdue) return -1
                  if (!aOverdue && bOverdue) return 1
                  return new Date(a.deadline || '9999-12-31') - new Date(b.deadline || '9999-12-31')
                })
                .slice(0, 4)
                .map((task) => {
                  const project = studentProjects.find(p => p.id === task.groupId)
                  const isOverdue = task.deadline && new Date(task.deadline) < new Date()

                  return (
                    <div key={task.id} className={`p-4 rounded-lg border bg-slate-50 ${isOverdue ? 'border-red-200 bg-red-50' : 'border-slate-200'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`font-medium ${isOverdue ? 'text-red-900' : 'text-slate-900'}`}>
                          {task.title}
                          {isOverdue && <span className="ml-2 text-xs text-red-600 font-semibold">(Overdue)</span>}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTaskStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </div>
                      {project && (
                        <p className="text-sm text-slate-600 mb-2">
                          Project: {project.name}
                        </p>
                      )}
                      {task.description && (
                        <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      {task.deadline && (
                        <div className={`flex items-center text-sm ${isOverdue ? 'text-red-600' : 'text-slate-500'}`}>
                          <FiCalendar className="w-4 h-4 mr-1" />
                          Due: {formatDate(task.deadline)}
                        </div>
                      )}
                    </div>
                  )
                })
            )}
          </div>
        </div>
      </div>

      {/* My Projects Overview */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center">
            <FiBookOpen className="w-5 h-5 mr-2" />
            My Projects
          </h2>
          <span className="text-sm text-slate-500">
            {studentProjects.length} active project{studentProjects.length !== 1 ? 's' : ''}
          </span>
        </div>

        {studentProjects.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <FiBookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
            <p>You haven't been assigned to any projects yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studentProjects.map((project) => (
              <div key={project.id} className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900">{project.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    project.status === 'Accepted' ? 'bg-green-100 text-green-700' :
                    project.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {project.status || 'Active'}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-slate-600">
                    <FiUsers className="w-4 h-4 mr-2" />
                    {project.members.length} members
                  </div>
                  <div className="text-sm text-slate-600">
                    Created: {formatDate(project.createdAt)}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    {studentTasks.filter(task => task.groupId === project.id).length} tasks
                  </span>
                  <Link
                    to="/student/group"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/student/student-notification"
            className="flex flex-col items-center p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
          >
            <FiBell className="w-8 h-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-slate-900">Notifications</span>
            {unreadNotifications > 0 && (
              <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full mt-1">
                {unreadNotifications}
              </span>
            )}
          </Link>

          <Link
            to="/student/tasks"
            className="flex flex-col items-center p-4 rounded-xl border border-slate-200 hover:border-green-300 hover:bg-green-50 transition-all"
          >
            <FiCheckCircle className="w-8 h-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-slate-900">My Tasks</span>
          </Link>

          <Link
            to="/student/group"
            className="flex flex-col items-center p-4 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-all"
          >
            <FiUsers className="w-8 h-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-slate-900">My Group</span>
          </Link>

          <Link
            to="/student/profile"
            className="flex flex-col items-center p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all"
          >
            <FiTrendingUp className="w-8 h-8 text-indigo-600 mb-2" />
            <span className="text-sm font-medium text-slate-900">Profile</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard