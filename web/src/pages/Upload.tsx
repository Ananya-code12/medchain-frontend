import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api, type UploadType } from "../api";
import { useAuth } from "../auth/AuthContext";
import { errText } from "../utils/errors";

// Patient upload. The server shrinks images to WebP, so the app does not compress a second time.
export default function Upload() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null); const [title, setTitle] = useState("");
  const [type, setType] = useState<UploadType>("prescription");
  const [stage, setStage] = useState<"idle" | "uploading" | "done" | "failed">("idle"); const [err, setErr] = useState("");

  async function start() {
    if (!file) return;
    setStage("uploading"); setErr("");
    try { await api.uploadRecord(user!.patientId, file, type, title.trim() || undefined); setStage("done"); }
    catch (x) { setErr(errText(x)); setStage("failed"); }
  }
  const pick = (f?: File) => { if (f) { setFile(f); setStage("idle"); } };

  return (
    <section className="card space-y-4">
      <h1 className="text-2xl font-bold">{t("upload.title")}</h1>
      <div><label className="label" htmlFor="type">{t("upload.type")}</label>
        <select id="type" className="input" value={type} onChange={(e) => setType(e.target.value as UploadType)}>
          {(["prescription", "bill", "lab_report"] as const).map((x) => <option key={x} value={x}>{t(`entry.${x}`)}</option>)}
        </select></div>
      <div><label className="label" htmlFor="title">{t("upload.titleOpt")}</label>
        <input id="title" className="input" maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)} /></div>
      <div className="flex flex-wrap gap-2">
        <label className="btn-primary cursor-pointer">{t("upload.camera")}
          <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => pick(e.target.files?.[0])} /></label>
        <label className="btn-ghost cursor-pointer">{t("upload.gallery")}
          <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="sr-only" onChange={(e) => pick(e.target.files?.[0])} /></label>
      </div>
      <p className="text-sm">{t("upload.hint")}</p>
      {file && <p>{t("upload.chosen", { name: file.name })}</p>}
      <button className="btn-primary w-full" disabled={!file || stage === "uploading"} onClick={start}>{t("upload.start")}</button>
      <div aria-live="polite" className="space-y-1">
        {stage === "uploading" && <p className="font-bold text-brand">{t("upload.uploading")}</p>}
        {stage === "done" && <p className="font-bold text-ok">{t("upload.done")} <Link className="underline" to="/timeline">{t("upload.view")}</Link></p>}
        {stage === "failed" && <p role="alert" className="font-bold text-alert">{t("upload.failed")} {err}</p>}
      </div>
    </section>
  );
}
