// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    const loadName = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return;

      // Try users.full_name first
      const { data: row, error: selErr } = await supabase
        .from('users')
        .select('full_name, email')
        .eq('id', user.id)
        .maybeSingle();

      const fromUsers = row?.full_name?.trim();
      const fromMeta  = user.user_metadata?.full_name?.trim();
      const fromEmail = (user.email || row?.email || '')
        .split('@')[0]
        .replace(/[._-]/g, ' ')
        .trim();

      setDisplayName(fromUsers || fromMeta || fromEmail || 'there');
    };

    loadName();
  }, []);

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
        welcome. you’re logged in, {displayName || '…'}
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
        <Link to="/advisors" style={tileStyle}>Advisors</Link>
        <Link to="/budget" style={tileStyle}>Budget</Link>
        <Link to="/volunteersignup" style={tileStyle}>Volunteer Sign-Up</Link>
        <Link to="/events/manage" style={tileStyle}>Manage Events</Link>
        <Link to="/login" style={tileStyle}>Log Out</Link>
        <Link to="/admin" style={tileStyle}>Admin</Link>
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
