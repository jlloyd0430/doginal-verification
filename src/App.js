import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import DiscordLogin from './components/DiscordLogin';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DiscordLogin />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
