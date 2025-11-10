import React, { useState, useEffect, useRef } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";
import Sidebar from "../components/sidebar";

export default function Events() {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    date: "",
    time: "",
    description: "",
    budget: "",
    committeeId: "",
    locationName: "",
  });
  const [errors, setErrors] = useState({});
  const dialogRef = useRef(null);

  // Accessibility: close on ESC, trap focus when open
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setIsOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (isOpen && dialogRef.current) {
      dialogRef.current.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  const open = () => setIsOpen(true);
  const close = () => {
    setIsOpen(false);
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Required";
    if (!form.date) next.date = "Required";
    if (!form.time) next.time = "Required";
    if (!form.committeeId.trim()) next.committeeId = "Required";
    if (!form.locationName.trim()) next.locationName = "Required";
    if (form.budget && Number(form.budget) < 0) next.budget = "Must be ≥ 0";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // TODO: integrate with Supabase insert for events + location
    console.log("Submitting event:", form);

    // Simple reset + close
    setForm({
      name: "",
      date: "",
      time: "",
      description: "",
      budget: "",
      committeeId: "",
      locationName: "",
    });
    setIsOpen(false);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc", color: "#1e293b" }}>
        <Sidebar />
    <div style={{ flex: 1, padding: "32px 48px" }}>
        
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ fontSize: 36, fontWeight: 900, margin: 0, color: "#0f172a" }}>Events</h1>

        <button onClick={open} style={addBtn}>
          <FaPlus style={{ marginRight: 8 }} />
          Add Event
        </button>
      </div>

      {/* Placeholder list area (you can render your events here) */}
      <div style={{ color: "#475569" }}>No events yet. Click “Add Event” to create one.</div>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="eventFormTitle"
          tabIndex={-1}
          ref={dialogRef}
          onMouseDown={(e) => {
            // click outside to close
            if (e.target === e.currentTarget) close();
          }}
          style={backdrop}
        >
          <div style={modal}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <h2 id="eventFormTitle" style={{ fontSize: 24, fontWeight: 800, margin: 0, color: "#0f172a" }}>
                Create Event
              </h2>
              <button aria-label="Close" onClick={close} style={iconBtn}>
                <FaTimes />
              </button>
            </div>
            <p style={{ marginTop: 0, marginBottom: 16, color: "#475569" }}>
              Fill out the details below. Fields marked with <span style={{ color: "#ef4444" }}>*</span> are required.
            </p>

            <form onSubmit={handleSubmit}>
              <Section title="Event">
                <Field
                  label="Name *"
                  error={errors.name}
                  input={
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      style={input}
                      placeholder="e.g., Ice Cream Social"
                    />
                  }
                />
                <div style={grid2}>
                  <Field
                    label="Date *"
                    error={errors.date}
                    input={<input type="date" name="date" value={form.date} onChange={handleChange} style={input} />}
                  />
                  <Field
                    label="Time *"
                    error={errors.time}
                    input={<input type="time" name="time" value={form.time} onChange={handleChange} style={input} />}
                  />
                </div>
                <Field
                  label="Description"
                  input={
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows={4}
                      style={{ ...input, resize: "vertical" }}
                      placeholder="Add a short description…"
                    />
                  }
                />
                <div style={grid2}>
                  <Field
                    label="Budget ($)"
                    error={errors.budget}
                    input={
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        name="budget"
                        value={form.budget}
                        onChange={handleChange}
                        style={input}
                        placeholder="e.g., 500"
                      />
                    }
                  />
                  <Field
                    label="Committee ID *"
                    error={errors.committeeId}
                    input={
                      <input
                        name="committeeId"
                        value={form.committeeId}
                        onChange={handleChange}
                        style={input}
                        placeholder="e.g., 1"
                      />
                    }
                  />
                </div>
              </Section>

              <Section title="Location">
                <Field
                  label="Location Name *"
                  error={errors.locationName}
                  input={
                    <input
                      name="locationName"
                      value={form.locationName}
                      onChange={handleChange}
                      style={input}
                      placeholder="e.g., Newcomb Ballroom"
                    />
                  }
                />
              </Section>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 12 }}>
                <button type="button" onClick={close} style={secondaryBtn}>
                  Cancel
                </button>
                <button type="submit" style={primaryBtn}>
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}

/* ---------- Small UI primitives ---------- */

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <h3 style={{ margin: "16px 0 8px", fontSize: 20, fontWeight: 800, color: "#0f172a" }}>{title}</h3>
      <div style={{ display: "grid", gap: 12 }}>{children}</div>
    </div>
  );
}

function Field({ label, input, error }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontWeight: 600, color: "#0f172a" }}>
        {label}
        {error && <span style={{ color: "#ef4444", fontWeight: 500, marginLeft: 8 }}>{error}</span>}
      </span>
      {input}
    </label>
  );
}

/* ---------- Styles ---------- */

const addBtn = {
  background: "#f97316",
  color: "white",
  border: "none",
  padding: "10px 14px",
  borderRadius: 10,
  fontSize: 16,
  fontWeight: 700,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
};

const backdrop = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
  zIndex: 1000,
};

const modal = {
  background: "white",
  width: "min(780px, 92vw)",
  borderRadius: 16,
  padding: 24,
  boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
  outline: "none",
};

const input = {
  height: 40,
  border: "1px solid #cbd5e1",
  borderRadius: 10,
  padding: "0 12px",
  fontSize: 15,
  color: "#0f172a",
  background: "#f8fafc",
};

const grid2 = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
};

const primaryBtn = {
  background: "#0f52ba",
  color: "white",
  border: "none",
  padding: "10px 16px",
  borderRadius: 10,
  fontSize: 15,
  fontWeight: 700,
  cursor: "pointer",
};

const secondaryBtn = {
  background: "transparent",
  color: "#0f172a",
  border: "1px solid #cbd5e1",
  padding: "10px 16px",
  borderRadius: 10,
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
};

const iconBtn = {
  background: "transparent",
  border: "none",
  color: "#0f172a",
  cursor: "pointer",
  fontSize: 18,
  lineHeight: 1,
  padding: 6,
  borderRadius: 8,
  transition: "background 0.15s ease",
};
