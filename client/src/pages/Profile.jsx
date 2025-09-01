import React from 'react';
import { Link } from 'react-router-dom';

export default function Profile() {
    return (
      <div style={{
        minHeight: '100vh',
        padding: '32px',
        boxSizing: 'border-box',
        fontFamily: '"Montserrat", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
        background: '#ffffff',
        color: '#003e83'
      }}>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700 }}>My Profile</h1>
        <p style={{ marginTop: 8, fontSize: 16 }}>
          Here you can view and update your information.
        </p>
  
        <div style={{
          marginTop: 24,
          display: 'grid',
          gap: 16,
          maxWidth: 500
        }}>
          <div style={cardStyle}>
            <strong>Name:</strong> Jane Doe
          </div>
          <div style={cardStyle}>
            <strong>Email:</strong> jane.doe@example.com
          </div>
          <div style={cardStyle}>
            <strong>Role:</strong> Student Council Member
          </div>
        </div>
  
        <div style={{ marginTop: 32 }}>
          <Link to="/" style={backLinkStyle}>← Back to Home</Link>
        </div>
      </div>
    );
  }
  
  const cardStyle = {
    padding: '16px',
    borderRadius: 12,
    border: '1px solid #eef1f4',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.06), 0 2px 4px -1px rgba(0,0,0,0.04)',
    background: '#ffffff',
    fontSize: 15
  };
  
  const backLinkStyle = {
    textDecoration: 'none',
    color: '#003e83',
    fontWeight: 600
  };