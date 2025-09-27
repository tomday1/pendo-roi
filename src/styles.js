// Tiny style system (no external UI libs)
export const font = {
  fontFamily:
    "ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji'",
};

export const page = { minHeight: "100vh", background: "#f8fafc", padding: 24, ...font };
export const container = { maxWidth: 1800, margin: "0 auto" };
export const box = {
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 16,
  background: "#fff",
  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
};
export const hstack = { display: "flex", alignItems: "center", gap: 12 };
export const summaryNum = { fontSize: 22, fontWeight: 600 };
export const labelCss = { fontSize: 12, color: "#475569", marginBottom: 4 };
export const inputCss = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: "10px 12px",
  width: "90%",
  background: "#fff",
};
export const selectCss = { ...inputCss, width: 120 };
export const tabBtn = (active) => ({
  ...inputCss,
  width: "auto",
  padding: "8px 12px",
  background: active ? "#111827" : "#fff",
  color: active ? "#fff" : "#111827",
  cursor: "pointer",
});
