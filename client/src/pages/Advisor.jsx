// src/pages/Advisor.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

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
    <div style={containerStyle}>
      <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700 }}>Advisors</h1>
      <p style={{ marginTop: 8, fontSize: 16 }}>
        Meet the advisors who support our Class Council.
      </p>

      {loading ? (
        <p>Loading advisors…</p>
      ) : (
        <div style={{ marginTop: 24, display: "grid", gap: 16, maxWidth: 700 }}>
          {advisors.map((a) => (
            <div key={a.advisor_id} style={cardStyle}>
              <div style={{ display: "flex", gap: 16 }}>
                <img
                  src={
                    a.advisor_profile_picture ||
                    "https://avatar.iran.liara.run/public"
                  }
                  alt={`${a.advisor_first_name} ${a.advisor_last_name}`}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid #eef1f4",
                  }}
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://avatar.iran.liara.run/public";
                  }}
                />
                <div>
                  <strong>
                    {a.advisor_first_name} {a.advisor_last_name}
                  </strong>
                  {a.advisor_role ? (
                    <>
                      {" "}
                      • <em>{a.advisor_role}</em>
                    </>
                  ) : null}
                  <br />
                  <strong>Email:</strong> {a.advisor_email || "—"}
                  <br />
                  <strong>Phone:</strong> {a.advisor_number || "—"}
                  <br />
                  <strong>Building:</strong> {a.advisor_building || "—"}
                  <br />
                  <strong>Address:</strong> {a.advisor_address || "—"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 32 }}>
        <Link to="/home" style={backLinkStyle}>
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

const containerStyle = {
  minHeight: "100vh",
  padding: "32px",
  boxSizing: "border-box",
  fontFamily:
    '"Montserrat", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
  background: "#ffffff",
  color: "#003e83",
};
const cardStyle = {
  padding: "16px",
  borderRadius: 12,
  border: "1px solid #eef1f4",
  boxShadow:
    "0 4px 6px -1px rgba(0,0,0,0.06), 0 2px 4px -1px rgba(0,0,0,0.04)",
  background: "#ffffff",
  fontSize: 15,
  lineHeight: 1.5,
};
const backLinkStyle = {
  textDecoration: "none",
  color: "#003e83",
  fontWeight: 600,
};

