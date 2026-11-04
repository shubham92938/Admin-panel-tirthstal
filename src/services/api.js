/* global __VITE_API_URL__, __VITE_PROD__ */

// Vite defines these constants at build time. The typeof fallbacks keep the
// service modules directly testable in Node without a browser or Vite runtime.
const configuredUrl =
  typeof __VITE_API_URL__ !== "undefined" ? __VITE_API_URL__.trim() : "";
const isProduction =
  typeof __VITE_PROD__ !== "undefined" ? __VITE_PROD__ : false;

if (isProduction && !configuredUrl) {
  throw new Error(
    "VITE_API_URL is required for production builds. Set it to the backend API root, including /api.",
  );
}

export const API_BASE_URL = (
  configuredUrl || "http://localhost:3000/api"
).replace(/\/+$/, "");

const TOKEN_KEYS = ["token", "adminToken", "authToken"];

export class ApiError extends Error {
  constructor(message, status = 0, errors = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = Array.isArray(errors) ? errors : [];
  }
}

export function getAuthToken() {
  if (typeof window === "undefined") return null;

  for (const key of TOKEN_KEYS) {
    const value = window.localStorage.getItem(key);
    if (value) return value;
  }

  return null;
}

export function clearAdminSession() {
  if (typeof window === "undefined") return;
  TOKEN_KEYS.forEach((key) => window.localStorage.removeItem(key));
}

function expireSession() {
  clearAdminSession();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("admin:session-expired"));
  }
}

/**
 * Sends JSON to the backend and normalizes its success/error contract.
 * Only a 401 clears the session; validation, password, and rate-limit errors
 * are returned to the form with the backend's original message.
 */
export async function apiRequest(path, options = {}) {
  const { body, headers, ...fetchOptions } = options;
  const token = getAuthToken();
  const requestHeaders = { Accept: "application/json", ...headers };

  if (token) requestHeaders.Authorization = `Bearer ${token}`;
  if (body !== undefined) requestHeaders["Content-Type"] = "application/json";

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...fetchOptions,
      headers: requestHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      "Unable to reach the server. Check your connection and that this panel's origin is allowed by the backend CLIENT_URL setting.",
    );
  }

  let payload = null;
  if (response.status !== 204) {
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }
  }

  if (!response.ok || payload?.success === false) {
    if (response.status === 401) expireSession();

    throw new ApiError(
      payload?.message || `Request failed (${response.status}).`,
      response.status,
      payload?.errors,
    );
  }

  return payload || { success: true };
}

export function errorDetails(error) {
  return {
    message:
      error instanceof Error
        ? error.message
        : "Something went wrong. Please try again.",
    fields: Array.isArray(error?.errors) ? error.errors : [],
  };
}
