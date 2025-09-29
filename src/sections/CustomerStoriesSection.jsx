import React, { useMemo, useState } from "react";
import customerStories from "../data/customerStories";

// Tiny styles (kept inline to match the rest of your app)
const tableWrap = {
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  background: "#fff",
  overflow: "hidden",
};
const thTd = { padding: "10px 12px", borderBottom: "1px solid #e5e7eb", fontSize: 14 };
const th = { ...thTd, userSelect: "none", cursor: "pointer", whiteSpace: "nowrap" };
const link = { color: "#0f172a", textDecoration: "underline", fontWeight: 600 };
const inputCss = {
  border: "1px solid #e5e7eb",
  borderRadius: 999,
  padding: "10px 14px",
  background: "#fff",
  fontSize: 14,
};

function SortIcon({ dir }) {
  return (
    <span style={{ marginLeft: 6, opacity: 0.6 }}>
      {dir === "asc" ? "▲" : dir === "desc" ? "▼" : "↕"}
    </span>
  );
}

export default function CustomerStoriesSection() {
  const [q, setQ] = useState("");
  // default sort by Customer asc
  const [sort, setSort] = useState({ key: "customer", dir: "asc" });

  // Filter across ALL visible fields (plus URL and modules)
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return customerStories;
    return customerStories.filter((row) => {
      const haystack = [
        row.story,
        row.customer,
        row.industry,
        row.useCase,
        row.results,
        Array.isArray(row.modules) ? row.modules.join(" ") : row.modules,
        row.url,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [q]);

  // Sort after filtering
  const data = useMemo(() => {
    const arr = [...filtered];
    const { key, dir } = sort;
    arr.sort((a, b) => {
      // Normalize arrays like "modules" to strings for sorting
      const vaRaw = Array.isArray(a[key]) ? a[key].join(", ") : a[key];
      const vbRaw = Array.isArray(b[key]) ? b[key].join(", ") : b[key];
      const va = (vaRaw ?? "").toString().toLowerCase();
      const vb = (vbRaw ?? "").toString().toLowerCase();
      if (va < vb) return dir === "asc" ? -1 : 1;
      if (va > vb) return dir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sort]);

  const toggleSort = (key) => {
    setSort((s) =>
      s.key !== key ? { key, dir: "asc" } : { key, dir: s.dir === "asc" ? "desc" : "asc" }
    );
  };

  return (
    <div id="tab-customer-stories" style={{ marginTop: 16, textAlign: "left" }}>
      {/* Top bar: Search (left) + helper text (right) */}
      <div
        style={{
          marginBottom: 8,
          color: "#475569",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search stories, customers, industries, use cases, results…"
            aria-label="Search customer stories"
            style={{ ...inputCss, minWidth: 260 }}
          />
          <div style={{ fontSize: 12, color: "#64748b" }}>
            {data.length} stor{data.length === 1 ? "y" : "ies"}
          </div>
          {q && (
            <button
              onClick={() => setQ("")}
              style={{ ...inputCss, padding: "8px 12px", borderRadius: 999, cursor: "pointer" }}
              aria-label="Clear search"
              title="Clear"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div style={tableWrap} role="region" aria-label="Customer stories table">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f8fafc" }}>
            <tr>
              <th style={th} onClick={() => toggleSort("story")}>
                Story <SortIcon dir={sort.key === "story" ? sort.dir : null} />
              </th>
              <th style={th} onClick={() => toggleSort("customer")}>
                Customer <SortIcon dir={sort.key === "customer" ? sort.dir : null} />
              </th>
              <th style={th} onClick={() => toggleSort("industry")}>
                Industry <SortIcon dir={sort.key === "industry" ? sort.dir : null} />
              </th>
              <th style={th} onClick={() => toggleSort("useCase")}>
                Use Case <SortIcon dir={sort.key === "useCase" ? sort.dir : null} />
              </th>
              <th style={th} onClick={() => toggleSort("results")}>
                Results <SortIcon dir={sort.key === "results" ? sort.dir : null} />
              </th>
              <th style={th} onClick={() => toggleSort("modules")}>
                Pendo Modules <SortIcon dir={sort.key === "modules" ? sort.dir : null} />
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={row.url ?? i}>
                <td style={thTd}>
                  <a
                    href={row.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={link}
                    title="Open story on pendo.io (new tab)"
                  >
                    {row.story}
                  </a>
                </td>
                <td style={thTd}>{row.customer}</td>
                <td style={thTd}>{row.industry}</td>
                <td style={thTd}>{row.useCase}</td>
                <td style={thTd}>{row.results}</td>
                <td style={thTd}>
                  {Array.isArray(row.modules) ? row.modules.join(", ") : row.modules}
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td style={{ ...thTd, textAlign: "center", color: "#64748b" }} colSpan={6}>
                  No stories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
