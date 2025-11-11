// src/pages/Profile.jsx
import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { uploadProfilePhoto, getProfilePhotoFromRow } from "../lib/profilePhoto";

export default function Profile() {
  const [fullName, setFullName] = useState(null);
  const [computingId, setComputingId] = useState(null);
  const [email, setEmail] = useState(null);
  const [gradYear, setGradYear] = useState(null);
  const [photoUrl, setPhotoUrl] = useState("/cav-man.png");
  const [msg, setMsg] = useState("Loading...");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);

  const buildName = (row, user) => {
    const rowFirst = row?.first_name?.trim();
    const rowLast = row?.last_name?.trim();
    const fromRow = [rowFirst, rowLast].filter(Boolean).join(" ").trim();

    const metaFull = user?.user_metadata?.full_name?.trim();
    const metaFirst = user?.user_metadata?.first_name?.trim();
    const metaLast = user?.user_metadata?.last_name?.trim();
    const fromMeta = metaFull || [metaFirst, metaLast].filter(Boolean).join(" ").trim();

    const fromEmail = (user?.email || row?.email || "")
      .split("@")[0]
      .replace(/[._-]/g, " ")
      .trim();

    return fromRow || fromMeta || fromEmail || null;
  };

  // load data
  useEffect(() => {
    const run = async () => {
      setMsg("Fetching auth user...");
      setError("");

      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr) {
        setMsg(`Auth error: ${authErr.message}`);
        return;
      }
      if (!user) {
        setMsg("No user logged in.");
        return;
      }

      const { data: row, error: selectErr } = await supabase
        .from("users")
        .select("id, computing_id, email, grad_year, first_name, last_name, full_name, profile_picture")
        .eq("id", user.id)
        .maybeSingle();

      if (selectErr) {
        setMsg(`Users select error: ${selectErr.message}`);
        setEmail(user.email);
        setComputingId(user.user_metadata?.computing_id ?? null);
        setFullName(buildName(null, user));
        setGradYear(user.user_metadata?.grad_year ?? null);
        setPhotoUrl("/cav-man.png");
        return;
      }

      if (row) {
        setEmail(row.email ?? user.email);
        setComputingId(row.computing_id ?? user.user_metadata?.computing_id ?? null);
        setGradYear(row.grad_year ?? user.user_metadata?.grad_year ?? null);
        setFullName(row.full_name?.trim() || buildName(row, user));
        // ✅ use helper for photo
        setPhotoUrl(getProfilePhotoFromRow(row));
        setMsg("OK");
      } else {
        setEmail(user.email);
        setComputingId(user.user_metadata?.computing_id ?? null);
        setFullName(buildName(null, user));
        setGradYear(user.user_metadata?.grad_year ?? null);
        setPhotoUrl("/cav-man.png");
        setMsg("No row in users for this id.");
      }
    };

    run();
  }, []);

  // upload handler now becomes tiny
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    setMsg("Uploading avatar…");

    const { publicUrl, error } = await uploadProfilePhoto(file);

    if (error) {
      setUploading(false);
      setError(error.message ?? String(error));
      setMsg("Upload failed.");
      return;
    }

    setPhotoUrl(publicUrl || "/cav-man.png");
    setMsg("Avatar updated!");
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700 }}>My Profile</h1>
      <p style={{ marginTop: 8, fontSize: 16 }}>Here you can view and update your information.</p>

      <div style={{ padding: "40px", maxWidth: "850px", margin: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            {/* Profile picture + upload */}
            <div style={{ textAlign: "center" }}>
              <img
                src={photoUrl}
                alt="Profile"
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid #ccc",
                  background: "#fff",
                }}
                onError={() => setPhotoUrl("/cav-man.png")}
              />
              <label
                htmlFor="photoUpload"
                style={{
                  display: "block",
                  marginTop: "8px",
                  fontSize: "12px",
                  color: "#007bff",
                  cursor: uploading ? "not-allowed" : "pointer",
                  textDecoration: "underline",
                  opacity: uploading ? 0.6 : 1,
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
                style={{ display: "none" }}
                disabled={uploading}
              />
            </div>

            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#003e83" }}>
                {fullName ?? "—"}
              </div>
              <div style={{ fontSize: 14, color: "#54637a" }}>
                {email ?? "—"}
              </div>
            </div>
          </div>

        </div>
      </div>

      <div style={{ marginTop: 24, display: "grid", gap: 16, maxWidth: 500 }}>
        <div style={cardStyle}>
          <strong>Name:</strong> {fullName ?? "—"}
        </div>
         <div style={cardStyle}>
          <strong>Computing ID:</strong> {computingId ?? "—"}
        </div>
        <div style={cardStyle}>
          <strong>Email:</strong> {email ?? "—"}
        </div>
        <div style={cardStyle}>
          <strong>Graduation Year:</strong> {gradYear ?? "—"}
        </div>
        {!!error && (
          <div style={{ ...noteStyle, borderColor: "#ffd7d7", background: "#fff4f4", color: "#b00020" }}>
            {error}
          </div>
        )}
        <div style={noteStyle}>
          <small>
            Status:{" "}
            <span style={{ color: /error|fail|failed|upload/i.test(msg) ? "red" : "#4a5568" }}>
              {msg}
            </span>
          </small>
        </div>
      </div>

      <div style={{ marginTop: 32 }}>
        <Link to="/home" style={backLinkStyle}>
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

/* styles */
const containerStyle = {
  minHeight: "100vh",
  padding: "32px",
  boxSizing: "border-box",
  fontFamily: '"Montserrat",system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif',
  background: "#fff",
  color: "#003e83",
};
const cardStyle = {
  padding: "16px",
  borderRadius: 12,
  border: "1px solid #eef1f4",
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.06), 0 2px 4px -1px rgba(0,0,0,0.04)",
  background: "#fff",
  fontSize: 15,
};
const noteStyle = {
  padding: "8px 12px",
  borderRadius: 8,
  background: "#f7fafc",
  border: "1px dashed #e2e8f0",
  color: "#4a5568",
};
const backLinkStyle = {
  textDecoration: "none",
  color: "#003e83",
  fontWeight: 600,
};
