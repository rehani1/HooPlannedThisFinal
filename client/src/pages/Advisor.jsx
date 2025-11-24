// src/pages/Advisor.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { getAdvisorPhotoFromRow } from "../lib/profilePhoto";
import Sidebar from "../components/sidebar";

export default function Advisor() {
  const [advisors, setAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdvisors = async () => {
      const { data, error } = await supabase
        .from("advisors")
        .select(`
          advisor_id,
          advisor_first_name,
          advisor_last_name,
          advisor_email,
          advisor_number,
          advisor_building,
          advisor_address,
          advisor_profile_picture,
          advisor_role
        `)
        .order("advisor_id", { ascending: true });

      if (!error) setAdvisors(data || []);
      setLoading(false);
    };

    fetchAdvisors();
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc", color: "#1e293b" }}>
      <Sidebar />

      <div style={{ flex: 1, padding: "48px", position: "relative" }}>
        <header style={heroHeader}>
          <div>
            <p style={eyebrow}>Meet the team</p>
            <h1 style={heroTitle}>Advisors</h1>
            <p style={{ margin: "6px 0 0", color: "#475569" }}>
              Guidance and support from our council advisors.
            </p>
          </div>
          <Link to="/home" style={homeBtn}>← Back to Home</Link>
        </header>

        {loading ? (
          <div style={{ color: "#475569", marginTop: 12 }}>Loading advisors…</div>
        ) : advisors.length === 0 ? (
          <div style={{ color: "#475569", marginTop: 12 }}>No advisors yet.</div>
        ) : (
          <div style={cardsGrid}>
            {advisors.map((a) => {
              const photoUrl = getAdvisorPhotoFromRow(a);
              const roleText = Array.isArray(a.advisor_role)
                ? a.advisor_role.join(", ")
                : a.advisor_role || "";
              return (
                <article key={a.advisor_id} style={card}>
                  <div style={cardTop}>
                    <img
                      src={photoUrl}
                      alt={`${a.advisor_first_name} ${a.advisor_last_name}`}
                      style={avatar}
                      onError={(e) => {
                        e.currentTarget.src = "/cav_man.png";
                      }}
                    />
                  </div>

                  <div style={{ textAlign: "center" }}>
                    <div style={nameText}>
                      {a.advisor_first_name} {a.advisor_last_name}
                    </div>
                    {roleText ? <div style={roleLine}>{roleText}</div> : null}
                    <div style={metaText}>{a.advisor_building || "—"}</div>
                  </div>

                  <div style={infoRow}>
                    <span style={label}>Email</span>
                    <span style={value}>{a.advisor_email || "—"}</span>
                  </div>
                  <div style={infoRow}>
                    <span style={label}>Phone</span>
                    <span style={value}>{a.advisor_number || "—"}</span>
                  </div>
                  <div style={infoRow}>
                    <span style={label}>Address</span>
                    <span style={value}>{a.advisor_address || "—"}</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const heroHeader = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 20,
};

const eyebrow = {
  textTransform: "uppercase",
  letterSpacing: 0.8,
  fontWeight: 800,
  fontSize: 12,
  color: "#f97316",
  margin: 0,
};

const heroTitle = { margin: "4px 0", fontSize: 36, fontWeight: 900, color: "#0f172a" };

const homeBtn = {
  background: "#fff",
  color: "#0f52ba",
  border: "1px solid #d7dce2",
  padding: "10px 14px",
  borderRadius: 10,
  fontWeight: 700,
  textDecoration: "none",
};

const cardsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 16,
  marginTop: 8,
};

const card = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  padding: 16,
  boxShadow: "0 14px 30px rgba(0,0,0,0.08)",
  display: "grid",
  gap: 10,
  alignContent: "start",
};

const cardTop = { display: "grid", justifyItems: "center", gap: 10, position: "relative", paddingTop: 12 };

const avatar = {
  width: 96,
  height: 96,
  borderRadius: "50%",
  objectFit: "cover",
  background: "#eef2f7",
  border: "2px solid #d7dce2",
};

const nameText = { fontSize: 18, fontWeight: 900, color: "#0f172a" };
const roleLine = { fontSize: 13, color: "#0f172a", fontWeight: 800, marginTop: 4 };
const metaText = { fontSize: 13, color: "#475569", fontWeight: 600, marginTop: 2 };

const infoRow = {
  display: "flex",
  justifyContent: "space-between",
  color: "#0f172a",
  fontWeight: 700,
  background: "#f8fafc",
  borderRadius: 10,
  padding: "8px 10px",
  border: "1px solid #e2e8f0",
};

const label = { color: "#475569", fontWeight: 700, fontSize: 13 };
const value = { color: "#0f172a", fontWeight: 800, fontSize: 14 };
