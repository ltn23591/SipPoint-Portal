import { preProcessData, preProcessDataWithCustom, transferListTreeData } from "@/helpers/commonHelper";
import apiCall from "./config";
import { API_METHOD } from "@/constants/application";

const { VITE_APP_REPORT_API_URL } = import.meta.env;

export const AuthenticationApi = {
  login: (payload) => {
    const endpoint = `/api/v1/auth/login`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  logout: () => {
    const endpoint = `/api/v1/auth/logout`;
    return apiCall(API_METHOD.GET, endpoint);
  },
  getInfo: () => {
    const endpoint = `/api/v1/auth/me`;
    return apiCall(API_METHOD.GET, endpoint);
  },
  refreshToken: (payload) => {
    const endpoint = `/api/v1/auth/refresh-token`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  forgotPassword: (payload) => {
    const endpoint = `/api/v1/auth/forgot-password`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  changePassword: (payload) => {
    const endpoint = `/api/v1/auth/change-password`;
    return apiCall(API_METHOD.PUT, endpoint, payload);
  },
};

// Danh mục (REST đơn giản: /api/v1/categories) — KHÁC ProductCategoryApi (search/pagination).
export const CategoryApi = {
  getAll: () => {
    const endpoint = `/api/v1/categories`;
    return apiCall(API_METHOD.GET, endpoint);
  },
  getById: (id) => {
    const endpoint = `/api/v1/categories/${id}`;
    return apiCall(API_METHOD.GET, endpoint);
  },
  create: (payload) => {
    const endpoint = `/api/v1/categories`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  update: (id, payload) => {
    const endpoint = `/api/v1/categories/${id}`;
    return apiCall(API_METHOD.PUT, endpoint, payload);
  },
  delete: (id) => {
    const endpoint = `/api/v1/categories/${id}`;
    return apiCall(API_METHOD.DELETE, endpoint);
  },
};

export const ToppingApi = {
  getAll: () => {
    const endpoint = `/api/v1/toppings`;
    return apiCall(API_METHOD.GET, endpoint);
  },
  getById: (id) => {
    const endpoint = `/api/v1/toppings/${id}`;
    return apiCall(API_METHOD.GET, endpoint);
  },
  create: (payload) => {
    const endpoint = `/api/v1/toppings`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  update: (id, payload) => {
    const endpoint = `/api/v1/toppings/${id}`;
    return apiCall(API_METHOD.PUT, endpoint, payload);
  },
  delete: (id) => {
    const endpoint = `/api/v1/toppings/${id}`;
    return apiCall(API_METHOD.DELETE, endpoint);
  },
};

export const ProductCategoryApi = {
  getAll: () => {
    const endpoint = `/api/v1/product-category/all`;
    return apiCall(API_METHOD.GET, endpoint);
  },
  getAllActive: () => {
    const endpoint = `/api/v1/product-category/all-active`;
    return apiCall(API_METHOD.GET, endpoint);
  },
  create: (payload) => {
    const endpoint = `/api/v1/product-category/create`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  getDetailById: (categoryId) => {
    const endpoint = `/api/v1/product-category/details/${categoryId}`;
    return apiCall(API_METHOD.GET, endpoint);
  },
  update: (payload) => {
    const endpoint = `/api/v1/product-category/update`;
    return apiCall(API_METHOD.PUT, endpoint, payload);
  },
  search: (payload) => {
    const endpoint = `/api/v1/product-category/search`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  searchWithPagination: (payload, signal) => {
    const endpoint = `/api/v1/product-category/search`;
    return apiCall(API_METHOD.POST, endpoint, payload, null, null, { signal }).then((res) => {
      return preProcessDataWithCustom(res, payload?.pageSize, transferListTreeData);
    });
  },
  delete: (categoryId) => {
    const endpoint = `/api/v1/product-category/delete/${categoryId}`;
    return apiCall(API_METHOD.DELETE, endpoint);
  },
  updateActive: (payload) => {
    const endpoint = `/api/v1/product-category/update-active`;
    return apiCall(API_METHOD.PATCH, endpoint, payload);
  },
  importFile: (payload) => {
    const endpoint = `/api/v1/product-category/import`;
    return apiCall(API_METHOD.POST, endpoint, payload, {
      "Content-Type": "multipart/form-data",
    });
  },
  getTemplateImport: () => {
    const endpoint = `/api/v1/product-category/template/import`;
    return apiCall(API_METHOD.GET, endpoint, null, null, null, { responseType: "blob" });
  },
  export: (payload) => {
    const endpoint = `/api/v1/product-category/export`;
    return apiCall(API_METHOD.POST, endpoint, payload, null, null, { responseType: "blob" });
  },
};

export const ProductApi = {
  create: (payload) => {
    const endpoint = `/api/v1/products`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  getDetailById: (productId) => {
    const endpoint = `/api/v1/product/details/${productId}`;
    return apiCall(API_METHOD.GET, endpoint);
  },
  update: (payload) => {
    const endpoint = `/api/v1/products`;
    return apiCall(API_METHOD.PUT, endpoint, payload);
  },
  search: (payload) => {
    const endpoint = `/api/v1/products`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  searchWithPagination: (payload, signal) => {
    const endpoint = `/api/v1/products`;
    return apiCall(API_METHOD.POST, endpoint, payload, null, null, { signal }).then((res) => {
      return preProcessData(res, payload?.pageSize);
    });
  },
  delete: (productId) => {
    const endpoint = `/api/v1/products/delete/${productId}`;
    return apiCall(API_METHOD.DELETE, endpoint);
  },
  updateActive: (payload) => {
    const endpoint = `/api/v1/products/update-active`;
    return apiCall(API_METHOD.PATCH, endpoint, payload);
  },
  updateMany: (payload) => {
    const endpoint = `/api/v1/products/update-many`;
    return apiCall(API_METHOD.PUT, endpoint, payload);
  },
  importFile: (payload) => {
    const endpoint = `/api/v1/products/import`;
    return apiCall(API_METHOD.POST, endpoint, payload, {
      "Content-Type": "multipart/form-data",
    });
  },
  getTemplateImport: () => {
    const endpoint = `/api/v1/products/template/import`;
    return apiCall(API_METHOD.GET, endpoint, null, null, null, { responseType: "blob" });
  },
  export: (payload) => {
    const endpoint = `/api/v1/products/export`;
    return apiCall(API_METHOD.POST, endpoint, payload, null, null, { responseType: "blob" });
  },
};

// Sản phẩm / Thực đơn (REST số nhiều: /api/v1/products) — API MỚI theo backend thật.
// KHÁC ProductApi cũ (RPC scaffold /api/v1/product/*). Cùng tiền lệ CustomersApi vs CustomerApi.
// getAll nhận query: page, limit, keyword (tìm theo tên), category (ID danh mục).
export const ProductsApi = {
  getAll: (params, signal) => {
    const endpoint = `/api/v1/products`;
    return apiCall(API_METHOD.GET, endpoint, null, null, null, { params, signal });
  },
  getById: (id) => {
    const endpoint = `/api/v1/products/${id}`;
    return apiCall(API_METHOD.GET, endpoint);
  },
  create: (payload) => {
    const endpoint = `/api/v1/products`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  update: (id, payload) => {
    const endpoint = `/api/v1/products/${id}`;
    return apiCall(API_METHOD.PUT, endpoint, payload);
  },
  delete: (id) => {
    const endpoint = `/api/v1/products/${id}`;
    return apiCall(API_METHOD.DELETE, endpoint);
  },
  importFile: (payload) => {
    const endpoint = `/api/v1/products/import`;
    return apiCall(API_METHOD.POST, endpoint, payload, {
      "Content-Type": "multipart/form-data",
    });
  },
};

export const ProductPriceApi = {
  search: (payload) => {
    const endpoint = `/api/v1/product-price/search`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  searchWithPagination: (payload, signal) => {
    const endpoint = `/api/v1/product-price/search`;
    return apiCall(API_METHOD.POST, endpoint, payload, null, null, { signal }).then((res) => {
      return preProcessData(res, payload?.pageSize);
    });
  },
  createUpdate: (payload) => {
    const endpoint = `/api/v1/product-price/create-or-update`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  getDetailById: (productId) => {
    const endpoint = `/api/v1/product-price/details/${productId}`;
    return apiCall(API_METHOD.GET, endpoint);
  },
};

export const OrderApi = {
  search: (payload) => {
    const endpoint = `/api/v1/order/search`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  searchWithPagination: (payload, signal) => {
    const endpoint = `/api/v1/order/search`;
    return apiCall(API_METHOD.POST, endpoint, payload, null, null, { signal }).then((res) => {
      return preProcessData(res, payload?.pageSize);
    });
  },
  recent: () => {
    const endpoint = `/api/v1/order/recent`;
    return apiCall(API_METHOD.GET, endpoint);
  },
  create: (payload) => {
    const endpoint = `/api/v1/order/create`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  update: (payload) => {
    const endpoint = `/api/v1/order/update`;
    return apiCall(API_METHOD.PUT, endpoint, payload);
  },
  delete: (orderId) => {
    const endpoint = `/api/v1/order/delete/${orderId}`;
    return apiCall(API_METHOD.DELETE, endpoint);
  },
  getDetailById: (orderId) => {
    const endpoint = `/api/v1/order/details/${orderId}`;
    return apiCall(API_METHOD.GET, endpoint);
  },
  updateStatus: (payload) => {
    const endpoint = `/api/v1/order/update-status`;
    return apiCall(API_METHOD.PATCH, endpoint, payload);
  },
  cancel: (orderId) => {
    const endpoint = `/api/v1/order/cancel/${orderId}`;
    return apiCall(API_METHOD.PATCH, endpoint);
  },
  confirm: (orderId) => {
    const endpoint = `/api/v1/order/confirm/${orderId}`;
    return apiCall(API_METHOD.PATCH, endpoint);
  },
  complete: (orderId) => {
    const endpoint = `/api/v1/order/complete/${orderId}`;
    return apiCall(API_METHOD.PATCH, endpoint);
  },
  export: (payload) => {
    const endpoint = `/api/v1/order/export`;
    return apiCall(API_METHOD.POST, endpoint, payload, null, null, { responseType: "blob" });
  },
  searchAuditLog: (payload) => {
    const endpoint = `/api/v1/order/audit-log/search`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  searchAuditLogWithPagination: (payload, signal) => {
    const endpoint = `/api/v1/order/audit-log/search`;
    return apiCall(API_METHOD.POST, endpoint, payload, null, null, { signal }).then((res) => {
      return preProcessData(res, payload?.pageSize);
    });
  },
};

// Đơn hàng (REST số nhiều: /api/v1/orders) — API MỚI theo backend thật.
// KHÁC OrderApi cũ (RPC /api/v1/order/*, scaffold) — cùng tiền lệ CustomersApi vs CustomerApi.
// getAll nhận query: page, limit, status, tableId, customerId, startDate, endDate.
export const OrdersApi = {
  getAll: (params, signal) => {
    const endpoint = `/api/v1/orders`;
    return apiCall(API_METHOD.GET, endpoint, null, null, null, { params, signal });
  },
  getById: (id) => {
    const endpoint = `/api/v1/orders/${id}`;
    return apiCall(API_METHOD.GET, endpoint);
  },
  create: (payload) => {
    const endpoint = `/api/v1/orders`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  // Đổi trạng thái: payload = { status } (PENDING/CONFIRMED/PREPARING/READY/COMPLETED/CANCELLED).
  updateStatus: (id, payload) => {
    const endpoint = `/api/v1/orders/${id}/status`;
    return apiCall(API_METHOD.PATCH, endpoint, payload);
  },
  // Hoàn trả đơn đã COMPLETED (trừ lại điểm tích luỹ): payload = { reason }.
  refund: (id, payload) => {
    const endpoint = `/api/v1/orders/${id}/refund`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
};

export const TableApi = {
  getAll: () => {
    const endpoint = `/api/v1/table/all`;
    return apiCall(API_METHOD.GET, endpoint);
  },
  search: (payload) => {
    const endpoint = `/api/v1/table/search`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  searchWithPagination: (payload, signal) => {
    const endpoint = `/api/v1/table/search`;
    return apiCall(API_METHOD.POST, endpoint, payload, null, null, { signal }).then((res) => {
      return preProcessData(res, payload?.pageSize);
    });
  },
  create: (payload) => {
    const endpoint = `/api/v1/table/create`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  update: (payload) => {
    const endpoint = `/api/v1/table/update`;
    return apiCall(API_METHOD.PUT, endpoint, payload);
  },
  delete: (tableId) => {
    const endpoint = `/api/v1/table/delete/${tableId}`;
    return apiCall(API_METHOD.DELETE, endpoint);
  },
  getDetailById: (tableId) => {
    const endpoint = `/api/v1/table/details/${tableId}`;
    return apiCall(API_METHOD.GET, endpoint);
  },
  generateQR: (tableId) => {
    const endpoint = `/api/v1/table/qr-code/${tableId}`;
    return apiCall(API_METHOD.POST, endpoint);
  },
  exportQR: (tableId) => {
    const endpoint = `/api/v1/table/export/qr-code/${tableId}`;
    return apiCall(API_METHOD.GET, endpoint, null, null, null, { responseType: "blob" });
  },
  updateStatus: (payload) => {
    const endpoint = `/api/v1/table/update-status`;
    return apiCall(API_METHOD.PATCH, endpoint, payload);
  },
};

// Khu vực (REST số nhiều: /api/v1/zones) — 1 khu vực chứa nhiều bàn.
export const ZoneApi = {
  getAll: (params, signal) => {
    const endpoint = `/api/v1/zones`;
    return apiCall(API_METHOD.GET, endpoint, null, null, null, { params, signal });
  },
  getById: (id) => {
    const endpoint = `/api/v1/zones/${id}`;
    return apiCall(API_METHOD.GET, endpoint);
  },
  create: (payload) => {
    const endpoint = `/api/v1/zones`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  update: (id, payload) => {
    const endpoint = `/api/v1/zones/${id}`;
    return apiCall(API_METHOD.PUT, endpoint, payload);
  },
  delete: (id) => {
    const endpoint = `/api/v1/zones/${id}`;
    return apiCall(API_METHOD.DELETE, endpoint);
  },
};

// Bàn ăn (REST số nhiều: /api/v1/tables) — KHÁC TableApi cũ (RPC /api/v1/table/*).
// getAll hỗ trợ query: zoneId (lọc bàn theo khu vực).
export const TablesApi = {
  getAll: (params, signal) => {
    const endpoint = `/api/v1/tables`;
    return apiCall(API_METHOD.GET, endpoint, null, null, null, { params, signal });
  },
  getById: (id) => {
    const endpoint = `/api/v1/tables/${id}`;
    return apiCall(API_METHOD.GET, endpoint);
  },
  create: (payload) => {
    const endpoint = `/api/v1/tables`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  update: (id, payload) => {
    const endpoint = `/api/v1/tables/${id}`;
    return apiCall(API_METHOD.PUT, endpoint, payload);
  },
  delete: (id) => {
    const endpoint = `/api/v1/tables/${id}`;
    return apiCall(API_METHOD.DELETE, endpoint);
  },
  generateQR: (id) => {
    const endpoint = `/api/v1/tables/${id}/qrcode`;
    return apiCall(API_METHOD.POST, endpoint);
  },
};

export const CustomerApi = {
  search: (payload) => {
    const endpoint = `/api/v1/customer/search`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  searchWithPagination: (payload, signal) => {
    const endpoint = `/api/v1/customer/search`;
    return apiCall(API_METHOD.POST, endpoint, payload, null, null, { signal }).then((res) => {
      return preProcessData(res, payload?.pageSize);
    });
  },
  create: (payload) => {
    const endpoint = `/api/v1/customer/create`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  update: (payload) => {
    const endpoint = `/api/v1/customer/update`;
    return apiCall(API_METHOD.PUT, endpoint, payload);
  },
  delete: (customerId) => {
    const endpoint = `/api/v1/customer/delete/${customerId}`;
    return apiCall(API_METHOD.DELETE, endpoint);
  },
  getDetailById: (customerId) => {
    const endpoint = `/api/v1/customer/details/${customerId}`;
    return apiCall(API_METHOD.GET, endpoint);
  },
  updateActive: (payload) => {
    const endpoint = `/api/v1/customer/update-active`;
    return apiCall(API_METHOD.PATCH, endpoint, payload);
  },
  importFile: (payload) => {
    const endpoint = `/api/v1/customer/import`;
    return apiCall(API_METHOD.POST, endpoint, payload, {
      "Content-Type": "multipart/form-data",
    });
  },
  getTemplateImport: () => {
    const endpoint = `/api/v1/customer/template/import`;
    return apiCall(API_METHOD.GET, endpoint, null, null, null, { responseType: "blob" });
  },
  export: (payload) => {
    const endpoint = `/api/v1/customer/export`;
    return apiCall(API_METHOD.POST, endpoint, payload, null, null, { responseType: "blob" });
  },
};

export const CustomersApi = {
  getAll: (params, signal) => {
    const endpoint = `/api/v1/customers`;
    return apiCall(API_METHOD.GET, endpoint, null, null, null, { params, signal });
  },
  getById: (id) => {
    const endpoint = `/api/v1/customers/${id}`;
    return apiCall(API_METHOD.GET, endpoint);
  },
  create: (payload) => {
    const endpoint = `/api/v1/customers`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  update: (id, payload) => {
    const endpoint = `/api/v1/customers/${id}`;
    return apiCall(API_METHOD.PUT, endpoint, payload);
  },
  // Cộng / trừ điểm: pointsChange âm = trừ, dương = cộng.
  adjustPoints: (id, payload) => {
    const endpoint = `/api/v1/customers/${id}/points`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
};

export const MembershipTierApi = {
  getAllByProgramId: (programId) => {
    const endpoint = `/api/v1/membership-tier/all/${programId}`;
    return apiCall(API_METHOD.GET, endpoint);
  },
  getAllCurrent: () => {
    const endpoint = `/api/v1/membership-tier/all/current`;
    return apiCall(API_METHOD.GET, endpoint);
  },
  search: (payload) => {
    const endpoint = `/api/v1/membership-tier/search`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  searchWithPagination: (payload, signal) => {
    const endpoint = `/api/v1/membership-tier/search`;
    return apiCall(API_METHOD.POST, endpoint, payload, null, null, { signal }).then((res) => {
      return preProcessData(res, payload?.pageSize);
    });
  },
  create: (payload) => {
    const endpoint = `/api/v1/membership-tier/create`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  update: (payload) => {
    const endpoint = `/api/v1/membership-tier/update`;
    return apiCall(API_METHOD.PUT, endpoint, payload);
  },
  detail: (id) => {
    const endpoint = `/api/v1/membership-tier/detail/${id}`;
    return apiCall(API_METHOD.GET, endpoint);
  },
};

export const MembershipProgramApi = {
  detailCurrent: () => {
    const endpoint = `/api/v1/membership-program/details/current`;
    return apiCall(API_METHOD.GET, endpoint);
  },
  detailById: (id) => {
    const endpoint = `/api/v1/membership-program/details/${id}`;
    return apiCall(API_METHOD.GET, endpoint);
  },
  create: (payload) => {
    const endpoint = `/api/v1/membership-program/create`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  update: (payload) => {
    const endpoint = `/api/v1/membership-program/update`;
    return apiCall(API_METHOD.PUT, endpoint, payload);
  },
  search: (payload) => {
    const endpoint = `/api/v1/membership-program/search`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  searchWithPagination: (payload, signal) => {
    const endpoint = `/api/v1/membership-program/search`;
    return apiCall(API_METHOD.POST, endpoint, payload, null, null, { signal }).then((res) => {
      return preProcessData(res, payload?.pageSize);
    });
  },
  approve: (payload) => {
    const endpoint = `/api/v1/membership-program/approve`;
    return apiCall(API_METHOD.PATCH, endpoint, payload);
  },
};

export const StaffApi = {
  all: () => {
    const endpoint = `/api/v1/staff/all`;
    return apiCall(API_METHOD.GET, endpoint);
  },
  search: (payload) => {
    const endpoint = `/api/v1/staff/search`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  searchWithPagination: (payload, signal) => {
    const endpoint = `/api/v1/staff/search`;
    return apiCall(API_METHOD.POST, endpoint, payload, null, null, { signal }).then((res) => {
      return preProcessData(res, payload?.pageSize);
    });
  },
  create: (payload) => {
    const endpoint = `/api/v1/staff/create`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  update: (payload) => {
    const endpoint = `/api/v1/staff/update`;
    return apiCall(API_METHOD.PUT, endpoint, payload);
  },
  delete: (id) => {
    const endpoint = `/api/v1/staff/delete/${id}`;
    return apiCall(API_METHOD.DELETE, endpoint);
  },
  getDetailById: (id) => {
    const endpoint = `/api/v1/staff/details/${id}`;
    return apiCall(API_METHOD.GET, endpoint);
  },
  updateActive: (payload) => {
    const endpoint = `/api/v1/staff/update-active`;
    return apiCall(API_METHOD.PATCH, endpoint, payload);
  },
  getByRole: (payload, signal) => {
    const endpoint = `/api/v1/staff/get-by-role`;
    return apiCall(API_METHOD.POST, endpoint, payload, null, null, { signal });
  },
};

// Nhân viên (REST số nhiều: /api/v1/employees) — KHÁC StaffApi cũ (RPC /api/v1/staff/*).
// `role` là code vai trò (chuỗi thường: admin/cashier/barista); `roleId` được populate khi GET.
export const EmployeeApi = {
  getAll: (params, signal) => {
    const endpoint = `/api/v1/employees`;
    return apiCall(API_METHOD.GET, endpoint, null, null, null, { params, signal });
  },
  getById: (id) => {
    const endpoint = `/api/v1/employees/${id}`;
    return apiCall(API_METHOD.GET, endpoint);
  },
  create: (payload) => {
    const endpoint = `/api/v1/employees`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  update: (id, payload) => {
    const endpoint = `/api/v1/employees/${id}`;
    return apiCall(API_METHOD.PUT, endpoint, payload);
  },
  delete: (id) => {
    const endpoint = `/api/v1/employees/${id}`;
    return apiCall(API_METHOD.DELETE, endpoint);
  },
};

// Ca làm việc (/api/v1/shifts) — mở/đóng ca, tiền quỹ.
export const ShiftApi = {
  search: (params, signal) => {
    const endpoint = `/api/v1/shifts/search`;
    return apiCall(API_METHOD.GET, endpoint, null, null, null, { params, signal });
  },
  open: (payload) => {
    const endpoint = `/api/v1/shifts/open`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  detail: (id) => {
    const endpoint = `/api/v1/shifts/${id}/detail`;
    return apiCall(API_METHOD.GET, endpoint);
  },
  close: (id, payload) => {
    const endpoint = `/api/v1/shifts/${id}/close`;
    return apiCall(API_METHOD.PUT, endpoint, payload);
  },
};

export const StaffRoleApi = {
  all: () => {
    const endpoint = `/api/v1/staff/role/all`;
    return apiCall(API_METHOD.GET, endpoint);
  },
  create: (payload) => {
    const endpoint = `/api/v1/staff/role/create`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  update: (payload) => {
    const endpoint = `/api/v1/staff/role/update`;
    return apiCall(API_METHOD.PUT, endpoint, payload);
  },
};

export const StoreApi = {
  all: () => {
    const endpoint = `/api/v1/store/all`;
    return apiCall(API_METHOD.GET, endpoint);
  },
  search: (payload) => {
    const endpoint = `/api/v1/store/search`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  searchWithPagination: (payload, signal) => {
    const endpoint = `/api/v1/store/search`;
    return apiCall(API_METHOD.POST, endpoint, payload, null, null, { signal }).then((res) => {
      return preProcessData(res, payload?.pageSize);
    });
  },
  create: (payload) => {
    const endpoint = `/api/v1/store/create`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  update: (payload) => {
    const endpoint = `/api/v1/store/update`;
    return apiCall(API_METHOD.PUT, endpoint, payload);
  },
  delete: (id) => {
    const endpoint = `/api/v1/store/delete/${id}`;
    return apiCall(API_METHOD.DELETE, endpoint);
  },
  detail: (id) => {
    const endpoint = `/api/v1/store/details/${id}`;
    return apiCall(API_METHOD.GET, endpoint);
  },
};

// Khớp routes BE thực tế: GET /vouchers/search, POST /vouchers/create,
// GET /vouchers/:id/detail, PUT /vouchers/:id/update, DELETE /vouchers/:id/delete.
export const VoucherApi = {
  getAll: (signal) => {
    const endpoint = `/api/v1/vouchers/search`;
    return apiCall(API_METHOD.GET, endpoint, null, null, null, { signal });
  },
  detail: (id) => {
    const endpoint = `/api/v1/vouchers/${id}/detail`;
    return apiCall(API_METHOD.GET, endpoint);
  },
  create: (payload) => {
    const endpoint = `/api/v1/vouchers/create`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  update: (id, payload) => {
    const endpoint = `/api/v1/vouchers/${id}/update`;
    return apiCall(API_METHOD.PUT, endpoint, payload);
  },
  delete: (id) => {
    const endpoint = `/api/v1/vouchers/${id}/delete`;
    return apiCall(API_METHOD.DELETE, endpoint);
  },
  validate: (payload) => {
    const endpoint = `/api/v1/vouchers/validate`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
};

// Nhóm khách hàng mục tiêu (Segmentation) — /api/v1/customer-segments.
export const CustomerSegmentApi = {
  getAll: (params, signal) => {
    const endpoint = `/api/v1/customer-segments`;
    return apiCall(API_METHOD.GET, endpoint, null, null, null, { params, signal });
  },
  getById: (id) => {
    const endpoint = `/api/v1/customer-segments/${id}`;
    return apiCall(API_METHOD.GET, endpoint);
  },
  create: (payload) => {
    const endpoint = `/api/v1/customer-segments`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  update: (id, payload) => {
    const endpoint = `/api/v1/customer-segments/${id}`;
    return apiCall(API_METHOD.PUT, endpoint, payload);
  },
  delete: (id) => {
    const endpoint = `/api/v1/customer-segments/${id}`;
    return apiCall(API_METHOD.DELETE, endpoint);
  },
  // Đếm thử số khách thỏa bộ tiêu chí (không lưu): payload = { criteria }.
  preview: (payload) => {
    const endpoint = `/api/v1/customer-segments/preview`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  sync: (id) => {
    const endpoint = `/api/v1/customer-segments/${id}/sync`;
    return apiCall(API_METHOD.POST, endpoint);
  },
  getMembers: (id, params, signal) => {
    const endpoint = `/api/v1/customer-segments/${id}/members`;
    return apiCall(API_METHOD.GET, endpoint, null, null, null, { params, signal });
  },
};

// Chiến dịch khuyến mãi (phát voucher vào ví theo nhóm KH) — /api/v1/campaigns.
export const CampaignApi = {
  getAll: (params, signal) => {
    const endpoint = `/api/v1/campaigns`;
    return apiCall(API_METHOD.GET, endpoint, null, null, null, { params, signal });
  },
  getById: (id) => {
    const endpoint = `/api/v1/campaigns/${id}`;
    return apiCall(API_METHOD.GET, endpoint);
  },
  create: (payload) => {
    const endpoint = `/api/v1/campaigns`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  update: (id, payload) => {
    const endpoint = `/api/v1/campaigns/${id}`;
    return apiCall(API_METHOD.PUT, endpoint, payload);
  },
  delete: (id) => {
    const endpoint = `/api/v1/campaigns/${id}`;
    return apiCall(API_METHOD.DELETE, endpoint);
  },
  // Kích hoạt: phát voucher vào ví toàn bộ thành viên nhóm mục tiêu.
  activate: (id) => {
    const endpoint = `/api/v1/campaigns/${id}/activate`;
    return apiCall(API_METHOD.POST, endpoint);
  },
  // Huỷ chiến dịch đang chạy: thu hồi voucher chưa sử dụng.
  deactivate: (id) => {
    const endpoint = `/api/v1/campaigns/${id}/deactivate`;
    return apiCall(API_METHOD.POST, endpoint);
  },
};

export const PromotionProgramApi = {
  search: (payload) => {
    const endpoint = `/api/v1/promotion-program/search`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  searchWithPagination: (payload, signal) => {
    const endpoint = `/api/v1/promotion-program/search`;
    return apiCall(API_METHOD.POST, endpoint, payload, null, null, { signal }).then((res) => {
      return preProcessData(res, payload?.pageSize);
    });
  },
  detail: (id) => {
    const endpoint = `/api/v1/promotion-program/details/${id}`;
    return apiCall(API_METHOD.GET, endpoint);
  },
  create: (payload) => {
    const endpoint = `/api/v1/promotion-program/create`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  update: (payload) => {
    const endpoint = `/api/v1/promotion-program/update`;
    return apiCall(API_METHOD.PUT, endpoint, payload);
  },
  delete: (id) => {
    const endpoint = `/api/v1/promotion-program/delete/${id}`;
    return apiCall(API_METHOD.DELETE, endpoint);
  },
  updateActive: (payload) => {
    const endpoint = `/api/v1/promotion-program/update-active`;
    return apiCall(API_METHOD.PATCH, endpoint, payload);
  },
  approve: (payload) => {
    const endpoint = `/api/v1/promotion-program/approve`;
    return apiCall(API_METHOD.PATCH, endpoint, payload);
  },
};

export const NotificationApi = {
  search: (payload) => {
    const endpoint = `/api/v1/notification/search`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  searchWithPagination: (payload, signal) => {
    const endpoint = `/api/v1/notification/search`;
    return apiCall(API_METHOD.POST, endpoint, payload, null, null, { signal }).then((res) => {
      return preProcessData(res, payload?.pageSize);
    });
  },
  detail: (id) => {
    const endpoint = `/api/v1/notification/details/${id}`;
    return apiCall(API_METHOD.GET, endpoint);
  },
  create: (payload) => {
    const endpoint = `/api/v1/notification/create`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  update: (payload) => {
    const endpoint = `/api/v1/notification/update`;
    return apiCall(API_METHOD.PUT, endpoint, payload);
  },
  delete: (id) => {
    const endpoint = `/api/v1/notification/delete/${id}`;
    return apiCall(API_METHOD.DELETE, endpoint);
  },
  updateActive: (payload) => {
    const endpoint = `/api/v1/notification/update-status`;
    return apiCall(API_METHOD.PUT, endpoint, payload);
  },
};

export const FeedbackApi = {
  search: (payload) => {
    const endpoint = `/api/v1/feedback/search`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  searchWithPagination: (payload, signal) => {
    const endpoint = `/api/v1/feedback/search`;
    return apiCall(API_METHOD.POST, endpoint, payload, null, null, { signal }).then((res) => {
      return preProcessData(res, payload?.pageSize);
    });
  },
  detail: (id) => {
    const endpoint = `/api/v1/feedback/detail/${id}`;
    return apiCall(API_METHOD.GET, endpoint);
  },
  update: (payload) => {
    const endpoint = `/api/v1/feedback/update`;
    return apiCall(API_METHOD.PUT, endpoint, payload);
  },
  export: (payload) => {
    const endpoint = `/api/v1/feedback/export`;
    return apiCall(API_METHOD.POST, endpoint, payload, null, null, { responseType: "blob" });
  },
};

export const ActivityLogApi = {
  search: (payload) => {
    const endpoint = `/api/v1/activity-log/search`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  searchWithPagination: (payload, signal) => {
    const endpoint = `/api/v1/activity-log/search`;
    return apiCall(API_METHOD.POST, endpoint, payload, null, null, { signal }).then((res) => {
      return preProcessData(res, payload?.pageSize);
    });
  },
};

export const LocationApi = {
  filterProvince: (payload) => {
    const endpoint = `/api/v1/location/filter/province`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  filterDistrict: (payload) => {
    const endpoint = `/api/v1/location/filter/district`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  filterWard: (payload) => {
    const endpoint = `/api/v1/location/filter/ward`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
};

export const DocumentApi = {
  uploadFile: (payload) => {
    const endpoint = `/api/v1/document/upload-file`;
    return apiCall(API_METHOD.POST, endpoint, payload, {
      "Content-Type": "multipart/form-data",
    });
  },
  uploadMultipleFile: (payload) => {
    const endpoint = `/api/v1/document/upload-multiple-file`;
    return apiCall(API_METHOD.POST, endpoint, payload, {
      "Content-Type": "multipart/form-data",
    });
  },
  deleteFile: (payload) => {
    const endpoint = `/api/v1/document/delete-file`;
    return apiCall(API_METHOD.DELETE, endpoint, payload);
  },
};

// Upload ảnh lên Cloudinary — payload là FormData: file (bắt buộc), folder (tuỳ chọn).
export const UploadApi = {
  cloudinaryFile: (payload) => {
    const endpoint = `/api/v1/upload/cloudinary/file`;
    return apiCall(API_METHOD.POST, endpoint, payload, {
      "Content-Type": "multipart/form-data",
    });
  },
};

export const ReportApi = {
  dashboard: () => {
    const endpoint = `/api/v1/report/dashboard`;
    return apiCall(API_METHOD.GET, endpoint);
  },
  revenue: (params) => {
    const endpoint = `/api/v1/report/revenue`;
    return apiCall(API_METHOD.GET, endpoint, null, null, null, { params });
  },
  topProducts: (params) => {
    const endpoint = `/api/v1/report/top-products`;
    return apiCall(API_METHOD.GET, endpoint, null, null, null, { params });
  },
  exportRevenue: (payload) => {
    const endpoint = `/api/v1/report/export/revenue`;
    return apiCall(API_METHOD.POST, endpoint, payload, null, null, { responseType: "blob" });
  },
  exportOrders: (payload) => {
    const endpoint = `/api/v1/report/export/orders`;
    return apiCall(API_METHOD.POST, endpoint, payload, null, null, { responseType: "blob" });
  },
  exportCustomers: (payload) => {
    const endpoint = `/api/v1/report/export/customers`;
    return apiCall(API_METHOD.POST, endpoint, payload, null, null, {
      responseType: "blob",
      baseURL: VITE_APP_REPORT_API_URL || undefined,
    });
  },
};
