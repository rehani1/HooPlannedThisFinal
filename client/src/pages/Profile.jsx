// src/pages/Profile.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from "../lib/supabaseClient";

export default function Profile() {
  const [email, setEmail] = useState(null);
  const [gradYear, setGradYear] = useState(null);
  const [msg, setMsg] = useState("Loading...");

  useEffect(() => {
    const run = async () => {
      setMsg("Fetching auth user...");
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr) { setMsg(`Auth error: ${authErr.message}`); return; }
      if (!user) { setMsg("No user logged in."); return; }

      console.log("Auth user:", { id: user.id, email: user.email, meta_grad_year: user.user_metadata?.grad_year });

      // 1) Try by id (expected path) — note snake_case 'grad_year'
      const byId = await supabase
        .from('users')
        .select('id, email, grad_year')
        .eq('id', user.id)
        .maybeSingle();

      if (byId.error) {
        console.error("Users by id error:", byId.error);
        setMsg(`Users select error: ${byId.error.message}`);
        setEmail(user.email); // fallback
        setGradYear(user.user_metadata?.grad_year ?? null); // fallback from auth metadata, if present
        return;
      }

      if (byId.data) {
        setEmail(byId.data.email);
        setGradYear(byId.data.grad_year ?? user.user_metadata?.grad_year ?? null);
        setMsg("OK");
        return;
      }

      // 2) Try by email (diagnostic)
      const byEmail = await supabase
        .from('users')
        .select('id, email, grad_year')
        .eq('email', user.email)
        .maybeSingle();

      if (byEmail.error) {
        console.error("Users by email error:", byEmail.error);
        setMsg(`No matching row found (and by-email check errored).`);
        setEmail(user.email); // fallback
        setGradYear(user.user_metadata?.grad_year ?? null);
        return;
      }

      if (byEmail.data) {
        console.warn("ID mismatch:", {
          auth_id: user.id,
          row_id: byEmail.data.id,
          email: byEmail.data.email
        });
        setMsg("ID mismatch: row exists but users.id ≠ auth.user.id");
        setEmail(byEmail.data.email);
        setGradYear(byEmail.data.grad_year ?? user.user_metadata?.grad_year ?? null);
        return;
      }

      // 3) Nothing found at all
      setMsg("No matching row in users. (Consider upserting on login.)");
      setEmail(user.email);
      setGradYear(user.user_metadata?.grad_year ?? null);
    };

    run();
  }, []);

  return (
    <div style={containerStyle}>
      <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700 }}>My Profile</h1>
      <p style={{ marginTop: 8, fontSize: 16 }}>Here you can view and update your information.</p>

      <div style={{ marginTop: 24, display: 'grid', gap: 16, maxWidth: 500 }}>
        <div style={cardStyle}>
          <strong>Email:</strong> {email ?? "—"}
        </div>
        <div style={cardStyle}>
          <strong>Graduation Year:</strong> {gradYear ?? "—"}
        </div>
        <div style={noteStyle}>
          <small>Status: <span style={{ color: /error|mismatch/i.test(msg) ? 'red' : '#4a5568' }}>{msg}</span></small>
        </div>
      </div>

      <div style={{ marginTop: 32 }}>
        <Link to="/home" style={backLinkStyle}>← Back to Home</Link>
      </div>
    </div>
  );
}

const containerStyle = { minHeight:'100vh', padding:'32px', boxSizing:'border-box', fontFamily:'"Montserrat",system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif', background:'#fff', color:'#003e83' };
const cardStyle = { padding:'16px', borderRadius:12, border:'1px solid #eef1f4', boxShadow:'0 4px 6px -1px rgba(0,0,0,0.06), 0 2px 4px -1px rgba(0,0,0,0.04)', background:'#fff', fontSize:15 };
const noteStyle = { padding:'8px 12px', borderRadius:8, background:'#f7fafc', border:'1px dashed #e2e8f0', color:'#4a5568' };
const backLinkStyle = { textDecoration:'none', color:'#003e83', fontWeight:600 };
