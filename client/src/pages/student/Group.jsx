import React, { useState, useEffect } from 'react'
import { FaUsers, FaPlus, FaEdit, FaSave, FaTimes } from 'react-icons/fa'
import { useAdmin } from '../../contexts/AdminContext'

const Group = () => {
  const { students, projectGroups, createProjectGroup, updateProjectGroup, guides } = useAdmin()
  const [currentUser, setCurrentUser] = useState(null)
  const [userGroup, setUserGroup] = useState(null)
  const [assignedGuide, setAssignedGuide] = useState(null)
  const [groupName, setGroupName] = useState('')
  const [topicName, setTopicName] = useState('')
  const [selectedMembers, setSelectedMembers] = useState([])
  const [availableStudents, setAvailableStudents] = useState([])
  const [error, setError] = useState('')
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editGroupName, setEditGroupName] = useState('')
  const [editTopicName, setEditTopicName] = useState('')

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setCurrentUser(parsedUser)

      // Get all student IDs that are already members of any group
      const studentsInGroups = new Set()
      projectGroups.forEach(group => {
        group.members.forEach(member => {
          studentsInGroups.add(member.id)
        })
      })

      // Filter students from the same department, excluding the current user and students already in groups
      const departmentStudents = students.filter(
        (s) => s.department === parsedUser.department &&
          s.id !== parsedUser.id &&
          !studentsInGroups.has(s.id)
      )
      setAvailableStudents(departmentStudents)

      // Check if the current user is already in a group
      const foundGroup = projectGroups.find(group =>
        group.members.some(member => member.id === parsedUser.id)
      )
      setUserGroup(foundGroup)
      if (foundGroup?.assignedGuide) {
        const guide = guides.find(g => g.id === foundGroup.assignedGuide)
        setAssignedGuide(guide ?? null)
      } else {
        setAssignedGuide(null)
      }
    }
  }, [students, projectGroups, guides])

  const handleMemberSelection = (studentId) => {
    const selectedStudent = availableStudents.find(s => s.id === studentId)
    if (selectedMembers.some(member => member.id === studentId)) {
      setSelectedMembers(selectedMembers.filter(member => member.id !== studentId))
    } else if (selectedMembers.length < 3) {
      setSelectedMembers([...selectedMembers, selectedStudent])
    } else {
      setError('Maximum 3 members can be selected for the group (excluding yourself).')
    }
  }

  const handleCreateGroup = (e) => {
    e.preventDefault()
    setError('')
    if (!groupName.trim()) {
      setError('Group name cannot be empty.')
      return
    }
    if (!topicName.trim()) {
      setError('Topic name cannot be empty.')
      return
    }
    if (!currentUser) {
      setError('Creator user not found.')
      return
    }
    if (selectedMembers.length < 1) {
      setError('Please select at least one member for the group.')
      return
    }

    const allMembers = [currentUser, ...selectedMembers]
    const newGroup = createProjectGroup(groupName, allMembers, topicName)
    setUserGroup(newGroup)
    setShowCreateGroupModal(false)
    setGroupName('')
    setTopicName('')
    setSelectedMembers([])
    alert('Project group created successfully!')
  }

  const handleEditToggle = () => {
    if (userGroup) {
      setEditGroupName(userGroup.name)
      setEditTopicName(userGroup.topicName || '')
      setIsEditing(true)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setError('')
  }

  const handleSaveEdit = () => {
    if (!editGroupName.trim()) {
      setError('Group name cannot be empty.')
      return
    }
    if (!editTopicName.trim()) {
      setError('Topic name cannot be empty.')
      return
    }

    updateProjectGroup(userGroup.id, {
      name: editGroupName,
      topicName: editTopicName
    })
    setIsEditing(false)
    setError('')
    alert('Group details updated successfully!')
  }

  if (!currentUser) {
    return <div className="text-center py-8 text-gray-600">Loading user data...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Project Group Management</h1>

        {userGroup ? (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <FaUsers className="text-blue-600" /> Your Project Group
              </h2>
              {!isEditing && (
                <button
                  onClick={handleEditToggle}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  <FaEdit /> Edit Details
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4 mb-6 p-4 bg-blue-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                  <input
                    type="text"
                    value={editGroupName}
                    onChange={(e) => setEditGroupName(e.target.value)}
                    className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Topic Name</label>
                  <input
                    type="text"
                    value={editTopicName}
                    onChange={(e) => setEditTopicName(e.target.value)}
                    className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                  >
                    <FaSave /> Save Changes
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center gap-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                  >
                    <FaTimes /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-lg font-medium text-gray-800 mb-2">Group Name: <span className="text-blue-700">{userGroup.name}</span></p>
                <p className="text-lg font-medium text-gray-800 mb-2">Topic Name: <span className="text-indigo-700">{userGroup.topicName || 'Not specified'}</span></p>
              </>
            )}

            <p className="text-lg font-medium text-gray-800 mb-2">
              Status: <span className={`font-semibold ${userGroup.status === 'Accepted' ? 'text-green-600' : 'text-amber-600'}`}>{userGroup.status ?? 'Pending acceptance'}</span>
            </p>
            {assignedGuide && (
              <p className="text-lg font-medium text-gray-800 mb-2">Supervised by: <span className="text-indigo-700">{assignedGuide.name} ({assignedGuide.username})</span></p>
            )}
            <h3 className="text-md font-semibold text-gray-700 mb-2">Members:</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              {userGroup.members.map(member => (
                <li key={member.id}>{member.name} ({member.username}) - {member.department}</li>
              ))}
            </ul>
            <p className="text-sm text-gray-500 mt-4">Created On: {new Date(userGroup.createdAt).toLocaleDateString()}</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">No Project Group Assigned</h2>
            <p className="text-gray-600 mb-6">You are not currently part of any project group.</p>
            <button
              onClick={() => setShowCreateGroupModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mx-auto"
            >
              <FaPlus /> Create New Project Group
            </button>
          </div>
        )}

        {/* Create Group Modal */}
        {showCreateGroupModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Project Group</h3>
              <form onSubmit={handleCreateGroup}>
                <div className="mb-4">
                  <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                  <input
                    type="text"
                    id="groupName"
                    value={groupName}
                    onChange={(e) => {
                      setGroupName(e.target.value)
                      setError('')
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="topicName" className="block text-sm font-medium text-gray-700 mb-1">Topic Name</label>
                  <input
                    type="text"
                    id="topicName"
                    value={topicName}
                    onChange={(e) => {
                      setTopicName(e.target.value)
                      setError('')
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="mb-4">
                  <p className="block text-sm font-medium text-gray-700 mb-2">Select 3 Members from {currentUser.department} Department:</p>
                  {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
                  <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md p-3 space-y-2">
                    {availableStudents.length === 0 ? (
                      <p className="text-gray-500">No available students in your department. All students may already be part of a group.</p>
                    ) : (
                      availableStudents.map(student => (
                        <div key={student.id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`student-${student.id}`}
                            checked={selectedMembers.some(member => member.id === student.id)}
                            onChange={() => handleMemberSelection(student.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            disabled={selectedMembers.length >= 3 && !selectedMembers.some(member => member.id === student.id)}
                          />
                          <label htmlFor={`student-${student.id}`} className="ml-2 text-sm text-gray-900">
                            {student.name} ({student.username})
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">You ({currentUser.name}) are automatically included as the 4th member.</p>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateGroupModal(false)
                      setGroupName('')
                      setTopicName('')
                      setSelectedMembers([])
                      setError('')
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Create Group
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Group