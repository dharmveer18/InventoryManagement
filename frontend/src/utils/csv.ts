// Lightweight CSV parsing helpers and validators for bulk stock uploads

// Normalize to trimmed string or empty string if nullish
export const nk = (s: unknown) => (s == null ? "" : String(s).trim());

// Parse an integer allowing optional leading +/-, ignoring spaces and commas.
// Rejects decimals and non-digit characters (after trimming separators).
export function intOrUndef(v: unknown): number | undefined {
  let s = nk(v);
  if (s === "") return undefined;
  // Allow leading '+' and '-', remove spaces and commas (thousands separators)
  s = s.replace(/\s+/g, "").replace(/,/g, "");
  // If contains a decimal point or any non [+-\d], reject
  if (/\./.test(s) || /[^+\-0-9]/.test(s)) return undefined;
  // Ensure a valid integer pattern
  if (!/^[-+]?\d+$/.test(s)) return undefined;
  const n = Number(s);
  return Number.isInteger(n) ? n : undefined;
}
