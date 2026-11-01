import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../api";
import { useAuth } from "../../auth/AuthContext";
import { HOME_BY_ROLE } from "../../auth/roles";
import { errText } from "../../utils/errors";

// Shared by doctor, diagnostic center and pharmacy: enter the patient's ID -> a code goes to THEIR phone.
export default function PatientSearch() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const nav = useNavigate();
  const [digits, setDigits] = useState(""); // memory only; cleared as soon as the request is sent
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);

  async function submit(ev: FormEvent) {
    ev.preventDefault();
    if (digits.length !== 12) { setErr(t("search.bad")); return; }
    setBusy(true); setErr("");
    try {
      const ticket = await api.requestConsent(digits);
      setDigits("");
      nav(`${HOME_BY_ROLE[user!.role]}/consent`, { state: ticket });
    } catch (x) { setErr(errText(x)); }
    setBusy(false);
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <h1 className="text-3xl font-bold">{t("search.title")}</h1>
        <p className="mt-2">{t("search.sub")}</p>
        <ol className="mt-4 space-y-3">
          {(["s1", "s2", "s3"] as const).map((s, i) => (
            <li key={s} className="flex gap-3"><span className="pill bg-brand-soft text-brand" aria-hidden="true">{i + 1}</span>
              <span><b>{t(`search.${s}`)}</b><br />{t(`search.${s}d`)}</span></li>
          ))}
        </ol>
      </div>
      <form onSubmit={submit} className="card space-y-4 shadow-lg">
        <div><label className="label" htmlFor="pid">{t("search.id")}</label>
          <input id="pid" className="input" inputMode="numeric" autoComplete="off" placeholder="0000 0000 0000"
            value={digits.replace(/(\d{4})(?=\d)/g, "$1 ")} onChange={(e) => setDigits(e.target.value.replace(/\D/g, "").slice(0, 12))} /></div>
        {err && <p role="alert" className="font-bold text-alert">{err}</p>}
        <button className="btn-primary w-full" disabled={busy}>{busy ? t("common.loading") : t("search.find")}</button>
      </form>
    </div>
  );
}
