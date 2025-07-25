// Sidebar.js
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaBook, FaCheck, FaListAlt, FaSignOutAlt, FaTrash } from 'react-icons/fa';
import { IoIosSunny } from "react-icons/io";

function Sidebar({ username, handleLogout, isMobile, isOpen, onClose }) {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: <FaHome />, label: 'Dashboard' },
    { path: '/journal', icon: <FaBook />, label: 'Journal' },
    { path: '/habit', icon: <FaCheck />, label: 'Habit' },
    { path: '/todo', icon: <FaListAlt />, label: 'Todo' },
  ];
  const handleMenuClick = () => {
    if (isMobile) {
      onClose(); // close sidebar on mobile
    }
  };
  return (
    <div className={`sidebar ${isMobile ? (isOpen ? 'visible' : 'hidden') : ''}`}>
      <div className="sidebar">
        <div className="sidebar-header">
          <IoIosSunny size={36} color='yellow' />
          <h2>{username}</h2>
        </div>
        <nav className="sidebar-menu">
          {menuItems.map(({ path, icon, label }) => (
            <Link
              key={path}
              to={path}
              className={`menu-item${location.pathname === path ? ' active' : ''}`}
              onClick={handleMenuClick}
            >
              <span className="icon">{icon}</span>
              {label}
            </Link>
          ))}
          <button className="menu-item logout-button" onClick={handleLogout}>
            <FaSignOutAlt className="icon" />
            Logout
          </button>
        </nav>
      </div>
    </div>

  );
};

export default Sidebar;
