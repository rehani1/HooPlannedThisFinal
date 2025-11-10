import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { getProfilePhotoFromRow } from "../lib/profilePhoto";
import Sidebar from "../components/sidebar";

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
      <Sidebar />

      {/* Main content */}
      <main style={{ flex: 1, padding: "48px", position: "relative" }}>
        <h1 style={{ fontSize: "36px", fontWeight: "900", color: "#1e3a8a" }}>
          Welcome to HooPlannedThis!
        </h1>

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

const avatarContainerStyle = {
  position: "fixed",
  bottom: "700px",
  left: "1300px",
  zIndex: 1000,
  textDecoration: "none",
};
