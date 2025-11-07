import React from "react";
import { useNavigate, Link } from "react-router-dom";

const ADMIN_PASSWORD = "admin"; // ← change me

export default function AdminLogin() {
  const navigate = useNavigate();
  const [pw, setPw] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // simple client-side check (demo only)
    setTimeout(() => {
      if (pw === ADMIN_PASSWORD) {
        sessionStorage.setItem("admin_unlocked", "1");
        navigate("/admin", { replace: true });
      } else {
        setError("Incorrect password.");
      }
      setLoading(false);
    }, 200);
  };

  return (
    <div style={page}>
      <div style={card}>
        <h1 style={title}>admin</h1>
        <p style={sub}>Enter the admin password to continue.</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="adminPw" style={label}>Password</label>
          <input
            id="adminPw"
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            style={input}
            placeholder="••••••••"
            autoFocus
          />
          <div style={error ? err : ok}>{error || "\u00A0"}</div>

          <button type="submit" style={btnPrimary} disabled={loading}>
            {loading ? "Checking…" : "Unlock"}
          </button>
        </form>

        <div style={linkRow}>
          <Link to="/home" style={a}>← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

/* styles */
const page = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  background: "#ffffff",
  fontFamily:
    '"Montserrat", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
  padding: 24,
  boxSizing: "border-box",
};
const card = {
  width: "100%",
  maxWidth: 420,
  padding: 24,
  border: "1px solid #eef1f4",
  borderRadius: 12,
  background: "#fff",
  boxShadow:
    "0 4px 6px -1px rgba(0,0,0,0.06), 0 2px 4px -1px rgba(0,0,0,0.04)",
};
const title = { margin: 0, fontWeight: 800, fontSize: 24, color: "#003e83" };
const sub = { marginTop: 8, color: "#003e83", opacity: 0.8 };
const label = {
  display: "block",
  margin: "16px 0 8px",
  color: "#003e83",
  fontWeight: 600,
};
const input = {
  width: "100%",
  height: 44,
  borderRadius: 8,
  border: "1px solid #d7dce2",
  padding: "0 12px",
  fontSize: 16,
  outline: "none",
  background: "#fff",
};
const btnPrimary = {
  marginTop: 16,
  width: "100%",
  height: 44,
  borderRadius: 9999,
  border: "none",
  background: "#003e83",
  color: "#fff",
  fontWeight: 600,
  fontSize: 16,
  cursor: "pointer",
};
const err = { color: "crimson", minHeight: 18, marginTop: 8 };
const ok = { color: "transparent", minHeight: 18, marginTop: 8 };
const linkRow = { marginTop: 12, textAlign: "center" };
const a = { color: "#003e83", textDecoration: "none", fontWeight: 600 };
