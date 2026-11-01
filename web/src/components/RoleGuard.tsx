import { Navigate } from "react-router-dom";
import type { Role } from "../api";
import { useAuth } from "../auth/AuthContext";
import { HOME_BY_ROLE } from "../auth/roles";
import Layout from "./Layout";

/** Route guard: only the listed roles get in. Signed-out visitors go to the landing page; other roles to their own home. */
export default function RoleGuard({ roles }: { roles: Role[] }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (!roles.includes(user.role)) return <Navigate to={HOME_BY_ROLE[user.role]} replace />;
  return <Layout />;
}
