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

// ─── Vòng quay may mắn (Module 5) ───────────────────────────────────────────
export const LUCKY_WHEEL_STATUS = {
  DRAFT: "DRAFT",
  ACTIVE: "ACTIVE",
  FINISHED: "FINISHED",
};

export const LUCKY_WHEEL_STATUS_LABEL = {
  [LUCKY_WHEEL_STATUS.DRAFT]: "Nháp",
  [LUCKY_WHEEL_STATUS.ACTIVE]: "Đang chạy",
  [LUCKY_WHEEL_STATUS.FINISHED]: "Đã kết thúc",
};

export const WHEEL_TARGET_TYPE = {
  ALL: "ALL",
  SEGMENT: "SEGMENT",
  TIER: "TIER",
};

export const WHEEL_TARGET_TYPE_LABEL = {
  [WHEEL_TARGET_TYPE.ALL]: "Tất cả khách hàng",
  [WHEEL_TARGET_TYPE.SEGMENT]: "Theo nhóm khách hàng",
  [WHEEL_TARGET_TYPE.TIER]: "Theo bậc hạng",
};

export const PRIZE_TYPE = {
  VOUCHER: "VOUCHER",
  POINTS: "POINTS",
  PHYSICAL: "PHYSICAL",
  NONE: "NONE",
};

export const PRIZE_TYPE_LABEL = {
  [PRIZE_TYPE.VOUCHER]: "Voucher",
  [PRIZE_TYPE.POINTS]: "Điểm thưởng",
  [PRIZE_TYPE.PHYSICAL]: "Quà hiện vật",
  [PRIZE_TYPE.NONE]: "Chúc may mắn",
};

// ─── Nhóm khách hàng (Module 3) ─────────────────────────────────────────────
export const GENDER = {
  MALE: "male",
  FEMALE: "female",
  OTHER: "other",
};

export const GENDER_LABEL = {
  [GENDER.MALE]: "Nam",
  [GENDER.FEMALE]: "Nữ",
  [GENDER.OTHER]: "Khác",
};

export const GENDER_OPTIONS = Object.entries(GENDER_LABEL).map(([value, label]) => ({
  value,
  label,
}));

export const SEGMENT_MODE = {
  AUTO: "AUTO",
  MANUAL: "MANUAL",
};

export const SEGMENT_OPERATOR_LABEL = {
  eq: "bằng",
  ne: "khác",
  gt: "lớn hơn",
  lt: "nhỏ hơn",
  between: "trong khoảng",
  in: "thuộc",
  notIn: "không thuộc",
};

// Danh mục điều kiện lọc (contract với backend customerSegment.service).
// valueType: enum | number | months | boolean | tier
export const SEGMENT_FIELDS = {
  gender: { label: "Giới tính", valueType: "enum", operators: ["eq", "ne"], options: GENDER_OPTIONS },
  age: { label: "Tuổi", valueType: "number", operators: ["eq", "gt", "lt", "between"] },
  birthdayMonth: { label: "Tháng sinh nhật", valueType: "months", operators: ["in", "notIn"] },
  points: { label: "Tổng điểm", valueType: "number", operators: ["eq", "gt", "lt", "between"] },
  hasEmail: { label: "Có email", valueType: "boolean", operators: ["eq"] },
  hasPhone: { label: "Có số điện thoại", valueType: "boolean", operators: ["eq"] },
  redeemCount: { label: "Số lần đổi quà", valueType: "number", operators: ["eq", "gt", "lt", "between"] },
  orderCount: { label: "Số lần order", valueType: "number", operators: ["eq", "gt", "lt", "between"] },
  tier: { label: "Hạng thành viên", valueType: "tier", operators: ["in", "notIn"] },
};

export const SEGMENT_FIELD_OPTIONS = Object.entries(SEGMENT_FIELDS).map(([value, cfg]) => ({
  value,
  label: cfg.label,
}));
