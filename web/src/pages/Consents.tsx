import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { api, type ConsentGrant } from "../api";
import { Empty, ErrorBox, Loading } from "../components/Status";
import { timeLeft } from "../utils/format";

function Grant({ g, onRevoke }: { g: ConsentGrant; onRevoke: () => void }) {
  const { t } = useTranslation();
  const [confirming, setConfirming] = useState(false);
  const left = timeLeft(g.expires_at);
  const active = !g.revoked_at && g.state !== "revoked" && g.state !== "expired" && left;
  return (
    <li className="card">
      <p className="text-lg font-bold">{g.accessor_name}{g.provider_name ? ` · ${g.provider_name}` : ""}</p>
      {g.purpose && <p>{g.purpose}</p>}
      <p className={`font-bold ${active ? "text-ok" : "text-alert"}`}>
        {g.revoked_at || g.state === "revoked" ? t("consents.revoked") : left ? t("consents.expires", { time: left }) : t("consents.expired")}
      </p>
      {active && !confirming && <button className="btn-ghost mt-3" onClick={() => setConfirming(true)}>{t("consents.revoke")}</button>}
      {active && confirming && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="btn bg-alert text-white" onClick={onRevoke}>{t("consents.sure")}</button>
          <button className="btn-ghost" onClick={() => setConfirming(false)}>{t("consents.cancel")}</button>
        </div>
      )}
    </li>
  );
}

export default function Consents() {
  const { t } = useTranslation();
  const [rows, setRows] = useState<ConsentGrant[] | null>(null);
  const [failed, setFailed] = useState(false);
  const load = useCallback(() => { setFailed(false); setRows(null); api.getConsentGrants().then(setRows).catch(() => setFailed(true)); }, []);
  useEffect(load, [load]);
  const revoke = (id: string) => api.revokeConsent(id).then(load).catch(() => setFailed(true));
  return (
    <section>
      <h1 className="mb-3 text-2xl font-bold">{t("consents.title")}</h1>
      {failed && <ErrorBox onRetry={load} />}
      {!failed && !rows && <Loading />}
      {rows?.length === 0 && <Empty text={t("consents.empty")} />}
      <ul className="space-y-3">{rows?.map((g) => <Grant key={g.id} g={g} onRevoke={() => revoke(g.id)} />)}</ul>
    </section>
  );
}
