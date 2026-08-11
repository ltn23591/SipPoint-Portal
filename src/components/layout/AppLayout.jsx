import { useEffect } from "react";
import { Outlet } from "react-router";

import { SidebarLeft } from "./SidebarLeft";
import { Topbar } from "./Topbar";
import { AuthenticationApi } from "@/apis";
import { useAuthStore } from "@/stores/authStore";

export function AppLayout() {
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    let active = true;
    AuthenticationApi.getInfo().then((res) => {
      const body = res?.data;
      if (active && body?.success && body?.data) {
        setUser({ ...body.data, type: body.type });
      }
    });
    return () => {
      active = false;
    };
  }, [setUser]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarLeft />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="themed-scroll flex-1 overflow-y-auto overscroll-contain px-6 py-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
