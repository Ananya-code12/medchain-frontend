import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { api, type OtpTicket } from "../api";
import { errText } from "../utils/errors";

// Link / unlink the WhatsApp number (the bot recognises patients only by this verified number) and erase chatbot memory.
export default function LinkWhatsApp() {
  const { t } = useTranslation();
  const [state, setState] = useState<{ linked: boolean; phone: string | null } | null>(null);
  const [mobile, setMobile] = useState(""); const [ticket, setTicket] = useState<OtpTicket | null>(null); const [code, setCode] = useState("");
  const [err, setErr] = useState(""); const [note, setNote] = useState(""); const [busy, setBusy] = useState(false);
  const refresh = useCallback(() => api.getWhatsApp().then(setState).catch((x) => setErr(errText(x))), []);
  useEffect(() => { refresh(); }, [refresh]);

  async function submit(ev: FormEvent) {
    ev.preventDefault(); setErr(""); setNote(""); setBusy(true);
    try {
      if (!ticket) setTicket(await api.linkWhatsAppStart(mobile));
      else { await api.linkWhatsAppVerify(ticket.otpId, code); setTicket(null); setCode(""); setMobile(""); setNote(t("wa.linked")); await refresh(); }
    } catch (x) { setErr(errText(x)); }
    setBusy(false);
  }
  async function unlink() { setErr(""); setNote(""); try { await api.unlinkWhatsApp(); await refresh(); } catch (x) { setErr(errText(x)); } }
  async function erase() {
    setErr(""); setNote("");
    try { const r = await api.deleteChatHistory(); if (r === "failed") setErr(t("wa.eraseFailed")); else setNote(t("wa.erased")); } catch (x) { setErr(errText(x)); }
  }

  return (
    <section className="card space-y-4">
      <h1 className="text-2xl font-bold">{t("wa.title")}</h1>
      <p>{t("wa.intro")}</p>
      {!state && !err && <p role="status">{t("common.loading")}</p>}
      {state?.linked ? (
        <div className="space-y-3">
          <p className="font-bold text-ok">✔ {t("wa.linkedAs", { phone: state.phone })}</p>
          <div className="flex flex-wrap gap-2">
            <button className="btn-ghost" onClick={unlink}>{t("wa.unlink")}</button>
            <button className="btn-ghost" onClick={erase}>{t("wa.erase")}</button>
          </div>
        </div>
      ) : state && (
        <form onSubmit={submit} className="space-y-4">
          <div><label className="label" htmlFor="wam">{t("login.mobile")}</label>
            <input id="wam" className="input" inputMode="tel" required value={mobile} disabled={!!ticket} onChange={(e) => setMobile(e.target.value)} /></div>
          {ticket && <div><label className="label" htmlFor="wac">{t("login.code")}</label>
            <p className="mb-1 text-sm">{t("login.sent", { mobile: ticket.sentTo })}</p>
            <input id="wac" className="input" inputMode="numeric" maxLength={6} required value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} /></div>}
          <button className="btn-primary w-full" disabled={busy}>{ticket ? t("wa.link") : t("wa.send")}</button>
        </form>
      )}
      {note && <p role="status" className="font-bold text-ok">{note}</p>}
      {err && <p role="alert" className="font-bold text-alert">{err}</p>}
    </section>
  );
}
