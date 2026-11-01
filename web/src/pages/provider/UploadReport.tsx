import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api, ApiError, type TimelineEntry, type UploadStage } from "../../api";
import { getGrant } from "../../auth/roles";
import UploadStatus from "../../components/UploadStatus";
import { errText } from "../../utils/errors";

// Lab: upload the report, then poll the entry while the AI reads it. Unclear reads become "needs manual review".
const finish = (e: TimelineEntry): UploadStage =>
  e.processing === "failed" || (e.tests ?? []).some((x) => x.confidence < 0.8) ? "needs_review" : "done";

export default function UploadReport() {
  const { t } = useTranslation();
  const { patientId = "" } = useParams();
  const grant = getGrant(patientId);
  const [file, setFile] = useState<File | null>(null); const [title, setTitle] = useState("");
  const [started, setStarted] = useState(false); const [entryId, setEntryId] = useState<string | null>(null);
  const [stage, setStage] = useState<UploadStage>("uploading"); const [err, setErr] = useState(""); const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (!entryId || stage !== "ocr_running") return;
    const id = setInterval(async () => {
      try { const e = await api.getEntry(patientId, entryId); if (e.processing !== "pending") setStage(finish(e)); }
      catch (x) { setErr(errText(x)); setStage("failed"); }
    }, 2500);
    return () => clearInterval(id);
  }, [entryId, stage, patientId]);

  if (!grant || denied) return <Navigate to="/diagnostic" replace />;
  async function start() {
    if (!file) return;
    setStarted(true); setStage("uploading"); setErr("");
    try {
      const e = await api.uploadRecord(patientId, file, "lab_report", title.trim() || undefined);
      setEntryId(e.id); setStage(e.processing === "pending" ? "ocr_running" : finish(e));
    } catch (x) {
      if (x instanceof ApiError && x.code.startsWith("CONSENT_")) setDenied(true);
      setErr(errText(x)); setStage("failed");
    }
  }
  const finished = started && ["done", "needs_review", "failed"].includes(stage);
  const reset = () => { setStarted(false); setEntryId(null); setFile(null); setTitle(""); setStage("uploading"); setErr(""); };

  return (
    <section className="card space-y-4">
      <h1 className="text-2xl font-bold">{t("diag.title", { name: grant.patient_name ?? "patient" })}</h1>
      {!started && <>
        <label className="btn-ghost cursor-pointer">{t("diag.pick")}
          <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></label>
        <p className="text-sm">{t("upload.hint")}</p>
        {file && <p>{file.name}</p>}
        <div><label className="label" htmlFor="rt">{t("upload.titleOpt")}</label>
          <input id="rt" className="input" maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)} /></div>
        <button className="btn-primary w-full" disabled={!file} onClick={start}>{t("diag.send")}</button>
      </>}
      {started && <UploadStatus stage={stage} />}
      {err && <p role="alert" className="font-bold text-alert">{err}</p>}
      {finished && <button className="btn-ghost" onClick={reset}>{t("diag.again")}</button>}
    </section>
  );
}
