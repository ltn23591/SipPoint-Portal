import { Outlet } from "react-router";

import { APP_NAME, APP_TAGLINE } from "@/constants/application";
import logoSippoint from "@/assets/logo_sippoint.png";

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <img src={logoSippoint} alt="Logo" className="mx-auto h-10 w-auto" />
          <div>
            <p className="text-2xl font-bold text-secondary">{APP_NAME}</p>
            <p className="text-sm text-muted-foreground">{APP_TAGLINE}</p>
          </div>
        </div>

        <div className="rounded-2xl border bg-background p-8 shadow-sm">
          <Outlet />
        </div>

        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </p>
      </div>
    </div>
  );
}
