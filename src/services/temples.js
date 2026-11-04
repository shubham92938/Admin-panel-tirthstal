import { apiRequest } from "./api.js";

function unwrapTemple(payload) {
  return (
    payload?.temple ||
    payload?.data?.temple ||
    (payload?.data && !Array.isArray(payload.data) ? payload.data : null) ||
    payload
  );
}

export async function listTemples(filters = {}, signal) {
  const query = new URLSearchParams();
  const allowedFilters = [
    "state",
    "district",
    "deity",
    "type",
    "search",
    "sort",
    "page",
    "limit",
  ];

  allowedFilters.forEach((key) => {
    const value = filters[key];
    if (value !== "" && value !== undefined && value !== null) {
      query.set(key, String(value));
    }
  });

  const suffix = query.size ? `?${query.toString()}` : "";
  const payload = await apiRequest(`/temples${suffix}`, { signal });
  const data = payload?.data;
  const temples = Array.isArray(data)
    ? data
    : data?.temples || payload?.temples || [];
  const pagination = data?.pagination || payload?.pagination || {};

  return {
    temples,
    pagination: {
      page: Number(
        pagination.page || pagination.currentPage || filters.page || 1,
      ),
      limit: Number(pagination.limit || filters.limit || 12),
      total: Number(
        pagination.total ?? pagination.totalItems ?? payload?.total ?? temples.length,
      ),
      pages: Number(
        pagination.pages ||
          pagination.totalPages ||
          Math.max(
            1,
            Math.ceil(
              Number(
                pagination.total ??
                  pagination.totalItems ??
                  payload?.total ??
                  temples.length,
              ) / Number(pagination.limit || filters.limit || 12),
            ),
          ),
      ),
    },
  };
}

export async function getTempleBySlug(slug, signal) {
  return unwrapTemple(
    await apiRequest(`/temples/${encodeURIComponent(slug)}`, { signal }),
  );
}

export async function createTemple(temple) {
  return unwrapTemple(
    await apiRequest("/temples", { method: "POST", body: temple }),
  );
}

export async function updateTemple(id, temple) {
  return unwrapTemple(
    await apiRequest(`/temples/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: temple,
    }),
  );
}

export async function deactivateTemple(id) {
  return apiRequest(`/temples/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function reactivateTemple(id) {
  return updateTemple(id, { isActive: true });
}
