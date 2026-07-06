export const PROMO_TYPE = {
  PERCENT: "PERCENT",
  FIXED: "FIXED",
};

export const PROMO_TYPE_LABEL = {
  [PROMO_TYPE.PERCENT]: "Giảm theo %",
  [PROMO_TYPE.FIXED]: "Giảm số tiền",
};

export const PROMO_TYPE_OPTIONS = Object.entries(PROMO_TYPE_LABEL).map(
  ([value, label]) => ({ value, label })
);

export const PROMO_STATUS_VARIANT = {
  active: "success",
  inactive: "secondary",
  expired: "destructive",
};

export const PROMO_STATUS_LABEL = {
  active: "Đang chạy",
  inactive: "Tạm dừng",
  expired: "Hết hạn",
};

export const TEXT = {
  pageTitle: "Khuyến mãi / Voucher",
  pageDesc: "Quản lý mã giảm giá, điều kiện áp dụng và hạn dùng.",
  addItem: "Tạo khuyến mãi",
  searchPlaceholder: "Tìm theo mã hoặc tên...",
  colCode: "Mã",
  colName: "Tên chương trình",
  colType: "Loại",
  colValue: "Giá trị",
  colMinOrder: "Đơn tối thiểu",
  colStatus: "Trạng thái",
  colActions: "Thao tác",
  viewDetail: "Xem chi tiết",
  edit: "Chỉnh sửa",
  delete: "Xóa",
  confirmDeleteTitle: "Xác nhận xóa khuyến mãi",
  confirmDeleteDesc: (name) => `Bạn có chắc muốn xóa "${name}"? Hành động này không thể hoàn tác.`,
  confirmYes: "Xóa",
  confirmNo: "Hủy",
  detailTitle: "Chi tiết khuyến mãi",
  editTitle: "Chỉnh sửa khuyến mãi",
  createTitle: "Tạo khuyến mãi",
  back: "Quay lại",
  save: "Lưu thay đổi",
  cancel: "Hủy",
};
