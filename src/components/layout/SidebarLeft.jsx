import { Coffee, LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { MENU_ITEMS } from "@/constants/menuItems";
import { APP_NAME, APP_TAGLINE } from "@/constants/application";
import { useAuth } from "@/hooks/useAuth";
import { useUiStore } from "@/stores/uiStore";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SidebarItem } from "./SidebarItem";

export function SidebarLeft() {
  const { user, logout } = useAuth();
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  const initials = (user?.name || "AD")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

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
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary">
          <Coffee className="size-5" />
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
          {MENU_ITEMS.map((item) => (
            <li key={item.key}>
              <SidebarItem item={item} collapsed={collapsed} />
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-sidebar-border px-3 py-3">
        <div
          className={cn(
            "flex items-center rounded-lg p-2",
            collapsed ? "justify-center" : "gap-3"
          )}
        >
          <Avatar className="size-9 bg-primary/20">
            <AvatarFallback className="bg-primary/20 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-sm font-medium text-sidebar-foreground">
                  {user?.name || "Admin SipPoint"}
                </p>
                <p className="truncate text-xs text-sidebar-foreground/60">
                  {user?.email || "admin@sippoint.vn"}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={logout}
                className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                title="Đăng xuất"
              >
                <LogOut className="size-4" />
              </Button>
            </>
          )}
        </div>

        <div
          className={cn(
            "mt-2 flex border-t border-sidebar-border pt-2",
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
