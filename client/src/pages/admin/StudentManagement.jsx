import React, { useState, useRef } from 'react'
import { FaPlus, FaEdit, FaTrash, FaDownload, FaUpload, FaUserGraduate } from 'react-icons/fa'
import { useAdmin } from '../../contexts/AdminContext'

const StudentManagement = () => {
  const {
    departments,
    students,
    getCurrentAcademicYear,
    addStudent,
    updateStudent,
    deleteStudent,
    toggleStudentStatus,
    exportStudentsToCSV,
    importStudentsFromCSV
  } = useAdmin()
  const [showStudentModal, setShowStudentModal] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [studentForm, setStudentForm] = useState({ name: '', email: '', username: '', department: '', rollNo: '', status: 'Active' })
  const studentFileInputRef = useRef(null)

  const handleStudentSubmit = (e) => {
    e.preventDefault()
    if (editingStudent) {
      updateStudent(editingStudent.id, studentForm)
    } else {
      addStudent(studentForm)
    }
    setStudentForm({ name: '', email: '', username: '', department: '', rollNo: '', status: 'Active' })
    setShowStudentModal(false)
    setEditingStudent(null)
  }

  const editStudent = (student) => {
    setEditingStudent(student)
    setStudentForm({
      name: student.name,
      email: student.email,
      username: student.username,
      department: student.department,
      rollNo: student.rollNo,
      status: student.status
    })
    setShowStudentModal(true)
  }

  const handleDeleteStudent = (id) => {
    if (window.confirm('Are you sure you want to delete this student? This will also remove them from any assigned projects.')) {
      deleteStudent(id)
    }
  }

  const handleImportStudentsFromCSV = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const csv = e.target.result
        const lines = csv.split('\n')
        const headers = lines[0].split(',').map(h => h.trim())

        const importedStudents = lines.slice(1).map((line, index) => {
          const values = line.split(',').map(v => v.trim())
          if (values.length >= 6) {
            return {
              name: values[0],
              email: values[1],
              username: values[2],
              department: values[3],
              rollNo: values[4],
              academicYear: values[5] || getCurrentAcademicYear(),
              status: values[6] || 'Active'
            }
          }
          return null
        }).filter(student => student !== null)

        const count = importStudentsFromCSV(importedStudents)
        alert(`Successfully imported ${count} final year student accounts`)
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Final Year Student Management</h1>
          <p className="text-gray-600 mt-2">Manage final year students participating in the Final Year Project program for the current academic year: <span className="font-medium text-blue-600">{getCurrentAcademicYear()}</span></p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <FaUserGraduate className="text-blue-600" />
              Final Year Students
            </h2>
            <div className="flex gap-2">
              <input
                type="file"
                ref={studentFileInputRef}
                onChange={handleImportStudentsFromCSV}
                accept=".csv"
                className="hidden"
              />
              <button
                onClick={() => studentFileInputRef.current?.click()}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 flex items-center gap-2"
              >
                <FaUpload /> Import CSV
              </button>
              <button
                onClick={exportStudentsToCSV}
                className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 flex items-center gap-2"
              >
                <FaDownload /> Export CSV
              </button>
              <button
                onClick={() => {
                  setEditingStudent(null)
                  setStudentForm({ name: '', email: '', username: '', department: '', rollNo: '', status: 'Active' })
                  setShowStudentModal(true)
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center gap-2"
              >
                <FaPlus /> Add Final Year Student
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Academic Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map(student => (
                  <tr key={student.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.rollNo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.academicYear}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleStudentStatus(student.id)}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          student.status === 'Active'
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {student.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => editStudent(student)}
                          className="text-blue-500 hover:text-blue-700"
                          title="Edit Student"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete Student"
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

        {/* Student Modal */}
        {showStudentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-2">
                {editingStudent ? 'Edit Final Year Student' : 'Add Final Year Student'}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Only final year students participating in the Final Year Project program can be added.
                Academic Year: <span className="font-medium text-blue-600">{getCurrentAcademicYear()}</span>
              </p>
              <form onSubmit={handleStudentSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      value={studentForm.name}
                      onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Username</label>
                    <input
                      type="text"
                      value={studentForm.username}
                      onChange={(e) => setStudentForm({ ...studentForm, username: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., john.doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={studentForm.email}
                      onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <select
                      value={studentForm.department}
                      onChange={(e) => setStudentForm({ ...studentForm, department: e.target.value })}
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
                    <label className="block text-sm font-medium text-gray-700">Roll No</label>
                    <input
                      type="text"
                      value={studentForm.rollNo}
                      onChange={(e) => setStudentForm({ ...studentForm, rollNo: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Academic Year</label>
                    <div className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-700">
                      {getCurrentAcademicYear()} (Final Year)
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Automatically assigned based on current academic year</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Account Status</label>
                    <select
                      value={studentForm.status}
                      onChange={(e) => setStudentForm({ ...studentForm, status: e.target.value })}
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
                    onClick={() => setShowStudentModal(false)}
                    className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                  >
                    {editingStudent ? 'Update Student' : 'Add Final Year Student'}
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

export default StudentManagement
