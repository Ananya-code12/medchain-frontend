import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api, type OtpTicket } from "../../api";
import { useAuth } from "../../auth/AuthContext";
import { AFTER_CONSENT, HOME_BY_ROLE, saveGrant } from "../../auth/roles";
import CodeBoxes from "../../components/CodeBoxes";
import { errText } from "../../utils/errors";

// The patient reads the 6-digit code aloud; entering it creates a time-limited, revocable grant.
export default function ConsentStep() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const ticket = useLocation().state as OtpTicket | null;
  const nav = useNavigate();
  const [code, setCode] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const home = HOME_BY_ROLE[user!.role];
  if (!ticket) return <Navigate to={home} replace />; // refreshed or opened directly: start over

  async function open() {
    setBusy(true); setErr("");
    try {
      const g = await api.confirmConsent(ticket!.otpId, code);
      saveGrant(g.patient_id!, g);
      nav(`${home}/${AFTER_CONSENT[user!.role]}/${g.patient_id}`);
    } catch (x) { setErr(errText(x)); }
    setBusy(false);
  }

  return (
    <div className="card mx-auto max-w-lg space-y-4 shadow-lg">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-soft text-2xl" aria-hidden="true">📱</span>
      <h1 className="text-2xl font-bold">{t("consent.title")}</h1>
      <p>{t("consent.body", { phone: ticket.sentTo })}</p>
      <CodeBoxes onChange={setCode} />
      {err && <p role="alert" className="font-bold text-alert">{err}</p>}
      <div className="flex flex-wrap gap-2">
        <button className="btn-primary" disabled={code.length !== 6 || busy} onClick={open}>🔑 {t("consent.open")}</button>
        <Link className="btn-ghost" to={home}>{t("consent.startOver")}</Link>
      </div>
    </div>
  );
}
