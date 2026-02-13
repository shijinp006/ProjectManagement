import React, { useState, useRef } from 'react'
import { FaPlus, FaEdit, FaTrash, FaDownload, FaUpload, FaUserTie, FaUserShield } from 'react-icons/fa'
import { useAdmin } from '../../contexts/AdminContext'

const GuideManagement = () => {
  const {
    guides,
    departments,
    addGuide,
    updateGuide,
    deleteGuide,
    toggleGuideStatus,
    exportGuidesToCSV,
    importGuidesFromCSV
  } = useAdmin()
  const [showGuideModal, setShowGuideModal] = useState(false)
  const [editingGuide, setEditingGuide] = useState(null)
  const [guideForm, setGuideForm] = useState({ name: '', email: '', username: '', department: '', specialization: '', status: 'Active' })
  const guideFileInputRef = useRef(null)

  const handleGuideSubmit = (e) => {
    e.preventDefault()
    if (editingGuide) {
      updateGuide(editingGuide.id, guideForm)
    } else {
      addGuide(guideForm)
    }
    setGuideForm({ name: '', email: '', username: '', department: '', specialization: '', status: 'Active' })
    setShowGuideModal(false)
    setEditingGuide(null)
  }

  const editGuide = (guide) => {
    setEditingGuide(guide)
    setGuideForm({
      name: guide.name,
      email: guide.email,
      username: guide.username,
      department: guide.department,
      specialization: guide.specialization,
      status: guide.status
    })
    setShowGuideModal(true)
  }

  const handleDeleteGuide = (id) => {
    if (window.confirm('Are you sure you want to delete this guide? This will also unassign them from any supervised projects.')) {
      deleteGuide(id)
    }
  }

  const handleImportGuidesFromCSV = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const csv = e.target.result
        const lines = csv.split('\n')
        const headers = lines[0].split(',').map(h => h.trim())

        const importedGuides = lines.slice(1).map((line, index) => {
          const values = line.split(',').map(v => v.trim())
          if (values.length >= 6) {
            return {
              name: values[0],
              email: values[1],
              username: values[2],
              department: values[3],
              specialization: values[4],
              status: values[5] || 'Active'
            }
          }
          return null
        }).filter(guide => guide !== null)

        const count = importGuidesFromCSV(importedGuides)
        alert(`Successfully imported ${count} guide accounts`)
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Guide Management</h1>
          <p className="text-gray-600 mt-2">Manage project guides and supervisors for the Final Year Project program</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <FaUserTie className="text-blue-600" />
              Project Guides
            </h2>
            <div className="flex gap-2">
              <input
                type="file"
                ref={guideFileInputRef}
                onChange={handleImportGuidesFromCSV}
                accept=".csv"
                className="hidden"
              />
              <button
                onClick={() => guideFileInputRef.current?.click()}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 flex items-center gap-2"
              >
                <FaUpload /> Import CSV
              </button>
              <button
                onClick={exportGuidesToCSV}
                className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 flex items-center gap-2"
              >
                <FaDownload /> Export CSV
              </button>
              <button
                onClick={() => {
                  setEditingGuide(null)
                  setGuideForm({ name: '', email: '', username: '', department: '', specialization: '', status: 'Active' })
                  setShowGuideModal(true)
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center gap-2"
              >
                <FaPlus /> Add Guide
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialization</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {guides.map(guide => (
                  <tr key={guide.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{guide.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{guide.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{guide.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{guide.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{guide.specialization}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleGuideStatus(guide.id)}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          guide.status === 'Active'
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {guide.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => editGuide(guide)}
                          className="text-blue-500 hover:text-blue-700"
                          title="Edit Guide"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteGuide(guide.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete Guide"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Guide Modal */}
        {showGuideModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                {editingGuide ? 'Edit Guide' : 'Add Project Guide'}
              </h3>
              <form onSubmit={handleGuideSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      value={guideForm.name}
                      onChange={(e) => setGuideForm({ ...guideForm, name: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Dr. Robert Johnson"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Username</label>
                    <input
                      type="text"
                      value={guideForm.username}
                      onChange={(e) => setGuideForm({ ...guideForm, username: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., r.johnson"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={guideForm.email}
                      onChange={(e) => setGuideForm({ ...guideForm, email: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., robert.johnson@university.edu"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <select
                      value={guideForm.department}
                      onChange={(e) => setGuideForm({ ...guideForm, department: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.name}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Specialization</label>
                    <input
                      type="text"
                      value={guideForm.specialization}
                      onChange={(e) => setGuideForm({ ...guideForm, specialization: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Software Engineering, Data Science"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Account Status</label>
                    <select
                      value={guideForm.status}
                      onChange={(e) => setGuideForm({ ...guideForm, status: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowGuideModal(false)}
                    className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                  >
                    {editingGuide ? 'Update Guide' : 'Add Guide'}
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

export default GuideManagement