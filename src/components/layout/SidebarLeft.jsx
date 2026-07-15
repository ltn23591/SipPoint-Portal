import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { MENU_ITEMS } from "@/constants/menuItems";
import { APP_NAME, APP_TAGLINE } from "@/constants/application";
import { useUiStore } from "@/stores/uiStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import logoSippoint from "@/assets/logo_sippoint.png";
import { SidebarItem } from "./SidebarItem";

export function SidebarLeft() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  return (
    <aside
      style={{
        width: collapsed ? 64 : 240,
        minWidth: collapsed ? 64 : 240,
        maxWidth: collapsed ? 64 : 240,
        flexShrink: 0,
      }}
      className={cn(
        "flex h-screen flex-col overflow-hidden bg-sidebar text-sidebar-foreground"
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3 border-b border-sidebar-border py-4",
          collapsed ? "justify-center px-2" : "px-5"
        )}
      >
        <div className="flex size-15 shrink-0 items-center justify-center rounded-xl bg-white/95 p-1.5">
          <img src={logoSippoint} alt="Logo" className="h-full w-full object-contain" />
        </div>
        <div>
          |
        </div>
        {!collapsed && (
          <div className="leading-tight">
            <p className="text-sm font-bold text-primary">{APP_NAME}</p>
            <p className="text-xs text-sidebar-foreground/70">{APP_TAGLINE}</p>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {MENU_ITEMS.map((item) =>
            item.type === "header" ? (
              <li key={item.key}>
                {collapsed ? (
                  <div className="my-2 border-t border-sidebar-border" />
                ) : (
                  <p className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                    {item.label}
                  </p>
                )}
              </li>
            ) : (
              <li key={item.key}>
                <SidebarItem item={item} collapsed={collapsed} />
              </li>
            )
          )}
        </ul>
      </nav>

      <div className="border-t border-sidebar-border px-3 py-3">
        <div
          className={cn(
            "flex",
            collapsed ? "justify-center" : "justify-end"
          )}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={toggleSidebar}
            className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            title={collapsed ? "Mở rộng" : "Thu gọn"}
          >
            {collapsed ? (
              <PanelLeftOpen className="size-4" />
            ) : (
              <PanelLeftClose className="size-4" />
            )}
          </Button>
        </div>
      </div>
    </aside>
  );
}
