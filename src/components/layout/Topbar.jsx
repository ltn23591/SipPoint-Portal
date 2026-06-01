import { Bell, Search, Settings } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";

export function Topbar() {
  const today = new Date();
  const todayLabel = format(today, "'Hôm nay,' dd MMMM", { locale: vi });

  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-border bg-card px-6 py-3">
      <div className="max-w-md flex-1">
        <InputGroup className="h-9 rounded-lg bg-background-secondary">
          <InputGroupAddon align="inline-start">
            <Search className="size-4" />
          </InputGroupAddon>
          <InputGroupInput placeholder="Tìm kiếm đơn hàng, khách hàng..." />
        </InputGroup>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" className="relative">
          <Bell className="size-4" />
          <span className="absolute right-1 top-1 size-1.5 rounded-full bg-destructive" />
        </Button>
        <Button variant="ghost" size="icon-sm">
          <Settings className="size-4" />
        </Button>
        <div className="ml-3 text-right leading-tight">
          <p className="text-xs text-muted-foreground">{todayLabel}</p>
        </div>
      </div>
    </header>
  );
}
