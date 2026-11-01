import { createContext, useContext, useState, type ReactNode } from "react";
import type { Session } from "../api";

interface Ctx { user: Session | null; login: (s: Session) => void; logout: () => void }
const AuthCtx = createContext<Ctx>(null!);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Session | null>(() => {
    // Ignore sessions saved by older versions (no valid role) instead of crashing on them.
    try {
      const s = JSON.parse(localStorage.getItem("session") || "null");
      return s && ["patient", "doctor", "diagnostic", "pharmacy", "admin"].includes(s.role) ? s : null;
    } catch { return null; }
  });
  const login = (s: Session) => { localStorage.setItem("session", JSON.stringify(s)); localStorage.setItem("token", s.token); setUser(s); };
  const logout = () => { localStorage.removeItem("session"); localStorage.removeItem("token"); setUser(null); };
  return <AuthCtx.Provider value={{ user, login, logout }}>{children}</AuthCtx.Provider>;
}
