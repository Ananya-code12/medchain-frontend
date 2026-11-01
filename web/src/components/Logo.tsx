import { useTranslation } from "react-i18next";

/** Logo mark: a medical cross (care) with a green check (verified record). Same artwork as public/logo.svg. */
export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <rect width="48" height="48" rx="12" fill="#1F5FBF" />
      <path d="M20 10h8v10h10v8H28v10h-8V28H10v-8h10z" fill="#fff" />
      <circle cx="37" cy="37" r="9" fill="#17613A" stroke="#fff" strokeWidth="3" />
      <path d="M33 37l3 3 5-6" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Logo({ size = 36 }: { size?: number }) {
  const { t } = useTranslation();
  return (
    <span className="inline-flex items-center gap-2">
      <LogoMark size={size} />
      <span className="text-xl font-bold text-ink">{t("app.name")}</span>
    </span>
  );
}
