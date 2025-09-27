import React from "react";
import { box, inputCss, labelCss } from "../styles";

export default function SettingsModal({ initialUrl, onSave, onClose }) {
  const [url, setUrl] = React.useState(initialUrl || "");
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
      display: "grid", placeItems: "center", zIndex: 50
    }}>
      <div style={{ ...box, width: 520, padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 18, fontWeight: 600 }}>Settings</div>
          <button onClick={onClose} style={{ ...inputCss, width: "auto", cursor: "pointer" }}>Close</button>
        </div>
        <div style={{ marginTop: 12 }}>
          <div style={labelCss}>Custom logo URL (appears left of Pendo logo)</div>
          <input
            type="url"
            placeholder="https://example.com/logo.png"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={inputCss}
          />
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
            Leave blank to hide the custom logo.
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
          <button onClick={() => onSave("")} style={{ ...inputCss, width: "auto", cursor: "pointer" }}>
            Remove Logo
          </button>
          <button onClick={() => onSave(url.trim())} style={{ ...inputCss, width: "auto", cursor: "pointer" }}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
