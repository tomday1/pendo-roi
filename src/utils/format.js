export const currencyFmt = (n, currency) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency }).format(
    Number.isFinite(n) ? n : 0
  );

export const pctFmt = (n) => `${(n * 100).toFixed(0)}%`;

export const num = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};
