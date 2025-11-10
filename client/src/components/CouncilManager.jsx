// src/components/CouncilManager.jsx
import React from "react";

export default function CouncilManager({ onClose }) {
  return (
    <div style={wrap}>
      <h3 style={{ marginTop: 0, marginBottom: 8 }}>Councils</h3>
      <p style={{ marginBottom: 16 }}>
        This is a placeholder for managing councils. You can add forms or tables here later.
      </p>
      {onClose && (
        <button onClick={onClose} style={btn}>
          Close
        </button>
      )}
    </div>
  );
}

const wrap = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  fontFamily:
    '"Montserrat", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
  color: "#003e83",
};

const btn = {
  alignSelf: "flex-end",
  background: "#003e83",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "8px 12px",
  fontWeight: 600,
  cursor: "pointer",
};
