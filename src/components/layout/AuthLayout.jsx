import { Outlet } from "react-router";
import { Coffee } from "lucide-react";

import { APP_NAME, APP_TAGLINE } from "@/constants/application";

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
            <Coffee className="size-7" />
          </div>
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
