import { PRODUCT_STATUS } from "@/constants/application";

export const MENU_CATEGORY = {
  COFFEE: "coffee",
  TEA: "tea",
  FOOD: "food",
  OTHER: "other",
};

export const MENU_CATEGORY_LABEL = {
  [MENU_CATEGORY.COFFEE]: "Cà phê",
  [MENU_CATEGORY.TEA]: "Trà",
  [MENU_CATEGORY.FOOD]: "Bánh & đồ ăn",
  [MENU_CATEGORY.OTHER]: "Khác",
};

export const MENU_CATEGORY_OPTIONS = Object.entries(MENU_CATEGORY_LABEL).map(
  ([value, label]) => ({ value, label })
);

export const CATEGORY_TABS = [
  { value: "all", label: "Tất cả" },
  ...MENU_CATEGORY_OPTIONS,
];

export const STATUS_CHANGE_CYCLES = {
  [PRODUCT_STATUS.ACTIVE]: PRODUCT_STATUS.INACTIVE,
  [PRODUCT_STATUS.INACTIVE]: PRODUCT_STATUS.ACTIVE,
  [PRODUCT_STATUS.OUT_OF_STOCK]: PRODUCT_STATUS.ACTIVE,
};

export const STATUS_CHANGE_LABEL = {
  [PRODUCT_STATUS.ACTIVE]: "Tạm ngưng bán",
  [PRODUCT_STATUS.INACTIVE]: "Mở bán lại",
  [PRODUCT_STATUS.OUT_OF_STOCK]: "Đánh dấu còn hàng",
};

export const TEXT = {
  pageTitle: "Thực đơn",
  pageDesc: "Quản lý danh sách món, giá và trạng thái.",
  addItem: "Thêm món",
  searchPlaceholder: "Tìm theo tên món...",
  colName: "Tên món",
  colCategory: "Danh mục",
  colPrice: "Giá bán",
  colStatus: "Trạng thái",
  colActions: "Thao tác",
  viewDetail: "Xem chi tiết",
  edit: "Chỉnh sửa",
  changeStatus: "Đổi trạng thái",
  confirmStatusTitle: "Xác nhận đổi trạng thái",
  confirmStatusDesc: (name, label) => `Xác nhận "${label}" cho món "${name}"?`,
  confirmYes: "Xác nhận",
  confirmNo: "Huỷ",
  detailTitle: "Chi tiết món",
  editTitle: "Chỉnh sửa món",
  fieldName: "Tên món",
  fieldCategory: "Danh mục",
  fieldPrice: "Giá bán (đ)",
  fieldDescription: "Mô tả",
  fieldStatus: "Trạng thái",
  back: "Quay lại",
  save: "Lưu thay đổi",
  cancel: "Huỷ",
};
