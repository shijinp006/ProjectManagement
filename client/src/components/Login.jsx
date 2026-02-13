import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '../contexts/AdminContext'
import axios from "axios"

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const { students, guides } = useAdmin()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Clear error when user starts typing
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    // Make POST request to backend login route
    const response = await axios.post(
      "/login",  // backend endpoint
      {
        email: formData.email,
        userName: formData.username, // if your backend uses username
      },
      {
        withCredentials: true // important for cookies
      }
    );
 
    console.log(response,"res");
    

    const admin = response.data.admin;
  
      

    if (admin) {
     
      
      // Store minimal user info in localStorage
      localStorage.setItem("user", JSON.stringify({
        id: admin.id,
        username: admin.userName,
        email: admin.email,
        role: "admin"
      }));

      // Navigate to admin dashboard
    navigate("/admin"); 

    }

    setError("Invalid credentials or user not found.");

  } catch (err) {
    console.error("Login error:", err);
    if (err.response && err.response.data?.message) {
      setError(err.response.data.message);
    } else {
      setError("An error occurred during login. Please try again.");
    }
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your Final Year Project account</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Field */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter your username"
            />
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter your email"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account? Contact your administrator to get access.
          </p>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Login Instructions:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Admin:</strong> Use username "admin" and email "admin@university.edu"</li>
            <li>• <strong>Students:</strong> Use credentials provided by your institution</li>
            <li>• <strong>Guides:</strong> Use credentials provided by your institution</li>
            <li>• Admins access the admin dashboard, students and guides access their respective dashboards</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Login