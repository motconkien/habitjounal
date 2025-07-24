// Sidebar.js
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaBook, FaCheck, FaListAlt, FaSignOutAlt, FaTrash } from 'react-icons/fa';
import { BiUserCircle } from 'react-icons/bi';
import { GiSunflower } from 'react-icons/gi';
import { IoIosSunny } from "react-icons/io";

function Sidebar({ username, handleLogout, open, close, isMobile }) {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: <FaHome />, label: 'Dashboard' },
    { path: '/journal', icon: <FaBook />, label: 'Journal' },
    { path: '/habit', icon: <FaCheck />, label: 'Habit' },
    { path: '/todo', icon: <FaListAlt />, label: 'Todo' },
  ];

  return (
    <div className={`sidebar ${isMobile ? (open ? 'visible' : 'hidden') : ''}`}>
      {isMobile && (
        <FaTrash size={24} onClick={close}/>
      )}
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
