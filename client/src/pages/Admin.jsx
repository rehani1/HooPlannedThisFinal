// src/pages/Admin.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdvisorManager from "../components/AdvisorManager";
import CouncilManager from "../components/CouncilManager";
import CommitteeManager from "../components/CommitteeManager";
import CommitteeAssign from "../components/CommitteeAssignment";
import RoleManager from "../components/RoleManager.jsx";

import { supabase } from "../lib/supabaseClient";

const eventStatusPalette = {
  Draft: { bg: "#e2e8f0", fg: "#0f172a" },
  Planning: { bg: "#fff7ed", fg: "#9a3412" },
  "Awaiting Approval": { bg: "#e0f2fe", fg: "#075985" },
  Approved: { bg: "#dcfce7", fg: "#166534" },
};

const eventStatusOptions = Object.keys(eventStatusPalette);

const eventStatusPill = (status) => {
  const palette = eventStatusPalette[status] || eventStatusPalette.Draft;
  return {
    background: palette.bg,
    color: palette.fg,
    padding: "6px 10px",
    borderRadius: 999,
    fontWeight: 800,
    fontSize: 12,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  };
};

const formatEventDateTime = (date, time) => {
  const dt = new Date(`${date}T${time || "00:00"}`);
  if (Number.isNaN(dt.getTime())) return `${date}${time ? ` ${time}` : ""}`;
  const options = time
    ? { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }
    : { month: "short", day: "numeric", year: "numeric" };
  return new Intl.DateTimeFormat("en-US", options).format(dt);
};

const normalizeTimeForInput = (time) => {
  if (!time) return "";
  return time.length > 5 ? time.slice(0, 5) : time;
};

export default function Admin() {
  const navigate = useNavigate();
  const [showAdvisorModal, setShowAdvisorModal] = useState(false);
  const [showCouncilModal, setShowCouncilModal] = useState(false);
  const [showEventManager, setShowEventManager] = useState(false);

  const [showEditCouncilModal, setShowEditCouncilModal] = useState(false);
  const [councilToEdit, setCouncilToEdit] = useState(null);
  const [showCommitteeAssign, setShowCommitteeAssign] = useState(false);
  const [selectedCommittee, setSelectedCommittee] = useState(null);
  const [showRoleManager, setShowRoleManager] = useState(false);
  const [roleGradYear, setRoleGradYear] = useState(null);
  const [managedEvents, setManagedEvents] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingForm, setEditingForm] = useState({
    name: "",
    eventDate: "",
    eventTime: "",
    location: "",
    status: "Draft",
    description: "",
    budget: "",
    attendees: "",
    committeeId: "",
    tags: "",
  });
  const [editSaving, setEditSaving] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsErr, setEventsErr] = useState("");




  const [councils, setCouncils] = useState([]);
  const [loadingCouncils, setLoadingCouncils] = useState(true);

  useEffect(() => {
    const ok = sessionStorage.getItem("admin_unlocked") === "1";
    if (!ok) navigate("/adminlogin", { replace: true });
  }, [navigate]);

  const loadEvents = async () => {
    setEventsLoading(true);
    setEventsErr("");
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
        status,
        budget,
        expected_attendees,
        tags,
        committee_id,
        committees:committee_id(committee_name)
      `
      )
      .order("event_date", { ascending: false })
      .order("event_time", { ascending: false });
    if (error) {
      setEventsErr(error.message || "Failed to load events.");
      setEventsLoading(false);
      return;
    }
    setManagedEvents(
      (data || []).map((row) => ({
        id: row.event_id,
        name: row.name,
        eventDate: row.event_date,
        eventTime: row.event_time,
        displayDate: formatEventDateTime(row.event_date, row.event_time),
        location: row.location_name,
        status: row.status || "Draft",
        description: row.description || "",
        budget: row.budget != null ? Number(row.budget) : null,
        attendees: row.expected_attendees != null ? Number(row.expected_attendees) : null,
        tags: row.tags || [],
        committeeId: row.committee_id || "",
        committeeName: row.committees?.committee_name || (row.committee_id ? `Committee #${row.committee_id}` : "Unassigned"),
      }))
    );
    setEventsLoading(false);
  };

  const startEdit = (ev) => {
    setEventsErr("");
    setEditingId(ev.id);
    setEditingForm({
      name: ev.name || "",
      eventDate: ev.eventDate || "",
      eventTime: normalizeTimeForInput(ev.eventTime || ""),
      location: ev.location || "",
      status: ev.status || "Draft",
      description: ev.description || "",
      budget: ev.budget ?? "",
      attendees: ev.attendees ?? "",
      committeeId: ev.committeeId ?? "",
      tags: ev.tags?.join(", ") || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingForm({
      name: "",
      eventDate: "",
      eventTime: "",
      location: "",
      status: "Draft",
      description: "",
      budget: "",
      attendees: "",
      committeeId: "",
      tags: "",
    });
    setEditSaving(false);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingForm((f) => ({ ...f, [name]: value }));
  };

  const saveEdit = async () => {
    if (!editingId) return;
    if (!editingForm.name.trim() || !editingForm.eventDate || !editingForm.location.trim()) {
      setEventsErr("Name, date, and location are required.");
      return;
    }

    const budgetVal = editingForm.budget !== "" ? Number(editingForm.budget) : null;
    const attendeesVal = editingForm.attendees !== "" ? Number(editingForm.attendees) : null;
    const committeeVal = editingForm.committeeId !== "" ? Number(editingForm.committeeId) : null;
    const tagsArray = editingForm.tags
      ? editingForm.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    setEditSaving(true);
    setEventsErr("");
    const payload = {
      name: editingForm.name.trim(),
      event_date: editingForm.eventDate,
      event_time: editingForm.eventTime || null,
      location_name: editingForm.location.trim(),
      status: editingForm.status || "Draft",
      description: editingForm.description.trim() || null,
      budget: Number.isFinite(budgetVal) ? budgetVal : null,
      expected_attendees: Number.isFinite(attendeesVal) ? attendeesVal : null,
      committee_id: Number.isFinite(committeeVal) ? committeeVal : null,
      tags: tagsArray.length ? tagsArray : null,
    };

    const { error } = await supabase.from("events").update(payload).eq("event_id", editingId);
    if (error) {
      setEventsErr(error.message || "Failed to update event.");
      setEditSaving(false);
      return;
    }

    setManagedEvents((prev) =>
      prev.map((ev) =>
        ev.id === editingId
          ? {
              ...ev,
              name: payload.name,
              eventDate: payload.event_date,
              eventTime: payload.event_time,
              displayDate: formatEventDateTime(payload.event_date, payload.event_time),
              location: payload.location_name,
              status: payload.status,
              description: payload.description || "",
              budget: payload.budget != null ? Number(payload.budget) : null,
              attendees: payload.expected_attendees != null ? Number(payload.expected_attendees) : null,
              committeeId: payload.committee_id || "",
              committeeName: payload.committee_id ? `Committee #${payload.committee_id}` : "Unassigned",
              tags: payload.tags || [],
            }
          : ev
      )
    );
    cancelEdit();
  };

  const removeEvent = async (id) => {
    const confirmed = window.confirm("Delete this event? This cannot be undone.");
    if (!confirmed) return;
    setDeleteLoadingId(id);
    setEventsErr("");
    const { error } = await supabase.from("events").delete().eq("event_id", id);
    if (error) {
      setEventsErr(error.message || "Failed to delete event.");
      setDeleteLoadingId(null);
      return;
    }
    setManagedEvents((prev) => prev.filter((ev) => ev.id !== id));
    if (editingId === id) cancelEdit();
    setDeleteLoadingId(null);
  };

  const updateEventStatus = async (id, status) => {
    const prev = managedEvents;
    setManagedEvents((p) => p.map((ev) => (ev.id === id ? { ...ev, status } : ev)));
    const { error } = await supabase.from("events").update({ status }).eq("event_id", id);
    if (error) {
      setManagedEvents(prev);
      setEventsErr(error.message || "Failed to update status.");
    }
  };

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
      computing_id,
      role
      ), 
      committees (
      committee_name,
      committee_id
      )
      `)
      .order("grad_year", { ascending: true });

    if (!error) setCouncils(data || []);
    setLoadingCouncils(false);
  };

  useEffect(() => {
    loadCouncils();
    loadEvents();
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
            <button
              style={btnPrimary}
              onClick={() => {
                setShowEventManager(true);
                loadEvents();
              }}
            >
              Manage Events
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
                    <div style={{ fontSize: 12, color: "#4b5563", marginTop: 4 }}>
                      Committees:
                      {c.committees && c.committees.length > 0 ? (
                        <ul style={{ marginTop: 4, paddingLeft: 16 }}>
                          {c.committees.map((cm, i) => (
                            <li key={i}>
                              <button
                                style={{
                                  background: "none",
                                  border: "none",
                                  padding: 0,
                                  color: "#1d4ed8",
                                  cursor: "pointer",
                                  textDecoration: "underline",
                                }}
                                onClick={() => {
                                  // open modal, pass council grad_year + committee
                                  setSelectedCommittee({
                                    grad_year: c.grad_year,
                                    committee_id: cm.committee_id,
                                    committee_name: cm.committee_name,
                                  });
                                  setShowCommitteeAssign(true);
                                }}
                              >
                                {cm.committee_name}
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span> none</span>
                      )}
                    </div>
                     <button
                          style={{ ...btnSmall, marginLeft: 8 }}
                          onClick={() => {
                            setRoleGradYear(c.grad_year);
                            setShowRoleManager(true);
                          }}
                        >
                          Manage Roles
                        </button>



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

      {/* Event manager modal */}
      {showEventManager && (
        <div style={modalBackdrop} onClick={() => setShowEventManager(false)}>
          <div style={modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeader}>
              <h2 style={{ margin: 0 }}>Manage Events</h2>
              <button style={modalCloseBtn} onClick={() => setShowEventManager(false)}>
                ✕
              </button>
            </div>
            <p style={{ margin: "0 0 4px", color: "#4b5563" }}>
              Adjust statuses for recent events from the database.
            </p>
            <div style={eventListWrap}>
              {eventsLoading ? (
                <div style={{ color: "#4b5563" }}>Loading events…</div>
              ) : eventsErr ? (
                <div style={{ color: "#b91c1c" }}>Error: {eventsErr}</div>
              ) : managedEvents.length === 0 ? (
                <div style={{ color: "#4b5563" }}>No events found.</div>
              ) : (
                managedEvents.map((ev) => (
                  <div key={ev.id} style={eventRow}>
                    {editingId === ev.id ? (
                      <>
                        <div style={eventEditForm}>
                          <input
                            name="name"
                            value={editingForm.name}
                            onChange={handleEditChange}
                            style={eventInput}
                            placeholder="Event name"
                          />
                          <div style={eventTwoCol}>
                            <input
                              type="date"
                              name="eventDate"
                              value={editingForm.eventDate}
                              onChange={handleEditChange}
                              style={eventInput}
                            />
                            <input
                              type="time"
                              name="eventTime"
                              value={editingForm.eventTime}
                              onChange={handleEditChange}
                              style={eventInput}
                            />
                          </div>
                          <input
                            name="location"
                            value={editingForm.location}
                            onChange={handleEditChange}
                            style={eventInput}
                            placeholder="Location"
                          />
                          <textarea
                            name="description"
                            value={editingForm.description}
                            onChange={handleEditChange}
                            style={eventTextarea}
                            rows={3}
                            placeholder="Description"
                          />
                          <div style={eventTwoCol}>
                            <input
                              type="number"
                              min="0"
                              name="attendees"
                              value={editingForm.attendees}
                              onChange={handleEditChange}
                              style={eventInput}
                              placeholder="Expected attendees"
                            />
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              name="budget"
                              value={editingForm.budget}
                              onChange={handleEditChange}
                              style={eventInput}
                              placeholder="Budget"
                            />
                          </div>
                          <div style={eventTwoCol}>
                            <input
                              name="committeeId"
                              value={editingForm.committeeId}
                              onChange={handleEditChange}
                              style={eventInput}
                              placeholder="Committee ID"
                            />
                            <input
                              name="tags"
                              value={editingForm.tags}
                              onChange={handleEditChange}
                              style={eventInput}
                              placeholder="Tags (comma separated)"
                            />
                          </div>
                        </div>
                        <div style={eventActions}>
                          <select
                            name="status"
                            value={editingForm.status}
                            onChange={handleEditChange}
                            style={statusSelect}
                          >
                            {eventStatusOptions.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                            <button style={btnPrimarySmall} onClick={saveEdit} disabled={editSaving}>
                              {editSaving ? "Saving…" : "Save"}
                            </button>
                            <button style={btnSecondarySmall} onClick={cancelEdit} disabled={editSaving}>
                              Cancel
                            </button>
                            <button
                              style={btnDangerSmall}
                              onClick={() => removeEvent(ev.id)}
                              disabled={deleteLoadingId === ev.id || editSaving}
                            >
                              {deleteLoadingId === ev.id ? "Deleting…" : "Delete"}
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <div style={{ fontWeight: 700, color: "#003e83" }}>{ev.name}</div>
                          <div style={eventMeta}>
                            {ev.displayDate} · {ev.location}
                          </div>
                          <div style={{ color: "#4b5563", fontSize: 13, marginTop: 4 }}>
                            {ev.description || "No description"}
                          </div>
                          <div style={eventMeta}>
                            {ev.attendees != null ? `${ev.attendees} attendees · ` : ""}
                            {ev.budget != null ? `Budget $${ev.budget}` : ""}
                          </div>
                          <div style={eventMeta}>Committee: {ev.committeeName || "Unassigned"}</div>
                          {ev.tags && ev.tags.length > 0 ? (
                            <div style={adminTagRow}>
                              {ev.tags.map((t) => (
                                <span key={t} style={adminTag}>
                                  {t}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                        <div style={eventActions}>
                          <span style={eventStatusPill(ev.status)}>{ev.status}</span>
                          <select
                            value={ev.status}
                            onChange={(e) => updateEventStatus(ev.id, e.target.value)}
                            style={statusSelect}
                          >
                            {eventStatusOptions.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                          <button style={btnSecondarySmall} onClick={() => startEdit(ev)}>
                            Edit
                          </button>
                          <button
                            style={btnDangerSmall}
                            onClick={() => removeEvent(ev.id)}
                            disabled={deleteLoadingId === ev.id}
                          >
                            {deleteLoadingId === ev.id ? "Deleting…" : "Delete"}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
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
              <CommitteeManager gradYear={councilToEdit.grad_year} />

            </div>
          </div>
        </div>
      )}
      {showCommitteeAssign && selectedCommittee && (
          <div style={modalBackdrop} onClick={() => setShowCommitteeAssign(false)}>
            <div style={modalContent} onClick={(e) => e.stopPropagation()}>
              <CommitteeAssign
                committee={selectedCommittee}
                onClose={() => {
                  setShowCommitteeAssign(false);
                  setSelectedCommittee(null);
                  loadCouncils(); // refresh
                }}
              />
            </div>
          </div>
        )}

      {showRoleManager && roleGradYear && (
          <div style={modalBackdrop} onClick={() => setShowRoleManager(false)}>
            <div style={modalContent} onClick={(e) => e.stopPropagation()}>
              <RoleManager
                gradYear={roleGradYear}
                onClose={() => {
                  setShowRoleManager(false);
                  setRoleGradYear(null);
                  // optional: reload to reflect updated roles in any other UI
                  // loadCouncils();
                }}
              />
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

const eventListWrap = {
  display: "grid",
  gap: 10,
  marginTop: 4,
};

const eventRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  border: "1px solid #eef1f4",
  borderRadius: 10,
  padding: "10px 12px",
  gap: 12,
  flexWrap: "wrap",
};

const eventMeta = { color: "#4b5563", fontSize: 13, marginTop: 2 };

const statusSelect = {
  border: "1px solid #d7dce2",
  borderRadius: 8,
  padding: "6px 10px",
  fontWeight: 600,
  color: "#003e83",
  background: "#fff",
};

const eventEditForm = {
  display: "grid",
  gap: 8,
  flex: 1,
  minWidth: 240,
};

const eventTwoCol = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
  gap: 8,
};

const eventInput = {
  border: "1px solid #d7dce2",
  borderRadius: 8,
  padding: "8px 10px",
  fontSize: 14,
  color: "#0f172a",
};

const eventTextarea = {
  ...eventInput,
  minHeight: 72,
  resize: "vertical",
};

const eventActions = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  justifyContent: "flex-end",
  flexWrap: "wrap",
};

const btnPrimarySmall = {
  ...btnPrimary,
  padding: "8px 10px",
  fontSize: 13,
};

const btnSecondarySmall = {
  ...btnSecondary,
  padding: "8px 10px",
  fontSize: 13,
  borderRadius: 8,
  borderColor: "#d7dce2",
};

const btnDangerSmall = {
  background: "#dc2626",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "8px 10px",
  fontWeight: 700,
  fontSize: 13,
  cursor: "pointer",
};

const adminTagRow = { display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 };
const adminTag = {
  background: "#e2e8f0",
  color: "#0f172a",
  padding: "4px 8px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
};
