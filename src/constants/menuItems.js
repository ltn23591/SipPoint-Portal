import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  QrCode,
  Users,
  Gift,
  UserCog,
  BarChart3,
  Settings,
  Package,
  BadgePercent,
  Star,
  Bell,
  CreditCard,
  Dices,
} from "lucide-react";
import { ROUTE_PATH } from "./routePaths";

// Sidebar gom theo nhóm domain. Phần tử { type: "header" } là tiêu đề nhóm.
// Mỗi module là 1 link đơn (chưa tách submenu vì các trang con chưa có mock dữ liệu).
export const MENU_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: ROUTE_PATH.DASHBOARD },

  // ─── Bán hàng & Vận hành ───
  { type: "header", key: "grp-sales", label: "Bán hàng & Vận hành" },
  { key: "orders", label: "Đơn hàng", icon: ShoppingBag, path: ROUTE_PATH.ORDERS },
  { key: "menu", label: "Menu", icon: UtensilsCrossed, path: ROUTE_PATH.MENU },
  { key: "tables", label: "Bàn & QR", icon: QrCode, path: ROUTE_PATH.TABLES },
  { key: "payments", label: "Thanh toán", icon: CreditCard, path: ROUTE_PATH.PAYMENTS },

  // ─── Kho vận ───
  { type: "header", key: "grp-inventory", label: "Kho vận" },
  { key: "inventory", label: "Kho & Nguyên liệu", icon: Package, path: ROUTE_PATH.INVENTORY },

  // ─── CRM & Marketing ───
  { type: "header", key: "grp-crm", label: "CRM & Marketing" },
  { key: "customers", label: "Khách hàng", icon: Users, path: ROUTE_PATH.CUSTOMERS },
  { key: "loyalty", label: "Loyalty & Events", icon: Gift, path: ROUTE_PATH.LOYALTY },
  { key: "promotions", label: "Khuyến mãi", icon: BadgePercent, path: ROUTE_PATH.PROMOTIONS },
  { key: "reviews", label: "Đánh giá", icon: Star, path: ROUTE_PATH.REVIEWS },
  { key: "notifications", label: "Thông báo", icon: Bell, path: ROUTE_PATH.NOTIFICATIONS },
  { key: "lucky-wheel", label: "Vòng quay may mắn", icon: Dices, path: ROUTE_PATH.LUCKY_WHEEL },

  // ─── Quản trị ───
  { type: "header", key: "grp-admin", label: "Quản trị" },
  { key: "staff", label: "Nhân viên", icon: UserCog, path: ROUTE_PATH.STAFF },
  { key: "reports", label: "Báo cáo", icon: BarChart3, path: ROUTE_PATH.REPORTS },
  { key: "settings", label: "Cài đặt", icon: Settings, path: ROUTE_PATH.SETTINGS },
];
