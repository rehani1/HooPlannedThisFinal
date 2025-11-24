import React from "react";
import { NavLink } from "react-router-dom";
import { FaCalendarAlt, FaCog, FaSignOutAlt } from "react-icons/fa";

export default function Sidebar() {
  return (
    <aside
      style={{
        width: "260px",
        background: "linear-gradient(180deg, #0e2a47 0%, #0b1c3f 100%)",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: "4px 0 18px rgba(0,0,0,0.18)",
      }}
    >
      <div>
        {/* Title / Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "24px 20px 16px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.15)",
          }}
        >
          <FaCalendarAlt size={24} color="#f97316" /> {/* orange calendar icon */}
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "900",
              margin: 0,
              color: "white",
              letterSpacing: "0.3px",
            }}
          >
            HooPlannedThis
          </h2>
        </div>

        {/* Navigation */}
        <div style={{ paddingTop: "16px" }}>
          <div
            style={{
              padding: "0 24px",
            fontSize: "18px",
            fontWeight: "bold",
            marginBottom: "12px",
            color: "rgba(255,255,255,0.8)",
            letterSpacing: 0.3,
          }}
        >
          Navigation
        </div>

          <nav
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              padding: "0 16px",
            }}
          >
            <NavLink to="/home" style={navButton}>
              Home
            </NavLink>
            <NavLink to="/class-council" style={navButton}>
              Class Council
            </NavLink>
            <NavLink to="/my-committee" style={navButton}>
              My Committee
            </NavLink>
            <NavLink to="/events" style={navButton}>
              Events
            </NavLink>
            <NavLink to="/advisor" style={navButton}>
              Advisors
            </NavLink>
          </nav>
        </div>
      </div>

      {/* Settings */}
      <div
        style={{
          padding: "16px",
          borderTop: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(255,255,255,0.02)",
        }}
      >
        <div
          style={{
            fontWeight: "bold",
            marginBottom: "8px",
            opacity: 0.9,
            fontSize: "18px",
            color: "rgba(255,255,255,0.8)",
          }}
        >
          Settings
        </div>
        <NavLink to="/admin" style={navButton}>
          <FaCog size={14} style={{ marginRight: "6px" }} /> Admin
        </NavLink>
        <NavLink to="/login" style={navButton}>
          <FaSignOutAlt size={14} style={{ marginRight: "6px" }} /> Log Out
        </NavLink>
      </div>
    </aside>
  );
}

const navButton = ({ isActive }) => ({
  backgroundColor: isActive ? "rgba(255,255,255,0.12)" : "transparent",
  color: "white",
  border: "none",
  textAlign: "left",
  padding: "10px 14px",
  borderRadius: "10px",
  fontSize: "16px",
  cursor: "pointer",
  textDecoration: "none",
  transition: "background 0.2s, transform 0.1s",
  display: "flex",
  alignItems: "center",
  gap: 10,
  whiteSpace: "nowrap",
  transform: isActive ? "translateX(2px)" : "translateX(0)",
});
