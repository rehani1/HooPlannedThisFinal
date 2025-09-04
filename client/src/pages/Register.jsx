// src/pages/Register.jsx
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
  page: { minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:'"Montserrat", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif', padding:"40px 24px", background: COLORS.white, boxSizing:"border-box" },
  container: { display:"flex", gap:96, alignItems:"center", justifyContent:"center", width:"100%", maxWidth:1280 },
  left: { flex:"0 0 520px" }, right: { flex:"0 0 600px" },
  brandRow: { display:"flex", alignItems:"center", gap:16 },
  calendarIcon: { width:48, height:48, flexShrink:0 },
  brandTitle: { margin:0, fontWeight:800, fontSize:48, color:COLORS.navy },
  tagline: { marginTop:18, color:COLORS.navy, fontSize:18, lineHeight:1.6 },
  card: { background:COLORS.white, borderRadius:12, padding:40, border:`1px solid ${COLORS.gray200}`, boxShadow:"0 4px 6px -1px rgba(0,0,0,0.06), 0 2px 4px -1px rgba(0,0,0,0.04)", width:"100%", maxWidth:420 },
  cardTitle: { margin:"0 0 28px", textAlign:"center", color:COLORS.navy, fontWeight:700, fontSize:28 },
  label: { display:"block", marginBottom:12, color:COLORS.navy, fontWeight:600, fontSize:18 },
  input: { width:"100%", height:48, borderRadius:8, border:`1px solid ${COLORS.gray300}`, background:COLORS.white, padding:"0 16px", fontSize:16, outline:"none" },
  inputWrapper: { position:"relative", marginBottom:20 },
  rightIconBtn: { position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", width:28, height:28, display:"grid", placeItems:"center", borderRadius:6, border:`1px solid ${COLORS.gray200}`, background:COLORS.white, cursor:"pointer" },
  primaryBtn: { width:"100%", height:48, border:"none", borderRadius:9999, background:COLORS.navy, color:COLORS.white, fontSize:16, fontWeight:500 },
  linkRow: { textAlign:"center", marginTop:12, color:COLORS.navy90, fontSize:14 },
  error: { color:"crimson", marginBottom:12, minHeight:20 },
  success: { color:"green", marginBottom:12, minHeight:20 },
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

export default function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = React.useState("");           // ✅ missing before
  const [firstName, setFirstName] = React.useState("");   // ✅ fixed name
  const [lastName, setLastName] = React.useState("");     // optional
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [gradYear, setGradYear] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    const y = Number(gradYear);
    if (!/^\d{4}$/.test(gradYear) || y < 1900 || y > 2100) {
      setError("Enter a valid 4-digit graduation year (e.g., 2027).");
      return;
    }

    setLoading(true);
    const { data, error: signErr } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // store extras in auth user_metadata
        data: { grad_year: y, first_name: firstName, last_name: lastName || null },
        emailRedirectTo: window.location.origin + "/login",
      },
    });
    setLoading(false);

    if (signErr) {                          // ✅ was checking wrong var
      setError(signErr.message || "Registration failed");
      return;
    }

    // If email confirmations are enabled: user exists but no session yet
    if (data?.user && !data?.session) {
      setSuccess("Check your email to confirm your account, then log in.");
      return;
    }

    // If confirmations are disabled: we may have a session → upsert to your users table
    const user = data?.user;
    if (user) {
      await supabase.from("users").upsert(
        {
          id: user.id,
          email: user.email,
          full_name: [firstName, lastName].filter(Boolean).join(" "),
          grad_year: y,
        },
        { onConflict: "id" }
      );
      navigate("/home", { replace: true });
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.left}>
          <div style={styles.brandRow}>
            <CalendarSVG style={styles.calendarIcon} />
            <h1 style={styles.brandTitle}>HooPlannedThis</h1>
          </div>
          <p style={styles.tagline}>
            Create your account to coordinate class events effortlessly.
          </p>
        </div>

        <div style={styles.right}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Create account</h2>

            <form onSubmit={handleSubmit}>

            <label htmlFor="firstName" style={styles.label}>First Name</label>
              <div style={styles.inputWrapper}>
                <input
                  id="firstName"
                  type="text"
                  placeholder="First Name"
                  style={styles.input}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>

              
              <label htmlFor="lastName" style={styles.label}>Last Name</label>
              <div style={styles.inputWrapper}>
                <input
                  id="lastName"
                  type="text"
                  placeholder="Last Name"
                  style={styles.input}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>


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
                  placeholder="Create a password"
                  style={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
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

              <label htmlFor="confirm" style={styles.label}>Confirm password</label>
              <div style={styles.inputWrapper}>
                <input
                  id="confirm"
                  type={showPw ? "text" : "password"}
                  placeholder="Re-enter your password"
                  style={styles.input}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>

              <label htmlFor="gradYear" style={styles.label}>Graduation year</label>
              <div style={styles.inputWrapper}>
                <input
                  id="gradYear"
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g., 2027"
                  maxLength={4}
                  pattern="\d{4}"
                  style={styles.input}
                  value={gradYear}
                  onChange={(e) => setGradYear(e.target.value.replace(/\D/g, ""))}
                  required
                />
              </div>

              
             

              <div style={styles.error}>{error}</div>
              <div style={styles.success}>{success}</div>

              <button type="submit" style={styles.primaryBtn} disabled={loading}>
                {loading ? "Creating…" : "Create account"}
              </button>
            </form>

            <div style={styles.linkRow}>
              Already have an account? <Link to="/login">Log in</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
