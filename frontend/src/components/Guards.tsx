import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/auth";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const authed = useAuthStore((s) => !!s.accessToken);
  const loc = useLocation();
  if (!authed) {
    return <Navigate to="/auth/login" replace state={{ from: loc.pathname }} />;
  }
  return <>{children}</>;
}

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const authed = useAuthStore((s) => !!s.accessToken);
  const isAdmin = useAuthStore((s) => s.user?.role === "admin");
  const loc = useLocation();
  if (!authed) {
    return <Navigate to="/auth/login" replace state={{ from: loc.pathname }} />;
  }
  if (!isAdmin) {
    return <Navigate to="/resume" replace />;
  }
  return <>{children}</>;
}
