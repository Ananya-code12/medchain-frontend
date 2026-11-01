export const fmtDateTime = (iso: string, lang: string) =>
  new Date(iso).toLocaleString(lang === "hi" ? "hi-IN" : "en-IN", { dateStyle: "medium", timeStyle: "short" });
export const fmtBytes = (n: number) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
/** "23h 5m" / "42m" until an ISO time; null if already past. */
export function timeLeft(iso: string, now = Date.now()): string | null {
  const m = Math.floor((new Date(iso).getTime() - now) / 60000);
  if (m <= 0) return null;
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`;
}
