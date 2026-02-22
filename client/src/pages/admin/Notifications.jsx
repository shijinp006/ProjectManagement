import React, { useEffect, useState } from 'react'
import { FiSend, FiUsers, FiUser, FiBookOpen, FiBell } from 'react-icons/fi'
import { useNotifications } from '../../contexts/NotificationContext'
import { useAdmin } from '../../contexts/AdminContext'

const Notifications = () => {
  const {
    sendToAllTeachers,
    sendToSpecificTeachers,
    sendToAllStudents,
    sendToSpecificStudents,
    // teacherNotifications,
    // studentNotifications
    Notifications
  } = useNotifications()

  const { students, guides } = useAdmin()



  const [notificationType, setNotificationType] = useState('all-teachers')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [selectedRecipients, setSelectedRecipients] = useState([])
  const [showRecipientSelector, setShowRecipientSelector] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [teacherId, setTeacherId] = useState()
  const [studentId, setStudentId] = useState()
  // console.log(teacherId, "teacherid");
  // console.log(studentId, "studentid");
  // console.log(notificationType, "tyo");
  // console.log(selectedRecipients, "Slele");

console.log(teacherId,"teacher Id 12");



  useEffect(() => {
    if (!selectedRecipients?.length) {
      setTeacherId([]);
      setStudentId([]);
      return;
    }

    const guides = [];
    const students = [];

    selectedRecipients.forEach(item => {
      if (item.role === "Guide") {
        guides.push(item._id);
      } else if (item.role === "Student") {
        students.push(item._id);
      }
    });

    setTeacherId(guides);
    setStudentId(students);

  }, [selectedRecipients]);






  // Combine notifications from both contexts
  const notifications = [...Notifications].sort((a, b) => b.timestamp - a.timestamp)
    
    
  // console.log(notifications, "norrr"); 


  const handleNotificationTypeChange = (type) => {
    setNotificationType(type)
    setSelectedRecipients([])
    setShowRecipientSelector(type.includes('specific'))
  }

  const handleRecipientToggle = (recipient) => {
    setSelectedRecipients(prev =>
      prev.find(item => item._id === recipient._id)
        ? prev.filter(item => item._id !== recipient._id)
        : [...prev, recipient]
    )
  }

  const handleSendNotification = async () => {


    if (!title.trim() || !message.trim()) {
      alert('Please fill in both title and message')
      return
    }

    if (notificationType.includes('specific') && selectedRecipients.length === 0) {
      alert('Please select at least one recipient')
      return
    }

    setIsLoading(true)

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      const target = notificationType;
      // Send notification using context methods
      let newNotification
      switch (target) {
        case 'specific-teachers':
          newNotification = sendToSpecificTeachers(title.trim(), message.trim(), teacherId);
          break;
        case 'all-students':
          newNotification = sendToAllStudents(title.trim(), message.trim());
          break;
        case 'all-teachers':
          newNotification = sendToAllTeachers(title.trim(), message.trim());
          break;
        case 'specific-students':
          newNotification = sendToSpecificStudents(title.trim(), message.trim(), studentId);
          break;
        default:
          console.warn("Unknown notification target:", target);
      }


      // Reset form
      setTitle('')
      setMessage('')
      setSelectedRecipients([])
      setShowRecipientSelector(false)
      setNotificationType('all-teachers')

      alert(`Notification sent successfully to ${getRecipientsLabel()}!`)
    } catch (error) {
      console.log(error);

      alert('Failed to send notification. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getRecipientsLabel = () => {
    switch (notificationType) {
      case 'all-teachers':
        return 'All Teachers'
      case 'all-students':
        return 'All Students'
      case 'specific-teachers':
        return `Selected Teachers (${selectedRecipients.length})`
      case 'specific-students':
        return `Selected Students (${selectedRecipients.length})`
      default:
        return ''
    }
  }

  const getRecipientsList = () => {
    return notificationType.includes('teachers') ? guides : students
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

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
            <FiBell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
            <p className="text-slate-600">Send notifications to teachers and students</p>
          </div>
        </div>

        {/* Send Notification Form */}
        <div className="bg-slate-50/50 rounded-xl p-6 border border-slate-200/40">
          <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
            <FiSend className="w-5 h-5 mr-2" />
            Send New Notification
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Notification Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">Recipient Type</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'all-teachers', label: 'All Teachers', icon: FiUsers },
                  { value: 'specific-teachers', label: 'Specific Teachers', icon: FiUser },
                  { value: 'all-students', label: 'All Students', icon: FiUsers },
                  { value: 'specific-students', label: 'Specific Students', icon: FiUser }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleNotificationTypeChange(option.value)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${notificationType === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                  >
                    <option.icon className="w-5 h-5 mx-auto mb-2" />
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient Selector */}
            {showRecipientSelector && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Select Recipients ({selectedRecipients.length} selected)
                </label>
                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-3 bg-white">
                  {getRecipientsList().map((recipient) => (
                    <label key={recipient.id} className="flex items-center space-x-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedRecipients.some(item => item._id === recipient._id)}
                        onChange={() => handleRecipientToggle(recipient)}
                        className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-slate-900">{recipient.name}</span>
                        <span className="text-xs text-slate-500 block">
                          {notificationType.includes('teacher')
                            ? `${recipient.department} - ${recipient.specialization || 'Guide'}`
                            : `${recipient.rollNo} - ${recipient.department}`
                          }
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Title Input */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Notification Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter notification title..."
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Message Input */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your notification message..."
              rows={4}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
            />
          </div>

          {/* Send Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSendNotification}
              disabled={isLoading}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Sending...
                </div>
              ) : (
                <div className="flex items-center">
                  <FiSend className="w-4 h-4 mr-2" />
                  Send Notification
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Notification History */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
          <FiBookOpen className="w-6 h-6 mr-3" />
          Notification History
        </h2>

        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <FiBell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No notifications sent yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div key={notification._id} className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">{notification.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${notification?.type.includes('teachers')
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-green-100 text-green-700'
                        }`}>
                        {notification.recipients}
                      </span> 
                    </div>
                    <p className="text-slate-600 mb-3">{notification.message}</p>
                    <p className="text-sm text-slate-500">
                      {new Date(notification.updatedAt).toLocaleDateString()}
                    </p>

                  </div>
                  <div className="ml-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      {notification.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default Notifications