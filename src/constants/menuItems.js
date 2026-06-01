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
} from "lucide-react";
import { ROUTE_PATH } from "./routePaths";

export const MENU_ITEMS = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: ROUTE_PATH.DASHBOARD,
  },
  {
    key: "orders",
    label: "Đơn hàng",
    icon: ShoppingBag,
    path: ROUTE_PATH.ORDERS,
    children: [
      { key: "orders-all", label: "Tất cả đơn hàng", path: ROUTE_PATH.ORDERS },
      { key: "orders-pending", label: "Chờ xác nhận", path: ROUTE_PATH.ORDERS_PENDING },
      { key: "orders-completed", label: "Đã hoàn thành", path: ROUTE_PATH.ORDERS_COMPLETED },
      { key: "orders-cancelled", label: "Đã huỷ", path: ROUTE_PATH.ORDERS_CANCELLED },
    ],
  },
  {
    key: "menu",
    label: "Menu",
    icon: UtensilsCrossed,
    path: ROUTE_PATH.MENU,
    children: [
      { key: "menu-products", label: "Tất cả món", path: ROUTE_PATH.MENU },
      { key: "menu-categories", label: "Danh mục", path: ROUTE_PATH.MENU_CATEGORIES },
      { key: "menu-combo", label: "Combo", path: ROUTE_PATH.MENU_COMBO },
      { key: "menu-price", label: "Bảng giá", path: ROUTE_PATH.MENU_PRICE },
    ],
  },
  {
    key: "tables",
    label: "Bàn & QR",
    icon: QrCode,
    path: ROUTE_PATH.TABLES,
    children: [
      { key: "tables-list", label: "Danh sách bàn", path: ROUTE_PATH.TABLES },
      { key: "tables-qr", label: "Tạo QR code", path: ROUTE_PATH.TABLES_QR },
      { key: "tables-map", label: "Sơ đồ bàn", path: ROUTE_PATH.TABLES_MAP },
    ],
  },
  {
    key: "customers",
    label: "Khách hàng",
    icon: Users,
    path: ROUTE_PATH.CUSTOMERS,
    children: [
      { key: "customers-list", label: "Danh sách", path: ROUTE_PATH.CUSTOMERS },
      { key: "customers-segments", label: "Phân khúc", path: ROUTE_PATH.CUSTOMERS_SEGMENTS },
      { key: "customers-history", label: "Lịch sử mua", path: ROUTE_PATH.CUSTOMERS_HISTORY },
    ],
  },
  {
    key: "loyalty",
    label: "Loyalty & Events",
    icon: Gift,
    path: ROUTE_PATH.LOYALTY,
    children: [
      { key: "loyalty-program", label: "Chương trình tích điểm", path: ROUTE_PATH.LOYALTY },
      { key: "loyalty-tiers", label: "Hạng thành viên", path: ROUTE_PATH.LOYALTY_TIERS },
      { key: "loyalty-vouchers", label: "Voucher", path: ROUTE_PATH.LOYALTY_VOUCHERS },
      { key: "loyalty-events", label: "Sự kiện", path: ROUTE_PATH.LOYALTY_EVENTS },
    ],
  },
  {
    key: "staff",
    label: "Nhân viên",
    icon: UserCog,
    path: ROUTE_PATH.STAFF,
    children: [
      { key: "staff-list", label: "Danh sách nhân viên", path: ROUTE_PATH.STAFF },
      { key: "staff-roles", label: "Vai trò & quyền", path: ROUTE_PATH.STAFF_ROLES },
      { key: "staff-shifts", label: "Ca làm việc", path: ROUTE_PATH.STAFF_SHIFTS },
    ],
  },
  {
    key: "reports",
    label: "Báo cáo",
    icon: BarChart3,
    path: ROUTE_PATH.REPORTS,
    children: [
      { key: "reports-revenue", label: "Doanh thu", path: ROUTE_PATH.REPORTS },
      { key: "reports-products", label: "Sản phẩm bán chạy", path: ROUTE_PATH.REPORTS_PRODUCTS },
      { key: "reports-customers", label: "Khách hàng", path: ROUTE_PATH.REPORTS_CUSTOMERS },
    ],
  },
  {
    key: "settings",
    label: "Cài đặt",
    icon: Settings,
    path: ROUTE_PATH.SETTINGS,
    children: [
      { key: "settings-store", label: "Thông tin cửa hàng", path: ROUTE_PATH.SETTINGS },
      { key: "settings-payment", label: "Thanh toán", path: ROUTE_PATH.SETTINGS_PAYMENT },
      { key: "settings-print", label: "In ấn", path: ROUTE_PATH.SETTINGS_PRINT },
      { key: "settings-integration", label: "Tích hợp", path: ROUTE_PATH.SETTINGS_INTEGRATION },
    ],
  },
];
