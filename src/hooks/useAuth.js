import { useNavigate } from "react-router";
import { useAuthStore } from "@/stores/authStore";
import { ROUTE_PATH } from "@/constants/routePaths";
import { STORAGE_KEY } from "@/constants/application";
import { storage } from "@/helpers/storage";

export function useAuth() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const loginStore = useAuthStore((state) => state.login);
  const logoutStore = useAuthStore((state) => state.logout);

  const login = ({ user, token, refreshToken }) => {
    storage.set(STORAGE_KEY.ACCESS_TOKEN, token);
    if (refreshToken) storage.set(STORAGE_KEY.REFRESH_TOKEN, refreshToken);
    loginStore({ user, token });
    navigate(ROUTE_PATH.DASHBOARD, { replace: true });
  };

  const logout = () => {
    storage.remove(STORAGE_KEY.ACCESS_TOKEN);
    storage.remove(STORAGE_KEY.REFRESH_TOKEN);
    logoutStore();
    navigate(ROUTE_PATH.LOGIN, { replace: true });
  };

  return { user, token, isAuthenticated, login, logout };
}
