import { useEffect, useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api, ApiError, type OtpTicket, type Role } from "../api";
import { useAuth } from "../auth/AuthContext";
import { HOME_BY_ROLE } from "../auth/roles";
import LanguageToggle from "../components/LanguageToggle";
import Logo from "../components/Logo";
import { errText } from "../utils/errors";

const ROLES: Role[] = ["patient", "doctor", "diagnostic", "pharmacy", "admin"];
const DEMO_EMAIL: Record<string, string> = { doctor: "doctor@medchain.demo", diagnostic: "lab@medchain.demo", pharmacy: "pharmacy@medchain.demo", admin: "admin@medchain.demo" };

// Patients: 12-digit ID -> OTP (new IDs also give name + mobile). Staff and admin: email + password.
export default function Login() {
  const { t } = useTranslation();
  const { user, login } = useAuth();
  const nav = useNavigate();
  const [role, setRole] = useState<Role>("patient");
  const [ident, setIdent] = useState(""); // the 12-digit ID lives in memory only, never in storage
  const [name, setName] = useState(""); const [mobile, setMobile] = useState(""); const [needReg, setNeedReg] = useState(false);
  const [ticket, setTicket] = useState<OtpTicket | null>(null); const [code, setCode] = useState("");
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const [demo, setDemo] = useState(false); const [cool, setCool] = useState(0);

  useEffect(() => { api.health().then((h) => setDemo(h.demoMode)).catch(() => undefined); }, []); // hint only shown in demo mode
  useEffect(() => { if (cool <= 0) return; const id = setTimeout(() => setCool((c) => c - 1), 1000); return () => clearTimeout(id); }, [cool]);
  if (user) return <Navigate to={HOME_BY_ROLE[user.role]} replace />;

  const pickRole = (r: Role) => { setRole(r); setErr(""); setTicket(null); setNeedReg(false); setCode(""); };
  async function start() {
    if (ident.length !== 12) throw new ApiError(400, "INVALID_IDENTIFIER", t("search.bad"));
    setTicket(await api.patientStart(ident, needReg ? { name: name.trim(), mobile } : undefined)); setCool(30);
  }
  async function submit(ev: FormEvent) {
    ev.preventDefault(); setErr(""); setBusy(true);
    try {
      if (role !== "patient") { const s = await api.login(email, password); login(s); nav(HOME_BY_ROLE[s.role]); }
      else if (!ticket) await start();
      else { const s = await api.patientVerify(ticket.otpId, code, needReg); setIdent(""); login(s); nav(HOME_BY_ROLE[s.role]); }
    } catch (x) {
      if (x instanceof ApiError && x.code === "PATIENT_NOT_REGISTERED" && !needReg) { setNeedReg(true); setErr(t("login.newHere")); }
      else setErr(errText(x));
    }
    setBusy(false);
  }
  async function resend() {
    setErr(""); setCode("");
    try { await start(); } catch (x) { setErr(errText(x)); }
  }

  return (
    <main className="mx-auto max-w-md p-4">
      <div className="mb-4 flex items-center justify-between"><h1><Logo size={44} /></h1><LanguageToggle /></div>
      <form onSubmit={submit} className="card space-y-4">
        <div><h2 className="text-2xl font-bold">{t("provider.welcome")}</h2><p>{t("provider.pick")}</p></div>
        <div role="group" aria-label="Role" className="grid grid-cols-2 gap-2">
          {ROLES.map((r) => (
            <button type="button" key={r} aria-pressed={role === r} onClick={() => pickRole(r)}
              className={`btn ${role === r ? "bg-brand text-white" : "border-2 border-line text-ink"}`}>{t(`roles.${r}`)}</button>
          ))}
        </div>

        {role === "patient" ? <>
          <div><label className="label" htmlFor="ident">{t("login.ident")}</label>
            <input id="ident" className="input" inputMode="numeric" autoComplete="off" required disabled={!!ticket} placeholder="0000 0000 0000"
              value={ident.replace(/(\d{4})(?=\d)/g, "$1 ")} onChange={(e) => setIdent(e.target.value.replace(/\D/g, "").slice(0, 12))} /></div>
          {needReg && !ticket && <>
            <div><label className="label" htmlFor="name">{t("login.name")}</label>
              <input id="name" className="input" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div><label className="label" htmlFor="mobile">{t("login.mobile")}</label>
              <input id="mobile" className="input" inputMode="tel" autoComplete="tel" required value={mobile} onChange={(e) => setMobile(e.target.value)} /></div>
          </>}
          {ticket && <div>
            <p role="status" className="mb-2">{t("login.sent", { mobile: ticket.sentTo })} {demo && <span className="text-sm">({t("login.demoHint")})</span>}</p>
            <label className="label" htmlFor="code">{t("login.code")}</label>
            <input id="code" className="input" inputMode="numeric" maxLength={6} autoComplete="one-time-code" required value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} />
            <button type="button" className="btn-ghost mt-2" disabled={cool > 0} onClick={resend}>{cool > 0 ? t("login.resendIn", { s: cool }) : t("login.resend")}</button>
          </div>}
          {demo && !ticket && <p className="text-sm">{t("login.demoPatient")}</p>}
        </> : <>
          <div><label className="label" htmlFor="email">{t("provider.email")}</label>
            <input id="email" type="email" className="input" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div><label className="label" htmlFor="pw">{t("provider.password")}</label>
            <input id="pw" type="password" className="input" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          {demo && <p className="text-sm">{t("provider.demo", { email: DEMO_EMAIL[role] })}</p>}
        </>}

        {err && <p role="alert" className="font-bold text-alert">{err}</p>}
        <button className="btn-primary w-full" disabled={busy}>{busy ? t("common.loading") : role !== "patient" ? t("provider.signin") : ticket ? t("login.verify") : t("login.send")}</button>
        {role === "patient" && <p className="text-sm">{t("login.consent")}</p>}
      </form>
    </main>
  );
}
