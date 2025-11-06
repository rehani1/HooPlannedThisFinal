// src/pages/Login.jsx
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const COLORS = {
  orange: "#ff8937",
  navy: "#003e83",
  navy90: "#00408d",
  gray100: "#f5f7fa",
  gray200: "#eef1f4",
  gray300: "#d7dce2",
  white: "#ffffff",
};

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily:
      '"Montserrat", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
    padding: "40px 24px",
    background: COLORS.white,
    boxSizing: "border-box",
  },
  container: {
    display: "flex",
    gap: 96,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    maxWidth: 1280,
  },
  left: { flex: "0 0 520px" },
  right: { flex: "0 0 600px" },

  brandRow: { display: "flex", alignItems: "center", gap: 16 },
  calendarIcon: { width: 48, height: 48, flexShrink: 0 },
  brandTitle: { margin: 0, fontWeight: 800, fontSize: 48, color: COLORS.navy },
  tagline: { marginTop: 18, color: COLORS.navy, fontSize: 18, lineHeight: 1.6 },

  card: {
    background: COLORS.white,
    borderRadius: 12,
    padding: 40,
    border: `1px solid ${COLORS.gray200}`,
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.06), 0 2px 4px -1px rgba(0,0,0,0.04)",
    width: "100%",
    maxWidth: 420,
  },
  cardTitle: { margin: "0 0 28px", textAlign: "center", color: COLORS.navy, fontWeight: 700, fontSize: 28 },

  label: { display: "block", marginBottom: 12, color: COLORS.navy, fontWeight: 600, fontSize: 18 },
  input: {
    width: "100%", height: 48, borderRadius: 8,
    border: `1px solid ${COLORS.gray300}`, background: COLORS.white,
    padding: "0 16px", fontSize: 16, outline: "none",
  },
  inputWrapper: { position: "relative", marginBottom: 20 },
  rightIconBtn: {
    position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
    width: 28, height: 28, display: "grid", placeItems: "center",
    borderRadius: 6, border: `1px solid ${COLORS.gray200}`, background: COLORS.white, cursor: "pointer",
  },

  primaryBtn: {
    width: "100%", height: 48, border: "none", borderRadius: 9999,
    background: COLORS.navy, color: COLORS.white, fontSize: 16, fontWeight: 500,
  },
  linkRow: { textAlign: "center", marginTop: 12, color: COLORS.navy90, fontSize: 14 },

  error: { color: "crimson", marginBottom: 12, minHeight: 20 },
};

const CalendarSVG = (props) => (
  <svg viewBox="0 0 24 24" {...props}>
    <rect x="3" y="4" width="18" height="17" rx="3" fill={COLORS.orange} />
    <rect x="6" y="3" width="2" height="4" rx="1" fill={COLORS.white} />
    <rect x="16" y="3" width="2" height="4" rx="1" fill={COLORS.white} />
    <rect x="6" y="10" width="3" height="3" rx="1" fill={COLORS.white} />
    <rect x="10.5" y="10" width="3" height="3" rx="1" fill={COLORS.white} />
    <rect x="15" y="10" width="3" height="3" rx="1" fill={COLORS.white} />
    <rect x="6" y="14.5" width="3" height="3" rx="1" fill={COLORS.white} />
    <rect x="10.5" y="14.5" width="3" height="3" rx="1" fill={COLORS.white} />
    <rect x="15" y="14.5" width="3" height="3" rx="1" fill={COLORS.white} />
  </svg>
);

const EyeSVG = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" {...props}>
    <path d="M1.5 12s3.5-6 10.5-6 10.5 6 10.5 6-3.5 6-10.5 6S1.5 12 1.5 12Z" fill="none" stroke={COLORS.navy} strokeWidth="1.6" />
    <circle cx="12" cy="12" r="3" fill="none" stroke={COLORS.navy} strokeWidth="1.6" />
    <line x1="4" y1="20" x2="20" y2="4" stroke={COLORS.navy} strokeWidth="1.6" />
  </svg>
);

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) {
      setError(error.message || "Login failed");
      return;
    }
    navigate("/home", { replace: true });
  };

  const gotoRequest = () => navigate("/request-account");

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Left: Brand */}
        <div style={styles.left}>
          <div style={styles.brandRow}>
            <CalendarSVG style={styles.calendarIcon} />
            <h1 style={styles.brandTitle}>HooPlannedThis</h1>
          </div>
          <p style={styles.tagline}>
            Welcome to HooPlannedThis.
            <br />
            Log in to coordinate your class events effortlessly.
          </p>
        </div>

        {/* Right: Login Card */}
        <div style={styles.right}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Login</h2>

            <form onSubmit={handleSubmit}>
              <label htmlFor="email" style={styles.label}>Email</label>
              <div style={styles.inputWrapper}>
                <input
                  id="email"
                  type="email"
                  placeholder="you@school.edu"
                  style={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <label htmlFor="password" style={styles.label}>Password</label>
              <div style={styles.inputWrapper}>
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  placeholder="Enter your password"
                  style={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  style={styles.rightIconBtn}
                  onClick={() => setShowPw((s) => !s)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  <EyeSVG />
                </button>
              </div>

              <div style={styles.error}>{error}</div>

              <button type="submit" style={styles.primaryBtn} disabled={loading}>
                {loading ? "Logging in…" : "Log In"}
              </button>
            </form>

            {/*<div style={styles.linkRow}>*/}
            {/*  New here? <Link to="/register">Create an account</Link>*/}
            {/*</div>*/}
              <div style={{ marginTop: 16 }}>
                <Link to="/register" style={{ textDecoration: "none" }}>
                <button
                  type="button"
                  style={{
                    ...styles.primaryBtn,
                    width: "100%",
                    marginTop: 8,
                    background: COLORS.orange,
                    color: COLORS.white,
                    fontWeight: 600,
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.06), 0 2px 4px -1px rgba(0,0,0,0.04)",
                    transition: "background 0.2s ease",
                    cursor: "pointer",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = "#ff9a50")}
                  onMouseOut={(e) => (e.currentTarget.style.background = COLORS.orange)}
                >
                  Create an Account
                </button>
              </Link>
            </div>


            {/*<div style={styles.linkRow}>*/}
            {/*  <button type="button" style={{ ...styles.primaryBtn, background: "transparent", color: COLORS.navy, border: `2px solid ${COLORS.navy}` }} onClick={gotoRequest}>*/}
            {/*    Request a New Account*/}
            {/*  </button>*/}
            {/*</div>*/}

          </div>
        </div>
      </div>
    </div>
  );
}
