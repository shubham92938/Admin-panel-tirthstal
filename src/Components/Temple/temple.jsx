import { useCallback, useEffect, useState } from "react";
import { errorDetails } from "../../services/api";
import {
  deactivateTemple,
  getTempleBySlug,
  listTemples,
  reactivateTemple,
} from "../../services/temples";
import TempleForm from "./TempleForm";
import { needsTempleData } from "./templePayload";
import "./temple.css";

const INITIAL_FILTERS = {
  search: "",
  state: "",
  district: "",
  deity: "",
  type: "",
  sort: "",
};

function Feedback({ feedback, onDismiss }) {
  if (!feedback) return null;
  return (
    <div className={`ts-alert ts-alert-${feedback.type}`} role={feedback.type === "error" ? "alert" : "status"}>
      <div>
        <strong>{feedback.message}</strong>
        {feedback.fields?.length > 0 && (
          <ul>{feedback.fields.map((item, index) => <li key={`${item.field}-${index}`}>{item.field}: {item.message}</li>)}</ul>
        )}
      </div>
      {onDismiss && <button type="button" onClick={onDismiss} aria-label="Dismiss message">×</button>}
    </div>
  );
}

export default function Temple() {
  const [temples, setTemples] = useState([]);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [formTarget, setFormTarget] = useState(undefined);
  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const loadTemples = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listTemples({ ...filters, page, limit: 12 });
      setTemples((current) => {
        const inactive = current.filter((temple) => temple.isActive === false);
        return [...result.temples, ...inactive];
      });
      setPagination(result.pagination);
    } catch (error) {
      setFeedback({ type: "error", ...errorDetails(error) });
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    const timer = window.setTimeout(loadTemples, filters.search ? 350 : 0);
    return () => window.clearTimeout(timer);
  }, [filters.search, loadTemples]);

  const updateFilter = (event) => {
    const { name, value } = event.target;
    setPage(1);
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const openEditor = async (temple) => {
    setBusyId(temple._id);
    setFeedback(null);
    try {
      const complete = await getTempleBySlug(temple.slug);
      setFormTarget({ ...temple, ...complete });
    } catch (error) {
      setFeedback({ type: "error", ...errorDetails(error) });
    } finally {
      setBusyId(null);
    }
  };

  const handleSaved = (saved, payload) => {
    const record = { ...(formTarget || {}), ...payload, ...saved };
    setTemples((current) => {
      const exists = current.some((temple) => temple._id === record._id);
      return exists
        ? current.map((temple) => (temple._id === record._id ? record : temple))
        : [record, ...current];
    });
    setFormTarget(undefined);
    setFeedback({
      type: "success",
      message: formTarget ? "Temple updated successfully." : "Temple created successfully.",
      fields: [],
    });
  };

  const confirmDeactivation = async () => {
    if (!deactivateTarget) return;
    setBusyId(deactivateTarget._id);
    setFeedback(null);
    try {
      await deactivateTemple(deactivateTarget._id);
      setTemples((current) => current.map((temple) =>
        temple._id === deactivateTarget._id ? { ...temple, isActive: false } : temple,
      ));
      setFeedback({ type: "success", message: `${deactivateTarget.name} was deactivated. You can reactivate it below.`, fields: [] });
      setDeactivateTarget(null);
    } catch (error) {
      setFeedback({ type: "error", ...errorDetails(error) });
    } finally {
      setBusyId(null);
    }
  };

  const handleReactivation = async (temple) => {
    setBusyId(temple._id);
    setFeedback(null);
    try {
      const updated = await reactivateTemple(temple._id);
      setTemples((current) => current.map((item) =>
        item._id === temple._id ? { ...item, ...updated, isActive: true } : item,
      ));
      setFeedback({ type: "success", message: `${temple.name} is active again.`, fields: [] });
    } catch (error) {
      setFeedback({ type: "error", ...errorDetails(error) });
    } finally {
      setBusyId(null);
    }
  };

  const inactiveCount = temples.filter((temple) => temple.isActive === false).length;

  return (
    <div className="ts-page">
      <header className="ts-page-header">
        <div>
          <span className="ts-eyebrow">Content management</span>
          <h1>Temples</h1>
          <p>Publish and maintain temple information for the Tirthstal website.</p>
        </div>
        <button className="ts-button ts-button-primary" type="button" onClick={() => setFormTarget(null)}>+ Add temple</button>
      </header>

      <aside className="ts-seed-note">
        <span aria-hidden="true">i</span>
        <div><strong>Server seed data</strong><p>The 34-temple Madhya Pradesh and Maharashtra seed is run on the server with <code>npm run seed:temples</code>. It is not run from this panel. Records marked “Needs data” are missing morning timings or images.</p></div>
      </aside>

      <Feedback feedback={feedback} onDismiss={() => setFeedback(null)} />

      <section className="ts-panel">
        <form className="ts-filters" onSubmit={(event) => event.preventDefault()}>
          <label className="ts-filter-search"><span>Search</span><input name="search" value={filters.search} onChange={updateFilter} placeholder="Name, location or keyword" /></label>
          <label><span>State</span><input name="state" value={filters.state} onChange={updateFilter} placeholder="All states" /></label>
          <label><span>District</span><input name="district" value={filters.district} onChange={updateFilter} placeholder="All districts" /></label>
          <label><span>Deity</span><input name="deity" value={filters.deity} onChange={updateFilter} placeholder="All deities" /></label>
          <label><span>Type</span><input name="type" value={filters.type} onChange={updateFilter} placeholder="All types" /></label>
          <label><span>Sort</span><select name="sort" value={filters.sort} onChange={updateFilter}><option value="">Default</option><option value="name">Name</option><option value="-name">Name (Z–A)</option><option value="rating">Rating</option><option value="-createdAt">Newest</option></select></label>
          <button className="ts-button ts-button-secondary ts-clear-button" type="button" onClick={() => { setFilters(INITIAL_FILTERS); setPage(1); }}>Clear</button>
        </form>

        <div className="ts-list-meta">
          <p><strong>{pagination.total}</strong> active temples in the backend{inactiveCount > 0 && <> · <strong>{inactiveCount}</strong> deactivated this session</>}</p>
          {loading && <span className="ts-loading-label">Refreshing…</span>}
        </div>

        <div className="ts-table-wrap">
          <table className="ts-table">
            <thead><tr><th>Temple</th><th>Location</th><th>Deity / type</th><th>Morning timings</th><th>Status</th><th><span className="ts-sr-only">Actions</span></th></tr></thead>
            <tbody>
              {!loading && temples.length === 0 ? (
                <tr><td colSpan={6} className="ts-empty">No temples match these filters.</td></tr>
              ) : temples.map((temple) => {
                const inactive = temple.isActive === false;
                return (
                  <tr key={temple._id || temple.slug} className={inactive ? "ts-inactive-row" : ""}>
                    <td><div className="ts-temple-name"><strong>{temple.name}</strong><span>/{temple.slug || "no-slug"}</span></div></td>
                    <td>{temple.district}<span className="ts-cell-subtitle">{temple.state}</span></td>
                    <td>{temple.deity}<span className="ts-cell-subtitle">{temple.type || "No type"}</span></td>
                    <td>{temple.timings?.morning || <span className="ts-muted">Not provided</span>}</td>
                    <td><div className="ts-badges"><span className={`ts-badge ${inactive ? "ts-badge-inactive" : "ts-badge-active"}`}>{inactive ? "Inactive" : "Active"}</span>{needsTempleData(temple) && <span className="ts-badge ts-badge-warning">Needs data</span>}</div></td>
                    <td><div className="ts-row-actions">
                      <button type="button" className="ts-button ts-button-small ts-button-secondary" disabled={busyId === temple._id} onClick={() => openEditor(temple)}>{busyId === temple._id ? "Loading…" : "Edit"}</button>
                      {inactive ? (
                        <button type="button" className="ts-button ts-button-small ts-button-success" disabled={busyId === temple._id} onClick={() => handleReactivation(temple)}>{busyId === temple._id ? "Restoring…" : "Reactivate"}</button>
                      ) : (
                        <button type="button" className="ts-button ts-button-small ts-button-danger" disabled={busyId === temple._id} onClick={() => setDeactivateTarget(temple)}>Deactivate</button>
                      )}
                    </div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <footer className="ts-pagination">
          <span>Page {pagination.page} of {pagination.pages}</span>
          <div><button type="button" className="ts-button ts-button-secondary ts-button-small" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}>Previous</button><button type="button" className="ts-button ts-button-secondary ts-button-small" disabled={page >= pagination.pages || loading} onClick={() => setPage((current) => current + 1)}>Next</button></div>
        </footer>
      </section>

      <p className="ts-session-note">The public list API only returns active temples. Deactivated records remain available for reactivation during this admin session.</p>

      {formTarget !== undefined && <TempleForm temple={formTarget} onClose={() => setFormTarget(undefined)} onSaved={handleSaved} />}

      {deactivateTarget && (
        <div className="ts-modal-backdrop" role="presentation" onMouseDown={() => setDeactivateTarget(null)}>
          <section className="ts-modal ts-confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="deactivate-title" onMouseDown={(event) => event.stopPropagation()}>
            <header className="ts-modal-header"><div><span className="ts-eyebrow">Confirm action</span><h2 id="deactivate-title">Deactivate {deactivateTarget.name}?</h2></div></header>
            <div className="ts-modal-body"><p>This hides the temple from the public website. It does not permanently delete the record, and you can reactivate it.</p></div>
            <footer className="ts-modal-footer"><button type="button" className="ts-button ts-button-secondary" onClick={() => setDeactivateTarget(null)}>Cancel</button><button type="button" className="ts-button ts-button-danger-solid" disabled={busyId === deactivateTarget._id} onClick={confirmDeactivation}>{busyId === deactivateTarget._id ? "Deactivating…" : "Deactivate temple"}</button></footer>
          </section>
        </div>
      )}
    </div>
  );
}
