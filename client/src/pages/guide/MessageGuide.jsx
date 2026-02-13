import React, { useState } from 'react'
import { FiMail, FiClock, FiCheckCircle, FiAlertTriangle, FiInfo, FiUsers, FiSend } from 'react-icons/fi'
import { useNotifications } from '../../contexts/NotificationContext'
import { useAdmin } from '../../contexts/AdminContext'

const MessageGuide = () => {
  const { teacherNotifications, markTeacherNotificationAsRead, markAllTeacherNotificationsAsRead, sendGuideMessageToStudent } = useNotifications()
  const { students } = useAdmin()

  const [filter, setFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  const [showCompose, setShowCompose] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [selectedStudent, setSelectedStudent] = useState('')

  // Use notifications from context
  const notifications = teacherNotifications


  const markAsRead = (id) => {
    markTeacherNotificationAsRead(id)
  }

  const markAllAsRead = () => {
    markAllTeacherNotificationsAsRead()
  }

  const sendMessage = () => {
    if (!selectedStudent || !newMessage.trim()) {
      alert('Please select a student and enter a message')
      return
    }

    // Send message to student using context
    sendGuideMessageToStudent(selectedStudent, newMessage)

    setNewMessage('')
    setSelectedStudent('')
    setShowCompose(false)
    alert('Message sent successfully!')
  }

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true
    if (filter === 'unread') return !notification.read
    if (filter === 'admin') return notification.type === 'admin'
    if (filter === 'student') return notification.type === 'student'
    return true
  })

  const getNotificationIcon = (type, priority) => {
    if (priority === 'high') return <FiAlertTriangle className="w-5 h-5 text-red-500" />
    if (type === 'admin') return <FiInfo className="w-5 h-5 text-blue-500" />
    if (type === 'student') return <FiUsers className="w-5 h-5 text-green-500" />
    if (type === 'sent') return <FiSend className="w-5 h-5 text-purple-500" />
    return <FiMail className="w-5 h-5 text-slate-500" />
  }

  const getNotificationTypeColor = (type, priority) => {
    if (priority === 'high') return 'border-red-200 bg-red-50'
    if (type === 'admin') return 'border-blue-200 bg-blue-50'
    if (type === 'student') return 'border-green-200 bg-green-50'
    if (type === 'sent') return 'border-purple-200 bg-purple-50'
    return 'border-slate-200 bg-slate-50'
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
          <FiMail className="w-6 h-6 text-blue-600 animate-pulse" />
          <span className="text-slate-600">Loading messages...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <FiMail className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Messages</h1>
              <p className="text-slate-600">Communicate with students and stay updated with admin announcements</p>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setShowCompose(!showCompose)}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white text-sm font-medium rounded-xl transition-all duration-200 transform hover:scale-105"
            >
              {showCompose ? 'Cancel' : 'Compose Message'}
            </button>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white text-sm font-medium rounded-xl transition-all duration-200 transform hover:scale-105"
              >
                Mark All Read ({unreadCount})
              </button>
            )}
          </div>
        </div>

        {/* Compose Message */}
        {showCompose && (
          <div className="bg-slate-50/50 rounded-xl p-6 border border-slate-200/40 mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Send Message to Student</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Student</label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Choose a student...</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} ({student.rollNo}) - {student.department}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowCompose(false)}
                  className="px-6 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium rounded-xl transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={sendMessage}
                  className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105"
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'all', label: 'All', count: notifications.length },
            { value: 'unread', label: 'Unread', count: unreadCount },
            { value: 'admin', label: 'Admin', count: notifications.filter(n => n.type === 'admin').length },
            { value: 'student', label: 'Students', count: notifications.filter(n => n.type === 'student').length }
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

      {/* Messages List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-12 text-center">
            <FiMail className="w-16 h-16 mx-auto mb-4 text-slate-400" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No messages</h3>
            <p className="text-slate-600">
              {filter === 'unread' ? 'You have read all your messages!' : 'No messages match your current filter.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-2xl shadow-lg border transition-all duration-200 hover:shadow-xl ${
                notification.read ? 'border-slate-200/60' : `border-2 ${getNotificationTypeColor(notification.type, notification.priority)}`
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type, notification.priority)}
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
                        {notification.type === 'sent' && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                            Sent
                          </span>
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
                        {notification.recipient && (
                          <span>To: {notification.recipient}</span>
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          notification.priority === 'high' ? 'bg-red-100 text-red-700' :
                          notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {notification.priority || 'normal'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {!notification.read && notification.type !== 'sent' && (
                    <div className="flex-shrink-0 ml-4">
                      <button
                        onClick={() => markAsRead(notification.id)}
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

export default MessageGuide