import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import { ApiError, apiRequest } from "../src/services/api.js";
import {
  createTemple,
  deactivateTemple,
  getTempleBySlug,
  listTemples,
  reactivateTemple,
  updateTemple,
} from "../src/services/temples.js";
import {
  changedProfileFields,
  changePassword,
  getProfile,
  updateProfile,
} from "../src/services/profile.js";
import {
  formToTemplePayload,
  needsTempleData,
  templeToForm,
} from "../src/Components/Temple/templePayload.js";

let calls;
let responseQueue;

function response(body, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

beforeEach(() => {
  calls = [];
  responseQueue = [];
  const values = new Map([["token", "test-admin-token"]]);
  globalThis.window = {
    localStorage: {
      getItem: (key) => values.get(key) || null,
      removeItem: (key) => values.delete(key),
    },
    dispatchEvent: () => true,
  };
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options, body: options.body ? JSON.parse(options.body) : undefined });
    return responseQueue.shift() || response({ success: true });
  };
});

test("temple list uses public filters and authorization without changing paths", async () => {
  responseQueue.push(response({ success: true, data: { temples: [{ _id: "1" }], pagination: { page: 2, pages: 4, total: 40, limit: 12 } } }));
  const result = await listTemples({ state: "Madhya Pradesh", district: "", search: "Shiva", page: 2, limit: 12 });
  assert.equal(calls[0].url, "http://localhost:3000/api/temples?state=Madhya+Pradesh&search=Shiva&page=2&limit=12");
  assert.equal(calls[0].options.headers.Authorization, "Bearer test-admin-token");
  assert.equal(result.pagination.pages, 4);
  assert.equal(result.temples.length, 1);
});

test("temple admin lifecycle uses create, edit, soft delete, and reactivate endpoints", async () => {
  const payload = { name: "Test Temple", deity: "Shiva", district: "Indore", state: "Madhya Pradesh" };
  await getTempleBySlug("test-temple");
  await createTemple(payload);
  await updateTemple("temple-1", { ...payload, name: "Edited Temple" });
  await deactivateTemple("temple-1");
  await reactivateTemple("temple-1");

  assert.deepEqual(calls.map((call) => [call.options.method || "GET", call.url]), [
    ["GET", "http://localhost:3000/api/temples/test-temple"],
    ["POST", "http://localhost:3000/api/temples"],
    ["PUT", "http://localhost:3000/api/temples/temple-1"],
    ["DELETE", "http://localhost:3000/api/temples/temple-1"],
    ["PUT", "http://localhost:3000/api/temples/temple-1"],
  ]);
  assert.equal(calls.some((call) => call.url.includes("/temples/api/login")), false);
  assert.deepEqual(calls[4].body, { isActive: true });
});

test("temple form maps every structured backend field and needs-data rule", () => {
  const form = templeToForm(null);
  const complete = {
    ...form,
    name: "Temple", deity: "Vishnu", district: "Indore", state: "MP",
    morning: "6 AM", evening: "7 PM", images: "https://example.com/a.jpg",
    festivals: "Diwali\nHoli", facilities: "Parking, Water", nearbyTemples: "Other",
    lat: "22.7", lng: "75.8", rating: "4.5", reviews: "10",
    aartiRows: [{ key: "morningAarti", value: "6:00 AM" }],
  };
  const payload = formToTemplePayload(complete);
  assert.deepEqual(payload.timings, { morning: "6 AM", evening: "7 PM" });
  assert.deepEqual(payload.aartiTimings, { morningAarti: "6:00 AM" });
  assert.deepEqual(payload.coordinates, { lat: 22.7, lng: 75.8 });
  assert.equal(payload.rating, 4.5);
  assert.equal(payload.reviews, 10);
  assert.deepEqual(payload.festivals, ["Diwali", "Holi"]);
  assert.equal(needsTempleData({ timings: { morning: "" }, images: ["url"] }), true);
  assert.equal(needsTempleData({ timings: { morning: "6 AM" }, images: [] }), true);
  assert.equal(needsTempleData({ timings: { morning: "6 AM" }, images: ["url"] }), false);
});

test("profile reads, updates only changed fields, and clears phone with an empty string", async () => {
  responseQueue.push(response({ success: true, user: { name: "Admin", language: "en" } }));
  await getProfile();
  const original = { name: "Admin", language: "en", phone: "+919999999999", city: "Indore", bio: "Old" };
  const current = { ...original, phone: "", city: "Ujjain" };
  const changes = changedProfileFields(original, current);
  assert.deepEqual(changes, { phone: "", city: "Ujjain" });
  await updateProfile(changes);
  assert.equal(calls[0].url, "http://localhost:3000/api/auth/profile");
  assert.equal(calls[1].options.method, "PUT");
  assert.deepEqual(calls[1].body, { phone: "", city: "Ujjain" });
});

test("wrong current password shows 400 without logout, then correct password succeeds", async () => {
  responseQueue.push(response({ success: false, message: "Current password is incorrect" }, 400));
  await assert.rejects(changePassword("wrong", "new-secret"), (error) => {
    assert.equal(error.status, 400);
    assert.equal(error.message, "Current password is incorrect");
    return true;
  });
  assert.equal(window.localStorage.getItem("token"), "test-admin-token");

  responseQueue.push(response({ success: true, message: "Password changed successfully" }));
  await changePassword("right-current", "new-secret");
  assert.deepEqual(calls[1].body, { currentPassword: "right-current", newPassword: "new-secret" });
  assert.equal(calls[1].url, "http://localhost:3000/api/auth/change-password");
});

test("401 expires the admin session and 429 preserves the backend message", async () => {
  responseQueue.push(response({ success: false, message: "Session expired" }, 401));
  await assert.rejects(apiRequest("/auth/profile"), (error) => error.status === 401);
  assert.equal(window.localStorage.getItem("token"), null);

  window.localStorage.getItem = () => "new-token";
  responseQueue.push(response({ success: false, message: "Too many requests, please try later." }, 429));
  await assert.rejects(apiRequest("/temples"), (error) => {
    assert.ok(error instanceof ApiError);
    assert.equal(error.message, "Too many requests, please try later.");
    assert.equal(error.status, 429);
    return true;
  });
});
