import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { useAdmin } from "../../contexts/AdminContext";
import { FiActivity, FiPieChart, FiBarChart2, FiTrendingUp } from "react-icons/fi";

const Analytics = () => {
  const { projectGroups, tasks, students, guides, departments } = useAdmin();

  // 1. Tasks per Project (Project Progress)
  const projectData = useMemo(() => {
    return projectGroups.map((group) => {
      const groupTasks = tasks.filter((task) => task.groupId === group.id);
      return {
        name: group.name,
        tasks: groupTasks.length,
        completed: groupTasks.filter(t => t.status === 'Completed' || t.status === 'Verified').length
      };
    });
  }, [projectGroups, tasks]);

  // 2. Task Status Distribution
  const taskStatusData = useMemo(() => {
    const statusCounts = tasks.reduce((acc, task) => {
      const status = task.status || "Pending";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return Object.keys(statusCounts).map((status) => ({
      name: status,
      value: statusCounts[status],
    }));
  }, [tasks]);

  // 3. Department Overview
  const deptData = useMemo(() => {
    return departments.map(d => {
      const deptStudents = students.filter(s => s.department === d.name);
      const deptGuides = guides.filter(g => g.department === d.name);
      const deptGroups = projectGroups.filter(p => p.members[0]?.department === d.name);

      return {
        name: d.name,
        students: deptStudents.length,
        guides: deptGuides.length,
        groups: deptGroups.length
      };
    });
  }, [departments, students, guides, projectGroups]);

  // 4. Growth Trends (Cumulative registrations over time)
  // For demonstration, we'll group by month of creation
  const growthData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();

    // Initialize data for last 6 months
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      last6Months.push({
        month: months[d.getMonth()],
        fullDate: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        registrations: 0,
        groups: 0
      });
    }

    // Populate data
    [...students, ...guides].forEach(user => {
      if (user.createdAt) {
        const date = new Date(user.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const entry = last6Months.find(m => m.fullDate === monthKey);
        if (entry) entry.registrations++;
      }
    });

    projectGroups.forEach(group => {
      if (group.createdAt) {
        const date = new Date(group.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const entry = last6Months.find(m => m.fullDate === monthKey);
        if (entry) entry.groups++;
      }
    });

    return last6Months;
  }, [students, guides, projectGroups]);

  const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">System Analytics</h1>
          <p className="text-slate-500 mt-1">Real-time overview of projects, tasks, and users.</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200">
            <span className="text-slate-500">Total Users:</span>
            <span className="ml-2 font-bold text-slate-900">{students.length + guides.length}</span>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200">
            <span className="text-slate-500">Active Groups:</span>
            <span className="ml-2 font-bold text-slate-900">{projectGroups.length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Department Overview */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-6 text-slate-800">
            <FiBarChart2 className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold">Department Overview</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                cursor={{ fill: '#f8fafc' }}
              />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="students" name="Students" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="guides" name="Guides" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="groups" name="Groups" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Growth Trends */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-6 text-slate-800">
            <FiTrendingUp className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold">Growth Trends</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Area
                type="monotone"
                dataKey="registrations"
                name="New Users"
                stroke="#6366f1"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorReg)"
              />
              <Area
                type="monotone"
                dataKey="groups"
                name="New Groups"
                stroke="#f59e0b"
                strokeWidth={3}
                fillOpacity={0}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Task Completion by Project */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-6 text-slate-800">
            <FiActivity className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold">Tasks per Project</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={projectData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="top" height={36} />
              <Line
                type="monotone"
                dataKey="tasks"
                name="Total Tasks"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ r: 4, fill: '#fff', strokeWidth: 2, stroke: '#6366f1' }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="completed"
                name="Completed"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4, fill: '#fff', strokeWidth: 2, stroke: '#10b981' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Task Status Distribution */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-6 text-slate-800">
            <FiPieChart className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold">Task Status Distribution</h3>
          </div>
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={taskStatusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={70}
                  paddingAngle={5}
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-4 mt-2">
              {taskStatusData.map((status, index) => (
                <div key={status.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-sm text-slate-600 font-medium">{status.name}: {status.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
