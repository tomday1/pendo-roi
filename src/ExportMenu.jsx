import React, { useState } from "react";

/** Minimal, standalone helpers kept in this file */
const currencyFmt = (n, currency) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency }).format(
    Number.isFinite(n) ? n : 0
  );

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const toCSV = (rows) => {
  const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
  return rows.map((r) => r.map(esc).join(",")).join("\n");
};

/** Lazy-loaders for tiny, CDN-hosted libs (no bundler changes needed) */
const ensureHtml2Canvas = async () => {
  if (window.html2canvas) return window.html2canvas;
  await new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js";
    s.onload = res;
    s.onerror = rej;
    document.head.appendChild(s);
  });
  return window.html2canvas;
};

const ensureXLSX = async () => {
  if (window.XLSX) return window.XLSX;
  await new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
    s.onload = res;
    s.onerror = rej;
    document.head.appendChild(s);
  });
  return window.XLSX;
};

export default function ExportMenu({
  buildSnapshot,         // () => { tab, currency, kpis, assumptions, levers[] }
  tab,                   // current tab id string
  inputCss,              // styling token from parent
  sectionSelectors = [], // CSS selectors for the 3 tab containers, in order: [levers, assumptions, breakdown]
}) {
  const [open, setOpen] = useState(false);

  /** ---- IMAGE EXPORTS: a true PICTURE of each tab ---- */
  const captureSectionsToCanvases = async () => {
    const html2canvas = await ensureHtml2Canvas();
    const canvases = [];
    for (const sel of sectionSelectors) {
      const el = document.querySelector(sel);
      if (!el) continue;
      // temporarily ensure it's visible height-wise for capture (in case some tabs are hidden)
      const hadHidden = el.style.display === "none";
      if (hadHidden) el.style.display = "block";
      const canvas = await html2canvas(el, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        windowWidth: document.documentElement.scrollWidth,
      });
      if (hadHidden) el.style.display = "none";
      canvases.push({ selector: sel, canvas });
    }
    return canvases;
  };

  // PNG: download one PNG per tab (one picture per tab)
  const exportPNGs = async () => {
    const canvases = await captureSectionsToCanvases();
    const names = ["levers", "assumptions", "breakdown"];
    canvases.forEach((c, i) =>
      c.canvas.toBlob((blob) => blob && downloadBlob(blob, `pendo-${names[i] || i + 1}.png`))
    );
  };

  // PDF: open a window with each tab image on its own page; user uses “Save as PDF”
  const exportPDF = async () => {
    const canvases = await captureSectionsToCanvases();
    const w = window.open("", "_blank", "noopener,noreferrer,width=1000,height=800");
    if (!w) return;
    const css = `
      <style>
        @page { size: A4; margin: 16mm; }
        body { font-family: ui-sans-serif, -apple-system, Segoe UI, Roboto, Helvetica, Arial; }
        .page { page-break-after: always; text-align: center; }
        img { max-width: 100%; height: auto; }
        h2 { font-size: 14px; color: #64748b; margin: 0 0 8px; font-weight: 500; }
      </style>`;
    const names = ["Levers", "Assumptions", "Breakdown"];
    const html = canvases
      .map((c, i) => {
        const dataURL = c.canvas.toDataURL("image/png");
        return `<div class="page">
          <h2>${names[i] || `Section ${i + 1}`}</h2>
          <img src="${dataURL}" />
        </div>`;
      })
      .join("");
    w.document.write(`<!doctype html><html><head><meta charset="utf-8">${css}</head><body>${html}
      <script>window.onload = () => setTimeout(() => window.print(), 200);</script>
    </body></html>`);
    w.document.close();
  };

  /** ---- SPREADSHEET EXPORTS: structured data for Sheets/Excel ---- */
  // CSV fallback (single sheet) — still useful if user wants CSV
  const exportCSV = () => {
    const snap = buildSnapshot();
    const leverRows = [
      ["Lever", "Annual Value"],
      ...snap.levers.map((l) => [l.label, currencyFmt(l.value, snap.currency)]),
    ];
    const breakdownRows = [
      ["KPI", "Value"],
      ["Total Benefits", currencyFmt(snap.kpis.totalBenefits, snap.currency)],
      ["Pendo Annual Cost", currencyFmt(snap.kpis.pendoAnnualCost, snap.currency)],
      ["Net Value", currencyFmt(snap.kpis.netValue, snap.currency)],
      ["ROI %", `${snap.kpis.roiPct.toFixed(0)}%`],
      ["Payback (months)", snap.kpis.paybackMonths == null ? "–" : snap.kpis.paybackMonths.toFixed(1)],
    ];
    const rows = [
      ["Exported Tab", snap.tab],
      ["Currency", snap.currency],
      [],
      ["— Levers —"], ...leverRows, [], ["— Breakdown —"], ...breakdownRows,
    ];
    const blob = new Blob([toCSV(rows)], { type: "text/csv;charset=utf-8" });
    downloadBlob(blob, `pendo-data-${snap.tab}.csv`);
  };

  // XLSX workbook with one sheet per section: Levers, Breakdown
  const exportXLSX = async () => {
    const XLSX = await ensureXLSX();
    const snap = buildSnapshot();

    const leversAOA = [
      ["Lever", "Annual Value"],
      ...snap.levers.map((l) => [l.label, Number((l.value || 0).toFixed(2))]),
    ];

    const breakdownAOA = [
      ["KPI", "Value"],
      ["Total Benefits", Number((snap.kpis.totalBenefits || 0).toFixed(2))],
      ["Pendo Annual Cost", Number((snap.kpis.pendoAnnualCost || 0).toFixed(2))],
      ["Net Value", Number((snap.kpis.netValue || 0).toFixed(2))],
      ["ROI %", Number((snap.kpis.roiPct || 0).toFixed(2))],
      ["Payback (months)", snap.kpis.paybackMonths == null ? "" : Number(snap.kpis.paybackMonths.toFixed(2))],
    ];

    const wb = XLSX.utils.book_new();
    const wsLevers = XLSX.utils.aoa_to_sheet(leversAOA);
    const wsBreakdown = XLSX.utils.aoa_to_sheet(breakdownAOA);

    XLSX.utils.book_append_sheet(wb, wsLevers, "Levers");
    XLSX.utils.book_append_sheet(wb, wsBreakdown, "Breakdown");

    XLSX.writeFile(wb, `pendo-roi-${snap.tab}.xlsx`);
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Export"
        title="Export"
        style={{ ...inputCss, width: 44, cursor: "pointer", display: "grid", placeItems: "center" }}
      >
        ⬇️
      </button>

      {open && (
        <div
          style={{
            position: "absolute", right: 0, top: 44, zIndex: 40,
            background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
            minWidth: 240, padding: 8
          }}
          onMouseLeave={() => setOpen(false)}
        >
          <div style={{ padding: "6px 10px", fontSize: 12, color: "#64748b" }}>
            Export (pictures = exact tab screenshots)
          </div>
          <button onClick={() => { setOpen(false); exportPDF(); }} style={{ ...inputCss, width: "100%", marginTop: 6, cursor: "pointer" }}>
            Export as PDF (pictures)
          </button>
          <button onClick={() => { setOpen(false); exportPNGs(); }} style={{ ...inputCss, width: "100%", marginTop: 6, cursor: "pointer" }}>
            Export as PNGs (one per tab)
          </button>
          <div style={{ height: 8 }} />
          <button onClick={() => { setOpen(false); exportXLSX(); }} style={{ ...inputCss, width: "100%", marginTop: 6, cursor: "pointer" }}>
            Export to Excel (Levers & Breakdown)
          </button>
          <button onClick={() => { setOpen(false); exportCSV(); }} style={{ ...inputCss, width: "100%", marginTop: 6, cursor: "pointer" }}>
            Export CSV (fallback)
          </button>
        </div>
      )}
    </div>
  );
}
