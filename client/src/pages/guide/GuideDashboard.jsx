import React, { useState, useEffect } from 'react'
import {
  FiUsers,
  FiBookOpen,
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
  FiBell,
  FiAlertTriangle,
  FiCalendar,
  FiMessageSquare,
  FiClipboard,
  FiUserCheck,
  FiTarget
} from 'react-icons/fi'
import { useAdmin } from '../../contexts/AdminContext'
import { useNotifications } from '../../contexts/NotificationContext'
import { Link } from 'react-router-dom'


const GuideDashboard = () => {
  const {
    students,
    guides,
    projectGroups,
    tasks,
    notifications
  } = useAdmin()

  const { Notifications } = useNotifications()

  const [currentGuide, setCurrentGuide] = useState([])
  const [guideProjects, setGuideProjects] = useState([])
  const [guideTasks, setGuideTasks] = useState([])
  const [guideStudents, setGuideStudents] = useState([])
  const [recentNotifications, setRecentNotifications] = useState([])
  const [stats, setStats] = useState({})



  useEffect(() => {
    // Get current guide from localStorage
    const userData = localStorage.getItem('user')

    console.log(projectGroups,"prooooo");
    console.log(currentGuide,"cu");
    
    console.log(guides,"hus");
    

    if (userData && guides) {
      try {


        const user = JSON.parse(userData)
        // console.log(user,"user");
        // console.log(guides,"giuss");


        // const guide = guides.find(g => g.email === user.email && g.name === user.name)

        // console.log(guide,"gu");

        if (guides) {
          guides.map((item) => {
            if (item) {
              setCurrentGuide(item)
            }
          })


          // Get projects assigned to this guide
          const projects = projectGroups.filter(group =>
            group.assignedGuide === guides._id && group.status === 'Accepted'
          )
          setGuideProjects(projects)

          // Get all tasks from guide's projects
          const projectTasks = tasks.filter(task =>
            projects.some(project => project.id === task.groupId)
          )
          setGuideTasks(projectTasks)

          // Get all students from guide's projects
          const projectStudents = students.filter(student =>
            projects.some(project =>
              project.members && project.members.some(member => member.email === student.email)
            )
          )
          setGuideStudents(projectStudents)

          // Calculate statistics
          const guideStats = {
            totalProjects: projects.length,
            totalStudents: projectStudents.length,
            totalTasks: projectTasks.length,
            completedTasks: projectTasks.filter(t => t.status === 'Completed').length,
            pendingTasks: projectTasks.filter(t => t.status === 'Pending').length,
            inProgressTasks: projectTasks.filter(t => t.status === 'In Progress').length,
            unreadNotifications: Notifications.filter(n => !n.read).length
          }
          setStats(guideStats)

        } else if (guides.length > 0) {
          // Demo mode - show first guide's data
          const demoGuide = guides[0]
          setCurrentGuide(demoGuide)

          const projects = projectGroups.filter(group =>
            group.assignedGuide === demoGuide.id && group.status === 'Accepted'
          )
          setGuideProjects(projects)

          const projectTasks = tasks.filter(task =>
            projects.some(project => project.id === task.groupId)
          )
          setGuideTasks(projectTasks)

          const projectStudents = students.filter(student =>
            projects.some(project =>
              project.members && project.members.some(member => member.email === student.email)
            )
          )
          setGuideStudents(projectStudents)

          const guideStats = {
            totalProjects: projects.length,
            totalStudents: projectStudents.length,
            totalTasks: projectTasks.length,
            completedTasks: projectTasks.filter(t => t.status === 'Completed').length,
            pendingTasks: projectTasks.filter(t => t.status === 'Pending').length,
            inProgressTasks: projectTasks.filter(t => t.status === 'In Progress').length,
            unreadNotifications: Notifications.filter(n => !n.read).length
          }
          setStats(guideStats)
        }
      } catch (error) {
        console.error('Error parsing user data:', error)
        // Demo mode fallback
        if (guides.length > 0) {
          const demoGuide = guides[0]
          setCurrentGuide(demoGuide)
          const projects = projectGroups.filter(group =>
            group.assignedGuide === demoGuide.id && group.status === 'Accepted'
          )
          setGuideProjects(projects)
        }
      }
    }

    console.log(currentGuide, "guids");


    // Get recent notifications for guides
    const recent = Notifications
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 3)
    setRecentNotifications(recent)
  }, [guides, projectGroups, tasks, students, Notifications])

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
      case 'admin': return <FiBell className="w-4 h-4 text-blue-500" />
      case 'system': return <FiAlertTriangle className="w-4 h-4 text-orange-500" />
      default: return <FiMessageSquare className="w-4 h-4 text-gray-500" />
    }
  }

  if (!currentGuide) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiBookOpen className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Dashboard</h2>
          <p className="text-gray-600">Please wait while we load your data...</p>
          {guides.length === 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <strong>Note:</strong> No guides found in the system. Please add guides through the admin panel first.
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
              Welcome back, {currentGuide.name}!
            </h1>
            <p className="text-blue-100 text-lg">
              {currentGuide.specialization} • {currentGuide.department}
            </p>
            <p className="text-blue-100 mt-2">
              Project Guide Dashboard
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <FiBookOpen className="w-10 h-10" />
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
              <p className="text-3xl font-bold text-slate-900">{stats.totalProjects || 0}</p>
              <p className="text-xs text-slate-500 mt-1">
                Active guidance projects
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiBookOpen className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">My Students</p>
              <p className="text-3xl font-bold text-slate-900">{stats.totalStudents || 0}</p>
              <p className="text-xs text-slate-500 mt-1">
                Students under guidance
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FiUsers className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Task Completion</p>
              <p className="text-3xl font-bold text-slate-900">
                {stats.totalTasks > 0
                  ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
                  : 0}%
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {stats.completedTasks}/{stats.totalTasks} completed
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiTrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Notifications</p>
              <p className="text-3xl font-bold text-slate-900">{stats.unreadNotifications || 0}</p>
              <p className="text-xs text-slate-500 mt-1">
                unread messages
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <FiBell className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* My Projects */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center">
              <FiBookOpen className="w-5 h-5 mr-2" />
              My Projects
            </h2>
            <Link
              to="/guide/managegroup"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Manage All →
            </Link>
          </div>

          <div className="space-y-4">
            {guideProjects.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <FiBookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="mb-2">No projects assigned yet</p>
                <p className="text-sm">You'll be notified when students request your guidance.</p>
              </div>
            ) : (
              guideProjects.map((project) => {
                const projectTasks = guideTasks.filter(task => task.groupId === project.id)
                const completedTasks = projectTasks.filter(task => task.status === 'Completed').length
                const totalTasks = projectTasks.length
                const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

                return (
                  <div key={project.id} className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-slate-900">{project.name}</h3>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${completionRate === 100 ? 'bg-green-100 text-green-700' :
                            completionRate > 50 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                          }`}>
                          {completionRate}% Complete
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-3 bg-slate-50 rounded-lg">
                        <p className="text-lg font-semibold text-slate-900">{project.members?.length || 0}</p>
                        <p className="text-xs text-slate-500">Students</p>
                      </div>
                      <div className="text-center p-3 bg-slate-50 rounded-lg">
                        <p className="text-lg font-semibold text-slate-900">{totalTasks}</p>
                        <p className="text-xs text-slate-500">Tasks</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-600">
                        Started: {formatDate(project.createdAt)}
                      </p>
                      <Link
                        to="/guide/managegroup"
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center">
              <FiBell className="w-5 h-5 mr-2" />
              Recent Notifications
            </h2>
            <Link
              to="/guide/message-guide"
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
                <p className="text-sm">Admin announcements and system updates will appear here.</p>
              </div>
            ) : (
              recentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border ${notification.read ? 'bg-slate-50 border-slate-200' : 'bg-blue-50 border-blue-200'
                    }`}
                >
                  <div className="flex items-start space-x-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${notification.read ? 'text-slate-900' : 'text-slate-900'
                        }`}>
                        {notification.title}
                      </p>
                      {notification.message && (
                        <p className={`text-xs mt-1 line-clamp-2 ${notification.read ? 'text-slate-500' : 'text-slate-600'
                          }`}>
                          {notification.message}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-slate-500">
                          {new Date(notification.timestamp).toLocaleDateString()} • {notification.sender}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full ${notification.priority === 'high' ? 'bg-red-100 text-red-700' :
                            notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-slate-100 text-slate-700'
                          }`}>
                          {notification.priority || 'normal'}
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
      </div>

      {/* Task Overview */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
          <FiCheckCircle className="w-5 h-5 mr-2" />
          Task Overview
        </h2>

        {guideTasks.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <FiCheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No tasks yet</h3>
            <p>Tasks will appear here once you assign them to your project groups.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Task Status Breakdown */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 mb-4">Task Status</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-900">Completed</span>
                  </div>
                  <span className="font-semibold text-green-900">{stats.completedTasks}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-blue-900">In Progress</span>
                  </div>
                  <span className="font-semibold text-blue-900">{stats.inProgressTasks}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm font-medium text-yellow-900">Submitted</span>
                  </div>
                  <span className="font-semibold text-yellow-900">
                    {guideTasks.filter(t => t.status === 'Submitted').length}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900">Pending</span>
                  </div>
                  <span className="font-semibold text-gray-900">{stats.pendingTasks}</span>
                </div>
              </div>
            </div>

            {/* Recent Tasks */}
            <div className="md:col-span-2">
              <h3 className="font-semibold text-slate-900 mb-4">Recent Task Activity</h3>

              <div className="space-y-3">
                {guideTasks
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .slice(0, 5)
                  .map((task) => {
                    const project = guideProjects.find(p => p.id === task.groupId)
                    return (
                      <div key={task.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-slate-900 text-sm">{task.title}</p>
                          <p className="text-xs text-slate-500">
                            {project?.name || 'Unknown Project'} • {formatDate(task.createdAt)}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTaskStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </div>
                    )
                  })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/guide/assigntask"
            className="flex flex-col items-center p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <FiClipboard className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-slate-900 mt-2">Assign Tasks</span>
            <span className="text-xs text-slate-500">Create new assignments</span>
          </Link>

          <Link
            to="/guide/message-guide"
            className="flex flex-col items-center p-4 rounded-xl border border-slate-200 hover:border-green-300 hover:bg-green-50 transition-all group"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <FiMessageSquare className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-slate-900 mt-2">Send Messages</span>
            <span className="text-xs text-slate-500">Communicate with students</span>
          </Link>

          <Link
            to="/guide/managegroup"
            className="flex flex-col items-center p-4 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-all group"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <FiUsers className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-slate-900 mt-2">Manage Groups</span>
            <span className="text-xs text-slate-500">Oversee project teams</span>
          </Link>

          <Link
            to="/guide/notifications"
            className="flex flex-col items-center p-4 rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50 transition-all group"
          >
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
              <FiBell className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-slate-900 mt-2">Notifications</span>
            <span className="text-xs text-slate-500">{stats.unreadNotifications || 0} unread</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default GuideDashboard