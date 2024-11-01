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
      <h1 className="navbar-logo">Dogepond Verification</h1>
      <div className="menu-icon" onClick={toggleMenu}>
        <div className={`bar ${menuOpen ? 'open' : ''}`} />
        <div className={`bar ${menuOpen ? 'open' : ''}`} />
        <div className={`bar ${menuOpen ? 'open' : ''}`} />
      </div>
      <ul className={`nav-links ${menuOpen ? 'show' : ''}`}>
        <li><Link to="/applications" onClick={() => setMenuOpen(false)}>Applications</Link></li>
        <li><Link to="/services" onClick={() => setMenuOpen(false)}>Services</Link></li>
      </ul>
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
