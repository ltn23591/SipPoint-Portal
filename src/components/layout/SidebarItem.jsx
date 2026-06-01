import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const isChildActive = (item, pathname) => {
  if (item.children?.length) {
    return item.children.some((c) => pathname === c.path);
  }
  return pathname === item.path;
};

export function SidebarItem({ item, collapsed }) {
  const location = useLocation();
  const Icon = item.icon;
  const hasChildren = !!item.children?.length;
  const active = isChildActive(item, location.pathname);

  const [open, setOpen] = useState(active);

  useEffect(() => {
    if (active && !collapsed) setOpen(true);
  }, [active, collapsed]);

  if (!hasChildren) {
    return (
      <NavLink
        to={item.path}
        end={item.path === "/dashboard"}
        className={({ isActive }) =>
          cn(
            "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            collapsed && "justify-center px-2",
            isActive
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          )
        }
        title={collapsed ? item.label : undefined}
      >
        <Icon className="size-4 shrink-0" />
        {!collapsed && <span className="truncate">{item.label}</span>}
      </NavLink>
    );
  }

  // Collapsed → flyout via HoverCard
  if (collapsed) {
    return (
      <HoverCard openDelay={80} closeDelay={150}>
        <HoverCardTrigger asChild>
          <button
            type="button"
            className={cn(
              "group flex w-full items-center justify-center rounded-lg px-2 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            )}
            title={item.label}
          >
            <Icon className="size-4" />
          </button>
        </HoverCardTrigger>
        <HoverCardContent
          side="right"
          align="start"
          sideOffset={12}
          className="w-60 p-2"
        >
          <p className="mb-1 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {item.label}
          </p>
          <ul className="space-y-0.5">
            {item.children.map((child) => (
              <li key={child.key}>
                <NavLink
                  to={child.path}
                  end
                  className={({ isActive }) =>
                    cn(
                      "block rounded-md px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-primary/10 font-medium text-primary"
                        : "text-foreground hover:bg-muted"
                    )
                  }
                >
                  {child.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </HoverCardContent>
      </HoverCard>
    );
  }

  // Expanded → inline accordion
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          active
            ? "bg-primary/10 text-primary"
            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
        )}
      >
        <Icon className="size-4 shrink-0" />
        <span className="flex-1 truncate text-left">{item.label}</span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open ? (
        <ul className="mt-1 space-y-0.5 pl-4">
          {item.children.map((child) => (
            <li key={child.key}>
              <NavLink
                to={child.path}
                end
                className={({ isActive }) =>
                  cn(
                    "relative flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
                    "before:absolute before:left-0 before:top-1/2 before:h-1 before:w-1 before:-translate-y-1/2 before:rounded-full before:bg-current before:opacity-40",
                    isActive
                      ? "bg-sidebar-accent font-medium text-primary"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )
                }
              >
                <span className="ml-2 truncate">{child.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
