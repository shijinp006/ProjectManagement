




import React, { useState, useEffect } from 'react'
// import { assets } from '../../assets/assets'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'

const GuideLayout = () => {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)

    useEffect(() => {
        // Get user data from localStorage
        const userData = localStorage.getItem('user')
        if (userData) {
            try {
                const parsedUser = JSON.parse(userData)
                if (parsedUser.role === 'guide') {
                    setUser(parsedUser)
                } else {
                    // If not a guide, redirect to login
                    navigate('/login')
                }
            } catch (error) {
                console.error('Error parsing user data:', error)
                navigate('/login')
            }
        } else {
            // No user data, redirect to login
            navigate('/login')
        }
    }, [navigate])

    const logout = () => {
        localStorage.removeItem('user')
        localStorage.removeItem('controller')
        navigate('/')
    }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/60 shadow-lg sticky top-0 z-40">
            <div className="flex items-center justify-between px-6 lg:px-8 h-16">
                {/* Logo Section */}
                <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 bg-clip-text text-transparent">
                        Capstone new
                    </h1>
                </div>

                {/* User Actions */}
                <div className="flex items-center space-x-4">
                    {/* Profile */}
                    <div className="hidden sm:flex items-center space-x-3">
                        <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-md">
                            <span className="text-white font-semibold text-sm">
                                {user ? user.name.charAt(0).toUpperCase() : 'G'}
                            </span>
                        </div>
                        <div className="hidden lg:block">
                            <p className="text-slate-800 font-semibold text-sm">
                                {user ? user.name : 'Guide'}
                            </p>
                            <p className="text-slate-500 text-xs">
                                {user ? `${user.department} • Guide` : 'guide dashboard'}
                            </p>
                        </div>
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={logout}
                        className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white text-sm font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                    </button>
                </div>
            </div>
        </header>

        {/* Main Layout */}
        <div className="flex h-[calc(100vh-4rem)]">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto bg-slate-50/30">
                    <div className="p-6 lg:p-8 min-h-full">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    </div>
  )
}

export default GuideLayout