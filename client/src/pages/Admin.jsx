// src/pages/Admin.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

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
/* Advisor manager lives in this file for now                          */
/* ------------------------------------------------------------------ */
function AdvisorManager() {
  const [advisors, setAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);

  // 👇 these were missing
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [form, setForm] = useState({
    advisor_first_name: "",
    advisor_last_name: "",
    advisor_role: "",
    advisor_email: "",
    advisor_number: "",
    advisor_building: "",
    advisor_address: "",
    advisor_profile_picture: "",
  });
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

    const { error } = await supabase.from("advisors").insert([form]);

    if (error) {
      console.error("INSERT ADVISOR ERROR:", error);
      setErrorMsg(error.message || "Could not save advisor.");
      return;
    }

    setSuccessMsg("Advisor added.");
    // clear form
    setForm({
      advisor_first_name: "",
      advisor_last_name: "",
      advisor_role: "",
      advisor_email: "",
      advisor_number: "",
      advisor_building: "",
      advisor_address: "",
      advisor_profile_picture: "",
    });
    loadAdvisors();
  };
  const deleteAdvisor = async (id) => {
    setErrorMsg("");
    setSuccessMsg("");
    const { error } = await supabase.from("advisors").delete().eq("advisor_id", id);
    if (error) {
      setErrorMsg(error.message || "Could not delete advisor.");
    } else {
      setSuccessMsg("Advisor deleted.");
      // if we were editing this one, stop editing
      if (editingId === id) {
        setEditingId(null);
      }
      loadAdvisors();
    }
  };

  // 👇 start editing: fill editForm with that advisor’s data
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
    setErrorMsg("");
    setSuccessMsg("");
  };

  // 👇 save edited advisor
  const saveEdit = async () => {
    if (!editingId) return;
    const { error } = await supabase
      .from("advisors")
      .update(editForm)
      .eq("advisor_id", editingId);

    if (error) {
      setErrorMsg(error.message || "Could not update advisor.");
      return;
    }
    setSuccessMsg("Advisor updated.");
    setEditingId(null);
    loadAdvisors();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setErrorMsg("");
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
          onChange={(e) => setForm({ ...form, advisor_first_name: e.target.value })}
        />
        <input
          style={input}
          placeholder="Last name"
          value={form.advisor_last_name}
          onChange={(e) => setForm({ ...form, advisor_last_name: e.target.value })}
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
          onChange={(e) => setForm({ ...form, advisor_building: e.target.value })}
        />
        <input
          style={input}
          placeholder="Address"
          value={form.advisor_address}
          onChange={(e) => setForm({ ...form, advisor_address: e.target.value })}
        />
        <input
          style={input}
          placeholder="Profile picture URL"
          value={form.advisor_profile_picture}
          onChange={(e) =>
            setForm({ ...form, advisor_profile_picture: e.target.value })
          }
        />

        <button onClick={addAdvisor} style={btnPrimary}>
          Save Advisor
        </button>
      </div>

      {/* messages */}
      {errorMsg && (
        <div style={errorBox}>{errorMsg}</div>
      )}
      {successMsg && (
        <div style={successBox}>{successMsg}</div>
      )}

      {/* list */}
      <h3 style={{ marginTop: 24, marginBottom: 8 }}>Current Advisors</h3>
      {loading ? (
        <p>Loading…</p>
      ) : advisors.length === 0 ? (
        <p>No advisors yet.</p>
      ) : (
        advisors.map((a) => (
          <div key={a.advisor_id} style={row}>
            {editingId === a.advisor_id ? (
              // 👇 EDIT MODE
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <input
                    style={inputSmall}
                    value={editForm.advisor_first_name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, advisor_first_name: e.target.value })
                    }
                  />
                  <input
                    style={inputSmall}
                    value={editForm.advisor_last_name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, advisor_last_name: e.target.value })
                    }
                  />
                  <input
                    style={inputSmall}
                    placeholder="Role"
                    value={editForm.advisor_role}
                    onChange={(e) =>
                      setEditForm({ ...editForm, advisor_role: e.target.value })
                    }
                  />
                  <input
                    style={inputSmall}
                    placeholder="Email"
                    value={editForm.advisor_email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, advisor_email: e.target.value })
                    }
                  />
                </div>
              </div>
            ) : (
              // 👇 VIEW MODE
              <div>
                <strong>
                  {a.advisor_first_name} {a.advisor_last_name}
                </strong>
                {a.advisor_role ? ` — ${a.advisor_role}` : ""}
                {a.advisor_email ? ` • ${a.advisor_email}` : ""}
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
              <button onClick={() => deleteAdvisor(a.advisor_id)} style={btnDanger}>
                Delete
              </button>
            </div>
          </div>
        ))
      )}
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


