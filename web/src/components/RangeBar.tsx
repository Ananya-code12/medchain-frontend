/** Visual only (aria-hidden): green = normal band printed on the report, red tick = this value. The numbers are in text beside it. */
export default function RangeBar({ value, low, high }: { value: number | null; low: number | null; high: number | null }) {
  if (value == null || low == null || high == null) return null;
  const span = Math.max(high - low, 1e-6);
  const min = Math.min(low - span * 0.5, value - span * 0.1), max = Math.max(high + span * 0.5, value + span * 0.1);
  const pct = (v: number) => ((v - min) / (max - min)) * 100;
  return (
    <div aria-hidden="true" className="relative my-3 h-3 rounded-full bg-line">
      <div className="absolute h-full rounded-full bg-ok/40" style={{ left: `${pct(low)}%`, width: `${pct(high) - pct(low)}%` }} />
      <div className="absolute -top-1 h-5 w-1.5 rounded bg-alert" style={{ left: `${pct(value)}%` }} />
    </div>
  );
}
