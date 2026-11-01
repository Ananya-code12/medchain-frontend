import { useTranslation } from "react-i18next";

export default function LanguageToggle() {
  const { t, i18n } = useTranslation();
  const next = i18n.language === "en" ? "hi" : "en";
  return (
    <button
      className="btn-ghost"
      onClick={() => { i18n.changeLanguage(next); localStorage.setItem("lang", next); document.documentElement.lang = next; }}
    >
      {t("lang.switch")}
    </button>
  );
}
