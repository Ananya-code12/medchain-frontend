import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api, ApiError, type TimelineEntry } from "../../api";
import { getGrant } from "../../auth/roles";
import FlaggedResultsCard, { type Flagged } from "../../components/FlaggedResultsCard";
import { ErrorBox, Loading } from "../../components/Status";
import TimelineView from "../../components/TimelineView";
import { errText } from "../../utils/errors";
import { timeLeft } from "../../utils/format";

// Doctor view: flagged values first, then the full history. Needs a live consent grant; CONSENT_* errors send you back (fail closed).
export default function PatientRecord() {
  const { t } = useTranslation();
  const { patientId = "" } = useParams();
  const grant = getGrant(patientId);
  const [entries, setEntries] = useState<TimelineEntry[] | null>(null);
  const [failed, setFailed] = useState(""); const [denied, setDenied] = useState(false);
  const [now, setNow] = useState(Date.now());

  const load = useCallback(() => {
    setFailed(""); setEntries(null);
    api.getTimeline(patientId).then(setEntries).catch((x) => {
      if (x instanceof ApiError && x.code.startsWith("CONSENT_")) setDenied(true); else setFailed(errText(x) || "!");
    });
  }, [patientId]);
  useEffect(() => { if (grant) load(); }, [patientId]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(id); }, []);

  if (!grant || denied) return <Navigate to="/doctor" replace />;
  const left = timeLeft(grant.expires_at, now);
  if (!left) return (
    <div role="alert" className="card border-alert bg-alert-soft">
      <p className="mb-3 font-bold text-alert">{t("consent.expired")}</p>
      <Link className="btn-primary" to="/doctor">{t("record.another")}</Link>
    </div>
  );

  const tests = entries?.flatMap((e) => (e.tests ?? []).map((x) => ({ ...x, date: e.date, entryId: e.id }))) ?? [];
  const flagged: Flagged[] = tests.filter((x) => x.status === "high" || x.status === "low").sort((a, b) => b.date.localeCompare(a.date));
  const unsure = tests.filter((x) => x.confidence < 0.8).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">{grant.patient_name ?? "Patient"}</h1>
        <p className="pill bg-ok-soft text-ok">⏱ {t("record.expires", { time: left })}</p>
      </div>
      {failed && <ErrorBox onRetry={load} message={failed} />}
      {!failed && !entries && <Loading />}
      {entries && <>
        <FlaggedResultsCard flagged={flagged} unsure={unsure} />
        <TimelineView entries={entries} emptyText={t("record.empty")} />
      </>}
      <Link className="btn-ghost" to="/doctor">{t("record.another")}</Link>
    </div>
  );
}
