import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', color: '#1e293b' }}>
      <aside style={{ width: '240px', backgroundColor: '#0e2a47', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ padding: '24px', fontSize: '20px', fontWeight: 'bold' }}>Navigation</div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 16px' }}>
            <Link to="/home" style={navButton}>Home</Link>
            <button style={navButton}>Class Council</button>
            <Link to="/events" style={navButton}>Events</Link>
            <Link to="/advisor" style={navButton}>Advisors</Link>
          </nav>
        </div>

        <div style={{ padding: '16px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', opacity: 0.9 }}>Settings</div>
          <Link to="/admin" style={navButton}>Admin</Link>
          <Link to="/home" style={navButton}>Log Out</Link>
          <Link to="/profile" style={navButton}>Profile</Link>
        </div>
      </aside>

      <main style={{ flex: 1, padding: '48px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#1e3a8a' }}>Welcome to HooPlannedThis!</h1>
      </main>
    </div>
  );
}

const navButton = {
  backgroundColor: 'transparent',
  color: 'white',
  border: 'none',
  textAlign: 'left',
  padding: '12px 16px',
  borderRadius: '8px',
  fontSize: '16px',
  cursor: 'pointer',
  transition: 'background 0.2s',
};
