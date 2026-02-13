import React, { useState } from 'react'
import { FaPlus, FaEdit, FaTrash, FaUserShield } from 'react-icons/fa'
import { useAdmin } from '../../contexts/AdminContext'

const AcademicSetup = () => {
  const { departments, addDepartment, updateDepartment, deleteDepartment } = useAdmin()
  const [showDeptModal, setShowDeptModal] = useState(false)
  const [editingDept, setEditingDept] = useState(null)
    const [deptForm, setDeptForm] = useState({ name: '', code: '', description: '' })

  const handleDeptSubmit = (e) => {
 
    
    e.preventDefault()
    if (editingDept) {
      updateDepartment(editingDept.id, deptForm)
    } else {
      addDepartment(deptForm)
    }
    setDeptForm({ name: '', code: '', description: '' })
    setShowDeptModal(false)
    setEditingDept(null)
  }

  const editDepartment = (dept) => {
    setEditingDept(dept)
    setDeptForm({ name: dept.name, code: dept.code, description: dept.description })
    setShowDeptModal(true)
  }

  const handleDeleteDepartment = (id) => {
    if (window.confirm('Are you sure you want to delete this department? This will also remove the department from all students and guides.')) {
      deleteDepartment(id)
    }
  }



  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Academic Department Setup</h1>
          <p className="text-gray-600 mt-2">Manage academic departments for the Final Year Project Management System</p>
        </div>

        {/* Departments Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <FaUserShield className="text-blue-600" />
              Academic Departments
            </h2>
            <button
              onClick={() => {
                setEditingDept(null)
                setDeptForm({ name: '', code: '', description: '' })
                setShowDeptModal(true)
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center gap-2"
            >
              <FaPlus /> Add Department
            </button>
          </div>

            <div className="grid gap-4">
              {departments.map(dept => (
                <div key={dept.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{dept.name}</h3>
                      <p className="text-sm text-gray-500">Code: {dept.code}</p>
                      <p className="text-sm text-gray-600 mt-1">{dept.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => editDepartment(dept)}
                        className="text-blue-500 hover:text-blue-700 p-2"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteDepartment(dept.id)}
                        className="text-red-500 hover:text-red-700 p-2"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>



        {/* Department Modal */}
        {showDeptModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                {editingDept ? 'Edit Department' : 'Add Department'}
              </h3>
              <form onSubmit={handleDeptSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={deptForm.name}
                      onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Code</label>
                    <input
                      type="text"
                      value={deptForm.code}
                      onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={deptForm.description}
                      onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowDeptModal(false)}
                    className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                  >
                    {editingDept ? 'Update' : 'Add'}
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

export default AcademicSetup