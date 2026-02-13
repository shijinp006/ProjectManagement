import React, { useMemo, useState } from 'react'
import { FaUsers, FaFilter } from 'react-icons/fa'
import { useAdmin } from '../../contexts/AdminContext'

const ProjectGroups = () => {
  const { projectGroups, departments, guides } = useAdmin()
  const [departmentFilter, setDepartmentFilter] = useState('ALL')

  const departmentOptions = useMemo(
    () => (departments || []).map(d => d.name).filter(Boolean),
    [departments]
  )

  const groupsWithMeta = useMemo(() => {
    const list = [...(projectGroups || [])]

    // newest first
    list.sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    )

    return list.map(group => {
      const department = group?.members?.[0]?.department || '—'
      const guide =
        guides?.find(g => g.id === group.assignedGuide) || null

      return {
        ...group,
        _department: department,
        _guideName: guide ? `${guide.name} (${guide.username})` : 'Not assigned'
      }
    })
  }, [projectGroups, guides])

  const filteredGroups = useMemo(() => {
    if (departmentFilter === 'ALL') return groupsWithMeta
    return groupsWithMeta.filter(g => g._department === departmentFilter)
  }, [groupsWithMeta, departmentFilter])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <FaUsers className="text-blue-600" />
              Project Groups
            </h1>
            <p className="text-gray-600 mt-1">
              All student-created project groups visible to administrators.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3">
            <FaFilter className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              Department
            </span>
            <select
              value={departmentFilter}
              onChange={e => setDepartmentFilter(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All</option>
              {departmentOptions.map(name => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredGroups.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-10 text-center text-gray-600">
            No project groups found.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {filteredGroups.map(group => (
              <div
                key={group.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {group.name}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Department:</span>{' '}
                      {group._department}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Status:</span>{' '}
                      {group.status || 'Pending acceptance'}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Assigned guide:</span>{' '}
                      {group._guideName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      Created:{' '}
                      {group.createdAt
                        ? new Date(group.createdAt).toLocaleString()
                        : '—'}
                    </p>
                    {group.updatedAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        Updated:{' '}
                        {new Date(group.updatedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-5">
                  <h3 className="text-sm font-semibold text-gray-800 mb-2">
                    Members ({group.members?.length || 0})
                  </h3>
                  <div className="border border-gray-200 rounded-md divide-y">
                    {(group.members || []).map(m => (
                      <div
                        key={m.id}
                        className="px-3 py-2 text-sm text-gray-700 flex flex-wrap items-center gap-x-2 gap-y-1"
                      >
                        <span className="font-medium">{m.name}</span>
                        <span className="text-gray-500">
                          ({m.username})
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600">
                          {m.email}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectGroups