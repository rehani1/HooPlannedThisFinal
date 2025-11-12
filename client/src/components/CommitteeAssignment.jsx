// src/components/CommitteeAssign.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function CommitteeAssign({ committee, onClose }) {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState("Member");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // load users in same grad year
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      const { data, error } = await supabase
        .from("users")
        .select("id, full_name, first_name, last_name, email, committee_id, role, grad_year")
        .eq("grad_year", committee.grad_year)
        .order("full_name", { ascending: true });

      if (error) {
        setError(error.message);
        setUsers([]);
      } else {
        setUsers(data || []);
      }
      setLoading(false);
    };
    load();
  }, [committee.grad_year]);

  const handleAssign = async (e) => {
    e.preventDefault();
    setError("");

    if (!selectedUserId) {
      setError("Select a user first.");
      return;
    }

    const { error } = await supabase
      .from("users")
      .update({
        committee_id: committee.committee_id,
        role: selectedRole,
      })
      .eq("id", selectedUserId);

    if (error) {
      setError(error.message);
      return;
    }

    // refresh user list so you can see who is assigned
    const { data } = await supabase
      .from("users")
      .select("id, full_name, first_name, last_name, email, committee_id, role, grad_year")
      .eq("grad_year", committee.grad_year)
      .order("full_name", { ascending: true });

    setUsers(data || []);
    setSelectedUserId("");
    setSelectedRole("Member");
  };

  const assignedUsers = users.filter(
    (u) => u.committee_id === committee.committee_id
  );
  const unassignedUsers = users.filter(
    (u) => u.committee_id === null || u.committee_id === undefined
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0 }}>
            {committee.committee_name} Committee!
        </h3>
        <button onClick={onClose} style={{ border: "none", background: "transparent", fontSize: 20, cursor: "pointer" }}>
          ×
        </button>
      </div>

      {loading ? (
        <p>Loading users…</p>
      ) : (
        <>
          <div>
            <strong>Current members:</strong>
            {assignedUsers.length === 0 ? (
              <p style={{ marginTop: 4, fontSize: 13 }}>None yet.</p>
            ) : (
              <ul style={{ marginTop: 4 }}>
                {assignedUsers.map((u) => (
                  <li key={u.id}>
                    {(u.full_name ||
                      `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() ||
                      u.email) +
                      (u.role ? ` — ${u.role}` : "")}
                  </li>
                ))}
              </ul>
            )}
          </div>


        </>
      )}
    </div>
  );
}
