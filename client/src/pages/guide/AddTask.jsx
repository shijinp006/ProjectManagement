import React, { useState, useEffect } from 'react'
import { FaCalendarAlt, FaTasks, FaSave, FaPlus, FaTrash, FaFlagCheckered, FaCheckCircle } from 'react-icons/fa'
import { useAdmin } from '../../contexts/AdminContext'
import axios from 'axios'
const AddTask = () => {
  const { projectGroups, tasks, addTask, updateTask, getTasksByGroup, reviewTask } = useAdmin()

  const [currentUser, setCurrentUser] = useState(null)
  const [supervisedGroups, setSupervisedGroups] = useState([])
  const [selectedGroupId, setSelectedGroupId] = useState(null)
  const [existingTasks, setExistingTasks] = useState([])
  const [taskDates, setTaskDates] = useState({})
  const [saving, setSaving] = useState(false)
  const [remarks, setRemarks] = useState({})
  // console.log(existingTasks, "existig");

  // New states for dynamic task creation
  const [newTaskName, setNewTaskName] = useState('')
  const [newTaskDeadline, setNewTaskDeadline] = useState('')
  // Final report states
  const [finalReportDeadline, setFinalReportDeadline] = useState('')
  const [finalMarks, setFinalMarks] = useState({}) // { groupId: mark }
  const [finalReportTask, setFinalReportTask] = useState(null)


  /* ===============================
     Load guide + assigned groups
  =============================== */


  const downloadFile = async (filePath, fileName) => {
    try {
      const response = await fetch(`http://localhost:5000/${filePath}`);

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName; // force download name

      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  useEffect(() => {
    // const userData = localStorage.getItem('user')
    // if (!userData) return

    try {
      // const user = JSON.parse(userData)
      // if (user.role !== 'guide') return

      // setCurrentUser(user)

      const assigned = projectGroups.filter(
        g => g.status === 'Accepted'
      )




      setSupervisedGroups(assigned)

      // Ensure selectedGroupId is always valid
      if (assigned.length === 0) {
        setSelectedGroupId(null)
      } else if (selectedGroupId === null || !assigned.some(g => g._id === selectedGroupId)) {
        // If nothing is selected, or selected group is no longer valid, default to the first
        setSelectedGroupId(assigned.length > 0 ? assigned[0]._id : null)
      }
    } catch (err) {
      console.error('User parse error:', err)
    }
  }, [projectGroups, selectedGroupId])
  console.log(supervisedGroups, "super");

  /* ===============================
     Sync tasks when group changes
  =============================== */
  useEffect(() => {
    const fetchGroupTasks = async () => {
      try {
        // if (!groupId) {
        //   setExistingTasks([]);
        //   setTaskDates({});
        //   setFinalReportTask(null);
        //   return;
        // }

        const groupTasks = await getTasksByGroup();

        console.log(groupTasks, "group Task");

        // Separate final report from regular tasks
        const finalTask = groupTasks.find(
          (t) => t.taskName === "Final Report Submission"
        );


        const regularTasks = groupTasks.filter(
          (t) => t.taskName !== "Final Report Submission"
        );

        setFinalReportTask(finalTask || null);
        setExistingTasks(regularTasks);



        const dates = {};
        regularTasks.forEach((task) => {
          dates[task.taskName] = task.submissionDate;
        });

        setTaskDates(dates);

        if (finalTask) {
          setFinalReportDeadline(finalTask.submissionDate);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
    fetchGroupTasks()

  }, [])

  /* ===============================
     Handlers
  =============================== */
  const handleDateChange = (taskName, date) => {
    setTaskDates(prev => ({
      ...prev,
      [taskName]: date
    }))
  }

  const handleRemarkChange = (taskId, value) => {
    setRemarks(prev => ({
      ...prev,
      [taskId]: value
    }))
  }

  const handleAssignTask = (taskName) => {
    if (!selectedGroupId) {
      alert('Please select a group')
      return
    }

    const submissionDate = taskDates[taskName]
    if (!submissionDate) {
      alert('Please select a submission date')
      return
    }

    setSaving(true)

    const existingTask = existingTasks.find(t => t.taskName === taskName)

    if (existingTask) {
      updateTask(existingTask.id, {
        submissionDate,
        // assignedBy: currentUser.id
      })
    } else {
      addTask({
        taskName,
        groupId: selectedGroupId,
        submissionDate,
        // assignedBy: currentUser.id,
        status: 'Pending'
      })
    }

    setSaving(false)
  }

  const handleReview = (task, action) => {
    console.log(task, "oppp");

    if (!task) return
    const remark = remarks || ''

    const status = action === 'verify' ? 'Verified' : 'Needs Resubmit'
    reviewTask(task._id, { status, remark })
    alert(
      action === 'verify'
        ? 'Task verified successfully.'
        : 'Resubmit requested from students.'
    )
  }

  const handleCreateTask = () => {
    if (!selectedGroupId) {
      alert('Please select a group first')
      return
    }

    if (!newTaskName.trim()) {
      alert('Please enter a task name')
      return
    }

    if (!newTaskDeadline) {
      alert('Please select a deadline')
      return
    }

    // Check if task with same name already exists for this group
    const duplicate = existingTasks.find(t => t.taskName.toLowerCase() === newTaskName.trim().toLowerCase())
    if (duplicate) {
      alert('A task with this name already exists for this group')
      return
    }

    setSaving(true)

    addTask({
      taskName: newTaskName.trim(),
      groupId: selectedGroupId,
      submissionDate: newTaskDeadline,
      // assignedBy: currentUser.id,
      status: 'Pending'
    })

    // Reset form
    setNewTaskName('')
    setNewTaskDeadline('')
    setSaving(false)
    alert('Task created successfully!')
  }

  const handleDeleteTask = async (taskId) => {
    // ⭐ Confirmation popup
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) return;

    try {
      const res = await axios.delete(
        `/deleteTask/${taskId}`,
        {
          withCredentials: true
        }
      );

      console.log(res, "delete");

      alert("Task deleted successfully ✅");
      setExistingTasks(prev => prev.filter(task => task._id !== taskId));
      return res.data;


    } catch (error) {
      console.error("Delete Task Error:", error);
      alert("Failed to delete task ❌");
      throw error;
    }
  };

  const handleFinalReportDeadline = () => {
    if (!selectedGroupId) {
      alert('Please select a group first')
      return
    }

    if (!finalReportDeadline) {
      alert('Please select a deadline for the final report')
      return
    }

    setSaving(true)

    if (finalReportTask) {
      // Update existing final report task
      updateTask(finalReportTask._id, {
        submissionDate: finalReportDeadline,
        // assignedBy: currentUser.id
      })
      alert('Final report deadline updated!')
    } else {
      // Create new final report task
      addTask({
        taskName: 'Final Report Submission',
        groupId: selectedGroupId,
        submissionDate: finalReportDeadline,
        // assignedBy: currentUser.id,
        status: 'Pending'
      })
      alert('Final report task created!')
    }

    setSaving(false)
  }

  const handleMarkChange = (groupId, mark) => {
    setFinalMarks(prev => ({
      ...prev,
      [groupId]: mark
    }))
  }

  const handlePublishMarks = () => {
    if (!selectedGroupId) {
      alert('Please select a group')
      return
    }

    const mark = finalMarks[selectedGroupId]
    if (!mark || mark < 0 || mark > 100) {
      alert('Please enter a valid mark between 0 and 100')
      return
    }
console.log(finalReportTask,"task reprt");

    if (!finalReportTask || !finalReportTask.submittedFileName) {
      alert('No final report has been submitted yet')
      return
    }

    if (!window.confirm(`Are you sure you want to publish the final mark of ${mark} for this group? This will make the project publicly visible.`)) {
      return
    }

    setSaving(true)

    // Get group information for public display
    const selectedGroup = supervisedGroups.find(g => g._id === selectedGroupId)

    // Update the task with the mark, mark as verified, and publish
    updateTask(finalReportTask._id, {
      status: 'Verified',
      reviewRemark: `Final Mark: ${mark}/100`,
      finalMark: mark,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      groupInfo: {
        id: selectedGroup._id,
        name: selectedGroup.name,
        topicName: selectedGroup.topicName,
        members: selectedGroup.members
      }
    })

    setSaving(false)
    alert(`Final mark of ${mark} published successfully! The project is now visible to the public.`)
  }

  if (!projectGroups) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-slate-500">
        Loading...
      </div>
    )
  }

  const selectedGroup = supervisedGroups.find(
    g => g._id === selectedGroupId
  )

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <FaTasks className="text-blue-600" />
          Assign Tasks
        </h1>
        <p className="text-slate-600">
          Assign tasks with submission dates to each group
        </p>
      </div>

      {/* Group Select */}
      <div className="bg-blue-400 p-6 rounded-xl border border-blue-400 mb-6 shadow-xl">
        <label className="block text-sm font-semibold mb-2 text-gray-800">
          Select Group
        </label>
        <select
          value={selectedGroupId ?? ''}
          onChange={e => setSelectedGroupId(Number(e.target.value))} // ✅ FIX
          className="w-full p-3 border border-gray-400 outline-none rounded-lg text-gray-700"
        >
          <option value="">-- Select Group --</option>
          {supervisedGroups.map(group => (
            <option key={group._id} value={group._id}>
              {group.groupName} ({group.selectedMembers.length} members)
            </option>
          ))}
        </select>

        {selectedGroup && (
          <div className="mt-4 p-4 bg-slate-50 rounded-lg shadow-xl">
            <p className="text-sm font-medium mb-2 text-gray-800">Group Members:</p>
            <ul className="text-sm text-slate-600 space-y-1">
              {selectedGroup.selectedMembers.map(m => (
                <li key={m._id}>• {m.name} ({m.name})</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Task Creation & Management */}
      {selectedGroupId && (
        <div className="space-y-6">
          {/* Create New Task Form */}
          <div className="bg-gradient-to-br from-blue-400 to-blue-500 p-6 rounded-xl border border-blue-300 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
              <FaPlus className="text-white" />
              Create New Task
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-white">
                  Task Name
                </label>
                <input
                  type="text"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  placeholder="e.g., Topic selection, Abstract submission, etc."
                  className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-white">
                  Submission Deadline
                </label>
                <input
                  type="date"
                  value={newTaskDeadline}
                  onChange={(e) => setNewTaskDeadline(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                />
              </div>

              <button
                onClick={handleCreateTask}
                disabled={saving || !newTaskName.trim() || !newTaskDeadline}
                className="w-full px-6 py-3 rounded-lg text-white font-semibold bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <FaPlus />
                Create Task
              </button>
            </div>
          </div>

          {/* Final Report Submission Section */}
          <div className="bg-white p-6 rounded-xl border border-blue-200 border-l-8 border-l-blue-600 shadow-sm relative overflow-hidden">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-900 relative z-10">
              <FaFlagCheckered className="text-blue-600" />
              Final Report Submission
              <span className="ml-auto bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-200">
                PROJECT FINALE
              </span>
            </h2>

            <div className="space-y-4">
              {/* Deadline Setting */}
              <div className="bg-white/20 p-4 rounded-lg">
                <label className="block text-sm font-semibold mb-2 text-white">
                  Final Report Deadline
                </label>
                <div className="flex gap-3">
                  <input
                    type="date"
                    value={finalReportDeadline}
                    onChange={(e) => setFinalReportDeadline(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="flex-1 p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 text-gray-700"
                  />
                  <button
                    onClick={handleFinalReportDeadline}
                    disabled={saving || !finalReportDeadline}
                    className="px-6 py-3 rounded-lg text-white font-semibold bg-green-700 hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    <FaSave />
                    {finalReportTask ? 'Update' : 'Set'} Deadline
                  </button>
                </div>
                {finalReportTask && (
                  <p className="text-xs text-white mt-2">
                    ✓ Deadline set: {new Date(finalReportTask.submissionDate).toLocaleDateString()}
                  </p>
                )}
              </div>

              {/* Submission Display & Marking */}
              {finalReportTask && finalReportTask.submittedFileName ? (
                <div className="bg-red-200 p-5 rounded-lg shadow-md space-y-4">
                  <div className="border-b pb-3">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Final Report Submitted</h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p><strong>File:</strong> {finalReportTask.submittedFile.fileName}</p>
                      <p><strong>Size:</strong> {Math.round(finalReportTask.submittedFile.fileSize / 1024)} KB</p>
                      <p><strong>Submitted:</strong> {new Date(finalReportTask.submittedFile.submittedAt).toLocaleString()}</p>
                      <p><strong>Status:</strong>
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${finalReportTask.status === 'Verified' ? 'bg-green-100 text-green-700' :
                          finalReportTask.status === 'Submitted' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                          {finalReportTask.status}
                        </span>
                      </p>
                    </div>
                     <a
                          href={`http://localhost:5000/${finalReportTask.submittedFileName}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1 mt-2 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
                        >
                            Download Final Report
                        </a>
                  </div>

                  {/* Mark Entry Section */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-800">
                      Final Mark (out of 100)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={finalMarks[selectedGroupId] || ''}
                      onChange={(e) => handleMarkChange(selectedGroupId, e.target.value)}
                      placeholder="Enter marks (0-100)"
                      className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 text-gray-700"
                      disabled={finalReportTask.status === 'Verified'}
                    />

                    {finalReportTask.finalMark && (
                      <p className="text-sm text-green-700 font-medium">
                        ✓ Published Mark: {finalReportTask.finalMark}/100
                      </p>
                    )}

                    <button
                      onClick={handlePublishMarks}
                      disabled={saving || finalReportTask.status === 'Verified' || !finalMarks[selectedGroupId]}
                      className="w-full px-6 py-3 rounded-lg text-white font-semibold bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      <FaSave />
                      {finalReportTask.status === 'Verified' ? 'Marks Published' : 'Publish Final Marks'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white/20 p-4 rounded-lg text-center text-white">
                  <p className="text-sm">
                    {finalReportTask
                      ? '⏳ Waiting for students to submit the final report...'
                      : 'Set a deadline above to enable final report submission'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Existing Tasks List */}
          <div className="bg-blue-400 p-6 rounded-xl border border-gray-300 shadow-xl">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800">
              <FaTasks className="text-blue-600" />
              Assigned Tasks ({existingTasks.length})
            </h2>

            {existingTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FaTasks className="mx-auto text-4xl mb-3 opacity-30" />
                <p>No tasks assigned yet. Create your first task above!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {existingTasks.map((task, index) => (
                  <div
                    key={task._id}
                    className="flex flex-col gap-3 p-4 border border-gray-200 rounded-lg bg-blue-200 shadow-md"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-semibold text-gray-800">
                            {index + 1}. {task.taskName}
                          </label>
                          <button
                            onClick={() => handleDeleteTask(task._id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Delete task"
                          >
                            <FaTrash />
                          </button>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${task.status === 'Verified' ? 'bg-green-100 text-green-700' :
                            task.status === 'Submitted' ? 'bg-blue-100 text-blue-700' :
                              task.status === 'Needs Resubmit' ? 'bg-orange-100 text-orange-700' :
                                'bg-gray-100 text-gray-700'
                            }`}>
                            {task.status}
                          </span>
                          <span className="text-xs text-gray-600">
                            Due: {new Date(task.submissionDate).toLocaleDateString()}
                          </span>
                        </div>

                        <input
                          type="date"
                          value={taskDates[task.taskName] || task.submissionDate}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) =>
                            handleDateChange(task.taskName, e.target.value)
                          }
                          className="w-full p-2 border border-gray-400 rounded outline-none text-sm"
                        />
                      </div>

                      <button
                        onClick={() => handleAssignTask(task.taskName)}
                        disabled={saving}
                        className="px-4 py-2 mt-6 rounded-lg text-white font-medium bg-green-600 hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                      >
                        <FaSave className="inline mr-1" />
                        Update
                      </button>
                    </div>

                    {task.submittedFileName && (
                      <div className="mt-2 p-3 bg-white/70 border border-gray-300 rounded">
                        <p className="text-xs font-semibold text-gray-700 mb-1">
                          Latest submission:
                        </p>
                        <p className="text-xs text-gray-700">
                          File: {task.submittedFileName} (
                          {task.submittedFileName}),{' '}
                          {Math.round(task.submittedFileName / 1024)} KB
                        </p>
                        <p className="text-xs text-gray-500">
                          Submitted:{' '}
                          {new Date(
                            task.submittedFile.submittedAt
                          ).toLocaleString()}
                        </p>
                        <a
                          href={`http://localhost:5000/${task.submittedFileName}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1 mt-2 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
                        >
                            Download File
                        </a>
                      </div>
                    )}

                    {task && (
                      <div className="mt-2 space-y-2">
                        <textarea
                          rows={2}
                          className="w-full text-xs p-2 border border-gray-400 rounded outline-none"
                          placeholder="Add remark for this task..."
                          value={task.id in remarks ? remarks[task.id] : task.reviewRemark || ''}
                          onChange={(e) =>
                            handleRemarkChange(task._id, e.target.value)
                          }
                        />

                        <div className="flex gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => handleReview(task, 'resubmit')}
                            className="px-3 py-1.5 text-xs rounded bg-orange-500 hover:bg-orange-600 text-white"
                          >
                            Send Resubmit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReview(task, 'verify')}
                            className="px-3 py-1.5 text-xs rounded bg-green-600 hover:bg-green-700 text-white"
                          >
                            Verified OK
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AddTask
