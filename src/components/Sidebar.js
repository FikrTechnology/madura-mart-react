import React, { useState } from 'react';
import '../styles/Sidebar.css';

const Sidebar = ({ activeMenu, onMenuChange, onLogout }) => {
  const menuItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'menu', label: 'Menu', icon: '📋' },
    { id: 'order', label: 'Order', icon: '📦' },
    { id: 'history', label: 'History', icon: '📜' },
    { id: 'report', label: 'Report', icon: '📊' },
  ];

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">MM</div>
        <div className="logo-text">
          <h3>Madura Mart</h3>
          <p>Kasir System</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activeMenu === item.id ? 'active' : ''}`}
            onClick={() => onMenuChange(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Divider */}
      <div className="sidebar-divider"></div>

      {/* Logout Button */}
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={onLogout}>
          <span className="nav-icon">🚪</span>
          <span className="nav-label">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
