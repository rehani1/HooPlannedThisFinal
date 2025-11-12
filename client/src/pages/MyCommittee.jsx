// src/pages/MyCommittee.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { getProfilePhotoFromRow } from "../lib/profilePhoto";
import { Link } from "react-router-dom";

export default function MyCommittee() {
  const [me, setMe] = useState(null);                // current user (row from `users`)
  const [committee, setCommittee] = useState(null);  // row from `committees`
  const [members, setMembers] = useState([]);        // all `users` in same committee
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setErr("");

        // 1) who is signed in?
        const {
          data: { user },
          error: authErr,
        } = await supabase.auth.getUser();
        if (authErr) throw authErr;
        if (!user) throw new Error("Not signed in.");

        // 2) fetch their row from `users`
        const { data: meRow, error: meErr } = await supabase
          .from("users")
          .select(
            "id, email, full_name, first_name, last_name, role, grad_year, committee_id, profile_picture, phone_number"
          )
          .eq("id", user.id)
          .single();
        if (meErr) throw meErr;
        if (cancelled) return;
        setMe(meRow);

        // not in a committee yet
        if (!meRow?.committee_id) {
          setCommittee(null);
          setMembers([]);
          return;
        }

        // 3) load committee
        const { data: cRow, error: cErr } = await supabase
          .from("committees")
          .select(
            "committee_id, committee_name, committee_budget, grad_year, created_at"
          )
          .eq("committee_id", meRow.committee_id)
          .single();
        if (cErr) throw cErr;
        if (cancelled) return;
        setCommittee(cRow);

        // 4) load members of the same committee
        const { data: mRows, error: mErr } = await supabase
          .from("users")
          .select(
            "id, first_name, last_name, full_name, role, profile_picture, grad_year, phone_number"
          )
          .eq("committee_id", meRow.committee_id)
          .order("last_name", { ascending: true });
        if (mErr) throw mErr;
        if (cancelled) return;

        setMembers(mRows || []);
      } catch (e) {
        console.error(e);
        setErr(e.message || "Failed to load committee.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // ——— UI states ———
  if (loading) {
    return (
      <div style={pageWrap}>
        <h2 style={{ color: "#0e2a47" }}>Loading your committee…</h2>
      </div>
    );
  }

  if (err) {
    return (
      <div style={pageWrap}>
        <h2 style={{ color: "#b91c1c" }}>Error</h2>
        <p style={{ color: "#6b7280" }}>{err}</p>
      </div>
    );
  }

  if (!me?.committee_id) {
    return (
      <div style={pageWrap}>
        <h2 style={{ color: "#0e2a47" }}>No committee assigned</h2>
        <p style={{ color: "#555" }}>
          Your profile isn’t linked to a committee yet. Ask an admin to set your{" "}
          <code>users.committee_id</code>.
        </p>
        <div style={{ marginTop: 24 }}>
          <Link to="/home" style={backLinkStyle}>← Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={pageWrap}>
      <header style={header}>
        <div>
          <h1 style={title}>{committee?.committee_name || "My Committee"}</h1>
          <p style={{ color: "#64748b", marginTop: 6 }}>
            {members.length} member{members.length !== 1 ? "s" : ""} · Grad year{" "}
            {committee?.grad_year ?? "—"}
            {" · Budget: "}
            {committee?.committee_budget != null ? `$${committee.committee_budget}` : "—"}
          </p>
        </div>

        <div style={meBox}>
          <img
            src={getProfilePhotoFromRow(me)}
            alt=""
            width={48}
            height={48}
            style={{ borderRadius: "9999px", objectFit: "cover", background: "#eef2f7" }}
            onError={(e) => {
              e.currentTarget.src = "/cav_man.png";
            }}
          />
          <div>
            <div style={{ fontWeight: 600, color: "#0e2a47" }}>
              {me.first_name || me.last_name
                ? `${me.first_name ?? ""} ${me.last_name ?? ""}`.trim()
                : me.full_name || "You"}
            </div>
            <div style={{ fontSize: 12, color: "#475569" }}>
              Role: {me.role || "Member"}
            </div>
          </div>
        </div>
      </header>

      <section style={memberGrid}>
        {members.map((m) => (
          <div key={m.id} style={memberCard}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img
                src={getProfilePhotoFromRow(m)}
                alt=""
                width={48}
                height={48}
                style={{ borderRadius: "9999px", objectFit: "cover", background: "#eef2f7" }}
                onError={(e) => {
                  e.currentTarget.src = "/cav_man.png";
                }}
              />
              <div>
                <div style={memberName}>
                  {m.first_name || m.full_name
                    ? `${m.first_name ?? ""} ${m.last_name ?? ""}`.trim()
                    : m.full_name || "Unnamed User"}
                </div>
                <div style={memberRole}>{m.role || "Member"}</div>
                <div style={{ fontSize: 12, color: "#475569" }}>
                  Contact: {m.phone_number || "No phone number stored"}
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Back link INSIDE the page wrapper */}
      <div style={{ marginTop: 32 }}>
        <Link to="/home" style={backLinkStyle}>
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

// ——— Styles ———
const pageWrap = {
  padding: "40px 60px",
  fontFamily: "system-ui, sans-serif",
  backgroundColor: "#f8fafc",
  minHeight: "100vh",
};

const header = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  borderBottom: "2px solid #e2e8f0",
  marginBottom: 20,
  paddingBottom: 12,
  gap: 20,
  flexWrap: "wrap",
};

const title = { fontSize: 28, color: "#0e2a47", margin: 0 };

const meBox = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  background: "#e2e8f0",
  padding: "8px 12px",
  borderRadius: 12,
};

const memberGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
  gap: 16,
};

const memberCard = {
  backgroundColor: "white",
  padding: 16,
  borderRadius: 12,
  boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
};

const memberName = { fontSize: 16, fontWeight: 600, color: "#0e2a47" };
const memberRole = { fontSize: 14, color: "#475569", marginTop: 2 };

const backLinkStyle = {
  textDecoration: "none",
  color: "#0e2a47",
  fontWeight: 600,
};
