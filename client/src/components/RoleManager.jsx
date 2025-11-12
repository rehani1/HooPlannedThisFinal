import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const ROLE_OPTIONS = [
  "President",
  "Vice President",
  "Treasurer",
  "Secretary",
  "Chair",
  "Member",
];

export default function RoleManager({ gradYear, onClose }) {
  const [rows, setRows] = useState([]); // [{ id, displayName, email, role, committee_id, committee_name }]
  const [committees, setCommittees] = useState([]); // [{ committee_id, committee_name }]
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");

  // Load committees for this council
  useEffect(() => {
    if (!gradYear) return;
    const loadCommittees = async () => {
      const { data, error } = await supabase
        .from("committees")
        .select("committee_id, committee_name")
        .eq("grad_year", gradYear)
        .order("committee_name", { ascending: true });
      if (error) {
        setError(error.message);
        setCommittees([]);
      } else {
        setCommittees(data || []);
      }
    };
    loadCommittees();
  }, [gradYear]);

  // Load users for this council (join committees for display)
  useEffect(() => {
    if (!gradYear) return;

    const loadUsers = async () => {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("users")
        .select(`
          id,
          first_name,
          last_name,
          full_name,
          email,
          role,
          committee_id,
          grad_year,
          committees:committee_id ( committee_id, committee_name )
        `)
        .eq("grad_year", gradYear)
        .order("full_name", { ascending: true });

      if (error) {
        setError(error.message);
        setRows([]);
        setLoading(false);
        return;
      }

      const mapped = (data || []).map((u) => ({
        id: u.id,
        displayName:
          u.full_name ||
          `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() ||
          u.email,
        email: u.email,
        role: u.role || "",
        committee_id: u.committee_id ?? null,
        committee_name: u.committees?.committee_name || null,
      }));

      setRows(mapped);
      setLoading(false);
    };

    loadUsers();
  }, [gradYear]);

  // Save both fields (we'll reuse for committee or role change)
  const saveUser = async (id, patch) => {
    setError("");
    setSavingId(id);

    // optimistic UI
    const prev = rows;
    setRows((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x)));

    const { error } = await supabase.from("users").update(patch).eq("id", id);
    setSavingId(null);

    if (error) {
      setError(error.message || "Could not save changes.");
      // rollback
      setRows(prev);
      return;
    }

    // If we changed committee_id, update committee_name locally for display
    if (Object.prototype.hasOwnProperty.call(patch, "committee_id")) {
      const name =
        committees.find((c) => c.committee_id === patch.committee_id)?.committee_name ||
        null;
      setRows((r) =>
        r.map((x) =>
          x.id === id ? { ...x, committee_name: name } : x
        )
      );
    }
  };

  const content = useMemo(() => {
    if (loading) return <p>Loading members…</p>;
    if (!rows.length) return <p>No users found for {gradYear}.</p>;

    return (
      <div style={{ display: "grid", gap: 8 }}>
        <div style={{ fontSize: 13, color: "#475569" }}>
          <strong>Tip:</strong> Set a user’s committee and title here. Committee options
          are scoped to Class of {gradYear}.
        </div>

        <div style={{ border: "1px solid #eef1f4", borderRadius: 8 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.6fr 1.3fr 1.2fr 1fr",
              gap: 8,
              padding: "8px 10px",
              fontWeight: 700,
              borderBottom: "1px solid #eef1f4",
              background: "#f8fafc",
            }}
          >
            <div>Name</div>
            <div>Email</div>
            <div>Committee</div>
            <div>Role</div>
          </div>

          {rows.map((u) => (
            <div
              key={u.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1.6fr 1.3fr 1.2fr 1fr",
                gap: 8,
                padding: "8px 10px",
                borderBottom: "1px solid #f1f5f9",
                alignItems: "center",
              }}
            >
              <div style={{ fontWeight: 600 }}>{u.displayName}</div>
              <div style={{ fontSize: 13, color: "#475569" }}>{u.email}</div>

              {/* Committee selector */}
              <div>
                <select
                  value={u.committee_id ?? ""}
                  onChange={(e) =>
                    saveUser(u.id, {
                      committee_id: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  disabled={savingId === u.id}
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    borderRadius: 6,
                    border: "1px solid #d7dce2",
                    fontSize: 13,
                    background: savingId === u.id ? "#f8fafc" : "#fff",
                  }}
                >
                  <option value="">— none —</option>
                  {committees.map((c) => (
                    <option key={c.committee_id} value={c.committee_id}>
                      {c.committee_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Role selector */}
              <div>
                <select
                  value={u.role}
                  onChange={(e) => saveUser(u.id, { role: e.target.value })}
                  disabled={savingId === u.id}
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    borderRadius: 6,
                    border: "1px solid #d7dce2",
                    fontSize: 13,
                    background: savingId === u.id ? "#f8fafc" : "#fff",
                  }}
                >
                  <option value="">— select —</option>
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }, [loading, rows, gradYear, savingId, committees]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 4,
        }}
      >
        <h3 style={{ margin: 0 }}>Manage Roles & Committees • Class of {gradYear}</h3>
        <button
          onClick={onClose}
          style={{
            border: "none",
            background: "transparent",
            fontSize: 20,
            cursor: "pointer",
          }}
        >
          ×
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: "8px 12px",
            background: "#fff4f4",
            border: "1px solid #ffd7d7",
            borderRadius: 8,
            color: "#b00020",
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {content}
    </div>
  );
}
