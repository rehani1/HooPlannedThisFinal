import React, { useState, useEffect, useRef } from "react";
import { FaPlus, FaTimes, FaRegCalendarAlt, FaMapMarkerAlt, FaUsers, FaDollarSign } from "react-icons/fa";
import Sidebar from "../components/sidebar";
import { supabase } from "../lib/supabaseClient";

const statusStyles = {
  Approved: { bg: "#dcfce7", fg: "#166534" },
  "Awaiting Approval": { bg: "#e0f2fe", fg: "#075985" },
  Planning: { bg: "#fff7ed", fg: "#9a3412" },
  Draft: { bg: "#e2e8f0", fg: "#0f172a" },
};

function statusPill(status) {
  const palette = statusStyles[status] || statusStyles.Draft;
  return {
    background: palette.bg,
    color: palette.fg,
    fontWeight: 800,
    borderRadius: 999,
    padding: "6px 10px",
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  };
}

function formatDateTime(date, time) {
  const dt = new Date(`${date}T${time || "00:00"}`);
  if (Number.isNaN(dt.getTime())) return `${date}${time ? ` ${time}` : ""}`;

  const options = time
    ? { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }
    : { month: "short", day: "numeric", year: "numeric" };
  return new Intl.DateTimeFormat("en-US", options).format(dt);
}

function mapEventRow(row) {
  return {
    id: row.event_id,
    name: row.name,
    date: row.event_date,
    time: row.event_time,
    description: row.description || "",
    budget: row.budget != null ? Number(row.budget) : null,
    committeeId: row.committee_id,
    committee: row.committees?.committee_name || (row.committee_id ? `Committee #${row.committee_id}` : "Unassigned"),
    location: row.location_name,
    attendees: row.expected_attendees != null ? Number(row.expected_attendees) : null,
    status: row.status || "Draft",
    tags: row.tags || [],
  };
}

export default function Events() {
  const [isOpen, setIsOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({
    name: "",
    date: "",
    time: "",
    description: "",
    budget: "",
    committee: "",
    location: "",
    attendees: "",
    tags: "",
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
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setErr("");
        const { data, error } = await supabase
          .from("events")
          .select(
            `
            event_id,
            name,
            description,
            event_date,
            event_time,
            location_name,
            budget,
            expected_attendees,
            status,
            tags,
            committee_id,
            committees:committee_id(committee_name)
          `
          )
          .order("event_date", { ascending: false })
          .order("event_time", { ascending: false });
        if (error) throw error;
        if (!cancelled) setEvents((data || []).map(mapEventRow));
      } catch (e) {
        if (!cancelled) setErr(e.message || "Failed to load events.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
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
    if (!form.committee.trim()) next.committee = "Required";
    if (!form.location.trim()) next.location = "Required";
    if (form.budget && Number(form.budget) < 0) next.budget = "Must be ≥ 0";
    if (form.attendees && Number(form.attendees) < 0) next.attendees = "Must be ≥ 0";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const committeeId = form.committee ? Number(form.committee) : null;
    const attendeesVal = form.attendees ? Number(form.attendees) : null;
    const budgetVal = form.budget ? Number(form.budget) : null;
    const tagsArray = form.tags
      ? form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    try {
      const { data, error } = await supabase
        .from("events")
        .insert([
          {
            name: form.name.trim(),
            event_date: form.date,
            event_time: form.time || null,
            description: form.description.trim() || null,
            budget: Number.isFinite(budgetVal) ? budgetVal : null,
            committee_id: Number.isFinite(committeeId) ? committeeId : null,
            location_name: form.location.trim(),
            expected_attendees: Number.isFinite(attendeesVal) ? attendeesVal : null,
            status: "Draft",
            tags: tagsArray.length ? tagsArray : null,
          },
        ])
        .select(
          `
          event_id,
          name,
          description,
          event_date,
          event_time,
          location_name,
          budget,
          expected_attendees,
          status,
          tags,
          committee_id,
          committees:committee_id(committee_name)
        `
        )
        .single();

      if (error) throw error;
      if (data) {
        setEvents((prev) => [mapEventRow(data), ...prev]);
      }
    } catch (e) {
      setErr(e.message || "Failed to save event.");
      return;
    }

    setForm({
      name: "",
      date: "",
      time: "",
      description: "",
      budget: "",
      committee: "",
      location: "",
      attendees: "",
      tags: "",
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

      <section style={{ marginTop: 6 }}>
        <div style={sectionHeader}>
          <div>
            <div style={eyebrow}>Recent</div>
            <h2 style={sectionTitle}>Recent events</h2>
            <p style={{ color: "#475569", margin: "4px 0 0", fontSize: 14 }}>
              Sorted by date with the freshest plans up top.
            </p>
          </div>
        </div>

        <div style={eventsGrid}>
          {loading ? (
            <div style={{ color: "#475569" }}>Loading events…</div>
          ) : err ? (
            <div style={{ color: "#b91c1c" }}>Error: {err}</div>
          ) : events.length === 0 ? (
            <div style={{ color: "#475569" }}>No events yet. Add one to get started.</div>
          ) : (
            events
              .slice()
              .sort(
                (a, b) =>
                  new Date(`${b.date}T${b.time || "00:00"}`) - new Date(`${a.date}T${a.time || "00:00"}`)
              )
              .map((ev) => (
                <article key={ev.id} style={eventCard}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ display: "grid", gap: 4 }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>{ev.name}</div>
                      <div style={{ color: "#475569", fontWeight: 600, fontSize: 14 }}>{ev.committee}</div>
                    </div>
                    <span style={statusPill(ev.status)}>{ev.status}</span>
                  </div>

                  <p style={{ color: "#475569", margin: "8px 0 0", lineHeight: 1.5 }}>{ev.description}</p>

                  <div style={metaGrid}>
                    <div style={metaItem}>
                      <FaRegCalendarAlt color="#0f52ba" />
                      <div>
                        <div style={metaLabel}>Date & Time</div>
                        <div style={metaValue}>{formatDateTime(ev.date, ev.time)}</div>
                      </div>
                    </div>
                    <div style={metaItem}>
                      <FaMapMarkerAlt color="#0f52ba" />
                      <div>
                        <div style={metaLabel}>Location</div>
                        <div style={metaValue}>{ev.location}</div>
                      </div>
                    </div>
                    <div style={metaItem}>
                      <FaUsers color="#0f52ba" />
                      <div>
                        <div style={metaLabel}>Expected</div>
                        <div style={metaValue}>{ev.attendees?.toLocaleString() || "—"} attendees</div>
                      </div>
                    </div>
                    <div style={metaItem}>
                      <FaDollarSign color="#0f52ba" />
                      <div>
                        <div style={metaLabel}>Budget</div>
                        <div style={metaValue}>
                          {ev.budget != null ? `$${ev.budget.toLocaleString()}` : "Not set"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={tagRow}>
                    {ev.tags?.map((tag) => (
                      <span key={tag} style={tagPill}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </article>
              ))
          )}
        </div>
      </section>

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
                    label="Expected attendees"
                    error={errors.attendees}
                    input={
                      <input
                        type="number"
                        min="0"
                        name="attendees"
                        value={form.attendees}
                        onChange={handleChange}
                        style={input}
                        placeholder="e.g., 250"
                      />
                    }
                  />
                </div>

                <div style={grid2}>
                  <Field
                    label="Committee *"
                    error={errors.committee}
                    input={
                      <input
                        name="committee"
                        value={form.committee}
                        onChange={handleChange}
                        style={input}
                        placeholder="e.g., Fourth-Year Council"
                      />
                    }
                  />
                  <Field
                    label="Location *"
                    error={errors.location}
                    input={
                      <input
                        name="location"
                        value={form.location}
                        onChange={handleChange}
                        style={input}
                        placeholder="e.g., Newcomb Ballroom"
                      />
                    }
                  />
                </div>

                <Field
                  label="Tags (comma separated)"
                  input={
                    <input
                      name="tags"
                      value={form.tags}
                      onChange={handleChange}
                      style={input}
                      placeholder="e.g., Food, Outdoor"
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

const sectionHeader = {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 8,
};

const eyebrow = {
  color: "#f97316",
  fontWeight: 800,
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: 0.8,
};

const sectionTitle = {
  fontSize: 26,
  fontWeight: 900,
  margin: "2px 0",
  color: "#0f172a",
};

const eventsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 16,
  marginTop: 12,
};

const eventCard = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 14,
  padding: 16,
  boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
  display: "grid",
  gap: 10,
};

const metaGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 10,
  marginTop: 6,
};

const metaItem = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  background: "#f8fafc",
  borderRadius: 10,
  padding: "10px 12px",
};

const metaLabel = { fontSize: 12, color: "#475569", fontWeight: 700, letterSpacing: 0.3 };

const metaValue = { fontSize: 15, color: "#0f172a", fontWeight: 700, marginTop: 2 };

const tagRow = { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 };

const tagPill = {
  background: "#e2e8f0",
  color: "#0f172a",
  padding: "6px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
};
