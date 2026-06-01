import { Outlet } from "react-router";
import { Coffee } from "lucide-react";

import { APP_NAME, APP_TAGLINE } from "@/constants/application";

export function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-secondary p-10 text-secondary-foreground lg:flex">
        <div className="absolute inset-0 bg-gradient-primary opacity-20" />
        <div className="relative flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-glow">
            <Coffee className="size-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">{APP_NAME}</p>
            <p className="text-sm opacity-80">{APP_TAGLINE}</p>
          </div>
        </div>
        <div className="relative space-y-3">
          <h1 className="text-3xl font-bold leading-tight">
            Quản lý cửa hàng <br />
            <span className="text-primary">đơn giản & hiện đại</span>
          </h1>
          <p className="max-w-md text-sm opacity-80">
            Theo dõi doanh thu, đơn hàng, khách hàng và điểm loyalty trong một
            bảng điều khiển duy nhất.
          </p>
        </div>
        <div className="relative text-xs opacity-60">
          © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </div>
      </aside>

      <main className="flex items-center justify-center bg-background px-6 py-10">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
