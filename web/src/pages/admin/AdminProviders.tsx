import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { api, type Provider } from "../../api";
import { Empty, Loading } from "../../components/Status";
import { errText } from "../../utils/errors";

type Filter = "pending" | "verified" | "rejected" | "all";
const FILTERS: Filter[] = ["pending", "verified", "rejected", "all"];

// Admin: approve or reject provider sign-ups. Rejecting a verified provider suspends it immediately.
export default function AdminProviders() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<Filter>("pending");
  const [rows, setRows] = useState<Provider[] | null>(null); const [err, setErr] = useState("");
  const [rejecting, setRejecting] = useState<string | null>(null); const [reason, setReason] = useState("");

  const load = useCallback(() => { setRows(null); setErr(""); api.listProviders(status).then(setRows).catch((x) => setErr(errText(x))); }, [status]);
  useEffect(load, [load]);
  const act = async (fn: () => Promise<void>) => {
    try { await fn(); setRejecting(null); setReason(""); load(); } catch (x) { setErr(errText(x)); }
  };

  return (
    <section>
      <h1 className="mb-3 text-2xl font-bold">{t("admin.title")}</h1>
      <div role="group" aria-label="Filter" className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button key={f} aria-pressed={status === f} onClick={() => setStatus(f)}
            className={`btn ${status === f ? "bg-brand text-white" : "border-2 border-brand text-brand"}`}>{t(`admin.f_${f}`)}</button>
        ))}
      </div>
      {err && <p role="alert" className="mb-3 font-bold text-alert">{err}</p>}
      {!rows && !err && <Loading />}
      {rows?.length === 0 && <Empty text={t("admin.none")} />}
      <ul className="space-y-3">
        {rows?.map((p) => (
          <li key={p.id} className="card">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-bold">{p.name}</h2>
              <span className={`pill ${p.verified_status === "verified" ? "bg-ok-soft text-ok" : p.verified_status === "rejected" ? "bg-alert-soft text-alert" : "bg-warn-soft text-warn"}`}>{t(`admin.f_${p.verified_status}`)}</span>
            </div>
            <p>{t(`roles.${p.type}`)} · {p.registration_number}</p>
            {p.contact && <p>{p.contact.name} · {p.contact.email}</p>}
            {p.rejection_reason && <p className="text-alert">{p.rejection_reason}</p>}
            <div className="mt-3 flex flex-wrap gap-2">
              {p.verified_status !== "verified" && <button className="btn-primary" onClick={() => act(() => api.verifyProvider(p.id))}>{t("admin.approve")}</button>}
              {p.verified_status !== "rejected" && rejecting !== p.id && <button className="btn-ghost" onClick={() => setRejecting(p.id)}>{t("admin.reject")}</button>}
            </div>
            {rejecting === p.id && (
              <div className="mt-3 space-y-2">
                <label className="label" htmlFor={`r-${p.id}`}>{t("admin.reason")}</label>
                <input id={`r-${p.id}`} className="input" minLength={3} maxLength={300} value={reason} onChange={(e) => setReason(e.target.value)} />
                <div className="flex gap-2">
                  <button className="btn bg-alert text-white" disabled={reason.trim().length < 3} onClick={() => act(() => api.rejectProvider(p.id, reason.trim()))}>{t("admin.confirmReject")}</button>
                  <button className="btn-ghost" onClick={() => setRejecting(null)}>{t("consents.cancel")}</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
