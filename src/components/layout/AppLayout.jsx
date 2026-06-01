import { Outlet } from "react-router";

import { SidebarLeft } from "./SidebarLeft";
import { Topbar } from "./Topbar";

export function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarLeft />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-6 py-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
