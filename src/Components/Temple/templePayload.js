export const EMPTY_TEMPLE = {
  name: "",
  deity: "",
  district: "",
  state: "",
  slug: "",
  deityColor: "",
  type: "",
  address: "",
  description: "",
  history: "",
  morning: "",
  evening: "",
  festivals: "",
  images: "",
  facilities: "",
  nearbyTemples: "",
  lat: "",
  lng: "",
  rating: "",
  reviews: "",
  officialWebsite: "",
  isActive: true,
};

export function templeToForm(temple) {
  if (!temple) return { ...EMPTY_TEMPLE, aartiRows: [{ key: "", value: "" }] };

  const aartiRows = Object.entries(temple.aartiTimings || {}).map(
    ([key, value]) => ({ key, value: String(value ?? "") }),
  );

  return {
    ...EMPTY_TEMPLE,
    name: temple.name || "",
    deity: temple.deity || "",
    district: temple.district || "",
    state: temple.state || "",
    slug: temple.slug || "",
    deityColor: temple.deityColor || "",
    type: temple.type || "",
    address: temple.address || "",
    description: temple.description || "",
    history: temple.history || "",
    morning: temple.timings?.morning || "",
    evening: temple.timings?.evening || "",
    festivals: (temple.festivals || []).join("\n"),
    images: (temple.images || []).join("\n"),
    facilities: (temple.facilities || []).join(", "),
    nearbyTemples: (temple.nearbyTemples || []).join("\n"),
    lat: temple.coordinates?.lat ?? "",
    lng: temple.coordinates?.lng ?? "",
    rating: temple.rating ?? "",
    reviews: temple.reviews ?? "",
    officialWebsite: temple.officialWebsite || "",
    isActive: temple.isActive !== false,
    aartiRows: aartiRows.length ? aartiRows : [{ key: "", value: "" }],
  };
}

function stringList(value) {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function formToTemplePayload(form) {
  const payload = {
    name: form.name.trim(),
    deity: form.deity.trim(),
    district: form.district.trim(),
    state: form.state.trim(),
    slug: form.slug.trim(),
    deityColor: form.deityColor.trim(),
    type: form.type.trim(),
    address: form.address.trim(),
    description: form.description.trim(),
    history: form.history.trim(),
    timings: {
      morning: form.morning.trim(),
      evening: form.evening.trim(),
    },
    aartiTimings: Object.fromEntries(
      form.aartiRows
        .filter((row) => row.key.trim())
        .map((row) => [row.key.trim(), row.value.trim()]),
    ),
    festivals: stringList(form.festivals),
    images: stringList(form.images),
    facilities: stringList(form.facilities),
    nearbyTemples: stringList(form.nearbyTemples),
    officialWebsite: form.officialWebsite.trim(),
    isActive: form.isActive,
  };

  if (form.lat !== "" || form.lng !== "") {
    payload.coordinates = { lat: Number(form.lat), lng: Number(form.lng) };
  } else {
    payload.coordinates = {};
  }

  if (form.rating !== "") payload.rating = Number(form.rating);
  if (form.reviews !== "") payload.reviews = Number(form.reviews);

  return payload;
}

export function needsTempleData(temple) {
  return !temple?.timings?.morning?.trim() || !(temple?.images || []).length;
}
