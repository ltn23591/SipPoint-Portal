export const ROUTE_PATH = {
  ROOT: "/",
  LOGIN: "/login",
  DASHBOARD: "/dashboard",

  // M1 — Đơn hàng (list kanban + trang thao tác POS riêng)
  ORDERS: "/orders",
  ORDER_NEW: "/orders/new",
  ORDER_DETAIL: "/orders/:id",

  MENU: "/menu",
  MENU_DETAIL: "/menu/:id",

  TABLES: "/tables",

  CUSTOMERS: "/customers",

  LOYALTY: "/loyalty",

  STAFF: "/staff",

  REPORTS: "/reports",

  SETTINGS: "/settings",

  // M11 — Kho & Nguyên liệu
  INVENTORY: "/inventory",
  INVENTORY_DETAIL: "/inventory/:id",

  // M14 — Khuyến mãi / Voucher
  PROMOTIONS: "/promotions",
  PROMOTIONS_DETAIL: "/promotions/:id",

  // M15 — Đánh giá & Phản hồi
  REVIEWS: "/reviews",
  REVIEWS_DETAIL: "/reviews/:id",

  // M16 — Trung tâm Thông báo
  NOTIFICATIONS: "/notifications",
  NOTIFICATIONS_DETAIL: "/notifications/:id",

  // M9 — Thanh toán
  PAYMENTS: "/payments",

  // M10 — Vòng quay may mắn
  LUCKY_WHEEL: "/lucky-wheel",

  NOT_FOUND: "*",
};
