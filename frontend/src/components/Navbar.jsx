import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { notifications, connected } = useWebSocket();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : true;
  });

  const unreadCount = notifications.filter(n => n.type === 'NEW_SWAP_REQUEST').length;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      {/* Backdrop overlay for mobile menu */}
      {isMenuOpen && (
        <div 
          className="navbar-backdrop" 
          onClick={closeMenu}
        ></div>
      )}
      
      <div className="container navbar-content">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🔄</span>
          <span className="brand-text">SlotSwapper</span>
        </Link>

        <button 
          className={`hamburger ${isMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {isAuthenticated ? (
          <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
            <Link to="/dashboard" className="nav-link" onClick={closeMenu}>
              <span className="nav-icon">📅</span>
              Dashboard
            </Link>
            <Link to="/marketplace" className="nav-link" onClick={closeMenu}>
              <span className="nav-icon">🛒</span>
              Marketplace
            </Link>
            <Link to="/groups" className="nav-link" onClick={closeMenu}>
              <span className="nav-icon">👥</span>
              Groups
            </Link>
            <Link to="/notifications" className="nav-link" onClick={closeMenu}>
              <span className="nav-icon">🔔</span>
              Notifications
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </Link>

            <button 
              onClick={() => { toggleDarkMode(); closeMenu(); }} 
              className="theme-toggle" 
              title="Toggle dark mode"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>

            <div className="navbar-user">
              <div className="user-info">
                <span className="user-name">{user?.name}</span>
                {user?.currentGroup ? (
                  <span className="user-org">
                    📍 {user.currentGroup.name}
                  </span>
                ) : (
                  <span className="user-org no-group">
                    No active group
                  </span>
                )}
                {connected && <span className="status-dot"></span>}
              </div>
              <button onClick={() => { logout(); closeMenu(); }} className="btn btn-sm btn-outline">
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
            <button 
              onClick={() => { toggleDarkMode(); closeMenu(); }} 
              className="theme-toggle" 
              title="Toggle dark mode"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <Link to="/login" className="btn btn-sm btn-outline" onClick={closeMenu}>
              Login
            </Link>
            <Link to="/signup" className="btn btn-sm btn-primary" onClick={closeMenu}>
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
