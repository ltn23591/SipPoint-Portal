import { preProcessData } from "@/helpers/commonHelper";
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
  restore: (id) => {
    const endpoint = `/api/v1/products/${id}/restore`;
    return apiCall(API_METHOD.PATCH, endpoint);
  },
  importFile: (payload) => {
    const endpoint = `/api/v1/products/import`;
    return apiCall(API_METHOD.POST, endpoint, payload, {
      "Content-Type": "multipart/form-data",
    });
  },
};

// Nguyên liệu & Kho (REST số nhiều: /api/v1/materials).
// getAll nhận query: page, limit, keyword, status (in_stock/low/out_of_stock), isActive.
export const MaterialApi = {
  getAll: (params, signal) => {
    const endpoint = `/api/v1/materials`;
    return apiCall(API_METHOD.GET, endpoint, null, null, null, { params, signal });
  },
  getLowStock: (signal) => {
    const endpoint = `/api/v1/materials/low-stock`;
    return apiCall(API_METHOD.GET, endpoint, null, null, null, { signal });
  },
  getById: (id) => {
    const endpoint = `/api/v1/materials/${id}`;
    return apiCall(API_METHOD.GET, endpoint);
  },
  create: (payload) => {
    const endpoint = `/api/v1/materials`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  update: (id, payload) => {
    const endpoint = `/api/v1/materials/${id}`;
    return apiCall(API_METHOD.PUT, endpoint, payload);
  },
  delete: (id) => {
    const endpoint = `/api/v1/materials/${id}`;
    return apiCall(API_METHOD.DELETE, endpoint);
  },
  restore: (id) => {
    const endpoint = `/api/v1/materials/${id}/restore`;
    return apiCall(API_METHOD.PATCH, endpoint);
  },
  // Nhập kho: payload = { quantity (>0), cost?, note? }
  importStock: (id, payload) => {
    const endpoint = `/api/v1/materials/${id}/import`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  // Điều chỉnh tồn thủ công: payload = { quantityChange (khác 0, âm để giảm), note? }
  adjustStock: (id, payload) => {
    const endpoint = `/api/v1/materials/${id}/adjust`;
    return apiCall(API_METHOD.PATCH, endpoint, payload);
  },
  // Lịch sử biến động tồn kho (sổ cái): params = { type?, page, limit }
  getMovements: (id, params, signal) => {
    const endpoint = `/api/v1/materials/${id}/movements`;
    return apiCall(API_METHOD.GET, endpoint, null, null, null, { params, signal });
  },
};

// Công thức sản phẩm (định mức nguyên liệu) — /api/v1/recipes.
export const RecipeApi = {
  getByProduct: (productId) => {
    const endpoint = `/api/v1/recipes/product/${productId}`;
    return apiCall(API_METHOD.GET, endpoint);
  },
  // payload = { items: [{ materialId, quantity }] }
  upsert: (productId, payload) => {
    const endpoint = `/api/v1/recipes/product/${productId}`;
    return apiCall(API_METHOD.PUT, endpoint, payload);
  },
  remove: (productId) => {
    const endpoint = `/api/v1/recipes/product/${productId}`;
    return apiCall(API_METHOD.DELETE, endpoint);
  },
  // Khả năng phục vụ (max makeable) cho danh sách sản phẩm: productIds là mảng hoặc chuỗi phẩy.
  availability: (productIds, signal) => {
    const ids = Array.isArray(productIds) ? productIds.join(",") : productIds;
    const endpoint = `/api/v1/recipes/availability`;
    return apiCall(API_METHOD.GET, endpoint, null, null, null, {
      params: { productIds: ids },
      signal,
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
  // Đổi trạng thái: payload = { status, reason } (reason bắt buộc khi status = CANCELLED).
  updateStatus: (id, payload) => {
    const endpoint = `/api/v1/orders/${id}/status`;
    return apiCall(API_METHOD.PATCH, endpoint, payload);
  },
  // Hoàn trả đơn đã COMPLETED (trừ lại điểm tích luỹ): payload = { reason }.
  refund: (id, payload) => {
    const endpoint = `/api/v1/orders/${id}/refund`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  // Tổng quan thống kê tài chính & giao dịch tiền
  getPaymentSummary: (params, signal) => {
    const endpoint = `/api/v1/orders/payment-summary`;
    return apiCall(API_METHOD.GET, endpoint, null, null, null, { params, signal });
  },
};

// Trò chơi may mắn (REST số nhiều: /api/v1/games).
// Admin: CRUD + chuyển trạng thái (publish/pause/resume/cancel) + danh sách trúng thưởng + cấp lượt.
export const GameApi = {
  getAll: (params, signal) => {
    const endpoint = `/api/v1/games`;
    return apiCall(API_METHOD.GET, endpoint, null, null, null, { params, signal });
  },
  getById: (id) => {
    const endpoint = `/api/v1/games/${id}`;
    return apiCall(API_METHOD.GET, endpoint);
  },
  create: (payload) => {
    const endpoint = `/api/v1/games`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  update: (id, payload) => {
    const endpoint = `/api/v1/games/${id}`;
    return apiCall(API_METHOD.PUT, endpoint, payload);
  },
  delete: (id) => {
    const endpoint = `/api/v1/games/${id}`;
    return apiCall(API_METHOD.DELETE, endpoint);
  },
  publish: (id) => apiCall(API_METHOD.PATCH, `/api/v1/games/${id}/publish`),
  pause: (id) => apiCall(API_METHOD.PATCH, `/api/v1/games/${id}/pause`),
  resume: (id) => apiCall(API_METHOD.PATCH, `/api/v1/games/${id}/resume`),
  cancel: (id) => apiCall(API_METHOD.PATCH, `/api/v1/games/${id}/cancel`),
  // Danh sách trúng thưởng (gộp theo khách)
  getWinners: (id, params, signal) => {
    const endpoint = `/api/v1/games/${id}/winners`;
    return apiCall(API_METHOD.GET, endpoint, null, null, null, { params, signal });
  },
  // Chi tiết phần thưởng 1 khách đã trúng trong trò chơi
  getWinnerRewards: (id, customerId) => {
    const endpoint = `/api/v1/games/${id}/winners/${customerId}`;
    return apiCall(API_METHOD.GET, endpoint);
  },
  // Danh sách các lượt trúng của riêng 1 ô thưởng
  getRewardWinners: (id, rewardId, params, signal) => {
    const endpoint = `/api/v1/games/${id}/rewards/${rewardId}/winners`;
    return apiCall(API_METHOD.GET, endpoint, null, null, null, { params, signal });
  },
  // Cấp thêm lượt cho một khách: payload = { customerId, quantity }
  grantBonusTurns: (id, payload) => {
    const endpoint = `/api/v1/games/${id}/bonus-turn`;
    return apiCall(API_METHOD.POST, endpoint, payload);
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
  // Admin: toàn bộ ví voucher của khách hàng (lọc campaignId ở FE để lấy timeline chiến dịch).
  getVouchers: (id) => {
    const endpoint = `/api/v1/customers/${id}/vouchers`;
    return apiCall(API_METHOD.GET, endpoint);
  },
  // Admin: lịch sử điểm đầy đủ (phân trang) của khách hàng.
  getPointHistory: (id, params, signal) => {
    const endpoint = `/api/v1/customers/${id}/point-history`;
    return apiCall(API_METHOD.GET, endpoint, null, null, null, { params, signal });
  },
  // Admin: toàn bộ lịch sử giao dịch điểm toàn hệ thống.
  getAllPointHistories: (params, signal) => {
    const endpoint = `/api/v1/customers/point-history/all`;
    return apiCall(API_METHOD.GET, endpoint, null, null, null, { params, signal });
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
  getConfig: () => {
    const endpoint = `/api/v1/store/config`;
    return apiCall(API_METHOD.GET, endpoint);
  },
  updateConfig: (payload) => {
    const endpoint = `/api/v1/store/config`;
    return apiCall(API_METHOD.PUT, endpoint, payload);
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
  // Bật/tắt trạng thái hoạt động của nhóm
  toggleActive: (id) => {
    const endpoint = `/api/v1/customer-segments/${id}/toggle-active`;
    return apiCall(API_METHOD.PATCH, endpoint);
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
  // Báo cáo hiệu quả: đã phát / đã dùng / doanh thu quy đổi.
  getReport: (id, signal) => {
    const endpoint = `/api/v1/campaigns/${id}/report`;
    return apiCall(API_METHOD.GET, endpoint, null, null, null, { signal });
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
  // Tổng quan tồn kho (giá trị tồn, số nguyên liệu sắp/hết hàng, danh sách cần nhập).
  inventoryDashboard: () => {
    const endpoint = `/api/v1/report/inventory-dashboard`;
    return apiCall(API_METHOD.GET, endpoint);
  },
  // Báo cáo tiêu hao nguyên liệu (tổng hợp theo nguyên liệu): params = { startDate?, endDate? }
  materialConsumption: (params) => {
    const endpoint = `/api/v1/report/material-consumption`;
    return apiCall(API_METHOD.GET, endpoint, null, null, null, { params });
  },
  // Tiêu hao theo ngày (cho biểu đồ): params = { startDate?, endDate? }
  materialConsumptionSeries: (params) => {
    const endpoint = `/api/v1/report/material-consumption-series`;
    return apiCall(API_METHOD.GET, endpoint, null, null, null, { params });
  },
  exportMaterialConsumption: (params) => {
    const endpoint = `/api/v1/report/export/material-consumption`;
    return apiCall(API_METHOD.POST, endpoint, null, null, null, {
      responseType: "blob",
      params,
    });
  },
};

export const BannerApi = {
  getAll: () => {
    const endpoint = `/api/v1/banners`;
    return apiCall(API_METHOD.GET, endpoint);
  },
  create: (payload) => {
    const endpoint = `/api/v1/banners`;
    return apiCall(API_METHOD.POST, endpoint, payload);
  },
  update: (id, payload) => {
    const endpoint = `/api/v1/banners/${id}`;
    return apiCall(API_METHOD.PUT, endpoint, payload);
  },
  delete: (id) => {
    const endpoint = `/api/v1/banners/${id}`;
    return apiCall(API_METHOD.DELETE, endpoint);
  },
};

