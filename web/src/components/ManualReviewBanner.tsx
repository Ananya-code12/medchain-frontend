import { useTranslation } from "react-i18next";

export default function ManualReviewBanner() {
  const { t } = useTranslation();
  return (
    <div role="status" className="mt-3 rounded-lg border-2 border-warn bg-warn-soft p-3">
      <p className="font-bold text-warn">⚠ {t("diag.review")}</p><p>{t("diag.reviewBody")}</p>
    </div>
  );
}
