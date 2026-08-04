// Đơn vị tính gợi ý (backend cho phép đơn vị tự do, đây chỉ là gợi ý nhanh).
export const UNIT_OPTIONS = [
  { value: "g", label: "gram (g)" },
  { value: "kg", label: "kilogram (kg)" },
  { value: "ml", label: "mililít (ml)" },
  { value: "l", label: "lít (l)" },
  { value: "pcs", label: "cái (pcs)" },
  { value: "pack", label: "gói (pack)" },
];

// Trạng thái tồn kho khớp enum backend MATERIAL_STOCK_STATUS.
export const MATERIAL_STATUS = {
  IN_STOCK: "in_stock",
  LOW: "low",
  OUT_OF_STOCK: "out_of_stock",
};

export const STATUS_META = {
  [MATERIAL_STATUS.IN_STOCK]: {
    label: "Đủ tồn",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  [MATERIAL_STATUS.LOW]: {
    label: "Sắp hết",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  [MATERIAL_STATUS.OUT_OF_STOCK]: {
    label: "Hết hàng",
    className: "bg-destructive/10 text-destructive",
  },
};

export const TEXT = {
  pageTitle: "Kho & Nguyên liệu",
  pageDesc: "Quản lý nguyên liệu, tồn kho và cảnh báo tồn thấp.",
  addItem: "Thêm nguyên liệu",
  searchPlaceholder: "Tìm theo tên nguyên liệu...",
  colName: "Nguyên liệu",
  colUnit: "Đơn vị",
  colStock: "Tồn kho",
  colReserved: "Đang giữ",
  colMinStock: "Tồn tối thiểu",
  colCost: "Giá vốn/đơn vị",
  colStatus: "Trạng thái",
  colActions: "Thao tác",
  viewDetail: "Xem chi tiết",
  edit: "Chỉnh sửa",
  delete: "Xóa",
  importStock: "Nhập kho",
  confirmDeleteTitle: "Xác nhận xóa nguyên liệu",
  confirmDeleteDesc: (name) => `Bạn có chắc muốn xóa "${name}"?`,
  confirmYes: "Xóa",
  confirmNo: "Hủy",
  allStatus: "Tất cả trạng thái",
  detailTitle: "Chi tiết nguyên liệu",
  editTitle: "Chỉnh sửa nguyên liệu",
  createTitle: "Thêm nguyên liệu",
  back: "Quay lại",
  save: "Lưu thay đổi",
  cancel: "Hủy",
  empty: "Chưa có nguyên liệu nào.",
  loadError: "Không tải được danh sách nguyên liệu.",
};
