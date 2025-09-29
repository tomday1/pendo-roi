import React, { useState } from "react";

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

const ensureJSPDF = async () => {
  if (window.jspdf?.jsPDF) return window.jspdf.jsPDF;
  await new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js";
    s.onload = res;
    s.onerror = rej;
    document.head.appendChild(s);
  });
  return window.jspdf.jsPDF;
};

// preserve aspect ratio, fit into a box
function fitBox(imgW, imgH, boxW, boxH) {
  const r = imgW / imgH;
  let w = boxW, h = w / r;
  if (h > boxH) {
    h = boxH;
    w = h * r;
  }
  const x = (boxW - w) / 2;
  const y = (boxH - h) / 2;
  return { w, h, x, y };
}

export default function ExportMenu({
  buildSnapshot,
  tab,
  inputCss,
  pillLook,
  sectionSelectors = [],
  switchToTab,
  tabIds = ["levers", "assumptions", "summary"],
  headerSelector = "#app-header",
}) {
  const [open, setOpen] = useState(false);

  const waitForPaint = () =>
    new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve))
    );

  // capture header and tabs
  const captureAll = async () => {
    const html2canvas = await ensureHtml2Canvas();
    const captures = { header: null, pages: [] };

    // clone header but hide right-side controls
    const headerEl = document.querySelector(headerSelector);
    if (headerEl) {
      const clone = headerEl.cloneNode(true);
      const rightSide = clone.querySelector("div[style*='flex'][style*='gap']");
      if (rightSide) rightSide.style.display = "none";
      document.body.appendChild(clone);
      clone.style.position = "absolute";
      clone.style.left = "-9999px";
      captures.header = await html2canvas(clone, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });
      clone.remove();
    }

    for (let i = 0; i < tabIds.length; i++) {
      const id = tabIds[i];
      const sel = sectionSelectors[i];

      await switchToTab(id);
      await waitForPaint();

      const el = document.querySelector(sel);
      if (!el) continue;

      el.scrollIntoView({ block: "start" });
      await waitForPaint();

      const canvas = await html2canvas(el, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });
      captures.pages.push({ tabId: id, canvas });
    }

    await switchToTab(tab);
    await waitForPaint();
    return captures;
  };

  const exportPNGs = async () => {
    const { pages } = await captureAll();
    pages.forEach(({ tabId, canvas }) =>
      canvas.toBlob((blob) => blob && downloadBlob(blob, `pendo-${tabId}.png`))
    );
  };

  const exportPDF = async () => {
    const jsPDF = await ensureJSPDF();
    const { header, pages } = await captureAll();
    if (!pages.length) return;

    const firstLandscape = pages[0].canvas.width > pages[0].canvas.height;
    const doc = new jsPDF({
      unit: "mm",
      format: "a4",
      orientation: firstLandscape ? "l" : "p",
    });

    pages.forEach(({ canvas }, idx) => {
      if (idx > 0) {
        const landscape = canvas.width > canvas.height;
        doc.addPage("a4", landscape ? "l" : "p");
      }
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      let yCursor = 6;

      if (header) {
        const hFit = fitBox(header.width, header.height, pageW - 12, pageH * 0.2);
        doc.addImage(header.toDataURL("image/png"), "PNG", hFit.x + 6, yCursor, hFit.w, hFit.h, undefined, "SLOW");
        yCursor += hFit.h + 4;
      }

      const fit = fitBox(canvas.width, canvas.height, pageW - 12, pageH - yCursor - 6);
      doc.addImage(canvas.toDataURL("image/png"), "PNG", fit.x + 6, yCursor, fit.w, fit.h, undefined, "SLOW");
    });

    doc.save("pendo-roi.pdf");
  };

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
      ["— Levers —"], ...leverRows,
      [],
      ["— Breakdown —"], ...breakdownRows,
    ];
    const blob = new Blob([toCSV(rows)], { type: "text/csv;charset=utf-8" });
    downloadBlob(blob, `pendo-data-${snap.tab}.csv`);
  };

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
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(leversAOA), "Levers");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(breakdownAOA), "Breakdown");
    XLSX.writeFile(wb, `pendo-roi-${snap.tab}.xlsx`);
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Export"
        title="Export"
        style={{ ...inputCss, ...pillLook, width: 44, cursor: "pointer", display: "grid", placeItems: "center" }}
      >
        ⬇️
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 44,
            zIndex: 40,
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
            minWidth: 240,
            padding: 8,
          }}
          onMouseLeave={() => setOpen(false)}
        >
          <button onClick={() => { setOpen(false); exportPDF(); }} style={{ ...inputCss, width: "100%", marginTop: 6, cursor: "pointer" }}>
            Export as PDF
          </button>
          <button onClick={() => { setOpen(false); exportPNGs(); }} style={{ ...inputCss, width: "100%", marginTop: 6, cursor: "pointer" }}>
            Export as PNGs (one per tab)
          </button>
          <button onClick={() => { setOpen(false); exportXLSX(); }} style={{ ...inputCss, width: "100%", marginTop: 6, cursor: "pointer" }}>
            Export to Excel
          </button>
          <button onClick={() => { setOpen(false); exportCSV(); }} style={{ ...inputCss, width: "100%", marginTop: 6, cursor: "pointer" }}>
            Export CSV
          </button>
        </div>
      )}
    </div>
  );
}
