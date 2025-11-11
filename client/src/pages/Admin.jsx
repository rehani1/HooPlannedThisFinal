// src/pages/Admin.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdvisorManager from "../components/AdvisorManager";
import CouncilManager from "../components/CouncilManager";
import { supabase } from "../lib/supabaseClient";

export default function Admin() {
  const navigate = useNavigate();
  const [showAdvisorModal, setShowAdvisorModal] = useState(false);
  const [showCouncilModal, setShowCouncilModal] = useState(false);

  const [showEditCouncilModal, setShowEditCouncilModal] = useState(false);
  const [councilToEdit, setCouncilToEdit] = useState(null);

  const [councils, setCouncils] = useState([]);
  const [loadingCouncils, setLoadingCouncils] = useState(true);

  useEffect(() => {
    const ok = sessionStorage.getItem("admin_unlocked") === "1";
    if (!ok) navigate("/adminlogin", { replace: true });
  }, [navigate]);

  const loadCouncils = async () => {
    setLoadingCouncils(true);
    const { data, error } = await supabase
      .from("councils")
      .select(`
        grad_year,
        academic_year_fall,
        academic_year_spring,
        class_name,
        class_logo,
        advisor_id,
        advisor:advisor_id (
        advisor_id,
        advisor_first_name,
        advisor_last_name
      ),
      users (
      id, 
      first_name,
      last_name, 
      full_name, 
      email, 
      computing_id
      )
      `)
      .order("grad_year", { ascending: true });

    if (!error) setCouncils(data || []);
    setLoadingCouncils(false);
  };

  useEffect(() => {
    loadCouncils();
  }, []);

  const lock = () => {
    sessionStorage.removeItem("admin_unlocked");
    navigate("/home", { replace: true });
  };

  return (
    <div style={wrap}>
      <header style={topbar}>
        <h1 style={title}>Admin</h1>
        <button style={btnSecondary} onClick={lock}>
          Lock
        </button>
      </header>

      <main style={content}>
        <div style={card}>
          <h2 style={h2}>Dashboard</h2>
          <p>Welcome to the admin panel.</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
            <button style={btnPrimary} onClick={() => setShowAdvisorModal(true)}>
              Manage Advisors
            </button>
            <button style={btnPrimary} onClick={() => setShowCouncilModal(true)}>
              Manage Councils
            </button>
          </div>
        </div>

        <div style={{ ...card, marginTop: 16 }}>
          <h2 style={h2}>Councils</h2>
          {loadingCouncils ? (
            <p>Loading councils…</p>
          ) : councils.length === 0 ? (
            <p>No councils yet.</p>
          ) : (
            <div style={councilGrid}>
              {councils.map((c) => {
                const label = c.class_name?.name || "Unnamed council";
                const key = `${label}-${c.grad_year}`;
                const logoUrl = c.class_logo
                  ? supabase.storage.from("avatars").getPublicUrl(c.class_logo).data.publicUrl
                  : null;
                return (
                  <div key={key} style={councilBox}>
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt={label}
                        style={{
                          width: "100%",
                          maxHeight: 80,
                          objectFit: "contain",
                          marginBottom: 8,
                        }}
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    ) : null}
                    <div style={{ fontWeight: 700 }}>{label}</div>
                    <div style={{ fontSize: 13, color: "#4b5563" }}>
                      Grad year: {c.grad_year}
                    </div>
                    <div style={{ fontSize: 13, color: "#4b5563" }}>
                      Academic Year: {c.academic_year_fall || "—"}–{c.academic_year_spring || "—"}
                    </div>
                    <div style={{ fontSize: 13, color: "#4b5563", marginBottom: 8 }}>

                        {c.advisor
                        ? <>Advisor: {c.advisor.advisor_first_name} {c.advisor.advisor_last_name}</>
                        : <i>No advisor assigned</i>}
                    </div>
                    <div style={{ fontSize: 12, color: "#4b5563" }}>
                      Members:
                      {c.users && c.users.length > 0 ? (
                        <ul style={{ marginTop: 4, paddingLeft: 16 }}>
                          {c.users.map((u) => (
                            <li key={u.id}>
                              {u.full_name ||
                                `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() ||
                                u.email}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span> none</span>
                      )}
                    </div>
                    <button
                      style={btnSmall}
                      onClick={() => {
                        setCouncilToEdit(c);
                        setShowEditCouncilModal(true);
                      }}
                    >
                      Edit
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Advisor modal */}
      {showAdvisorModal && (
        <div style={modalBackdrop} onClick={() => setShowAdvisorModal(false)}>
          <div style={modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeader}>
              <h2 style={{ margin: 0 }}>Manage Advisors</h2>
              <button
                style={modalCloseBtn}
                onClick={() => {
                  setShowAdvisorModal(false);
                  loadCouncils();
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
              <AdvisorManager
                onChange={loadCouncils}
                onClose={() => {
                  setShowAdvisorModal(false);
                  loadCouncils();

                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Council create modal */}
      {showCouncilModal && (
        <div style={modalBackdrop} onClick={() => setShowCouncilModal(false)}>
          <div style={modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeader}>
              <h2 style={{ margin: 0 }}>Manage Councils</h2>
              <button style={modalCloseBtn} onClick={() => setShowCouncilModal(false)}>
                ✕
              </button>
            </div>
            <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
              <CouncilManager
                onClose={() => {
                  setShowCouncilModal(false);
                  loadCouncils();
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Council edit modal */}
      {showEditCouncilModal && councilToEdit && (
        <div style={modalBackdrop} onClick={() => setShowEditCouncilModal(false)}>
          <div style={modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeader}>
              <h2 style={{ margin: 0 }}>Edit Council</h2>
              <button style={modalCloseBtn} onClick={() => setShowEditCouncilModal(false)}>
                ✕
              </button>
            </div>
            <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
              <CouncilManager
                mode="edit"
                initialCouncil={councilToEdit}
                onClose={() => {
                  setShowEditCouncilModal(false);
                  setCouncilToEdit(null);
                  loadCouncils();

                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// /* styles */
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
  borderRadius: 9999,
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
  marginBottom: 16,
};
const h2 = { margin: "0 0 12px", fontSize: 22, fontWeight: 800, color: "#003e83" };
const btnPrimary = {
  background: "#003e83",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "10px 14px",
  fontWeight: 600,
  cursor: "pointer",
  marginTop: 0,
};
const councilGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 12,
};
const councilBox = {
  border: "1px solid #eef1f4",
  borderRadius: 10,
  padding: 12,
  background: "#fff",
  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
};
const btnSmall = {
  background: "#fff",
  color: "#003e83",
  border: "1px solid #d7dce2",
  borderRadius: 6,
  padding: "4px 8px",
  fontSize: 12,
  cursor: "pointer",
};

const modalBackdrop = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.3)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};
const modalContent = {
  background: "#fff",
  borderRadius: 12,
  width: "min(1000px, 95%)",
  boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
  padding: 16,
  display: "flex",
  flexDirection: "column",
  gap: 16,
};
const modalHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: "1px solid #eef1f4",
  paddingBottom: 10,
};
const modalCloseBtn = {
  background: "transparent",
  border: "none",
  fontSize: 20,
  cursor: "pointer",
  lineHeight: 1,
};
