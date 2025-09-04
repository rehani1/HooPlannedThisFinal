import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const navigate = useNavigate();

  useEffect(() => {
    const ok = sessionStorage.getItem("admin_unlocked") === "1";
    if (!ok) navigate("/adminlogin", { replace: true });
  }, [navigate]);

  const lock = () => {
    sessionStorage.removeItem("admin_unlocked");
    navigate("/adminlogin", { replace: true });
  };

  return (
    <div style={wrap}>
      <header style={topbar}>
        <h1 style={title}>admin</h1>
        <button style={btnSecondary} onClick={lock}>Lock</button>
      </header>

      <main style={content}>
        {/* Put your admin content here (tables, cards, etc.) */}
        <div style={card}>
          <h2 style={h2}>Dashboard</h2>
          <p>Welcome to the admin panel.</p>
        </div>
      </main>
    </div>
  );
}

/* styles */
const wrap = {
  minHeight: "100vh",
  background: "#ffffff",
  display: "grid",
  gridTemplateRows: "56px 1fr",
  fontFamily:
    '"Montserrat", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
};
const topbar = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 16px",
  borderBottom: "1px solid #eef1f4",
  background: "#ffffff",
};
const title = { margin: 0, fontWeight: 800, fontSize: 24, color: "#003e83" };
const btnSecondary = {
  border: "1px solid #eef1f4",
  background: "#ffffff",
  color: "#003e83",
  padding: "8px 12px",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 700,
};
const content = { padding: 16, maxWidth: 1200, margin: "0 auto", width: "100%" };
const card = {
  padding: 16,
  border: "1px solid #eef1f4",
  borderRadius: 12,
  boxShadow:
    "0 4px 6px -1px rgba(0,0,0,0.06), 0 2px 4px -1px rgba(0,0,0,0.04)",
  background: "#fff",
};
const h2 = { margin: "0 0 12px", fontSize: 22, fontWeight: 800, color: "#003e83" };
