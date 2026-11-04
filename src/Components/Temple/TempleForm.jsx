import { useState } from "react";
import { errorDetails } from "../../services/api";
import { createTemple, updateTemple } from "../../services/temples";
import {
  formToTemplePayload,
  templeToForm,
} from "./templePayload";

function Field({ label, required, hint, children, className = "" }) {
  return (
    <label className={`ts-field ${className}`}>
      <span className="ts-label">
        {label} {required && <span aria-hidden="true">*</span>}
      </span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}

export default function TempleForm({ temple, onClose, onSaved }) {
  const [form, setForm] = useState(() => templeToForm(temple));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const set = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const updateAarti = (index, property, value) => {
    setForm((current) => ({
      ...current,
      aartiRows: current.aartiRows.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [property]: value } : row,
      ),
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError(null);

    if ((form.lat === "") !== (form.lng === "")) {
      setError({ message: "Enter both latitude and longitude, or leave both empty.", fields: [] });
      return;
    }

    setSaving(true);
    try {
      const payload = formToTemplePayload(form);
      const saved = temple?._id
        ? await updateTemple(temple._id, payload)
        : await createTemple(payload);
      onSaved(saved || { ...temple, ...payload }, payload);
    } catch (requestError) {
      setError(errorDetails(requestError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ts-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="ts-modal ts-temple-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="temple-form-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="ts-modal-header">
          <div>
            <span className="ts-eyebrow">{temple ? "Temple record" : "New temple"}</span>
            <h2 id="temple-form-title">{temple ? "Edit temple" : "Add a temple"}</h2>
            <p>Required fields are marked with an asterisk.</p>
          </div>
          <button className="ts-icon-button" type="button" onClick={onClose} aria-label="Close form">×</button>
        </header>

        <form onSubmit={submit}>
          <div className="ts-modal-body">
            {error && (
              <div className="ts-alert ts-alert-error" role="alert">
                <strong>{error.message}</strong>
                {error.fields.length > 0 && (
                  <ul>{error.fields.map((item, index) => <li key={`${item.field}-${index}`}>{item.field}: {item.message}</li>)}</ul>
                )}
              </div>
            )}

            <fieldset className="ts-form-section">
              <legend>Basic information</legend>
              <div className="ts-form-grid">
                <Field label="Temple name" required className="ts-span-2">
                  <input name="name" value={form.name} onChange={set} maxLength={150} required autoFocus />
                </Field>
                <Field label="Deity" required>
                  <input name="deity" value={form.deity} onChange={set} required />
                </Field>
                <Field label="Deity color" hint="Hex or CSS color, if used by the website.">
                  <input name="deityColor" value={form.deityColor} onChange={set} placeholder="#7c3aed" />
                </Field>
                <Field label="Slug" hint="Leave empty to generate it from the name.">
                  <input name="slug" value={form.slug} onChange={set} placeholder="auto-generated-from-name" />
                </Field>
                <Field label="Temple type">
                  <input name="type" value={form.type} onChange={set} placeholder="Jyotirlinga, Shaktipeeth…" />
                </Field>
                <Field label="Official website" className="ts-span-2">
                  <input name="officialWebsite" type="url" value={form.officialWebsite} onChange={set} placeholder="https://" />
                </Field>
                <Field label="Description" className="ts-span-2">
                  <textarea name="description" value={form.description} onChange={set} rows={4} />
                </Field>
                <Field label="History" className="ts-span-2">
                  <textarea name="history" value={form.history} onChange={set} rows={4} />
                </Field>
              </div>
            </fieldset>

            <fieldset className="ts-form-section">
              <legend>Location</legend>
              <div className="ts-form-grid">
                <Field label="District" required>
                  <input name="district" value={form.district} onChange={set} required />
                </Field>
                <Field label="State" required>
                  <input name="state" value={form.state} onChange={set} required />
                </Field>
                <Field label="Full address" className="ts-span-2">
                  <textarea name="address" value={form.address} onChange={set} rows={2} />
                </Field>
                <Field label="Latitude">
                  <input name="lat" type="number" min={-90} max={90} step="any" value={form.lat} onChange={set} />
                </Field>
                <Field label="Longitude">
                  <input name="lng" type="number" min={-180} max={180} step="any" value={form.lng} onChange={set} />
                </Field>
              </div>
            </fieldset>

            <fieldset className="ts-form-section">
              <legend>Darshan and aarti timings</legend>
              <div className="ts-form-grid">
                <Field label="Morning timings">
                  <input name="morning" value={form.morning} onChange={set} placeholder="6:00 AM – 12:00 PM" />
                </Field>
                <Field label="Evening timings">
                  <input name="evening" value={form.evening} onChange={set} placeholder="4:00 PM – 9:00 PM" />
                </Field>
              </div>
              <div className="ts-aarti-heading">
                <span className="ts-label">Aarti timings</span>
                <button type="button" className="ts-text-button" onClick={() => setForm((current) => ({ ...current, aartiRows: [...current.aartiRows, { key: "", value: "" }] }))}>+ Add aarti</button>
              </div>
              {form.aartiRows.map((row, index) => (
                <div className="ts-aarti-row" key={index}>
                  <input aria-label={`Aarti ${index + 1} name`} value={row.key} onChange={(event) => updateAarti(index, "key", event.target.value)} placeholder="morningAarti" />
                  <input aria-label={`Aarti ${index + 1} time`} value={row.value} onChange={(event) => updateAarti(index, "value", event.target.value)} placeholder="6:00 AM" />
                  <button type="button" className="ts-icon-button" aria-label={`Remove aarti ${index + 1}`} onClick={() => setForm((current) => ({ ...current, aartiRows: current.aartiRows.filter((_, rowIndex) => rowIndex !== index) }))}>×</button>
                </div>
              ))}
            </fieldset>

            <fieldset className="ts-form-section">
              <legend>Visitor information</legend>
              <div className="ts-form-grid">
                <Field label="Image URLs" hint="One public image URL per line; no files are uploaded." className="ts-span-2">
                  <textarea name="images" value={form.images} onChange={set} rows={4} placeholder="https://example.com/temple.jpg" />
                </Field>
                <Field label="Facilities" hint="Separate facilities with commas or new lines.">
                  <textarea name="facilities" value={form.facilities} onChange={set} rows={3} placeholder="Parking, Drinking Water" />
                </Field>
                <Field label="Festivals" hint="One festival per line or comma separated.">
                  <textarea name="festivals" value={form.festivals} onChange={set} rows={3} />
                </Field>
                <Field label="Nearby temples" hint="One temple per line or comma separated." className="ts-span-2">
                  <textarea name="nearbyTemples" value={form.nearbyTemples} onChange={set} rows={2} />
                </Field>
                <Field label="Rating">
                  <input name="rating" type="number" min={0} max={5} step="0.1" value={form.rating} onChange={set} />
                </Field>
                <Field label="Review count">
                  <input name="reviews" type="number" min={0} step={1} value={form.reviews} onChange={set} />
                </Field>
              </div>
            </fieldset>

            <label className="ts-checkbox-row">
              <input name="isActive" type="checkbox" checked={form.isActive} onChange={set} />
              <span><strong>Active temple</strong><small>Inactive temples are hidden from the public list.</small></span>
            </label>
          </div>

          <footer className="ts-modal-footer">
            <button type="button" className="ts-button ts-button-secondary" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="ts-button ts-button-primary" disabled={saving}>
              {saving ? "Saving…" : temple ? "Save changes" : "Create temple"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
