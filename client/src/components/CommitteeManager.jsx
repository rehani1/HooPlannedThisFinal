// src/components/CommitteeManager.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function CommitteeManager({ gradYear }) {
  const [committees, setCommittees] = useState([]);
  const [name, setName] = useState("");
  const [budget, setBudget] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!gradYear) return;
    const load = async () => {
      const { data, error } = await supabase
        .from("committees")
        .select("committee_id, committee_name, committee_budget")
        .eq("grad_year", gradYear)
        .order("committee_name", { ascending: true });
      if (!error) setCommittees(data || []);
    };
    load();
  }, [gradYear]);

  const addCommittee = async () => {
    setError("");
    if (!name) {
      setError("Committee name is required.");
      return;
    }
    const { error } = await supabase.from("committees").insert([
      {
        committee_name: name,
        committee_budget: budget ? Number(budget) : null,
        grad_year: gradYear,
      },
    ]);
    if (error) {
      setError(error.message);
      return;
    }
    setName("");
    setBudget("");
    // reload
    const { data } = await supabase
      .from("committees")
      .select("committee_id, committee_name, committee_budget")
      .eq("grad_year", gradYear)
      .order("committee_name", { ascending: true });
    setCommittees(data || []);
  };

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <h4 style={{ margin: 0 }}>Committees for {gradYear}</h4>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Committee name"
        />
        <input
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder="Budget"
          type="number"
        />
        <button onClick={addCommittee}>Add</button>
      </div>

      {error ? <div style={{ color: "red" }}>{error}</div> : null}

      <ul style={{ margin: 0, paddingLeft: 16 }}>
        {committees.map((c) => (
          <li key={c.committee_id}>
            {c.committee_name}{" "}
            {c.committee_budget ? `($${c.committee_budget})` : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
