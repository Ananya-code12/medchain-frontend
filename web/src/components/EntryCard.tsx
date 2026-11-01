import { useState } from "react";
import { useTranslation } from "react-i18next";
import { api, type IntegrityStatus, type LabTest, type TimelineEntry } from "../api";
import { errText } from "../utils/errors";
import { fmtDateTime } from "../utils/format";

const LOW_CONFIDENCE = 0.8; // below this, the value is marked "Please verify"

/** Solana badge. "Recorded" until the person taps "Check authenticity": that re-hashes the file and compares it with the chain. */
function Integrity({ e }: { e: TimelineEntry }) {
  const { t, i18n } = useTranslation();
  const [res, setRes] = useState<IntegrityStatus | null>(null);
  const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  if (e.chain_status === "none") return <p className="font-bold text-warn">{t("chain.none")}</p>;
  if (e.chain_status === "pending") return <p className="font-bold text-warn">⏳ {t("chain.pending")}</p>;
  async function check() {
    setBusy(true); setErr("");
    try { setRes(await api.verifyEntry(e.patient_id, e.id)); } catch (x) { setErr(errText(x)); }
    setBusy(false);
  }
  const label = res === "verified" ? `✔ ${t("chain.verified")}` : res === "tampered" ? `⚠ ${t("chain.tampered")}` : res === "pending" ? `⏳ ${t("chain.pending")}` : `🔗 ${t("chain.recorded")}`;
  return (
    <details className={res === "tampered" ? "text-alert" : res === "pending" ? "text-warn" : "text-ok"}>
      <summary className="cursor-pointer font-bold">{label}</summary>
      <div className="mt-1 space-y-1 text-ink">
        {e.solana_tx && <p className="break-all">{t("timeline.chainTx")}: {e.solana_tx}</p>}
        {e.anchored_at && <p>{t("timeline.chainTime")}: {fmtDateTime(e.anchored_at, i18n.language)}</p>}
        {res === "verified" && <p className="font-bold text-ok">{t("chain.ok")}</p>}
        {res === "pending" && <p>{t("chain.notYet")}</p>}
        {err && <p role="alert" className="font-bold text-alert">{err}</p>}
        <button className="btn-ghost" disabled={busy} onClick={check}>{busy ? t("chain.checking") : t("chain.check")}</button>
      </div>
    </details>
  );
}

/** Files need the login token, so they are fetched as a blob and opened in a new tab. */
function OpenFile({ e }: { e: TimelineEntry }) {
  const { t } = useTranslation();
  const [err, setErr] = useState("");
  async function open() {
    setErr("");
    const w = window.open("", "_blank"); // opened first so the browser's popup blocker allows it
    try {
      const url = await api.openFile(e.patient_id, e.id);
      if (w) w.location.href = url; else window.location.href = url;
      setTimeout(() => URL.revokeObjectURL(url), 120000);
    } catch (x) { w?.close(); setErr(errText(x)); }
  }
  return (
    <div className="mt-3">
      <button className="font-bold text-brand underline" onClick={open}>{t("timeline.viewOriginal")}</button>
      {err && <p role="alert" className="font-bold text-alert">{err}</p>}
    </div>
  );
}

function LabTable({ tests }: { tests: LabTest[] }) {
  const { t } = useTranslation();
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full text-left">
        <thead><tr className="border-b border-line">
          <th className="py-2 pr-2">{t("lab.test")}</th><th className="pr-2">{t("lab.value")}</th><th>{t("lab.range")}</th>
        </tr></thead>
        <tbody>
          {tests.map((x) => {
            const abnormal = x.status === "high" || x.status === "low";
            return (
              <tr key={x.name} className={`border-b border-line ${abnormal ? "bg-alert-soft" : ""}`}>
                <td className="py-2 pr-2 font-bold">{x.name}</td>
                <td className="pr-2">
                  <span className={abnormal ? "font-bold text-alert" : ""}>{x.value ?? x.value_text ?? "?"} {x.unit}</span>{" "}
                  {abnormal && <span className="pill bg-alert text-white">{x.status === "high" ? "▲" : "▼"} {t(`lab.${x.status}`)}</span>}
                  {x.confidence < LOW_CONFIDENCE && <span className="pill ml-1 bg-warn-soft text-warn">⚠ {t("lab.verify")}</span>}
                </td>
                <td>{x.range_low != null && x.range_high != null ? `${x.range_low} – ${x.range_high}` : x.range_text ?? "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {tests.some((x) => x.status === "high" || x.status === "low") && <p className="mt-2 text-sm">{t("lab.disclaimer")}</p>}
    </div>
  );
}

export default function EntryCard({ e }: { e: TimelineEntry }) {
  const { t, i18n } = useTranslation();
  const verified = e.source === "provider";
  const label = e.source_label ?? t(verified ? "entry.provider" : "entry.patient");
  return (
    <li className="card">
      <div className="flex flex-wrap items-baseline justify-between gap-2 font-bold">
        <h3 className="text-lg">{t(`entry.${e.type}`)}</h3>
        <time dateTime={e.date}>{new Date(e.date).toLocaleDateString(i18n.language === "hi" ? "hi-IN" : "en-IN", { dateStyle: "medium" })}</time>
      </div>
      {e.title && <p className="font-bold">{e.title}</p>}
      <p className={`pill my-2 ${verified ? "bg-ok-soft text-ok" : "bg-warn-soft text-warn"}`}>{label}</p>
      <Integrity e={e} />
      {e.type === "lab_report" && e.processing === "pending" && <p role="status" className="mt-2 font-bold text-brand">⏳ {t("entry.reading")}</p>}
      {e.type === "lab_report" && e.processing === "failed" && <p role="status" className="mt-2 font-bold text-warn">⚠ {t("entry.readFailed")}</p>}
      {e.tests && e.tests.length > 0 && <LabTable tests={e.tests} />}
      <OpenFile e={e} />
    </li>
  );
}
