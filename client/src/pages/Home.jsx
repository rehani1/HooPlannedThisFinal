// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      padding: '32px',
      boxSizing: 'border-box',
      fontFamily: '"Montserrat", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
      background: '#ffffff',
      color: '#003e83'
    }}>
      <h1 style={{ margin: 0, fontSize: 36, fontWeight: 800 }}>HooPlannedThis</h1>
      <p style={{ marginTop: 8, fontSize: 16 }}>
        Welcome! You’re logged in.
      </p>

      <div style={{
        marginTop: 24,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 12,
        maxWidth: 800
      }}>
        <Link to="/events" style={tileStyle}>Events</Link>
        <Link to="/events/createevent" style={tileStyle}>Create Event</Link>
        <Link to="/committees" style={tileStyle}>Committees</Link>
        <Link to="/profile" style={tileStyle}>Profile</Link>
        <Link to="/classcouncil" style={tileStyle}>Class Council</Link>
        <Link to="/advisor" style={tileStyle}>Advisors</Link>
        <Link to="/budget" style={tileStyle}>Budget</Link>
        <Link to="/volunteersignup" style={tileStyle}>Volunteer Sign-Up</Link>
        <Link to="/events/manage" style={tileStyle}>Manage Events</Link>
      </div>
    </div>
  );
}

const tileStyle = {
  display: 'grid',
  placeItems: 'center',
  textDecoration: 'none',
  height: 64,
  borderRadius: 12,
  border: '1px solid #eef1f4',
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.06), 0 2px 4px -1px rgba(0,0,0,0.04)',
  background: '#ffffff',
  color: '#003e83',
  fontWeight: 600
};
