// src/layouts/Admin.jsx
import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";



export default function Admin() {
    return (
      <div style={wrap}>
        <header style={topbar}>
          <h1 style={title}>admin</h1>
        </header>
        <main style={content}>
          <Outlet />
        </main>
      </div>
    );
  }
  
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
    padding: "0 16px",
    borderBottom: "1px solid #eef1f4",
    background: "#ffffff",
  };
  
  const title = {
    margin: 0,
    fontWeight: 800,
    fontSize: 24,
    color: "#003e83",
  };
  
  const content = {
    padding: 16,
  };


