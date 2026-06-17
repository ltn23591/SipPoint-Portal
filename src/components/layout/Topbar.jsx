import { Bell, ChevronDown, ChevronRight, Home, LogOut, Settings, User } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Link, useLocation, useMatches } from "react-router";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_LABEL } from "@/constants/application";

// Segment → Vietnamese label map
const SEGMENT_LABEL = {
  dashboard: "Dashboard",
  orders: "Đơn hàng",
  pending: "Chờ xác nhận",
  completed: "Đã hoàn thành",
  cancelled: "Đã huỷ",
  menu: "Thực đơn",
  categories: "Danh mục",
  combo: "Combo",
  price: "Bảng giá",
  tables: "Bàn & QR",
  qr: "Mã QR",
  map: "Sơ đồ bàn",
  customers: "Khách hàng",
  segments: "Phân khúc",
  history: "Lịch sử",
  loyalty: "Loyalty & Events",
  tiers: "Hạng thành viên",
  vouchers: "Voucher",
  events: "Sự kiện",
  staff: "Nhân viên",
  roles: "Phân quyền",
  shifts: "Ca làm việc",
  reports: "Báo cáo",
  products: "Theo sản phẩm",
  settings: "Cài đặt",
  payment: "Thanh toán",
  print: "In ấn",
  integration: "Tích hợp",
};

// Root label per top-level segment
const ROOT_LABEL = {
  dashboard: "Dashboard",
  orders: "Đơn hàng",
  menu: "Thực đơn",
  tables: "Bàn & QR",
  customers: "Khách hàng",
  loyalty: "Loyalty & Events",
  staff: "Nhân viên",
  reports: "Báo cáo",
  settings: "Cài đặt",
};

function useBreadcrumbs() {
  const location = useLocation();
  const matches = useMatches();

  const segments = location.pathname.replace(/^\//, "").split("/").filter(Boolean);
  if (segments.length === 0) return [];

  const crumbs = [];
  let acc = "";

  segments.forEach((seg, i) => {
    acc += `/${seg}`;
    // Check if this segment looks like a dynamic id (not in our label map)
    const label = SEGMENT_LABEL[seg];
    if (!label) {
      // Try to get name from route state
      const stateLabel = location.state?.itemName;
      crumbs.push({ label: stateLabel ?? "Chi tiết", path: acc, active: i === segments.length - 1 });
    } else {
      crumbs.push({ label, path: acc, active: i === segments.length - 1 });
    }
  });

  return crumbs;
}

export function Topbar() {
  const { user, logout } = useAuth();
  const today = new Date();
  const todayLabel = format(today, "'Hôm nay,' dd MMMM", { locale: vi });
  const breadcrumbs = useBreadcrumbs();

  const initials = (user?.name || "AD")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-border bg-card px-6 py-3">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm">
        <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
          <Home className="size-3.5" />
        </Link>
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.path} className="flex items-center gap-1">
            <ChevronRight className="size-3 text-muted-foreground/60" />
            {crumb.active ? (
              <span className="font-medium text-foreground">{crumb.label}</span>
            ) : (
              <Link
                to={crumb.path}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </nav>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-2">
        <div className="mr-1 text-right leading-tight">
          <p className="text-xs text-muted-foreground">{todayLabel}</p>
        </div>

        <Button variant="ghost" size="icon-sm" className="relative">
          <Bell className="size-4" />
          <span className="absolute right-1 top-1 size-1.5 rounded-full bg-destructive" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="ml-1 flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-accent focus:outline-none"
            >
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left leading-tight sm:block">
                <p className="max-w-[120px] truncate font-medium text-foreground">
                  {user?.name || "Admin SipPoint"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {ROLE_LABEL[user?.role] || user?.role || "Admin"}
                </p>
              </div>
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{user?.name || "Admin SipPoint"}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email || "admin@sippoint.vn"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 size-4" />
              Hồ sơ cá nhân
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 size-4" />
              Cài đặt
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 size-4" />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
