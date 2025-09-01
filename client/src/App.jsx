
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login.jsx";
import Home from "./pages/Home.jsx";
import Register from "./pages/Register.jsx";
import Profile from "./pages/Profile.jsx";


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} /> 
        <Route path="/Profile" element={<Profile />} /> 
        
        <Route path="/dashboard" element={<h1>Dashboard (protected)</h1>} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

