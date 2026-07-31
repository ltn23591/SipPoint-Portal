import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Tags,
  QrCode,
  Users,
  Gift,
  UserCog,
  BarChart3,
  Settings,
  Package,
  Map,
  ClipboardList,
  ShieldCheck,
  BadgePercent,
  Star,
  Bell,
  CreditCard,
  Dices,
  UsersRound,
  Megaphone,
} from "lucide-react";
import { ROUTE_PATH } from "./routePaths";

export const MENU_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: ROUTE_PATH.DASHBOARD, permission: null },

  { type: "header", key: "grp-sales", label: "Bán hàng & Vận hành" },
  { key: "orders", label: "Đơn hàng", icon: ShoppingBag, path: ROUTE_PATH.ORDERS, permission: ["manage_orders", "view_order", "create_order"] },
  { key: "menu", label: "Menu", icon: UtensilsCrossed, path: ROUTE_PATH.MENU, permission: "manage_products" },
  { key: "categories", label: "Danh mục", icon: Tags, path: ROUTE_PATH.CATEGORIES, permission: "manage_products" },
  { key: "zones", label: "Khu vực", icon: Map, path: ROUTE_PATH.ZONES, permission: "manage_store" },
  { key: "tables", label: "Bàn & QR", icon: QrCode, path: ROUTE_PATH.TABLES, permission: "manage_store" },
  { key: "payments", label: "Thanh toán", icon: CreditCard, path: ROUTE_PATH.PAYMENTS, permission: ["payment", "manage_orders"] },

  { type: "header", key: "grp-inventory", label: "Kho vận" },
  { key: "inventory", label: "Kho & Nguyên liệu", icon: Package, path: ROUTE_PATH.INVENTORY, permission: "manage_store" },

  { type: "header", key: "grp-crm", label: "CRM & Marketing" },
  { key: "customers", label: "Khách hàng", icon: Users, path: ROUTE_PATH.CUSTOMERS, permission: "manage_customers" },
  { key: "segments", label: "Nhóm khách hàng", icon: UsersRound, path: ROUTE_PATH.SEGMENTS, permission: "manage_customers" },
  { key: "campaigns", label: "Chiến dịch", icon: Megaphone, path: ROUTE_PATH.CAMPAIGNS, permission: "manage_promotions" },
  { key: "loyalty", label: "Loyalty & Events", icon: Gift, path: ROUTE_PATH.LOYALTY, permission: "manage_promotions" },
  { key: "promotions", label: "Khuyến mãi", icon: BadgePercent, path: ROUTE_PATH.PROMOTIONS, permission: "manage_promotions" },
  { key: "reviews", label: "Đánh giá", icon: Star, path: ROUTE_PATH.REVIEWS, permission: "manage_customers" },
  { key: "notifications", label: "Thông báo", icon: Bell, path: ROUTE_PATH.NOTIFICATIONS, permission: "manage_store" },
  { key: "lucky-wheel", label: "Vòng quay may mắn", icon: Dices, path: ROUTE_PATH.LUCKY_WHEEL, permission: "manage_promotions" },

  { type: "header", key: "grp-admin", label: "Quản trị" },
  { key: "staff", label: "Nhân viên", icon: UserCog, path: ROUTE_PATH.STAFF, permission: "manage_staff" },
  { key: "roles", label: "Vai trò & Quyền", icon: ShieldCheck, path: ROUTE_PATH.ROLES, permission: "manage_staff" },
  { key: "reports", label: "Báo cáo", icon: BarChart3, path: ROUTE_PATH.REPORTS, permission: "view_reports" },
  { key: "settings", label: "Cài đặt", icon: Settings, path: ROUTE_PATH.SETTINGS, permission: "manage_store" },
];

export const hasPermission = (permission, user) => {
  if (!permission) return true;
  if (!user) return true;

  const roleCode = (user.roleId?.code || user.role || "").toLowerCase();
  if (roleCode === "admin") return true;

  const userPerms = Array.isArray(user.roleId?.permissions)
    ? user.roleId.permissions
    : (Array.isArray(user.permissions) ? user.permissions : []);

  if (Array.isArray(permission)) {
    return permission.some((p) => userPerms.includes(p));
  }
  return userPerms.includes(permission);
};
