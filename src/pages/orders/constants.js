import { ORDER_STATUS, ORDER_TYPE } from "@/constants/application";

// ─── Kanban columns ───────────────────────────────────────────────────────────
export const KANBAN_COLUMNS = [
  { status: ORDER_STATUS.PENDING, dotClass: "bg-destructive" },
  { status: ORDER_STATUS.CONFIRMED, dotClass: "bg-amber-500" },
  { status: ORDER_STATUS.PREPARING, dotClass: "bg-orange-400" },
  { status: ORDER_STATUS.READY, dotClass: "bg-emerald-500" },
  { status: ORDER_STATUS.COMPLETED, dotClass: "bg-muted-foreground" },
  { status: ORDER_STATUS.CANCELLED, dotClass: "bg-destructive/40" },
];

// ─── Card action buttons ──────────────────────────────────────────────────────
export const CARD_ACTIONS = {
  [ORDER_STATUS.PENDING]: [
    {
      label: "Hủy",
      target: ORDER_STATUS.CANCELLED,
      variant: "outline",
      className: "",
    },
    {
      label: "Xác nhận",
      target: ORDER_STATUS.CONFIRMED,
      variant: "default",
      className: "",
    },
  ],
  [ORDER_STATUS.CONFIRMED]: [
    {
      label: "Pha chế",
      target: ORDER_STATUS.PREPARING,
      variant: "default",
      className: "",
    },
  ],
  [ORDER_STATUS.PREPARING]: [
    {
      label: "Sẵn sàng",
      target: ORDER_STATUS.READY,
      variant: "default",
      className: "bg-cyan-500 hover:bg-cyan-600 border-transparent text-white",
    },
  ],
  [ORDER_STATUS.READY]: [
    {
      label: "Hoàn tất",
      target: ORDER_STATUS.COMPLETED,
      variant: "default",
      className: "",
    },
  ],
  [ORDER_STATUS.COMPLETED]: [],
  [ORDER_STATUS.CANCELLED]: [],
};

// ─── Filter options ───────────────────────────────────────────────────────────
export const DATE_FILTER_OPTIONS = [
  { value: "today", label: "Hôm nay" },
  { value: "yesterday", label: "Hôm qua" },
  { value: "week", label: "7 ngày qua" },
  { value: "month", label: "Tháng này" },
];

export const TABLE_FILTER_OPTIONS = [
  { value: "all", label: "Tất cả bàn" },
  { value: "t-01", label: "Bàn 01" },
  { value: "t-02", label: "Bàn 02" },
  { value: "t-03", label: "Bàn 03" },
  { value: "t-04", label: "Bàn 04" },
  { value: "t-05", label: "Bàn 05" },
  { value: "t-07", label: "Bàn 07" },
  { value: "t-08", label: "Bàn 08" },
  { value: "t-12", label: "Bàn 12" },
  { value: "takeaway", label: "Mang đi" },
];

// ─── Order action sheet ───────────────────────────────────────────────────────
export const ACTION_MODES = [
  { key: "view", label: "Chi tiết" },
  { key: "edit", label: "Chỉnh sửa" },
];

// ─── UI labels / text ─────────────────────────────────────────────────────────
export const TEXT = {
  newOrder: "Đơn hàng mới",
  exportReport: "Xuất báo cáo",
  filterByDate: "Lọc theo ngày",
  filterByTable: "Lọc theo bàn",
  filterByStatus: "Lọc theo trạng thái",
  allStatuses: "Tất cả trạng thái",
  noOrders: "Không có đơn",
  viewDetail: "Xem chi tiết",
  edit: "Chỉnh sửa",
  cancelOrder: "Hủy đơn",
  confirmCancelTitle: "Xác nhận hủy đơn",
  confirmCancelDesc: (num) =>
    `Bạn có chắc muốn hủy đơn ${num}? Hành động này không thể hoàn tác.`,
  confirmNo: "Không",
  loadingText: "Đang tải...",
  noData: "Không có dữ liệu",
  saveChanges: "Lưu thay đổi",
  cancel: "Hủy",
  addItem: "Thêm món",
  total: "Tổng cộng",
  location: "Vị trí",
  orderType: "Loại đơn",
  status: "Trạng thái",
  note: "Ghi chú",
  itemList: "Danh sách món",
  paid: "Đã thanh toán",
  completedAt: "Hoàn thành lúc",
  cancelled: "Đã hủy",
};

// ─── Order type badge ─────────────────────────────────────────────────────────
export const ORDER_TYPE_BADGE = {
  [ORDER_TYPE.TAKEAWAY]: {
    label: "Mang đi",
    className: "bg-blue-500 text-white",
  },
  [ORDER_TYPE.DELIVERY]: {
    label: "Giao hàng",
    className: "bg-purple-500 text-white",
  },
};
