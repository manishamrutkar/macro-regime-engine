/**
 * Format a decimal as a percentage string.
 * e.g. 0.123 → "+12.3%"  |  -0.05 → "-5.0%"
 */
export const fmtPct = (n, decimals = 1) => {
  if (n == null || isNaN(n)) return '—';
  const sign = n >= 0 ? '+' : '';
  return `${sign}${(n * 100).toFixed(decimals)}%`;
};

/**
 * Format a plain percentage value already in percent form.
 * e.g. 12.3 → "+12.3%"
 */
export const fmtPctRaw = (n, decimals = 1) => {
  if (n == null || isNaN(n)) return '—';
  const sign = n >= 0 ? '+' : '';
  return `${sign}${Number(n).toFixed(decimals)}%`;
};

/**
 * Format a number with fixed decimals.
 */
export const fmtNum = (n, decimals = 2) => {
  if (n == null || isNaN(n)) return '—';
  return Number(n).toFixed(decimals);
};

/**
 * Format as USD currency.
 * e.g. 1234567 → "$1,234,567"
 */
export const fmtUSD = (n) => {
  if (n == null || isNaN(n)) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0,
  }).format(n);
};

/**
 * Format a date string as "Jan 2024".
 */
export const fmtDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

/**
 * Format a number with K / M / B suffix.
 */
export const fmtCompact = (n) => {
  if (n == null) return '—';
  if (Math.abs(n) >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (Math.abs(n) >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return String(n);
};

/**
 * Direction arrow.
 */
export const fmtArrow = (n) => (n >= 0 ? '▲' : '▼');

/**
 * Change string: "▲ +2.3%"
 */
export const fmtChange = (n, decimals = 2) => {
  if (n == null || isNaN(n)) return '—';
  return `${fmtArrow(n)} ${fmtPct(n, decimals)}`;
};
