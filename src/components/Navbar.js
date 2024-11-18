import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ darkMode, toggleDarkMode }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  const redirectToLogin = () => {
    navigate('/login'); // Change '/login' to the correct path for your login page
  };

  return (
    <nav className="navbar">
      <div className="navbar-left" onClick={redirectToLogin} style={{ cursor: 'pointer' }}>
        <h1 className="navbar-logo">Dogepond Verification</h1>
      </div>

      {/* Desktop links */}
      <ul className="nav-links desktop-links">
        <li><Link to="/applications">Apply</Link></li>
        <li><Link to="/services">Services</Link></li>
      </ul>

      {/* Mobile menu icon */}
      <div className="menu-icon" onClick={toggleMenu}>
        <div className={`bar ${menuOpen ? 'open' : ''}`} />
        <div className={`bar ${menuOpen ? 'open' : ''}`} />
        <div className={`bar ${menuOpen ? 'open' : ''}`} />
      </div>

      {/* Mobile links */}
      {menuOpen && (
        <ul className="nav-links mobile-links">
          <li><Link to="/applications" onClick={() => setMenuOpen(false)}>Apply</Link></li>
          <li><Link to="/services" onClick={() => setMenuOpen(false)}>Services</Link></li>
          <li className="mobile-dark-mode-toggle">
            <label className="switch">
              <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} />
              <span className="slider"></span>
            </label>
          </li>
        </ul>
      )}

      {/* Desktop dark mode toggle */}
      <div className="dark-mode-toggle">
        <label className="switch">
          <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} />
          <span className="slider"></span>
        </label>
      </div>
    </nav>
  );
};

export default Navbar;
