// src/pages/Admin.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import {
  uploadAdvisorPhoto,
  getAdvisorPhotoFromRow,
} from "../lib/profilePhoto";

export default function Admin() {
  const navigate = useNavigate();

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
        </div>

        <div style={{ ...card, marginTop: 16 }}>
          <h2 style={h2}>Manage Advisors</h2>
          <AdvisorManager />
        </div>
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Advisor manager                                                     */
/* ------------------------------------------------------------------ */
function AdvisorManager() {
  const [advisors, setAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // form for CREATE
  const [form, setForm] = useState({
    advisor_first_name: "",
    advisor_last_name: "",
    advisor_role: "",
    advisor_email: "",
    advisor_number: "",
    advisor_building: "",
    advisor_address: "",
    // we will NOT store the file here
  });
  // file for CREATE
  const [newAdvisorFile, setNewAdvisorFile] = useState(null);

  // form for EDIT
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    advisor_first_name: "",
    advisor_last_name: "",
    advisor_role: "",
    advisor_email: "",
    advisor_number: "",
    advisor_building: "",
    advisor_address: "",
    advisor_profile_picture: "",
  });
  // file for EDIT
  const [editAdvisorFile, setEditAdvisorFile] = useState(null);

  useEffect(() => {
    loadAdvisors();
  }, []);

  const loadAdvisors = async () => {
    setLoading(true);
    setErrorMsg("");
    const { data, error } = await supabase
      .from("advisors")
      .select(
        `
        advisor_id,
        advisor_first_name,
        advisor_last_name,
        advisor_role,
        advisor_email,
        advisor_number,
        advisor_building,
        advisor_address,
        advisor_profile_picture
      `
      )
      .order("advisor_id", { ascending: true });

    if (error) {
      console.error("Error loading advisors:", error);
      setErrorMsg(error.message || "Could not load advisors.");
    } else {
      setAdvisors(data || []);
    }
    setLoading(false);
  };

  const addAdvisor = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    if (!form.advisor_first_name || !form.advisor_last_name) {
      setErrorMsg("First and last name are required.");
      return;
    }

    // 1) insert advisor WITHOUT photo first
    const { data: inserted, error } = await supabase
      .from("advisors")
      .insert([
        {
          advisor_first_name: form.advisor_first_name,
          advisor_last_name: form.advisor_last_name,
          advisor_role: form.advisor_role,
          advisor_email: form.advisor_email,
          advisor_number: form.advisor_number,
          advisor_building: form.advisor_building,
          advisor_address: form.advisor_address,
          // advisor_profile_picture will be set after upload
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("INSERT ADVISOR ERROR:", error);
      setErrorMsg(error.message || "Could not save advisor.");
      return;
    }

    // 2) if user picked a file, upload it now using helper
    if (newAdvisorFile) {
      const { error: photoErr } = await uploadAdvisorPhoto(
        inserted.advisor_id,
        newAdvisorFile
      );
      if (photoErr) {
        console.error("UPLOAD ADVISOR PHOTO ERROR:", photoErr);
        // we won't fail the whole creation here, just tell them
        setErrorMsg(
          photoErr.message || "Advisor saved, but photo upload failed."
        );
      } else {
        setSuccessMsg("Advisor added with photo.");
      }
    } else {
      setSuccessMsg("Advisor added.");
    }

    // clear form + file
    setForm({
      advisor_first_name: "",
      advisor_last_name: "",
      advisor_role: "",
      advisor_email: "",
      advisor_number: "",
      advisor_building: "",
      advisor_address: "",
    });
    setNewAdvisorFile(null);

    loadAdvisors();
  };

  const deleteAdvisor = async (id) => {
    setErrorMsg("");
    setSuccessMsg("");
    const { error } = await supabase
      .from("advisors")
      .delete()
      .eq("advisor_id", id);
    if (error) {
      setErrorMsg(error.message || "Could not delete advisor.");
    } else {
      setSuccessMsg("Advisor deleted.");
      if (editingId === id) {
        setEditingId(null);
      }
      loadAdvisors();
    }
  };

  const startEdit = (advisor) => {
    setEditingId(advisor.advisor_id);
    setEditForm({
      advisor_first_name: advisor.advisor_first_name || "",
      advisor_last_name: advisor.advisor_last_name || "",
      advisor_role: advisor.advisor_role || "",
      advisor_email: advisor.advisor_email || "",
      advisor_number: advisor.advisor_number || "",
      advisor_building: advisor.advisor_building || "",
      advisor_address: advisor.advisor_address || "",
      advisor_profile_picture: advisor.advisor_profile_picture || "",
    });
    setEditAdvisorFile(null);
    setErrorMsg("");
    setSuccessMsg("");
  };

  const saveEdit = async () => {
    if (!editingId) return;

    // update text fields first
    const { error } = await supabase
      .from("advisors")
      .update({
        advisor_first_name: editForm.advisor_first_name,
        advisor_last_name: editForm.advisor_last_name,
        advisor_role: editForm.advisor_role,
        advisor_email: editForm.advisor_email,
        advisor_number: editForm.advisor_number,
        advisor_building: editForm.advisor_building,
        advisor_address: editForm.advisor_address,
        // don't overwrite advisor_profile_picture here unless we have a new upload
      })
      .eq("advisor_id", editingId);

    if (error) {
      setErrorMsg(error.message || "Could not update advisor.");
      return;
    }

    // if a new file was chosen, upload it and update picture path
    if (editAdvisorFile) {
      const { error: photoErr } = await uploadAdvisorPhoto(
        editingId,
        editAdvisorFile
      );
      if (photoErr) {
        setErrorMsg(
          photoErr.message || "Advisor updated, but photo upload failed."
        );
        // still refresh list
        loadAdvisors();
        return;
      }
    }

    setSuccessMsg("Advisor updated.");
    setEditingId(null);
    setEditAdvisorFile(null);
    loadAdvisors();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setErrorMsg("");
    setEditAdvisorFile(null);
  };

  return (
    <div>
      {/* create form */}
      <h3 style={{ marginTop: 0, marginBottom: 8 }}>Add New Advisor</h3>
      <div style={{ display: "grid", gap: 8, maxWidth: 520 }}>
        <input
          style={input}
          placeholder="First name"
          value={form.advisor_first_name}
          onChange={(e) =>
            setForm({ ...form, advisor_first_name: e.target.value })
          }
        />
        <input
          style={input}
          placeholder="Last name"
          value={form.advisor_last_name}
          onChange={(e) =>
            setForm({ ...form, advisor_last_name: e.target.value })
          }
        />
        <input
          style={input}
          placeholder="Role"
          value={form.advisor_role}
          onChange={(e) => setForm({ ...form, advisor_role: e.target.value })}
        />
        <input
          style={input}
          placeholder="Email"
          value={form.advisor_email}
          onChange={(e) => setForm({ ...form, advisor_email: e.target.value })}
        />
        <input
          style={input}
          placeholder="Phone / Number"
          value={form.advisor_number}
          onChange={(e) => setForm({ ...form, advisor_number: e.target.value })}
        />
        <input
          style={input}
          placeholder="Building"
          value={form.advisor_building}
          onChange={(e) =>
            setForm({ ...form, advisor_building: e.target.value })
          }
        />
        <input
          style={input}
          placeholder="Address"
          value={form.advisor_address}
          onChange={(e) =>
            setForm({ ...form, advisor_address: e.target.value })
          }
        />

        {/* NEW: file input for photo */}
        <label style={{ fontSize: 12, color: "#54637a" }}>
          Profile picture (upload)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setNewAdvisorFile(e.target.files?.[0] || null)}
        />

        <button onClick={addAdvisor} style={btnPrimary}>
          Save Advisor
        </button>
      </div>

      {/* messages */}
      {errorMsg && <div style={errorBox}>{errorMsg}</div>}
      {successMsg && <div style={successBox}>{successMsg}</div>}

      {/* list */}
      <h3 style={{ marginTop: 24, marginBottom: 8 }}>Current Advisors</h3>
      {loading ? (
        <p>Loading…</p>
      ) : advisors.length === 0 ? (
        <p>No advisors yet.</p>
      ) : (
        advisors.map((a) => {
          const photoUrl = getAdvisorPhotoFromRow(a);
          return (
            <div key={a.advisor_id} style={row}>
              {editingId === a.advisor_id ? (
                // EDIT MODE
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <input
                      style={inputSmall}
                      value={editForm.advisor_first_name}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          advisor_first_name: e.target.value,
                        })
                      }
                    />
                    <input
                      style={inputSmall}
                      value={editForm.advisor_last_name}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          advisor_last_name: e.target.value,
                        })
                      }
                    />
                    <input
                      style={inputSmall}
                      placeholder="Role"
                      value={editForm.advisor_role}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          advisor_role: e.target.value,
                        })
                      }
                    />
                    <input
                      style={inputSmall}
                      placeholder="Email"
                      value={editForm.advisor_email}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          advisor_email: e.target.value,
                        })
                      }
                    />
                    <input
                      style={inputSmall}
                      placeholder="Phone Number"
                      value={editForm.advisor_number}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          advisor_number: e.target.value,
                        })
                      }
                    />
                    <input
                      style={inputSmall}
                      placeholder="Building"
                      value={editForm.advisor_building}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          advisor_building: e.target.value,
                        })
                      }
                    />
                    <input
                      style={inputSmall}
                      placeholder="Address"
                      value={editForm.advisor_address}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          advisor_address: e.target.value,
                        })
                      }
                    />

                    {/* show current photo if exists */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <img
                        src={photoUrl}
                        alt="Advisor"
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "1px solid #eef1f4",
                        }}
                        onError={(e) => {
                          e.target.src = "/cav_man.png";
                        }}
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setEditAdvisorFile(e.target.files?.[0] || null)
                        }
                      />
                    </div>
                  </div>
                </div>
              ) : (
                // VIEW MODE
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <img
                    src={photoUrl}
                    alt="Advisor"
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "1px solid #eef1f4",
                    }}
                    onError={(e) => {
                      e.target.src = "/cav_man.png";
                    }}
                  />
                  <div>
                    <strong>
                      {a.advisor_first_name} {a.advisor_last_name}
                    </strong>
                    {a.advisor_role ? ` — ${a.advisor_role}` : ""}
                    {a.advisor_email ? ` • ${a.advisor_email}` : ""}
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: 6 }}>
                {editingId === a.advisor_id ? (
                  <>
                    <button onClick={saveEdit} style={btnPrimarySmall}>
                      Save
                    </button>
                    <button onClick={cancelEdit} style={btnSecondarySmall}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <button onClick={() => startEdit(a)} style={btnSecondarySmall}>
                    Edit
                  </button>
                )}
                <button
                  onClick={() => deleteAdvisor(a.advisor_id)}
                  style={btnDanger}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })
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
const input = {
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid #d7dce2",
  fontSize: 14,
};
const btnPrimary = {
  background: "#003e83",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "10px 14px",
  fontWeight: 600,
  cursor: "pointer",
  marginTop: 4,
  width: "fit-content",
};
const row = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "6px 0",
  borderBottom: "1px solid #eef1f4",
};
const btnDanger = {
  background: "#e11d48",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  padding: "6px 10px",
  fontSize: 12,
  cursor: "pointer",
};
const errorBox = {
  marginTop: 10,
  padding: "8px 12px",
  background: "#ffe6e6",
  border: "1px solid #ffb3b3",
  borderRadius: 8,
  color: "#b00020",
  fontSize: 13,
};
const successBox = {
  marginTop: 10,
  padding: "8px 12px",
  background: "#ecfdf3",
  border: "1px solid #a6f4c5",
  borderRadius: 8,
  color: "#166534",
  fontSize: 13,
};
const inputSmall = {
  padding: "6px 8px",
  borderRadius: 6,
  border: "1px solid #d7dce2",
  fontSize: 13,
};
const btnPrimarySmall = {
  background: "#003e83",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  padding: "6px 10px",
  fontSize: 12,
  cursor: "pointer",
};
const btnSecondarySmall = {
  background: "#fff",
  color: "#003e83",
  border: "1px solid #d7dce2",
  borderRadius: 6,
  padding: "6px 10px",
  fontSize: 12,
  cursor: "pointer",
};

