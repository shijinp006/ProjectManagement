import React from "react";
import { NavLink } from "react-router-dom";
import { BiNotification } from "react-icons/bi";
import { CgAdd, CgNotes } from "react-icons/cg";
import { GoReport } from "react-icons/go";
import {
  MdGroups,
  MdOutlineManageAccounts,
  MdOutlineSpaceDashboard,
} from "react-icons/md";
import { PiExam, PiNotificationBold, PiStudentFill } from "react-icons/pi";
import { IoIosApps } from "react-icons/io";
import { FaUserTie } from "react-icons/fa";
import { HiAcademicCap } from "react-icons/hi";

const SidebarLink = ({ to, end, icon: Icon, label }) => {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `group flex items-center gap-4 py-4 px-4 rounded-xl text-sm font-medium transition-all duration-200 hover:shadow-md ${
          isActive
            ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={`w-5 h-5 transition-colors duration-200 ${
              isActive
                ? "text-white"
                : "text-slate-400 group-hover:text-slate-600"
            }`}
          />
          <span className="hidden md:inline-block">{label}</span>
        </>
      )}
    </NavLink>
  );
};

const Sidebar = () => {
  return (
    <aside className="flex flex-col bg-white/95 backdrop-blur-md border-r border-slate-200/60 min-h-full pt-8 px-4 shadow-xl w-64">
      <nav className="flex-1 space-y-2">
        <SidebarLink
          to="/admin"
          end
          icon={MdOutlineSpaceDashboard}
          label="Dashboard"
        />
        <SidebarLink
          to="/admin/academic-setup"
          icon={HiAcademicCap}
          label="Academic Setup"
        />
        <SidebarLink
          to="/admin/students"
          icon={PiStudentFill}
          label="Student Management"
        />
        <SidebarLink
          to="/admin/guides"
          icon={FaUserTie}
          label="Guide Management"
        />
        <SidebarLink
          to="/admin/project-groups"
          icon={MdGroups}
          label="Project Groups"
        />
       
        <SidebarLink
          to="/admin/analytics"
          icon={PiExam}
          label="Analytics & Reports"
        />
        <SidebarLink
          to="/admin/notifications"
          icon={PiNotificationBold}
          label="Notifications"
        />
      </nav>

      {/* Footer */}
      <div className="pt-6 border-t border-slate-200/60 mt-6">
        <p className="text-xs text-slate-500 text-center">Capstone Admin v1.0</p>
      </div>
    </aside>
  );
};

export default Sidebar;
