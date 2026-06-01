import { Navigate, useLocation } from "react-router";

import { ROUTE_PATH } from "@/constants/routePaths";
import { useAuthStore } from "@/stores/authStore";

export function PrivateRoute({ children }) {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return (
      <Navigate
        to={ROUTE_PATH.LOGIN}
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return children;
}
