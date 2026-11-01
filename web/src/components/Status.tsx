import { useTranslation } from "react-i18next";

export const Loading = () => { const { t } = useTranslation(); return <p role="status">{t("common.loading")}</p>; };
export const Empty = ({ text }: { text: string }) => <p className="card text-center">{text}</p>;
export function ErrorBox({ onRetry, message }: { onRetry: () => void; message?: string }) {
  const { t } = useTranslation();
  return (
    <div role="alert" className="card border-alert bg-alert-soft">
      <p className="mb-3 font-bold text-alert">{message || t("common.error")}</p>
      <button className="btn-primary" onClick={onRetry}>{t("common.retry")}</button>
    </div>
  );
}
