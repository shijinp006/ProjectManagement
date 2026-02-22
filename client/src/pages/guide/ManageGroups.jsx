import React, { useState, useEffect } from 'react'
import { FaUsers, FaCheckCircle } from 'react-icons/fa'
import { useAdmin } from '../../contexts/AdminContext'

const ManageGroups = () => {
  const { projectGroups } = useAdmin()
  const [currentUser, setCurrentUser] = useState(null)
  const [myGroups, setMyGroups] = useState([])

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        if (parsedUser.role === 'guide') {
          setCurrentUser(parsedUser)
          // Filter groups assigned to this guide
          const assignedGroups = projectGroups.filter(
            group => group.assignedGuide === parsedUser.id && group.status === 'Accepted'
          )
          setMyGroups(assignedGroups)
        }
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
  }, [projectGroups])

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-slate-500">
        Loading...
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Manage Groups</h1>
        <p className="text-slate-600">Groups under your supervision</p>
      </div>

      {myGroups.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <FaUsers className="text-slate-300 text-6xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No Groups Assigned</h3>
          <p className="text-slate-500">You haven't accepted any group requests yet. Check your notifications to accept group requests.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {myGroups.map((group) => (
            <div
              key={group.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <FaUsers className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">{group.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <FaCheckCircle className="text-green-500 text-sm" />
                      <span className="text-sm text-green-600 font-medium">Accepted</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Members ({group.members.length}):</h4>
                <ul className="space-y-2">
                  {group.members.map((member) => (
                    <li key={member.id} className="text-sm text-slate-600 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span>{member.name}</span>
                      <span className="text-slate-400">({member.username})</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-500">
                  Created: {new Date(group.createdAt).toLocaleDateString()}
                </p>
                {group.updatedAt && (
                  <p className="text-xs text-slate-500 mt-1">
                    Accepted: {new Date(group.updatedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ManageGroups
