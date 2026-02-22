import React, { useState, useEffect } from 'react'
import { FaCheckCircle, FaTimesCircle, FaUsers } from 'react-icons/fa'
import { useAdmin } from '../../contexts/AdminContext'

const NotificationGuide = () => {
  const { notifications, acceptGroupNotification, removeNotification } = useAdmin()
  const [currentUser, setCurrentUser] = useState(null)
  const [myNotifications, setMyNotifications] = useState([])

  // // console.log(notifications,"nott");
  console.log(myNotifications, "my");


  useEffect(() => {
    const raw = localStorage.getItem('user')


    if (!raw) return
    try {
      const user = JSON.parse(raw)
      console.log(user, "uses");

      if (user.role !== 'Guide') return
      setCurrentUser(user)

      setMyNotifications(
        notifications.filter(n => n.status !== "Accepted")
      );
    } catch (_) { }
  }, [notifications])

  const handleAccept = (n) => {


    if (!currentUser) return
    acceptGroupNotification(n._id, n.groupId, currentUser.id)
  }

  const handleReject = (n) => {
    removeNotification(n._id)
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-slate-500">
        Loading…
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Group acceptance notifications</h1>

      {myNotifications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-600">
          No pending group requests in your department.
        </div>
      ) : (
        <ul className="space-y-4">
          {myNotifications
            .filter(n => n.status !== "Accepted")
            .map((n) => (
              <li
                key={n._id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-wrap items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <FaUsers className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">
                      Group: <span className="text-blue-700">{n.groupName}</span>
                    </p>
                    <p className="text-sm text-slate-600">
                      From <span className="font-medium">{n.sender}</span> · {n.department}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleAccept(n)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <FaCheckCircle /> Accept
                  </button>

                  <button
                    type="button"
                    onClick={() => handleReject(n)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <FaTimesCircle /> Reject
                  </button>
                </div>
              </li>
            ))}

        </ul>
      )}
    </div>
  )
}

export default NotificationGuide
