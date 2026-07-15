// ─── App ─────────────────────────────────────────────────────────────────────
export const APP_NAME = "SipPoint";
export const APP_TAGLINE = "Quản lý cửa hàng";

export const CODE_KEY = {
  BAD_REQUEST: 400,
  UNAUTHORIZED_STATUS: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  ERROR_NETWORK: "ERR_NETWORK",
  TIME_OUT: 408,
  NOT_INTERNET: "NOT_INTERNET",
  UNDEFINED: "UNDEFINED",
  UNKNOWN: "UNKNOWN",
  CANCEL: "ERR_CANCELED",
  REQUEST_ENTITY_TOO_LARGE: 413,
};

export const API_METHOD = {
  POST: "POST",
  GET: "GET",
  PUT: "PUT",
  DELETE: "DELETE",
  PATCH: "PATCH",
};

// ─── Storage ──────────────────────────────────────────────────────────────────
export const STORAGE_KEY = {
  ACCESS_TOKEN: "ACCESS_TOKEN",
  REFRESH_TOKEN: "REFRESH_TOKEN",
  USER_INFO: "USER_INFO",
  THEME: "THEME",
};

// ─── Date formats ─────────────────────────────────────────────────────────────
export const DATE_FORMAT = "DD/MM/YYYY";
export const DATE_TIME_FORMAT = "DD/MM/YYYY HH:mm";
export const ISO_DATE_FORMAT = "yyyy-MM-dd";
export const ISO_DATE_TIME_FORMAT = "yyyy-MM-dd HH:mm:ss";

// ─── Pagination ───────────────────────────────────────────────────────────────
export const PAGE_SIZE_DEFAULT = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// ─── Role ─────────────────────────────────────────────────────────────────────
export const ROLE = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  STAFF: "STAFF",
  BARISTA: "BARISTA",
  CASHIER: "CASHIER",
};

export const ROLE_LABEL = {
  [ROLE.ADMIN]: "Quản trị viên",
  [ROLE.MANAGER]: "Quản lý",
  [ROLE.STAFF]: "Nhân viên",
  [ROLE.BARISTA]: "Pha chế",
  [ROLE.CASHIER]: "Thu ngân",
};

export const ROLE_OPTIONS = Object.entries(ROLE_LABEL).map(([value, label]) => ({
  value,
  label,
}));

export const ACCOUNT_STATUS_LABEL = {
  active: "Đang hoạt động",
  inactive: "Ngưng hoạt động",
  locked: "Đã khoá",
  pending: "Chờ kích hoạt",
};

export const ACCOUNT_STATUS_VARIANT = {
  active: "success",
  inactive: "secondary",
  locked: "destructive",
  pending: "warning",
};

export const ACCOUNT_TYPE_LABEL = {
  employee: "Nhân viên",
  customer: "Khách hàng",
};

export const PERMISSION_LABEL = {
  manage_store: "Quản lý cửa hàng",
  manage_staff: "Quản lý nhân viên",
  manage_products: "Quản lý sản phẩm",
  view_reports: "Xem báo cáo",
  manage_orders: "Quản lý đơn hàng",
  manage_customers: "Quản lý khách hàng",
  manage_promotions: "Quản lý khuyến mãi",
  view_order: "Xem đơn hàng",
  create_order: "Tạo đơn hàng",
  payment: "Thanh toán",
  complete_drink: "Hoàn tất pha chế",
};

export const ORDER_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  PREPARING: "PREPARING",
  READY: "READY",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  REFUNDED: "REFUNDED",
};

export const ORDER_STATUS_LABEL = {
  [ORDER_STATUS.PENDING]: "Chờ xác nhận",
  [ORDER_STATUS.CONFIRMED]: "Đã xác nhận",
  [ORDER_STATUS.PREPARING]: "Đang pha chế",
  [ORDER_STATUS.READY]: "Sẵn sàng",
  [ORDER_STATUS.COMPLETED]: "Hoàn tất",
  [ORDER_STATUS.CANCELLED]: "Đã huỷ",
  [ORDER_STATUS.REFUNDED]: "Đã hoàn trả",
};

// Màu theo tài liệu: PENDING=amber, PREPARING=blue, READY=teal, COMPLETED=green, CANCELLED=red.
export const ORDER_STATUS_VARIANT = {
  [ORDER_STATUS.PENDING]: "warning",
  [ORDER_STATUS.CONFIRMED]: "info",
  [ORDER_STATUS.PREPARING]: "info",
  [ORDER_STATUS.READY]: "success",
  [ORDER_STATUS.COMPLETED]: "success",
  [ORDER_STATUS.CANCELLED]: "destructive",
  [ORDER_STATUS.REFUNDED]: "destructive",
};

export const CAMPAIGN_STATUS = {
  DRAFT: "DRAFT",
  ACTIVE: "ACTIVE",
  FINISHED: "FINISHED",
  CANCELLED: "CANCELLED",
};

export const CAMPAIGN_STATUS_LABEL = {
  [CAMPAIGN_STATUS.DRAFT]: "Nháp",
  [CAMPAIGN_STATUS.ACTIVE]: "Đang chạy",
  [CAMPAIGN_STATUS.FINISHED]: "Đã kết thúc",
  [CAMPAIGN_STATUS.CANCELLED]: "Đã huỷ",
};

export const ORDER_STATUS_OPTIONS = Object.entries(ORDER_STATUS_LABEL).map(
  ([value, label]) => ({ value, label })
);

export const ORDER_TYPE = {
  DINE_IN: "dine_in",
  TAKEAWAY: "takeaway",
  DELIVERY: "delivery",
};

export const ORDER_TYPE_LABEL = {
  [ORDER_TYPE.DINE_IN]: "Tại bàn",
  [ORDER_TYPE.TAKEAWAY]: "Mang đi",
  [ORDER_TYPE.DELIVERY]: "Giao hàng",
};

export const ORDER_TYPE_OPTIONS = Object.entries(ORDER_TYPE_LABEL).map(
  ([value, label]) => ({ value, label })
);

export const PRODUCT_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  OUT_OF_STOCK: "out_of_stock",
};

export const PRODUCT_STATUS_LABEL = {
  [PRODUCT_STATUS.ACTIVE]: "Đang bán",
  [PRODUCT_STATUS.INACTIVE]: "Tạm ngưng",
  [PRODUCT_STATUS.OUT_OF_STOCK]: "Hết hàng",
};

export const PRODUCT_STATUS_OPTIONS = Object.entries(PRODUCT_STATUS_LABEL).map(
  ([value, label]) => ({ value, label })
);

export const TABLE_STATUS = {
  AVAILABLE: "available",
  OCCUPIED: "occupied",
  RESERVED: "reserved",
  CLEANING: "cleaning",
};

export const TABLE_STATUS_LABEL = {
  [TABLE_STATUS.AVAILABLE]: "Trống",
  [TABLE_STATUS.OCCUPIED]: "Đang dùng",
  [TABLE_STATUS.RESERVED]: "Đã đặt trước",
  [TABLE_STATUS.CLEANING]: "Đang dọn",
};

export const TABLE_STATUS_OPTIONS = Object.entries(TABLE_STATUS_LABEL).map(
  ([value, label]) => ({ value, label })
);

export const ACTIVE_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
};

export const ACTIVE_STATUS_LABEL = {
  [ACTIVE_STATUS.ACTIVE]: "Đang hoạt động",
  [ACTIVE_STATUS.INACTIVE]: "Ngưng hoạt động",
};

export const ACTIVE_STATUS_OPTIONS = Object.entries(ACTIVE_STATUS_LABEL).map(
  ([value, label]) => ({ value, label })
);

export const SHIFT_STATUS = {
  OPEN: "OPEN",
  CLOSED: "CLOSED",
};

export const SHIFT_STATUS_LABEL = {
  [SHIFT_STATUS.OPEN]: "Đang mở",
  [SHIFT_STATUS.CLOSED]: "Đã đóng",
};
