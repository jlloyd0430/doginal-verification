import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import DiscordLogin from './components/DiscordLogin';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  return (
    <div className={`App ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <Router>
        <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <Routes>
          <Route path="/" element={<DiscordLogin />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Add more routes for other services here */}
        </Routes>
      </Router>
    </div>
  );
}

export default App;
