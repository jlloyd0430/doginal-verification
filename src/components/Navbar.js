import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ darkMode, toggleDarkMode }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h1 className="navbar-logo">Dogepond Verification</h1>
        {/* Desktop links */}
        <ul className="nav-links desktop-links">
          <li><Link to="/applications">Apply</Link></li>
          <li><Link to="/services">Services</Link></li>
        </ul>
      </div>

      {/* Mobile menu icon */}
      <div className="menu-icon" onClick={toggleMenu}>
        <div className={`bar ${menuOpen ? 'open' : ''}`} />
        <div className={`bar ${menuOpen ? 'open' : ''}`} />
        <div className={`bar ${menuOpen ? 'open' : ''}`} />
      </div>

      {/* Mobile links */}
      <ul className={`nav-links mobile-links ${menuOpen ? 'show' : ''}`}>
        <li><Link to="/applications" onClick={() => setMenuOpen(false)}>Apply</Link></li>
        <li><Link to="/services" onClick={() => setMenuOpen(false)}>Services</Link></li>
        <li className="mobile-dark-mode-toggle">
          <label className="switch">
            <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} />
            <span className="slider"></span>
          </label>
        </li>
      </ul>

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
