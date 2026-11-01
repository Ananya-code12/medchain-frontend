import { useTranslation } from "react-i18next";
import type { LabTest } from "../api";
import RangeBar from "./RangeBar";

export interface Flagged extends LabTest { date: string; entryId: string }

/** The first thing a doctor sees: values outside the range PRINTED on the report. Status is computed by code, never by AI. */
export default function FlaggedResultsCard({ flagged, unsure }: { flagged: Flagged[]; unsure: number }) {
  const { t, i18n } = useTranslation();
  const fmt = (d: string) => new Date(d).toLocaleDateString(i18n.language === "hi" ? "hi-IN" : "en-IN", { dateStyle: "medium" });
  return (
    <section aria-labelledby="attn" className="card border-2 border-alert/40">
      <div className="flex items-center justify-between gap-2">
        <h2 id="attn" className="text-xl font-bold">{t("record.attention")}</h2>
        {flagged.length > 0 && <span className="pill bg-alert text-white">{flagged.length}</span>}
      </div>
      {flagged.length === 0 && <p className="mt-2">{t("record.none")}</p>}
      {flagged.length > 0 && <p className="mt-1">{t("record.summary", { count: flagged.length })}</p>}
      {unsure > 0 && <p className="mt-1 font-bold text-warn">⚠ {t("record.unsure", { count: unsure })}</p>}
      <ul className="mt-3 divide-y divide-line">
        {flagged.map((x) => (
          <li key={`${x.entryId}-${x.name}`} className="py-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-bold">{x.name}</span><span className="text-sm">{fmt(x.date)}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-2xl font-bold text-alert">{x.value ?? x.value_text ?? "?"}</span><span>{x.unit}</span>
              <span className="pill bg-alert text-white">{x.status === "high" ? "▲" : "▼"} {t(`lab.${x.status}`)}</span>
              {x.confidence < 0.8 && <span className="pill bg-warn-soft text-warn">⚠ {t("lab.verify")}</span>}
            </div>
            <RangeBar value={x.value} low={x.range_low} high={x.range_high} />
            <p className="text-sm">{x.range_low != null && x.range_high != null ? t("record.normal", { low: x.range_low, high: x.range_high }) : `${t("lab.range")}: ${x.range_text ?? "—"}`}</p>
          </li>
        ))}
      </ul>
      {flagged.length > 0 && <p className="mt-2 text-sm">{t("lab.disclaimer")}</p>}
    </section>
  );
}
