import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api, ApiError, type TimelineEntry } from "../../api";
import { getGrant } from "../../auth/roles";
import EntryCard from "../../components/EntryCard";
import { Empty, ErrorBox, Loading } from "../../components/Status";
import { errText } from "../../utils/errors";

// Pharmacy: see the patient's prescriptions, then upload the bill for what was handed over.
export default function RecordDispense() {
  const { t } = useTranslation();
  const { patientId = "" } = useParams();
  const grant = getGrant(patientId);
  const [rx, setRx] = useState<TimelineEntry[] | null>(null);
  const [file, setFile] = useState<File | null>(null); const [title, setTitle] = useState("");
  const [saved, setSaved] = useState(false); const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(""); const [denied, setDenied] = useState(false);

  const load = () => api.getTimeline(patientId)
    .then((all) => setRx(all.filter((e) => e.type === "prescription")))
    .catch((x) => { if (x instanceof ApiError && x.code.startsWith("CONSENT_")) setDenied(true); else setErr(errText(x)); });
  useEffect(() => { if (grant) load(); }, [patientId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!grant || denied) return <Navigate to="/pharmacy" replace />;
  async function upload() {
    if (!file) return;
    setBusy(true); setErr(""); setSaved(false);
    try { await api.uploadRecord(patientId, file, "bill", title.trim() || undefined); setSaved(true); setFile(null); setTitle(""); }
    catch (x) { if (x instanceof ApiError && x.code.startsWith("CONSENT_")) setDenied(true); setErr(errText(x)); }
    setBusy(false);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t("pharm.title", { name: grant.patient_name ?? "patient" })}</h1>
      <section>
        <h2 className="mb-2 text-xl font-bold">{t("pharm.rxTitle")}</h2>
        {!rx && !err && <Loading />}
        {err && !rx && <ErrorBox onRetry={() => { setErr(""); load(); }} message={err} />}
        {rx?.length === 0 && <Empty text={t("pharm.none")} />}
        <ul className="space-y-3">{rx?.map((e) => <EntryCard key={e.id} e={e} />)}</ul>
      </section>
      <section className="card space-y-3">
        <h2 className="text-xl font-bold">{t("pharm.billTitle")}</h2>
        <label className="btn-ghost cursor-pointer">{t("pharm.billPick")}
          <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="sr-only" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setSaved(false); }} /></label>
        <p className="text-sm">{t("upload.hint")}</p>
        {file && <p>{file.name}</p>}
        <div><label className="label" htmlFor="bt">{t("upload.titleOpt")}</label>
          <input id="bt" className="input" maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)} /></div>
        <button className="btn-primary w-full" disabled={!file || busy} onClick={upload}>{busy ? t("common.loading") : t("pharm.billSave")}</button>
        {saved && <p role="status" className="font-bold text-ok">✔ {t("pharm.saved")}</p>}
        {err && rx && <p role="alert" className="font-bold text-alert">{err}</p>}
      </section>
    </div>
  );
}
