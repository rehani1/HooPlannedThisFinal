// src/components/CouncilManager.jsx
import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "../lib/supabaseClient";

const COUNCIL_BUCKET = "avatars"; // change if you made a separate bucket

export default function CouncilManager({
  onClose,
  mode = "create", // "create" | "edit"
  initialCouncil = null, // when editing, pass the council row here
}) {
  const [advisors, setAdvisors] = useState([]);
  const [loadingAdvisors, setLoadingAdvisors] = useState(true);

  const [form, setForm] = useState({
    grad_year: "",
    academic_year_fall: "",
    academic_year_spring: "",
    advisor_id: "",
  });
  const [logoFile, setLogoFile] = useState(null);

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // 1) load advisors for dropdown
  useEffect(() => {
    const load = async () => {
      setLoadingAdvisors(true);
      const { data, error } = await supabase
        .from("advisors")
        .select("advisor_id, advisor_first_name, advisor_last_name")
        .order("advisor_last_name", { ascending: true });

      if (error) {
        console.error("Error loading advisors:", error);
        setErrorMsg(error.message || "Could not load advisors.");
        setAdvisors([]);
      } else {
        setAdvisors(data || []);
      }
      setLoadingAdvisors(false);
    };
    load();
  }, []);

  // 2) prefill form if we're editing
  useEffect(() => {
    if (mode === "edit" && initialCouncil) {
      setForm({
        grad_year: initialCouncil.grad_year?.toString() || "",
        academic_year_fall: initialCouncil.academic_year_fall
          ? initialCouncil.academic_year_fall.toString()
          : "",
        academic_year_spring: initialCouncil.academic_year_spring
          ? initialCouncil.academic_year_spring.toString()
          : "",
        advisor_id: initialCouncil.advisor_id
          ? initialCouncil.advisor_id.toString()
          : "",
      });
    }
  }, [mode, initialCouncil]);

  // 3) compute council name from years
  const computedCouncilName = useMemo(() => {
    const grad = Number(form.grad_year);
    // prefer spring; if fall only, assume spring = fall + 1
    let spring = form.academic_year_spring
      ? Number(form.academic_year_spring)
      : form.academic_year_fall
      ? Number(form.academic_year_fall) + 1
      : NaN;

    if (!grad || !spring) return "";

    const diff = grad - spring; // 0..3
    switch (diff) {
      case 0:
        return "Fourth Year Trustees";
      case 1:
        return "Third Year Council";
      case 2:
        return "Second Year Council";
      case 3:
        return "First Year Council";
      default:
        return "Unknown council";
    }
  }, [form.grad_year, form.academic_year_fall, form.academic_year_spring]);

  // 4) helper to upload logo
  async function uploadCouncilLogo(gradYear, file) {
    if (!file) return { path: null, publicUrl: null, error: null };

    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const fileName = `${Date.now()}.${ext}`;
    const path = `councils/${gradYear}/${fileName}`;

    const { error: uploadErr } = await supabase.storage
      .from(COUNCIL_BUCKET)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type,
      });

    if (uploadErr) {
      return { error: uploadErr, path: null, publicUrl: null };
    }

    const { data: pub } = supabase.storage
      .from(COUNCIL_BUCKET)
      .getPublicUrl(path);

    return {
      path,
      publicUrl: pub?.publicUrl ?? null,
      error: null,
    };
  }

  // 5) handle submit for both create + edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // basic validation
    if (!form.grad_year) {
      setErrorMsg("Graduation year is required.");
      return;
    }
    if (!form.academic_year_fall && !form.academic_year_spring) {
      setErrorMsg("At least one of academic fall or spring year is required.");
      return;
    }
    if (!computedCouncilName) {
      setErrorMsg("Could not determine council name from the years.");
      return;
    }

    const advisorId =
      form.advisor_id && form.advisor_id !== ""
        ? Number(form.advisor_id)
        : null;

    // final spring year we will store
    const springYear = form.academic_year_spring
      ? Number(form.academic_year_spring)
      : form.academic_year_fall
      ? Number(form.academic_year_fall) + 1
      : null;

    // --------------------------------------------------
    // CREATE MODE
    // --------------------------------------------------
    if (mode === "create") {
      // check first to avoid PK violation
      const { data: existingCouncil, error: existingError } = await supabase
        .from("councils")
        .select("grad_year")
        .eq("grad_year", Number(form.grad_year))
        .maybeSingle();

      if (existingError) {
        console.error("Error checking existing council:", existingError);
        setErrorMsg(
          existingError.message || "Could not verify existing council."
        );
        return;
      }

      if (existingCouncil) {
        setErrorMsg(
          `A council for the Class of ${form.grad_year} already exists.`
        );
        return;
      }

      setSaving(true);

      // upload logo if present
      let logoPath = null;
      if (logoFile) {
        const { error: logoErr, path } = await uploadCouncilLogo(
          form.grad_year,
          logoFile
        );
        if (logoErr) {
          console.error("Logo upload error:", logoErr);
          setErrorMsg(logoErr.message || "Logo upload failed.");
          setSaving(false);
          return;
        }
        logoPath = path;
      }

      const insertPayload = {
        grad_year: Number(form.grad_year),
        academic_year_fall: form.academic_year_fall
          ? Number(form.academic_year_fall)
          : null,
        academic_year_spring: springYear,
        class_name: { name: computedCouncilName },
        advisor_id: advisorId,
        class_logo: logoPath,
      };

      const { error } = await supabase.from("councils").insert([insertPayload]);

      if (error) {
        console.error("Error inserting council:", error);
        setErrorMsg(error.message || "Could not create council.");
        setSaving(false);
        return;
      }

      setSuccessMsg("Council created.");
      setSaving(false);
      setForm({
        grad_year: "",
        academic_year_fall: "",
        academic_year_spring: "",
        advisor_id: "",
      });
      setLogoFile(null);
      if (onClose) onClose();
      return;
    }

    // // --------------------------------------------------
    // // EDIT MODE
    // // --------------------------------------------------
    // if (mode === "edit" && initialCouncil) {
    //   setSaving(true);
    //
    //   // if a new logo was chosen, upload; else keep old
    //   let logoPath = initialCouncil.class_logo || null;
    //   if (logoFile) {
    //     const { error: logoErr, path } = await uploadCouncilLogo(
    //       form.grad_year,
    //       logoFile
    //     );
    //     if (logoErr) {
    //       console.error("Logo upload error:", logoErr);
    //       setErrorMsg(logoErr.message || "Logo upload failed.");
    //       setSaving(false);
    //       return;
    //     }
    //     logoPath = path;
    //   }
    //
    //   const { error } = await supabase
    //     .from("councils")
    //     .update({
    //       academic_year_fall: form.academic_year_fall
    //         ? Number(form.academic_year_fall)
    //         : null,
    //       academic_year_spring: springYear,
    //       class_name: { name: computedCouncilName },
    //       advisor_id: advisorId,
    //       class_logo: logoPath,
    //     })
    //     // table uses grad_year as PK
    //     .eq("grad_year", Number(initialCouncil.grad_year));
    //
    //   if (error) {
    //     console.error("Error updating council:", error);
    //     setErrorMsg(error.message || "Could not update council.");
    //     setSaving(false);
    //     return;
    //   }
    //
    //   setSuccessMsg("Council updated.");
    //   setSaving(false);
    //   setLogoFile(null);
    //   if (onClose) onClose();
    //   return;
    // }
      // --------------------------------------------------
// EDIT MODE
// --------------------------------------------------
//     if (mode === "edit" && initialCouncil) {
//       console.log("🟦 [CouncilManager] edit submit for council:", initialCouncil);
//       setSaving(true);
//
//       // compute final spring year again
//       const springYear = form.academic_year_spring
//         ? Number(form.academic_year_spring)
//         : form.academic_year_fall
//         ? Number(form.academic_year_fall) + 1
//         : null;
//
//       // make sure advisor is either number or null
//       const advisorId =
//         form.advisor_id && form.advisor_id !== ""
//           ? Number(form.advisor_id)
//           : null;
//       console.log("🟣 [CouncilManager] final advisorId to save:", advisorId);
//
//       // logo stuff
//       let logoPath = initialCouncil.class_logo || null;
//       if (logoFile) {
//         const { error: logoErr, path } = await uploadCouncilLogo(
//           form.grad_year,
//           logoFile
//         );
//         if (logoErr) {
//           console.error("❌ [CouncilManager] logo upload error:", logoErr);
//           setErrorMsg(logoErr.message || "Logo upload failed.");
//           setSaving(false);
//           return;
//         }
//         logoPath = path;
//       }
//
//       const updatePayload = {
//         academic_year_fall: form.academic_year_fall
//           ? Number(form.academic_year_fall)
//           : null,
//         academic_year_spring: springYear,
//         class_name: { name: computedCouncilName },
//         advisor_id: advisorId,
//         class_logo: logoPath,
//       };
//
//       console.log("📨 [CouncilManager] update payload:", updatePayload);
//
//       const { error } = await supabase
//         .from("councils")
//         .update(updatePayload)
//         .eq("grad_year", Number(initialCouncil.grad_year));
//
//       if (error) {
//         console.error("❌ [CouncilManager] update error:", error);
//         setErrorMsg(error.message || "Could not update council.");
//         setSaving(false);
//         return;
//       }
//
//       console.log("✅ [CouncilManager] council updated in DB");
//
//       setSuccessMsg("Council updated.");
//       setSaving(false);
//       setLogoFile(null);
//
//       if (onClose) {
//         console.log("🟢 [CouncilManager] calling onClose() so Admin can reload");
//         onClose();
//       }
//
//       return;
//     }
//
//   };

      if (mode === "edit" && initialCouncil) {

          setSaving(true);
          setErrorMsg("");
          setSuccessMsg("");

          // make sure it’s an integer or null
          const advisorId =
            form.advisor_id && form.advisor_id !== ""
              ? parseInt(form.advisor_id, 10)
              : null;

          // recompute spring the same way you do
          const springYear = form.academic_year_spring
            ? Number(form.academic_year_spring)
            : form.academic_year_fall
            ? Number(form.academic_year_fall) + 1
            : null;

          // start with the guaranteed-good fields
          const updatePayload = {
            academic_year_fall: form.academic_year_fall
              ? Number(form.academic_year_fall)
              : null,
            academic_year_spring: springYear,
            advisor_id: advisorId,
          };

          // only add class_name if you actually want to change it
          if (computedCouncilName) {
            updatePayload.class_name = { name: computedCouncilName };
          }

          // only add logo if you actually uploaded one
          let finalLogoPath = initialCouncil.class_logo || null;
          if (logoFile) {
            const { error: logoErr, path } = await uploadCouncilLogo(
              form.grad_year,
              logoFile
            );
            if (logoErr) {
              console.error("logo upload error:", logoErr);
              setErrorMsg(logoErr.message || "Logo upload failed.");
              setSaving(false);
              return;
            }
            finalLogoPath = path;
          }
          updatePayload.class_logo = finalLogoPath;

          const { data, error } = await supabase
            .from("councils")
            .update(updatePayload)
            .eq("grad_year", Number(initialCouncil.grad_year))
            .select(); // ← let’s see what came back

          if (error) {
            console.error("❌ council update error:", error);
            setErrorMsg(error.message || "Could not update council.");
            setSaving(false);
            return;
          }

          console.log("✅ updated council:", data);

          setSuccessMsg("Council updated.");
          setSaving(false);
          setLogoFile(null);
          if (onClose) onClose();
          return;
      }

      };

  return (
    <div style={wrap}>
      <h3 style={{ marginTop: 0, marginBottom: 8 }}>
        {mode === "edit" ? "Edit Council" : "Create Council"}
      </h3>
      <p
        style={{
          marginTop: 0,
          marginBottom: 16,
          fontSize: 13,
          color: "#4b5563",
        }}
      >
        Enter the years — the council name will be calculated automatically.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10 }}>
        <input
          style={input}
          type="number"
          placeholder="Graduation Year (e.g. 2026)"
          value={form.grad_year}
          onChange={(e) => setForm({ ...form, grad_year: e.target.value })}
          disabled={mode === "edit"} // PK, so let's not change it in edit
        />
        <input
          style={input}
          type="number"
          placeholder="Academic Year (Fall) e.g. 2025"
          value={form.academic_year_fall}
          onChange={(e) =>
            setForm({ ...form, academic_year_fall: e.target.value })
          }
        />
        <input
          style={input}
          type="number"
          placeholder="Academic Year (Spring) e.g. 2026"
          value={form.academic_year_spring}
          onChange={(e) =>
            setForm({ ...form, academic_year_spring: e.target.value })
          }
        />

        {/* show computed name */}
        <div
          style={{
            padding: "8px 10px",
            borderRadius: 8,
            background: "#f3f7fb",
            border: "1px solid #d7dce2",
            fontSize: 14,
          }}
        >
          <strong>Computed council name: </strong>
          {computedCouncilName || "—"}
        </div>



        <label style={{ fontSize: 13, color: "#003e83" }}>
          Advisor (optional)
        </label>
        <select
          style={input}
          value={form.advisor_id}
          onChange={(e) => {
            const val = e.target.value; // string
            console.log("🟣 [CouncilManager] advisor changed in form to:", val);
            setForm({ ...form, advisor_id: val });
          }}
        >
          <option value="">— Select advisor —</option>
          {loadingAdvisors ? (
            <option disabled>Loading advisors…</option>
          ) : advisors.length === 0 ? (
            <option disabled>No advisors found</option>
          ) : (
            advisors.map((a) => (
              <option key={a.advisor_id} value={a.advisor_id}>
                {a.advisor_first_name} {a.advisor_last_name}
              </option>
            ))
          )}
        </select>


        <label style={{ fontSize: 13, color: "#003e83" }}>
          Class logo (optional)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
        />

        <button type="submit" style={btnPrimary} disabled={saving}>
          {saving
            ? mode === "edit"
              ? "Saving…"
              : "Creating…"
            : mode === "edit"
            ? "Save Changes"
            : "Create Council"}
        </button>
      </form>

      {errorMsg && <div style={errorBox}>{errorMsg}</div>}
      {successMsg && <div style={successBox}>{successMsg}</div>}

      {onClose && (
        <div style={{ marginTop: 16, textAlign: "right" }}>
          <button onClick={onClose} style={btnSecondary}>
            Close
          </button>
        </div>
      )}
    </div>
  );
}

/* styles */
const wrap = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  fontFamily:
    '"Montserrat", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
  color: "#003e83",
};
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
  padding: "9px 12px",
  fontWeight: 600,
  cursor: "pointer",
};
const btnSecondary = {
  background: "#fff",
  color: "#003e83",
  border: "1px solid #d7dce2",
  borderRadius: 8,
  padding: "7px 10px",
  fontWeight: 600,
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
