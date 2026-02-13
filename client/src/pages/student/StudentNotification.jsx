import React, { useState, useEffect } from 'react'
import { FiBell, FiClock, FiCheckCircle, FiAlertCircle, FiInfo } from 'react-icons/fi'
import { useNotifications } from '../../contexts/NotificationContext'

const StudentNotification = () => {
  const { studentNotifications, markStudentNotificationAsRead, markAllStudentNotificationsAsRead } = useNotifications()

  const [filter, setFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(false)

  // Use notifications from context
  const notifications = studentNotifications

  const markAsRead = (id) => {
    markStudentNotificationAsRead(id)
  }

  const markAllAsRead = () => {
    markAllStudentNotificationsAsRead()
  }

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true
    if (filter === 'unread') return !notification.read
    if (filter === 'important') return notification.type === 'important'
    return true
  })

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'important':
        return <FiAlertCircle className="w-5 h-5 text-red-500" />
      case 'reminder':
        return <FiClock className="w-5 h-5 text-yellow-500" />
      case 'update':
        return <FiInfo className="w-5 h-5 text-blue-500" />
      default:
        return <FiBell className="w-5 h-5 text-slate-500" />
    }
  }

  const getNotificationTypeColor = (type) => {
    switch (type) {
      case 'important':
        return 'border-red-200 bg-red-50'
      case 'reminder':
        return 'border-yellow-200 bg-yellow-50'
      case 'update':
        return 'border-blue-200 bg-blue-50'
      default:
        return 'border-slate-200 bg-slate-50'
    }
  }

  const formatTimestamp = (timestamp) => {
    const now = new Date()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const unreadCount = notifications.filter(n => !n.read).length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-600">Loading notifications...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <FiBell className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Notifications</h1>
              <p className="text-slate-600 text-sm md:text-xl">Stay updated with important announcements and messages</p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white text-sm font-medium rounded-xl transition-all duration-200 transform hover:scale-105"
            >
              Mark All Read ({unreadCount})
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2">
          {[
            { value: 'all', label: 'All', count: notifications.length },
            { value: 'unread', label: 'Unread', count: unreadCount },
            { value: 'important', label: 'Important', count: notifications.filter(n => n.type === 'important').length }
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                filter === tab.value
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                  : 'text-slate-600 hover:bg-slate-100 border-2 border-transparent'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-12 text-center">
            <FiBell className="w-16 h-16 mx-auto mb-4 text-slate-400" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No notifications</h3>
            <p className="text-slate-600">
              {filter === 'unread' ? 'You have read all your notifications!' : 'No notifications match your current filter.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-2xl shadow-lg border transition-all duration-200 hover:shadow-xl cursor-pointer ${
                notification.read ? 'border-slate-200/60' : `border-2 ${getNotificationTypeColor(notification.type)}`
              }`}
              onClick={() => !notification.read && markAsRead(notification.id)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className={`text-lg font-semibold ${
                          notification.read ? 'text-slate-900' : 'text-slate-900'
                        }`}>
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>

                      <p className={`mb-3 leading-relaxed ${
                        notification.read ? 'text-slate-600' : 'text-slate-700'
                      }`}>
                        {notification.message}
                      </p>

                      <div className="flex items-center space-x-4 text-sm text-slate-500">
                        <span className="flex items-center">
                          <FiClock className="w-4 h-4 mr-1" />
                          {formatTimestamp(notification.timestamp)}
                        </span>
                        <span>From: {notification.sender}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          notification.type === 'important' ? 'bg-red-100 text-red-700' :
                          notification.type === 'reminder' ? 'bg-yellow-100 text-yellow-700' :
                          notification.type === 'update' ? 'bg-blue-100 text-blue-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {notification.type}
                        </span>
                      </div>
                    </div>
                  </div>

                  {!notification.read && (
                    <div className="flex-shrink-0 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          markAsRead(notification.id)
                        }}
                        className="flex items-center space-x-2 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm font-medium rounded-lg transition-colors duration-200"
                      >
                        <FiCheckCircle className="w-4 h-4" />
                        <span>Mark Read</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default StudentNotification