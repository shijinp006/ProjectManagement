import React, { useState, useEffect } from 'react'
import { FaTasks, FaUpload, FaCheckCircle, FaClock, FaFile, FaFlagCheckered } from 'react-icons/fa'
import { useAdmin } from '../../contexts/AdminContext'

const Tasks = () => {
  const { projectGroups, tasks, submitTaskFile } = useAdmin()
  const [currentUser, setCurrentUser] = useState(null)
  const [userGroup, setUserGroup] = useState(null)
  const [groupTasks, setGroupTasks] = useState([])
  const [uploadingTaskId, setUploadingTaskId] = useState(null)
  const [selectedFiles, setSelectedFiles] = useState({})

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setCurrentUser(parsedUser)

        // Find the group the user belongs to
        const foundGroup = projectGroups.find(group =>
          group.members.some(member => member.id === parsedUser.id)
        )
        setUserGroup(foundGroup)

        if (foundGroup) {
          const tasksForGroup = tasks.filter(task => task.groupId === foundGroup.id)
          setGroupTasks(tasksForGroup)
        }
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
  }, [projectGroups, tasks])

  const handleFileSelect = (taskId, event) => {
    const file = event.target.files[0]
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const fileContent = e.target.result // base64 encoded
        setSelectedFiles(prev => ({
          ...prev,
          [taskId]: {
            file,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            fileContent: fileContent.split(',')[1] // Remove data:type;base64, prefix
          }
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmitFile = async (taskId) => {
    const fileData = selectedFiles[taskId]
    if (!fileData) {
      alert('Please select a file first')
      return
    }

    if (!currentUser) {
      alert('User not found')
      return
    }

    setUploadingTaskId(taskId)
    try {
      submitTaskFile(taskId, {
        fileName: fileData.fileName,
        fileSize: fileData.fileSize,
        fileType: fileData.fileType,
        fileContent: fileData.fileContent,
        submittedBy: currentUser.id
      })

      alert('File submitted successfully!')
      // Clear selected file
      setSelectedFiles(prev => {
        const newState = { ...prev }
        delete newState[taskId]
        return newState
      })

      // Refresh tasks
      if (userGroup) {
        const tasksForGroup = tasks.filter(task => task.groupId === userGroup.id)
        setGroupTasks(tasksForGroup)
      }
    } catch (error) {
      console.error('Error submitting file:', error)
      alert('Error submitting file. Please try again.')
    } finally {
      setUploadingTaskId(null)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getTaskStatus = (task) => {
    const dueDate = new Date(task.submissionDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    dueDate.setHours(0, 0, 0, 0)

    switch (task.status) {
      case 'Verified':
        return { text: 'Verified', color: 'text-green-700', bg: 'bg-green-50', icon: FaCheckCircle }
      case 'Submitted':
        return { text: 'Submitted', color: 'text-green-600', bg: 'bg-green-50', icon: FaCheckCircle }
      case 'Needs Resubmit':
        return { text: 'Resubmit', color: 'text-orange-600', bg: 'bg-orange-50', icon: FaClock }
      default: {
        if (dueDate < today) {
          return { text: 'Overdue', color: 'text-red-600', bg: 'bg-red-50', icon: FaClock }
        }
        return { text: 'Pending', color: 'text-amber-600', bg: 'bg-amber-50', icon: FaClock }
      }
    }
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-slate-500">
        Loading...
      </div>
    )
  }

  if (!userGroup) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <FaTasks className="text-slate-300 text-6xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No Group Assigned</h3>
          <p className="text-slate-500">You need to be part of a group to view tasks.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-3">
          <FaTasks className="text-blue-600" />
          Project Tasks
        </h1>
        <p className="text-slate-600">View and submit tasks assigned to your group</p>
        <p className="text-sm text-slate-500 mt-1">Group: <span className="font-medium">{userGroup.name}</span></p>
      </div>

      {groupTasks.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <FaTasks className="text-slate-300 text-6xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No Tasks Assigned</h3>
          <p className="text-slate-500">Your guide hasn't assigned any tasks yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupTasks.map((task) => {
            const isFinalStage = task.taskName === 'Final Report Submission'
            const status = getTaskStatus(task)
            const StatusIcon = status.icon
            const hasFile = !!selectedFiles[task.id]
            const isSubmitted = task.status === 'Submitted' || task.status === 'Verified'
            const dueDate = new Date(task.submissionDate)
            const isOverdue = dueDate < new Date() && !isSubmitted

            return (
              <div
                key={task.id}
                className={`rounded-xl shadow-sm border p-6 transition-all duration-300 relative ${isFinalStage
                  ? 'bg-red-400 border-blue-200 shadow-blue-50 border-l-8 border-l-blue-600'
                  : 'bg-white border-slate-200 hover:shadow-md'
                  }`}
              >
                <div className="flex items-start justify-between mb-4 relative z-10">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      {isFinalStage && (
                        <span className="flex items-center gap-1 bg-blue-600 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                          <FaFlagCheckered className="text-[10px]" />
                          Final Stage
                        </span>
                      )}
                      <h3 className={`text-lg font-bold ${isFinalStage ? 'text-blue-900' : 'text-slate-800'}`}>
                        {task.taskName}
                      </h3>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color} border border-current/10`}>
                        <StatusIcon className="text-xs" />
                        {status.text}
                      </span>
                    </div>

                    {isFinalStage && task.finalMark !== undefined && (
                      <div className="my-6 p-6 bg-red-100 border border-slate-200 rounded-xl shadow-inner">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Project Performance Score</p>
                            <div className="flex items-baseline gap-1">
                              <span className="text-5xl font-black text-slate-900">{task.finalMark}</span>
                              <span className="text-xl font-bold text-slate-400">/ 100</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200 inline-flex items-center gap-1">
                              <FaCheckCircle className="text-[10px]" />
                              COMPLETED
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2 font-medium">Published on {new Date(task.publishedAt || Date.now()).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <FaClock className="text-slate-400" />
                        Deadline: {dueDate.toLocaleDateString()}
                      </span>
                      {isOverdue && (
                        <span className="text-red-600 font-bold">⚠ Overdue</span>
                      )}
                    </div>
                  </div>
                </div>

                {isSubmitted && task.submittedFile && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700 mb-2">
                      <FaCheckCircle />
                      <span className="font-medium">
                        {task.status === 'Verified' ? 'Verified Submission' : 'File Submitted'}
                      </span>
                    </div>
                    <div className="text-sm text-green-600 space-y-1">
                      <p>File: {task.submittedFile.fileName}</p>
                      <p>Size: {formatFileSize(task.submittedFile.fileSize)}</p>
                      <p>Submitted: {new Date(task.submittedFile.submittedAt).toLocaleString()}</p>
                      {task.reviewRemark && (
                        <p className="text-xs text-green-800">
                          Guide remark: {task.reviewRemark}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {!isSubmitted && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Upload File (Max 10MB)
                      </label>
                      <div className="flex items-center gap-3">
                        <label className="flex-1 cursor-pointer">
                          <input
                            type="file"
                            onChange={(e) => handleFileSelect(task.id, e)}
                            className="hidden"
                            accept=".pdf,.doc,.docx,.zip,.rar"
                          />
                          <div className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 transition-colors">
                            <FaFile className="text-slate-400" />
                            <span className="text-sm text-slate-600">
                              {hasFile ? selectedFiles[task.id].fileName : 'Choose file...'}
                            </span>
                          </div>
                        </label>
                        {hasFile && (
                          <button
                            onClick={() => handleSubmitFile(task.id)}
                            disabled={uploadingTaskId === task.id}
                            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
                          >
                            <FaUpload />
                            {uploadingTaskId === task.id ? 'Uploading...' : 'Submit'}
                          </button>
                        )}
                      </div>
                      {hasFile && (
                        <p className="text-xs text-slate-500 mt-1">
                          File size: {formatFileSize(selectedFiles[task.id].fileSize)}
                        </p>
                      )}
                    </div>
                    {task.reviewRemark && task.status === 'Needs Resubmit' && (
                      <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-xs text-orange-800">
                        Guide remark: {task.reviewRemark}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Tasks
