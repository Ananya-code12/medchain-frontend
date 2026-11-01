import { NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { Role } from "../api";
import { useAuth } from "../auth/AuthContext";
import LanguageToggle from "./LanguageToggle";
import Logo from "./Logo";

const NAV: Record<Role, string[][]> = {
  patient: [["/timeline", "nav.timeline"], ["/upload", "nav.upload"], ["/access-log", "nav.access"], ["/consents", "nav.consents"], ["/whatsapp", "nav.whatsapp"]],
  doctor: [["/doctor", "nav2.patients"]],
  diagnostic: [["/diagnostic", "nav2.uploadReport"]],
  pharmacy: [["/pharmacy", "nav2.dispense"]],
  admin: [["/admin", "nav2.providers"]],
};

export default function Layout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const links = NAV[user!.role];
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:m-2 focus:bg-white focus:p-2">Skip to content</a>
      <header className="border-b border-line bg-panel">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 p-3">
          <Logo />
          <div className="flex items-center gap-2">
            <span className="hidden text-sm font-bold sm:inline">{user!.name}</span>
            <LanguageToggle /><button className="btn-ghost" onClick={logout}>{t("nav.logout")}</button>
          </div>
        </div>
        <nav aria-label="Main" className="mx-auto max-w-3xl overflow-x-auto">
          <ul className="flex gap-1 px-3 pb-2">
            {links.map(([to, key]) => (
              <li key={to}>
                <NavLink to={to} className={({ isActive }) => `btn whitespace-nowrap ${isActive ? "bg-ink text-white" : "text-brand hover:bg-brand-soft"}`}>{t(key)}</NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main id="main" className="mx-auto max-w-3xl p-4"><Outlet /></main>
    </>
  );
}
