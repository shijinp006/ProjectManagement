import React, { useState } from 'react'
import { useAdmin } from '../contexts/AdminContext'
import { FaDownload, FaUsers, FaTrophy, FaSearch, FaCalendar } from 'react-icons/fa'

const Projects = () => {
    const { tasks, projectGroups } = useAdmin()
    const [searchTerm, setSearchTerm] = useState('')

    // Get all published final reports
    const publishedProjects = tasks.filter(
        task => task.taskName === 'Final Report Submission' &&
            task.isPublished === true &&
            task.submittedFile
    )

    // Filter projects based on search term
    const filteredProjects = publishedProjects.filter(project => {
        const groupName = project.groupInfo?.name || ''
        const topicName = project.groupInfo?.topicName || ''
        const members = project.groupInfo?.members?.map(m => m.name).join(' ') || ''
        const searchLower = searchTerm.toLowerCase()

        return groupName.toLowerCase().includes(searchLower) ||
            topicName.toLowerCase().includes(searchLower) ||
            members.toLowerCase().includes(searchLower)
    })

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center">
                        <h1 className="text-5xl font-bold mb-4 flex items-center justify-center gap-3">
                            <FaTrophy className="text-yellow-300" />
                            Student Projects Gallery
                        </h1>
                        <p className="text-xl text-blue-100 mb-8">
                            Explore outstanding final year projects from our talented students
                        </p>

                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto">
                            <div className="relative">
                                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by topic, group, or member..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 rounded-full text-gray-800 text-lg focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-lg"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Projects Grid */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                {filteredProjects.length === 0 ? (
                    <div className="text-center py-20">
                        <FaTrophy className="mx-auto text-6xl text-gray-300 mb-4" />
                        <h3 className="text-2xl font-semibold text-gray-600 mb-2">
                            {searchTerm ? 'No projects found' : 'No published projects yet'}
                        </h3>
                        <p className="text-gray-500">
                            {searchTerm ? 'Try adjusting your search terms' : 'Check back soon for amazing student projects!'}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="mb-8">
                            <p className="text-gray-600 text-lg">
                                Showing <span className="font-semibold text-blue-600">{filteredProjects.length}</span> published project{filteredProjects.length !== 1 ? 's' : ''}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredProjects.map((project) => (
                                <div
                                    key={project.id}
                                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-300 transform hover:-translate-y-1"
                                >
                                    {/* Project Header */}
                                    <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-6 text-white">
                                        <h3 className="text-xl font-bold mb-1 line-clamp-1">
                                            {project.groupInfo?.topicName || 'Untitled Project'}
                                        </h3>
                                        <p className="text-sm font-medium text-blue-100 mb-2 opacity-90">
                                            {project.groupInfo?.name || 'Project Group'}
                                        </p>
                                        <div className="flex items-center gap-2 text-blue-100">
                                            <FaCalendar className="text-sm" />
                                            <span className="text-sm">
                                                Published: {new Date(project.publishedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Project Body */}
                                    <div className="p-6 space-y-4">
                                        {/* Final Mark */}
                                        {/* <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                                            <span className="text-gray-700 font-medium">Final Mark</span>
                                            <span className="text-3xl font-bold text-green-600">
                                                {project.finalMark}
                                                <span className="text-lg text-gray-500">/100</span>
                                            </span>
                                        </div> */}

                                        {/* Team Members */}
                                        <div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <FaUsers className="text-blue-600" />
                                                <h4 className="font-semibold text-gray-800">Team Members</h4>
                                            </div>
                                            <ul className="space-y-2">
                                                {project.groupInfo?.members?.map((member, idx) => (
                                                    <li key={idx} className="text-sm text-gray-600 flex items-start">
                                                        <span className="text-blue-500 mr-2">•</span>
                                                        <div>
                                                            <p className="font-medium text-gray-800">{member.name}</p>
                                                            <p className="text-xs text-gray-500">{member.department}</p>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* File Info */}
                                        <div className="pt-4 border-t border-gray-200">
                                            <p className="text-sm text-gray-600 mb-3">
                                                <span className="font-medium">Report:</span> {project.submittedFile.fileName}
                                            </p>
                                            <p className="text-xs text-gray-500 mb-4">
                                                Size: {Math.round(project.submittedFile.fileSize / 1024)} KB •
                                                Submitted: {new Date(project.submittedFile.submittedAt).toLocaleDateString()}
                                            </p>

                                            {/* Download Button */}
                                            <a
                                                href={`data:${project.submittedFile.fileType};base64,${project.submittedFile.fileContent}`}
                                                download={project.submittedFile.fileName}
                                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                                            >
                                                <FaDownload />
                                                Download Report
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Footer */}
            <div className="bg-gray-800 text-white py-8 mt-16">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-gray-400">
                        © {new Date().getFullYear()} Final Year Project Management System
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Projects