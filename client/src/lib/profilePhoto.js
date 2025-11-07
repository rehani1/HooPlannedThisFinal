// src/lib/profilePhoto.js
import { supabase } from "./supabaseClient";

// bucket name — change here if you rename it
const AVATAR_BUCKET = "avatars";

/**
 * Uploads a profile photo for the currently logged-in user.
 * 1) gets the user
 * 2) uploads to storage at userId/timestamp.ext
 * 3) saves path to public.users.profile_picture
 * 4) returns { publicUrl, path, error }
 */
export async function uploadProfilePhoto(file) {
  // make sure we have a user
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return { error: authErr || new Error("No user logged in.") };
  }

  // build storage path
  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const fileName = `${Date.now()}.${ext}`;
  const path = `${user.id}/${fileName}`;

  // upload to storage
  const { error: uploadErr } = await supabase
    .storage
    .from(AVATAR_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type,
    });

  if (uploadErr) {
    return { error: uploadErr };
  }

  // save path to users table
  const { error: updateErr } = await supabase
    .from("users")
    .update({ profile_picture: path })
    .eq("id", user.id);

  if (updateErr) {
    return { error: updateErr };
  }

  // get public URL
  const { data: pub } = supabase
    .storage
    .from(AVATAR_BUCKET)
    .getPublicUrl(path);

  return {
    path,
    publicUrl: pub?.publicUrl ?? null,
    error: null,
  };
}

/**
 * Given a users row with profile_picture, return a public URL,
 * or a default image if empty.
 */
export function getProfilePhotoFromRow(row, fallback = "/cav_man.png") {
  if (!row?.profile_picture) return fallback;
  const { data: pub } = supabase
    .storage
    .from(AVATAR_BUCKET)
    .getPublicUrl(row.profile_picture);
  return pub?.publicUrl ?? fallback;
}

/**
 * Upload a photo for a specific advisor and save it to advisors.advisor_profile_picture
 */
export async function uploadAdvisorPhoto(advisorId, file) {
  if (!advisorId) {
    return { error: new Error("advisorId is required") };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const fileName = `${Date.now()}.${ext}`;
  // store under advisors/<advisorId>/<file>
  const path = `advisors/${advisorId}/${fileName}`;

  const { error: uploadErr } = await supabase
    .storage
    .from(AVATAR_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type,
    });

  if (uploadErr) {
    return { error: uploadErr };
  }

  // update advisors table
  const { error: updateErr } = await supabase
    .from("advisors")
    .update({ advisor_profile_picture: path })
    .eq("advisor_id", advisorId);

  if (updateErr) {
    return { error: updateErr };
  }

  const { data: pub } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);

  return {
    path,
    publicUrl: pub?.publicUrl ?? null,
    error: null,
  };
}

/**
 * Convert advisors.advisor_profile_picture to a public URL
 */
export function getAdvisorPhotoFromRow(row, fallback = "/cav_man.png") {
  if (!row?.advisor_profile_picture) return fallback;
  const { data: pub } = supabase
    .storage
    .from(AVATAR_BUCKET)
    .getPublicUrl(row.advisor_profile_picture);
  return pub?.publicUrl ?? fallback;
}
