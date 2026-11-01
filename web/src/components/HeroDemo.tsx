import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

// A looping, fake product walkthrough: upload -> flagged values -> doctor consent with a live countdown.
const rows = [
  { name: "Haemoglobin", value: "10.1 g/dL", range: "12 – 15.5", status: "low" as const },
  { name: "Fasting glucose", value: "142 mg/dL", range: "70 – 100", status: "high" as const },
  { name: "Creatinine", value: "0.9 mg/dL", range: "0.6 – 1.2", status: "normal" as const },
];
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function HeroDemo() {
  const { t } = useTranslation();
  const [stage, setStage] = useState(0);
  const [paused, setPaused] = useState(false);
  const [sec, setSec] = useState(0); // seconds since the demo started, drives the countdown

  useEffect(() => { const id = setInterval(() => setSec((s) => s + 1), 1000); return () => clearInterval(id); }, []);
  useEffect(() => {
    if (paused || reduced()) return;
    const id = setInterval(() => setStage((s) => (s + 1) % 3), 4500);
    return () => clearInterval(id);
  }, [paused]);

  const left = 24 * 3600 - sec;
  const time = `${Math.floor(left / 3600)}h ${String(Math.floor((left % 3600) / 60)).padStart(2, "0")}m ${String(left % 60).padStart(2, "0")}s`;
  const tabs = t("landing.demoTabs", { returnObjects: true }) as string[];

  return (
    <div className="card p-0 shadow-lg" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <div role="group" aria-label={t("landing.demoPause")} className="flex border-b border-line">
        {tabs.map((label, i) => (
          <button key={label} aria-pressed={stage === i} onClick={() => setStage(i)}
            className={`min-h-[48px] flex-1 px-2 font-bold ${stage === i ? "border-b-4 border-brand text-brand" : "text-ink"}`}>{label}</button>
        ))}
      </div>

      <div key={stage} className="min-h-[250px] p-4" aria-live="off">
        {stage === 0 && (
          <div className="space-y-3">
            <div className="rounded-lg border-2 border-dashed border-brand bg-brand-soft p-4">
              <p className="font-bold">📄 {t("landing.demoFile")}</p>
              <p className="text-sm">{t("landing.demoSaved")}</p>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-line"><div className="bar-fill h-full w-full rounded-full bg-brand" /></div>
            <p className="font-bold text-brand">{t("landing.demoWork")}</p>
          </div>
        )}
        {stage === 1 && (
          <div>
            <p className="mb-2 font-bold">{t("landing.demoFlag")}</p>
            <ul className="space-y-2">
              {rows.map((r, i) => (
                <li key={r.name} style={{ animationDelay: `${i * 350}ms` }}
                  className={`row-in flex flex-wrap items-center justify-between gap-1 rounded-lg p-2 ${r.status === "normal" ? "bg-paper" : "bg-alert-soft"}`}>
                  <span className="font-bold">{r.name}</span>
                  <span>{r.value} <span className="text-sm">({r.range})</span>{" "}
                    {r.status !== "normal" && <span className="pill bg-alert text-white">{r.status === "high" ? "▲" : "▼"} {t(`lab.${r.status}`)}</span>}</span>
                </li>
              ))}
            </ul>
            <p style={{ animationDelay: "1.2s" }} className="row-in mt-3 inline-flex items-center gap-2 font-bold text-ok">
              <span className="ping inline-block h-3 w-3 rounded-full bg-ok" />✔ {t("landing.demoVerified")}
            </p>
          </div>
        )}
        {stage === 2 && (
          <div className="space-y-3">
            <p className="text-lg font-bold">{t("landing.demoAsk")}</p>
            <p className="row-in rounded-lg bg-brand-soft p-3">📱 {t("landing.demoCode")}: <span className="font-bold tracking-widest">● ● ● ● ● ●</span></p>
            <p style={{ animationDelay: "0.8s" }} className="row-in font-bold text-ok">✔ {t("landing.demoOk")}</p>
            <p style={{ animationDelay: "1.2s" }} className="row-in pill bg-ok-soft text-ok">{t("landing.demoLeft", { time })}</p>
          </div>
        )}
      </div>
    </div>
  );
}
