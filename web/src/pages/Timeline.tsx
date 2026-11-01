import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { api, type TimelineEntry } from "../api";
import { useAuth } from "../auth/AuthContext";
import { ErrorBox, Loading } from "../components/Status";
import TimelineView from "../components/TimelineView";

export default function Timeline() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [entries, setEntries] = useState<TimelineEntry[] | null>(null);
  const [failed, setFailed] = useState(false);
  const load = useCallback(() => { setFailed(false); setEntries(null); api.getTimeline(user!.patientId).then(setEntries).catch(() => setFailed(true)); }, [user]);
  useEffect(load, [load]);
  return (
    <section>
      <h1 className="mb-3 text-2xl font-bold">{t("timeline.title")}</h1>
      {failed && <ErrorBox onRetry={load} />}
      {!failed && !entries && <Loading />}
      {entries && <TimelineView entries={entries} emptyText={t("timeline.empty")} />}
    </section>
  );
}
