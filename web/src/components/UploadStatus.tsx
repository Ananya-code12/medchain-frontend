import { useTranslation } from "react-i18next";
import type { UploadStage } from "../api";
import ManualReviewBanner from "./ManualReviewBanner";

const steps = ["uploading", "ocr_running", "anchoring", "done"] as const;

/** uploading -> reading -> anchored on Solana -> done. Low-confidence reads end in "needs manual review" instead of a guess. */
export default function UploadStatus({ stage }: { stage: UploadStage }) {
  const { t } = useTranslation();
  if (stage === "failed") return <p role="alert" className="font-bold text-alert">{t("diag.failed")}</p>;
  const cur = stage === "needs_review" ? 3 : steps.indexOf(stage as (typeof steps)[number]);
  return (
    <div aria-live="polite">
      <ol className="space-y-2">
        {steps.map((s, i) => {
          const finished = i < cur || (i === 3 && stage === "done");
          return (
            <li key={s} className={`flex items-center gap-2 font-bold ${finished ? "text-ok" : i === cur ? "text-brand" : "text-ink/50"}`}>
              <span aria-hidden="true">{finished ? "✔" : i === cur ? "●" : "○"}</span>
              {i === 3 && stage === "needs_review" ? t("diag.review") : t(`diag.${s}`)}
            </li>
          );
        })}
      </ol>
      {stage === "needs_review" && <ManualReviewBanner />}
    </div>
  );
}
