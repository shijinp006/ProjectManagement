import React, { useState, useEffect } from 'react'
import {
  FiUsers,
  FiBookOpen,
  FiCheckCircle,
  FiTrendingUp,
  FiBell,
  FiAlertTriangle,
  FiCalendar,
  FiBarChart2,
  FiUserPlus,
  FiClipboard,
  FiSettings,
  FiActivity
} from 'react-icons/fi'
import { useAdmin } from '../../contexts/AdminContext'
import { useNotifications } from '../../contexts/NotificationContext'
import { Link } from 'react-router-dom'

const Dashboard = () => {
  const {
    students,
    guides,
    projectGroups,
    tasks,
    notifications,
    departments
  } = useAdmin()

  const { Notifications } = useNotifications()

  const [recentActivities, setRecentActivities] = useState([])
  const [systemStats, setSystemStats] = useState({})

  useEffect(() => {
    // Calculate system statistics
    const stats = {
      totalStudents: students.length,
      totalGuides: guides.length,
      activeProjects: projectGroups.filter(p => p.status !== 'Rejected').length,
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'Completed').length,
      pendingTasks: tasks.filter(t => t.status === 'Pending').length,
      activeDepartments: departments.length,
      unreadNotifications: Notifications.filter(n => !n.read).length

    }
    setSystemStats(stats)

    // Generate real activities from system data
    const allActivities = [
      ...students.map(s => ({
        id: `student-${s.id}`,
        type: 'student_added',
        message: 'New student registered',
        user: s.name,
        timestamp: new Date(s.createdAt || Date.now()),
        icon: FiUserPlus
      })),
      ...guides.map(g => ({
        id: `guide-${g.id}`,
        type: 'guide_added',
        message: 'New guide registered',
        user: g.name,
        timestamp: new Date(g.createdAt || Date.now()),
        icon: FiUsers
      })),
      ...projectGroups.map(p => ({
        id: `project-${p.id}`,
        type: 'project_created',
        message: 'New project group formed',
        user: p.name,
        timestamp: new Date(p.createdAt || Date.now()),
        icon: FiBookOpen
      })),
      ...tasks.map(t => ({
        id: `task-${t.id}`,
        type: 'task_added',
        message: 'New task assigned',
        user: t.title,
        timestamp: new Date(t.createdAt || Date.now()),
        icon: FiClipboard
      })),
      ...tasks.filter(t => t.status === 'Completed').map(t => ({
        id: `task-comp-${t.id}`,
        type: 'task_completed',
        message: 'Task marked as completed',
        user: t.title,
        timestamp: new Date(t.reviewedAt || t.updatedAt || t.createdAt || Date.now()),
        icon: FiCheckCircle
      })),
      ...Notifications.map(n => ({
        id: `t-notif-${n.id}`,
        type: 'notification_sent',
        message: n.title,
        user: 'To: Teachers',
        timestamp: new Date(n.timestamp || Date.now()),
        icon: FiBell
      }))
    ]

    // Sort by timestamp descending and take top 5
    const sortedActivities = allActivities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5)

    setRecentActivities(sortedActivities)
  }, [students, guides, projectGroups, tasks, departments, Notifications])

  const formatTimestamp = (timestamp) => {
    const now = new Date()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))

    if (isNaN(diff)) return 'Unknown'
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(diff / (1000 * 60 * 60 * 24))}d ago`
  }

  const getActivityIconColor = (type) => {
    switch (type) {
      case 'student_added': return 'text-green-500 bg-green-100'
      case 'guide_added': return 'text-emerald-500 bg-emerald-100'
      case 'project_created': return 'text-blue-500 bg-blue-100'
      case 'task_added': return 'text-indigo-500 bg-indigo-100'
      case 'task_completed': return 'text-purple-500 bg-purple-100'
      case 'notification_sent': return 'text-orange-500 bg-orange-100'
      default: return 'text-slate-500 bg-slate-100'
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-blue-100 text-lg">
              Welcome back! Here's what's happening in your system.
            </p>
            <p className="text-blue-100 mt-2">
              Last updated: {new Date().toLocaleTimeString()}
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <FiBarChart2 className="w-10 h-10" />
            </div>
          </div>
        </div>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Total Students</p>
              <p className="text-3xl font-bold text-slate-900">{systemStats.totalStudents || 0}</p>
              <p className="text-xs text-slate-500 mt-1">
                {students.filter(s => s.status === 'Active').length} active
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiUsers className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Project Guides</p>
              <p className="text-3xl font-bold text-slate-900">{systemStats.totalGuides || 0}</p>
              <p className="text-xs text-slate-500 mt-1">
                {guides.filter(g => g.status === 'Active').length} active
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FiBookOpen className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Active Projects</p>
              <p className="text-3xl font-bold text-slate-900">{systemStats.activeProjects || 0}</p>
              <p className="text-xs text-slate-500 mt-1">
                {projectGroups.length} total groups
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiClipboard className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Task Completion</p>
              <p className="text-3xl font-bold text-slate-900">
                {systemStats.totalTasks > 0
                  ? Math.round((systemStats.completedTasks / systemStats.totalTasks) * 100)
                  : 0}%
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {systemStats.completedTasks}/{systemStats.totalTasks} completed
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <FiTrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* System Overview */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
            <FiActivity className="w-5 h-5 mr-2" />
            System Overview
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FiUsers className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Departments</p>
                  <p className="text-xs text-slate-500">{systemStats.activeDepartments || 0} active</p>
                </div>
              </div>
              <span className="text-lg font-semibold text-slate-900">{systemStats.activeDepartments || 0}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <FiCheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Pending Tasks</p>
                  <p className="text-xs text-slate-500">Require attention</p>
                </div>
              </div>
              <span className="text-lg font-semibold text-slate-900">{systemStats.pendingTasks || 0}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <FiBell className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Unread Notifications</p>
                  <p className="text-xs text-slate-500">Across all users</p>
                </div>
              </div>
              <span className="text-lg font-semibold text-slate-900">{systemStats.unreadNotifications || 0}</span>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
            <FiCalendar className="w-5 h-5 mr-2" />
            Recent Activities
          </h2>

          <div className="space-y-4">
            {recentActivities.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <FiActivity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No recent activities</p>
              </div>
            ) : (
              recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getActivityIconColor(activity.type)}`}>
                    <activity.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{activity.message}</p>
                    <p className="text-xs text-slate-600">{activity.user}</p>
                    <p className="text-xs text-slate-500 mt-1">{formatTimestamp(activity.timestamp)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
            <FiSettings className="w-5 h-5 mr-2" />
            Quick Actions
          </h2>

          <div className="space-y-3">
            <Link
              to="/admin/students"
              className="flex items-center space-x-3 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <FiUsers className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Manage Students</p>
                <p className="text-sm text-slate-500">Add, edit, or remove students</p>
              </div>
            </Link>

            <Link
              to="/admin/guides"
              className="flex items-center space-x-3 p-4 rounded-xl border border-slate-200 hover:border-green-300 hover:bg-green-50 transition-all group"
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <FiBookOpen className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Manage Guides</p>
                <p className="text-sm text-slate-500">Assign and manage project guides</p>
              </div>
            </Link>

            <Link
              to="/admin/project-groups"
              className="flex items-center space-x-3 p-4 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-all group"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <FiClipboard className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Project Groups</p>
                <p className="text-sm text-slate-500">Monitor and manage project teams</p>
              </div>
            </Link>

            <Link
              to="/admin/notifications"
              className="flex items-center space-x-3 p-4 rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50 transition-all group"
            >
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                <FiBell className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Send Notifications</p>
                <p className="text-sm text-slate-500">Communicate with students and guides</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Alerts & Notifications */}
      {(systemStats.pendingTasks > 0 || systemStats.unreadNotifications > 0) && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
            <FiAlertTriangle className="w-5 h-5 mr-2" />
            System Alerts
          </h2>

          <div className="space-y-4">
            {systemStats.pendingTasks > 0 && (
              <div className="flex items-center space-x-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <FiAlertTriangle className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-yellow-900">Pending Tasks</p>
                  <p className="text-sm text-yellow-700">
                    {systemStats.pendingTasks} tasks are pending review or completion.
                  </p>
                </div>
                <Link
                  to="/admin/analytics"
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Review
                </Link>
              </div>
            )}

            {systemStats.unreadNotifications > 0 && (
              <div className="flex items-center space-x-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FiBell className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-blue-900">Unread Notifications</p>
                  <p className="text-sm text-blue-700">
                    {systemStats.unreadNotifications} notifications are unread across the system.
                  </p>
                </div>
                <Link
                  to="/admin/notifications"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  View
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard