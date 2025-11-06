import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { getProfilePhotoFromRow } from "../lib/profilePhoto";

export default function Home() {
  const [photoUrl, setPhotoUrl] = useState("/cav_man.png");

  useEffect(() => {
    const loadAvatar = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: row, error } = await supabase
        .from("users")
        .select("profile_picture")
        .eq("id", user.id)
        .maybeSingle();

      if (!error && row) {
        setPhotoUrl(getProfilePhotoFromRow(row));
      } else {
        setPhotoUrl("/cav_man.png");
      }
    };

    loadAvatar();
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc", color: "#1e293b" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: "240px",
          backgroundColor: "#0e2a47",
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ padding: "24px", fontSize: "20px", fontWeight: "bold" }}>Navigation</div>
          <nav style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "0 16px" }}>
            <Link to="/home" style={navButton}>
              Home
            </Link>
            <button style={navButton}>Class Council</button>
            <Link to="/events" style={navButton}>
              Events
            </Link>
            <Link to="/advisor" style={navButton}>
              Advisors
            </Link>
          </nav>
        </div>

        <div style={{ padding: "16px" }}>
          <div style={{ fontWeight: "bold", marginBottom: "8px", opacity: 0.9 }}>Settings</div>
          <Link to="/admin" style={navButton}>
            Admin
          </Link>
          <Link to="/login" style={navButton}>
            Log Out
          </Link>
          <Link to="/profile" style={navButton}>
            Profile
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: "48px", position: "relative" }}>
        <h1 style={{ fontSize: "36px", fontWeight: "900", color: "#1e3a8a" }}>Welcome to HooPlannedThis!</h1>

        {/* Floating avatar */}
        <Link to="/profile" style={avatarContainerStyle}>
          <img
            src={photoUrl}
            alt="User avatar"
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              border: "2px solid #003e83",
              objectFit: "cover",
              backgroundColor: "#fff",
              boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "scale(1.08)";
              e.currentTarget.style.boxShadow = "0 6px 14px rgba(0,0,0,0.3)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.2)";
            }}
            onError={() => setPhotoUrl("/cav_man.png")}
          />
        </Link>
      </main>
    </div>
  );
}

/* styles */
const navButton = {
  backgroundColor: "transparent",
  color: "white",
  border: "none",
  textAlign: "left",
  padding: "12px 16px",
  borderRadius: "8px",
  fontSize: "16px",
  cursor: "pointer",
  transition: "background 0.2s",
};

const avatarContainerStyle = {
  position: "fixed",
  bottom: "700px",
  left: "1300px",
  zIndex: 1000,
  textDecoration: "none",
};
