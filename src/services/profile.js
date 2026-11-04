import { apiRequest } from "./api.js";

const EDITABLE_FIELDS = ["name", "language", "phone", "city", "bio"];

function unwrapProfile(payload) {
  return payload?.user || payload?.profile || payload?.data?.user || payload?.data || payload;
}

export async function getProfile(signal) {
  return unwrapProfile(await apiRequest("/auth/profile", { signal }));
}

export function changedProfileFields(original, current) {
  return EDITABLE_FIELDS.reduce((changes, field) => {
    const previous = original?.[field] ?? "";
    const next = current?.[field] ?? "";
    if (previous !== next) changes[field] = next;
    return changes;
  }, {});
}

export async function updateProfile(changes) {
  return unwrapProfile(
    await apiRequest("/auth/profile", { method: "PUT", body: changes }),
  );
}

export function changePassword(currentPassword, newPassword) {
  return apiRequest("/auth/change-password", {
    method: "PUT",
    body: { currentPassword, newPassword },
  });
}
