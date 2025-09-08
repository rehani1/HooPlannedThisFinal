// src/pages/Profile.jsx
import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from "../lib/supabaseClient";

export default function Profile() {
  const [fullName, setFullName] = useState(null);
  const [email, setEmail] = useState(null);
  const [gradYear, setGradYear] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);   // URL used by <img>
  const [profilePicture, setProfilePicture] = useState(null); // path stored in DB
  const [msg, setMsg] = useState("Loading...");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);

  // helper: compose name from row or metadata
  const buildName = (row, user) => {
    const first = row?.first_name?.trim();
    const last  = row?.last_name?.trim();
    const fromRow = [first, last].filter(Boolean).join(' ').trim();

    const metaFirst = user?.user_metadata?.first_name?.trim();
    const metaLast  = user?.user_metadata?.last_name?.trim();
    const metaFull  = user?.user_metadata?.full_name?.trim();
    const fromMeta  = metaFull || [metaFirst, metaLast].filter(Boolean).join(' ').trim();

    const fromEmail = (user?.email || row?.email || '')
      .split('@')[0]
      .replace(/[._-]/g, ' ')
      .trim();

    return (fromRow || fromMeta || fromEmail || null);
  };

  useEffect(() => {
    const run = async () => {
      setMsg("Fetching auth user...");
      setError("");

      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr) { setMsg(`Auth error: ${authErr.message}`); return; }
      if (!user) { setMsg("No user logged in."); return; }

      // Try by id – include avatar_path and name fields
      const byId = await supabase
        .from('users')
        .select('id, email, grad_year, first_name, last_name, full_name, profile_picture')
        .eq('id', user.id)
        .maybeSingle();

      if (byId.error) {
        console.error("Users by id error:", byId.error);
        setMsg(`Users select error: ${byId.error.message}`);
        setEmail(user.email);
        setGradYear(user.user_metadata?.grad_year ?? null);
        setFullName(buildName(null, user));
      } else if (byId.data) {
        const row = byId.data;
        setEmail(row.email ?? user.email);
        setGradYear(row.grad_year ?? user.user_metadata?.grad_year ?? null);
        setFullName(row.full_name?.trim() || buildName(row, user));
        setProfilePicture(row.profile_picture ?? null);

        if (row.profile_picture) {
          const { data: pub } = supabase.storage.from('avatars').getPublicUrl(row.profile_picture);
          setPhotoUrl(pub?.publicUrl ?? null);
        }
        setMsg("OK");
      } else {
        // diagnostic: try by email (id mismatch)
        const byEmail = await supabase
          .from('users')
          .select('id, email, grad_year, first_name, last_name, full_name, profile_picture')
          .eq('email', user.email)
          .maybeSingle();

        if (byEmail.error) {
          console.error("Users by email error:", byEmail.error);
          setMsg("No matching row found (and by-email check errored).");
          setEmail(user.email);
          setGradYear(user.user_metadata?.grad_year ?? null);
          setFullName(buildName(null, user));
        } else if (byEmail.data) {
          const row = byEmail.data;
          console.warn("ID mismatch:", { auth_id: user.id, row_id: row.id, email: row.email });
          setMsg("ID mismatch: row exists but users.id ≠ auth.user.id");
          setEmail(row.email);
          setGradYear(row.grad_year ?? user.user_metadata?.grad_year ?? null);
          setFullName(row.full_name?.trim() || buildName(row, user));
          setProfilePicture(row.profile_pictuure ?? null);

          if (row.profile_picture) {
            const { data: pub } = supabase.storage.from('avatars').getPublicUrl(row.profile_picture);
            setPhotoUrl(pub?.publicUrl ?? null);
          }
        } else {
          setMsg("No matching row in users. (Consider upserting on login.)");
          setEmail(user.email);
          setGradYear(user.user_metadata?.grad_year ?? null);
          setFullName(buildName(null, user));
        }
      }
    };

    run();
  }, []);

  // === File upload handler for the "Edit Photo" input ===
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!/^image\/(png|jpe?g|gif|webp)$/i.test(file.type)) {
      setError("Please upload a PNG, JPG, GIF, or WEBP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image is too large (max 5MB).");
      return;
    }

    setUploading(true);
    setMsg("Uploading avatar…");
    setError("");

    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      setUploading(false);
      setMsg(authErr ? `Auth error: ${authErr.message}` : "No user logged in.");
      return;
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
    const fileName = `${Date.now()}.${ext}`;
    const path = `${user.id}/${fileName}`;

    const { error: upErr } = await supabase
      .storage
      .from('avatars')
      .upload(path, file, { cacheControl: '3600', upsert: true, contentType: file.type });

    if (upErr) {
      setUploading(false);
      setMsg("Upload failed.");
      setError(upErr.message);
      return;
    }

    // Save path into users.avatar_path
    const { error: updErr } = await supabase
      .from('users')
      .update({ profile_picture: path })
      .eq('id', user.id);

    if (updErr) {
      setUploading(false);
      setMsg("Saved file but failed to update profile row.");
      setError(updErr.message);
      return;
    }

    const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
    setProfilePicture(path);
    setPhotoUrl(pub?.publicUrl ?? null);
    setUploading(false);
    setMsg("Avatar updated!");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700 }}>My Profile</h1>
      <p style={{ marginTop: 8, fontSize: 16 }}>Here you can view and update your information.</p>

      {/* 🔽🔽 Place your provided block RIGHT HERE (wired to our state/handler) */}
      <div style={{ padding: '40px', maxWidth: '850px', margin:0 }}>
        {/* Top row: photo + name + save button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {/* Profile picture */}
            <div style={{ textAlign: 'center' }}>
              <img
                src={photoUrl || 'https://avatar.iran.liara.run/public'}
                alt="Profile"
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #ccc'
                }}
                onError={() => setPhotoUrl(null)}
              />

              <label
                htmlFor="photoUpload"
                style={{
                  display: 'block',
                  marginTop: '8px',
                  fontSize: '12px',
                  color: '#007bff',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                {uploading ? "Uploading…" : "Edit Photo"}
              </label>
              <input
                id="photoUpload"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                ref={fileInputRef}
                style={{ display: 'none' }}
              />
            </div>

            {/* Name + email */}
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#003e83' }}>
                {fullName ?? "—"}
              </div>
              <div style={{ fontSize: 14, color: '#54637a' }}>
                {email ?? "—"}
              </div>
            </div>
          </div>

          {/* (Optional) Save button placeholder — wire to name edits if you add inputs later */}
          <button
            type="button"
            style={{
              border: '1px solid #eef1f4',
              background: '#ffffff',
              color: '#003e83',
              padding: '10px 14px',
    
              borderRadius: 10,
              cursor: uploading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.06), 0 2px 4px -1px rgba(0,0,0,0.04)',
              fontSize: 14,
              fontWeight: 600
            }}
            disabled={uploading}
            onClick={() => setMsg("Nothing to save yet — add name inputs to enable.")}
          >
            Save
          </button>
        </div>
      </div>
      {/* 🔼🔼 End inserted block */}

      <div style={{ marginTop: 24, display: 'grid', gap: 16, maxWidth: 500 }}>
        <div style={cardStyle}>
          <strong>Name:</strong> {fullName ?? "—"}
        </div>
        <div style={cardStyle}>
          <strong>Email:</strong> {email ?? "—"}
        </div>
        <div style={cardStyle}>
          <strong>Graduation Year:</strong> {gradYear ?? "—"}
        </div>
        {!!error && (
          <div style={{ ...noteStyle, borderColor:'#ffd7d7', background:'#fff4f4', color:'#b00020' }}>
            {error}
          </div>
        )}
        <div style={noteStyle}>
          <small>Status: <span style={{ color: /error|fail|mismatch/i.test(msg) ? 'red' : '#4a5568' }}>{msg}</span></small>
        </div>
      </div>

      <div style={{ marginTop: 32 }}>
        <Link to="/home" style={backLinkStyle}>← Back to Home</Link>
      </div>
    </div>
  );
}

/* styles */
const containerStyle = { minHeight:'100vh', padding:'32px', boxSizing:'border-box', fontFamily:'"Montserrat",system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif', background:'#fff', color:'#003e83' };
const cardStyle = { padding:'16px', borderRadius:12, border:'1px solid #eef1f4', boxShadow:'0 4px 6px -1px rgba(0,0,0,0.06), 0 2px 4px -1px rgba(0,0,0,0.04)', background:'#fff', fontSize:15 };
const noteStyle = { padding:'8px 12px', borderRadius:8, background:'#f7fafc', border:'1px dashed #e2e8f0', color:'#4a5568' };
const backLinkStyle = { textDecoration:'none', color:'#003e83', fontWeight:600 };

