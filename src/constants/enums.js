export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PREPARING: "preparing",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

export const ORDER_STATUS_LABEL = {
  [ORDER_STATUS.PENDING]: "Chờ xác nhận",
  [ORDER_STATUS.CONFIRMED]: "Đã xác nhận",
  [ORDER_STATUS.PREPARING]: "Đang pha chế",
  [ORDER_STATUS.COMPLETED]: "Hoàn thành",
  [ORDER_STATUS.CANCELLED]: "Đã huỷ",
};

export const ORDER_STATUS_VARIANT = {
  [ORDER_STATUS.PENDING]: "warning",
  [ORDER_STATUS.CONFIRMED]: "info",
  [ORDER_STATUS.PREPARING]: "secondary",
  [ORDER_STATUS.COMPLETED]: "success",
  [ORDER_STATUS.CANCELLED]: "destructive",
};

export const ROLE = {
  ADMIN: "admin",
  MANAGER: "manager",
  STAFF: "staff",
  BARISTA: "barista",
  CASHIER: "cashier",
};

export const ROLE_LABEL = {
  [ROLE.ADMIN]: "Quản trị viên",
  [ROLE.MANAGER]: "Quản lý",
  [ROLE.STAFF]: "Nhân viên",
  [ROLE.BARISTA]: "Pha chế",
  [ROLE.CASHIER]: "Thu ngân",
};

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

export const TABLE_STATUS = {
  AVAILABLE: "available",
  OCCUPIED: "occupied",
  RESERVED: "reserved",
  CLEANING: "cleaning",
};
