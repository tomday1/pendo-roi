import React from "react";
import {
  listCustomers,
  loadCustomerPreset,
  saveCustomerPreset,
  canEditCustomer,
  getUserEmail,
} from "../utils/presetsRemote";

const pill = {
  border: "1px solid #e5e7eb",
  borderRadius: 999,
  padding: "6px 10px",
  fontSize: 12,
};

const btn = (variant) => ({
  border: "1px solid " + (variant === "danger" ? "#fecaca" : "#e5e7eb"),
  background: variant === "danger" ? "#fee2e2" : "#fff",
  borderRadius: 12,
  padding: "8px 12px",
  fontSize: 13,
  cursor: "pointer",
});

export default function CustomerBar({
  currentCustomerId,
  setCurrentCustomerId,
  getModelState,
  applyModelState,
}) {
  const [customers, setCustomers] = React.useState([]);
  const [canEdit, setCanEdit] = React.useState(false);
  const [loadingAction, setLoadingAction] = React.useState(false);
  const [loadingList, setLoadingList] = React.useState(true);
  const [error, setError] = React.useState("");

  // Persisted "auto-load on change"
  const [autoLoad, setAutoLoad] = React.useState(() => {
    try {
      const raw = localStorage.getItem("pendo.autoLoadCustomer");
      return raw ? JSON.parse(raw) : true;
    } catch {
      return true;
    }
  });
  React.useEffect(() => {
    try {
      localStorage.setItem("pendo.autoLoadCustomer", JSON.stringify(autoLoad));
    } catch {}
  }, [autoLoad]);

  // Fetch customer list
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingList(true);
      setError("");
      try {
        const list = await listCustomers();
        if (cancelled) return;
        setCustomers(list || []);
        // pick first if nothing selected
        if (!currentCustomerId && list && list.length) {
          const email = await getUserEmail();
          if (email && email.endsWith("@pendo.io")) {
            // Look for "Pendo" customer
            const pendo = list.find((c) => c.name.toLowerCase() === "pendo");
            if (pendo) {
              setCurrentCustomerId(pendo.id);
              return;
            }
          }
          // fallback to first
          setCurrentCustomerId(list[0].id);
        }
      } catch (e) {
        if (cancelled) return;
        console.error(e);
        setError(e?.message || "Failed to load customers");
        setCustomers([]);
      } finally {
        if (!cancelled) setLoadingList(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setCurrentCustomerId, currentCustomerId]);

  // Check edit permission whenever customer changes
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!currentCustomerId) {
        setCanEdit(false);
        return;
      }
      try {
        const ok = await canEditCustomer(currentCustomerId);
        if (!cancelled) setCanEdit(!!ok);
      } catch {
        if (!cancelled) setCanEdit(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentCustomerId]);

  // Auto-load latest preset when customer changes
  React.useEffect(() => {
    if (!autoLoad || !currentCustomerId) return;
    (async () => {
      try {
        setLoadingAction(true);
        const state = await loadCustomerPreset(currentCustomerId);
        if (state) applyModelState(state);
      } catch (e) {
        console.warn("Auto-load failed:", e);
      } finally {
        setLoadingAction(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCustomerId, autoLoad]);

  async function onLoad() {
    if (!currentCustomerId) return;
    setLoadingAction(true);
    try {
      const state = await loadCustomerPreset(currentCustomerId);
      if (state) applyModelState(state);
      else alert("No preset found for this customer yet.");
    } catch (e) {
      console.error(e);
      alert("Load failed: " + (e?.message || "Unknown error"));
    } finally {
      setLoadingAction(false);
    }
  }

  async function onSave() {
    if (!currentCustomerId) return;
    if (!canEdit) return alert("You don't have edit permission for this customer.");
    setLoadingAction(true);
    try {
      await saveCustomerPreset(currentCustomerId, getModelState());
      alert("Saved!");
    } catch (e) {
      console.error(e);
      alert("Save failed: " + (e?.message || "Unknown error"));
    } finally {
      setLoadingAction(false);
    }
  }

  const nothingSelected = !currentCustomerId || customers.length === 0;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "auto auto auto auto 1fr",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
      }}
    >
      <select
        value={currentCustomerId || ""}
        onChange={(e) => setCurrentCustomerId(e.target.value || null)}
        disabled={loadingList}
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: "8px 10px",
          minWidth: 220,
          background: loadingList ? "#f1f5f9" : "#fff",
        }}
      >
        {loadingList && <option>Loading...</option>}
        {!loadingList && customers.length === 0 && (
          <option value="">No customers available</option>
        )}
        {!loadingList &&
          customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
      </select>

      <span
        title={canEdit ? "You can edit this customer's presets" : "Read-only access"}
        style={{
          ...pill,
          color: canEdit ? "#065f46" : "#6b7280",
          background: canEdit ? "#ecfdf5" : "#f3f4f6",
          borderColor: canEdit ? "#a7f3d0" : "#e5e7eb",
        }}
      >
        {canEdit ? "Can edit" : "Read-only"}
      </span>

      <label
        style={{
          ...pill,
          display: "flex",
          alignItems: "center",
          gap: 8,
          userSelect: "none",
          cursor: "pointer",
        }}
        title="Automatically load the latest preset when you switch customer"
      >
        <input
          type="checkbox"
          checked={autoLoad}
          onChange={(e) => setAutoLoad(e.target.checked)}
        />
        Auto-load on change
      </label>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={onLoad}
          style={btn()}
          disabled={loadingAction || loadingList || nothingSelected}
        >
          {loadingAction ? "Loading…" : "Load latest"}
        </button>
        <button
          onClick={onSave}
          style={btn()}
          disabled={loadingAction || loadingList || nothingSelected || !canEdit}
          title={!canEdit ? "You don't have edit permission" : "Save a new version"}
        >
          Save
        </button>
      </div>

      {error ? (
        <div style={{ gridColumn: "1 / -1", color: "#b91c1c", fontSize: 12 }}>{error}</div>
      ) : null}
    </div>
  );
}
