import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { api, type AccessLogEntry } from "../api";
import { Empty, ErrorBox, Loading } from "../components/Status";
import { errText } from "../utils/errors";
import { fmtDateTime } from "../utils/format";

export default function AccessLog() {
  const { t, i18n } = useTranslation();
  const [rows, setRows] = useState<AccessLogEntry[] | null>(null);
  const [failed, setFailed] = useState("");
  const load = useCallback(() => { setFailed(""); setRows(null); api.getAccessLog().then(setRows).catch((x) => setFailed(errText(x))); }, []);
  useEffect(load, [load]);
  return (
    <section>
      <h1 className="mb-3 text-2xl font-bold">{t("access.title")}</h1>
      {failed && <ErrorBox onRetry={load} message={failed} />}
      {!failed && !rows && <Loading />}
      {rows?.length === 0 && <Empty text={t("access.empty")} />}
      <ul className="space-y-3">
        {rows?.map((r) => (
          <li key={r.id} className="card">
            <p className="font-bold">{r.accessor_name}{r.provider_name ? ` · ${r.provider_name}` : ""}</p>
            <p>{t(`access.act.${r.action ?? "view_timeline"}`)} · {fmtDateTime(r.viewed_at, i18n.language)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
