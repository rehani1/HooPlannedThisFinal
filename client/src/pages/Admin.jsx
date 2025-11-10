// src/pages/Admin.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdvisorManager from "../components/AdvisorManager";
import CouncilManager from "../components/CouncilManager";

export default function Admin() {
  const navigate = useNavigate();
  const [showAdvisorModal, setShowAdvisorModal] = useState(false);
  const [showCouncilModal, setShowCouncilModal] = useState(false);

  // check admin lock on mount
  useEffect(() => {
    const ok = sessionStorage.getItem("admin_unlocked") === "1";
    if (!ok) navigate("/adminlogin", { replace: true });
  }, [navigate]);

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
          <button
            style={btnPrimary}
            onClick={() => setShowAdvisorModal(true)}
          >
            Manage Advisors
          </button>
            <button

            style={{ ...btnPrimary, marginLeft: 8 }}
            onClick={() => setShowCouncilModal(true)}
          >
            Manage Councils
          </button>
        </div>
      </main>

      {/* Modal for Manage Advisors */}
      {showAdvisorModal && (
        <div style={modalBackdrop} onClick={() => setShowAdvisorModal(false)}>
          <div
            style={modalContent}
            onClick={(e) => e.stopPropagation()} // stop close on inner click
          >
            <div style={modalHeader}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
                Manage Advisors
              </h2>
              <button
                onClick={() => setShowAdvisorModal(false)}
                style={modalCloseBtn}
              >
                ✕
              </button>
            </div>
            <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
              <AdvisorManager onClose={() => setShowAdvisorModal(false)} />
            </div>
          </div>
        </div>
      )}

        {showCouncilModal && (
        <div style={modalBackdrop} onClick={() => setShowCouncilModal(false)}>
          <div
            style={modalContent}
            onClick={(e) => e.stopPropagation()} // stop close on inner click
          >
            <div style={modalHeader}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
                Manage Advisors
              </h2>
              <button
                onClick={() => setShowCouncilModal(false)}
                style={modalCloseBtn}
              >
                ✕
              </button>
            </div>
            <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
              <CouncilManager onClose={() => setShowCouncilModal(false)} />
            </div>
          </div>
        </div>

      )}
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
  marginTop: 12,
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


