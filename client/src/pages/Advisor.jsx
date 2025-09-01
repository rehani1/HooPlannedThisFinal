// src/pages/Advisor.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function Advisor() {
  return (
    <div style={{
      minHeight: '100vh',
      padding: '32px',
      boxSizing: 'border-box',
      fontFamily: '"Montserrat", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
      background: '#ffffff',
      color: '#003e83'
    }}>
      <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700 }}>Advisors</h1>
      <p style={{ marginTop: 8, fontSize: 16 }}>
        Meet the advisors who support our Class Council.
      </p>

      <div style={{
        marginTop: 24,
        display: 'grid',
        gap: 16,
        maxWidth: 600
      }}>
        <div style={cardStyle}>
          <strong>Name:</strong> Dr. Angela Orebaugh <br />
          <strong>Email:</strong> angela.orebaugh@virginia.edu <br />
          <strong>Role:</strong> Faculty Advisor
        </div>

        <div style={cardStyle}>
          <strong>Name:</strong> John Smith <br />
          <strong>Email:</strong> jsmith@virginia.edu <br />
          <strong>Role:</strong> Administrative Advisor
        </div>

        <div style={cardStyle}>
          <strong>Name:</strong> Sarah Johnson <br />
          <strong>Email:</strong> sjohnson@virginia.edu <br />
          <strong>Role:</strong> Alumni Advisor
        </div>
      </div>

      <div style={{ marginTop: 32 }}>
        <Link to="/Home" style={backLinkStyle}>← Back to Home</Link>
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
  fontSize: 15,
  lineHeight: 1.5
};

const backLinkStyle = {
  textDecoration: 'none',
  color: '#003e83',
  fontWeight: 600
};

