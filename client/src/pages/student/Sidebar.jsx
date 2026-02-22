import React from "react";
import { NavLink } from "react-router-dom";
import { BiNotification } from "react-icons/bi";
import { CgAdd, CgNotes } from "react-icons/cg";
import { GoReport } from "react-icons/go";
import { LuMessageSquareMore, LuUserRoundCheck } from "react-icons/lu";

import {
  MdOutlineManageAccounts,
  MdOutlineSpaceDashboard,
} from "react-icons/md";
import { PiExam } from "react-icons/pi";
import { HiOutlineUserGroup } from "react-icons/hi";
import { FaRegUser, FaTasks } from "react-icons/fa";
import { RiRobot2Line } from "react-icons/ri";

const SidebarLink = ({ to, end, icon: Icon, label, onClick }) => {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `group flex items-center gap-4 py-4 px-4 rounded-xl text-sm font-medium transition-all duration-200 hover:shadow-md ${isActive
          ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={`w-5 h-5 transition-colors duration-200 ${isActive
                ? "text-white"
                : "text-slate-400 group-hover:text-slate-600"
              }`}
          />
          <span className="md:inline-block">{label}</span>
        </>
      )}
    </NavLink>
  );
};

const Sidebar = ({ isOpen, setIsOpen }) => {
  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar aside */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 flex flex-col bg-white/95 backdrop-blur-md border-r border-slate-200/60 h-screen md:h-full pt-8 px-4 shadow-xl w-64 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
      >
        {/* Mobile Header in Sidebar */}
        <div className="flex items-center justify-between mb-8 md:hidden">
          <h2 className="text-xl font-bold text-slate-800">Menu</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-slate-500 hover:text-slate-800"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto">
          <SidebarLink
            to="/student"
            end
            icon={MdOutlineSpaceDashboard}
            label="Dashboard"
            onClick={() => setIsOpen(false)}
          />
          <SidebarLink
            to="/student/group"
            icon={HiOutlineUserGroup}
            label="Group"
            onClick={() => setIsOpen(false)}
          />
          <SidebarLink
            to="/student/tasks"
            icon={FaTasks}
            label="Tasks"
            onClick={() => setIsOpen(false)}
          />
          <SidebarLink
            to="/student/student-notification"
            icon={LuMessageSquareMore}
            label="Messages"
            onClick={() => setIsOpen(false)}
          />
          <SidebarLink
            to="/student/student-profile"
            icon={LuUserRoundCheck}
            label="Profile"
            onClick={() => setIsOpen(false)}
          />
          <SidebarLink
            to="/student/student-chatbot"
            icon={RiRobot2Line}
            label="Chatbot"
            onClick={() => setIsOpen(false)}
          />
        </nav>

        {/* Footer */}
        <div className="pt-6 border-t border-slate-200/60 mt-6 mb-8 md:mb-4">
          <p className="text-xs text-slate-500 text-center">Capstone Admin v1.0</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
