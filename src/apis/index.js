import { preProcessData, preProcessDataWithCustom, transferListTreeData } from "@/helpers/commonHelper";
import apiCall from "./config";
import { API_METHOD } from "@/constants/application";

const { VITE_APP_REPORT_API_URL } = import.meta.env;

export const AuthenticationApi = {
  login: (payload) => {
    const endpoint = `/api/v1/authen/portal/login`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  logout: () => {
    const endpoint = `/api/v1/authen/portal/logout`;
    return apiCall(API_METHOD.POST, endpoint);
  },
  getInfo: () => {
    const endpoint = `/api/v1/authen/portal/me`;
    return apiCall(API_METHOD.GET, endpoint);
  },
  refreshToken: (payload) => {
    const endpoint = `/api/v1/authen/portal/refresh-token`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  forgotPassword: (payload) => {
    const endpoint = `/api/v1/authen/portal/forgot-password`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  changePassword: (payload) => {
    const endpoint = `/api/v1/authen/portal/change-password`;
    return apiCall(API_METHOD.PUT, endpoint, payload);
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
    const endpoint = `/api/v1/product/create`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  getDetailById: (productId) => {
    const endpoint = `/api/v1/product/details/${productId}`;
    return apiCall(API_METHOD.GET, endpoint);
  },
  update: (payload) => {
    const endpoint = `/api/v1/product/update`;
    return apiCall(API_METHOD.PUT, endpoint, payload);
  },
  search: (payload) => {
    const endpoint = `/api/v1/product/search`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  searchWithPagination: (payload, signal) => {
    const endpoint = `/api/v1/product/search`;
    return apiCall(API_METHOD.POST, endpoint, payload, null, null, { signal }).then((res) => {
      return preProcessData(res, payload?.pageSize);
    });
  },
  delete: (productId) => {
    const endpoint = `/api/v1/product/delete/${productId}`;
    return apiCall(API_METHOD.DELETE, endpoint);
  },
  updateActive: (payload) => {
    const endpoint = `/api/v1/product/update-active`;
    return apiCall(API_METHOD.PATCH, endpoint, payload);
  },
  updateMany: (payload) => {
    const endpoint = `/api/v1/product/update-many`;
    return apiCall(API_METHOD.PUT, endpoint, payload);
  },
  importFile: (payload) => {
    const endpoint = `/api/v1/product/import`;
    return apiCall(API_METHOD.POST, endpoint, payload, {
      "Content-Type": "multipart/form-data",
    });
  },
  getTemplateImport: () => {
    const endpoint = `/api/v1/product/template/import`;
    return apiCall(API_METHOD.GET, endpoint, null, null, null, { responseType: "blob" });
  },
  export: (payload) => {
    const endpoint = `/api/v1/product/export`;
    return apiCall(API_METHOD.POST, endpoint, payload, null, null, { responseType: "blob" });
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

export const VoucherApi = {
  create: (payload) => {
    const endpoint = `/api/v1/voucher/create`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  update: (payload) => {
    const endpoint = `/api/v1/voucher/update`;
    return apiCall(API_METHOD.PUT, endpoint, payload);
  },
  delete: (id) => {
    const endpoint = `/api/v1/voucher/delete/${id}`;
    return apiCall(API_METHOD.DELETE, endpoint);
  },
  detail: (id) => {
    const endpoint = `/api/v1/voucher/detail/${id}`;
    return apiCall(API_METHOD.GET, endpoint);
  },
  search: (payload) => {
    const endpoint = `/api/v1/voucher/search`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  searchWithPagination: (payload, signal) => {
    const endpoint = `/api/v1/voucher/search`;
    return apiCall(API_METHOD.POST, endpoint, payload, null, null, { signal }).then((res) => {
      return preProcessData(res, payload?.pageSize);
    });
  },
  updateActive: (payload) => {
    const endpoint = `/api/v1/voucher/update-active`;
    return apiCall(API_METHOD.PATCH, endpoint, payload);
  },
  importVoucherCode: (payload) => {
    const endpoint = `/api/v1/voucher/import-code`;
    return apiCall(API_METHOD.POST, endpoint, payload, {
      "Content-Type": "multipart/form-data",
    });
  },
  getTemplateImport: () => {
    const endpoint = `/api/v1/voucher/template/import`;
    return apiCall(API_METHOD.GET, endpoint, null, null, null, { responseType: "blob" });
  },
  export: (payload) => {
    const endpoint = `/api/v1/voucher/export`;
    return apiCall(API_METHOD.POST, endpoint, payload, null, null, { responseType: "blob" });
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
