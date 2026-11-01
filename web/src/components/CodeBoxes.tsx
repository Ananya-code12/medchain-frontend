import { useRef, useState } from "react";

/** Six single-digit boxes. Auto-advances, Backspace goes back, pasting "123456" fills all six. */
export default function CodeBoxes({ onChange }: { onChange: (code: string) => void }) {
  const [d, setD] = useState<string[]>(Array(6).fill(""));
  const refs = useRef<HTMLInputElement[]>([]);
  const update = (next: string[]) => { setD(next); onChange(next.join("")); };
  return (
    <div role="group" aria-label="6-digit code" className="flex gap-2"
      onPaste={(e) => {
        const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (!p) return;
        e.preventDefault(); update(Array.from({ length: 6 }, (_, i) => p[i] ?? "")); refs.current[Math.min(p.length, 5)]?.focus();
      }}>
      {d.map((v, i) => (
        <input key={i} ref={(el) => { if (el) refs.current[i] = el; }} value={v} inputMode="numeric" maxLength={1}
          aria-label={`Digit ${i + 1}`} autoComplete={i === 0 ? "one-time-code" : "off"}
          className="h-14 w-11 rounded-lg border-2 border-brand/40 bg-brand-soft text-center text-2xl font-bold sm:w-12"
          onChange={(e) => { const c = e.target.value.replace(/\D/g, "").slice(-1); const n = [...d]; n[i] = c; update(n); if (c && i < 5) refs.current[i + 1]?.focus(); }}
          onKeyDown={(e) => { if (e.key === "Backspace" && !d[i] && i > 0) refs.current[i - 1]?.focus(); }} />
      ))}
    </div>
  );
}
