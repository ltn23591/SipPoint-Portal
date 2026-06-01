import { Navigate } from "react-router";

import { ROUTE_PATH } from "@/constants/routePaths";
import { useAuthStore } from "@/stores/authStore";

export function PublicRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to={ROUTE_PATH.DASHBOARD} replace />;
  }

  return children;
}
