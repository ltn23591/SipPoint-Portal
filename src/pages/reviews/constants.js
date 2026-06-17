export const REVIEW_STATUS = {
  OPEN: "OPEN",
  IN_PROGRESS: "IN_PROGRESS",
  RESOLVED: "RESOLVED",
};

export const REVIEW_STATUS_LABEL = {
  [REVIEW_STATUS.OPEN]: "Chưa xử lý",
  [REVIEW_STATUS.IN_PROGRESS]: "Đang xử lý",
  [REVIEW_STATUS.RESOLVED]: "Đã xử lý",
};

export const REVIEW_STATUS_VARIANT = {
  [REVIEW_STATUS.OPEN]: "warning",
  [REVIEW_STATUS.IN_PROGRESS]: "info",
  [REVIEW_STATUS.RESOLVED]: "success",
};

export const REVIEW_STATUS_OPTIONS = Object.entries(REVIEW_STATUS_LABEL).map(
  ([value, label]) => ({ value, label })
);

export const RATING_OPTIONS = [5, 4, 3, 2, 1].map((v) => ({
  value: String(v),
  label: `${v} sao`,
}));

export const TEXT = {
  pageTitle: "Đánh giá & Phản hồi",
  pageDesc: "Theo dõi đánh giá khách hàng và phản hồi khiếu nại.",
  searchPlaceholder: "Tìm theo nội dung đánh giá...",
  colCustomer: "Khách hàng",
  colRating: "Điểm",
  colComment: "Nội dung",
  colStatus: "Trạng thái",
  colDate: "Thời gian",
  colActions: "Thao tác",
  viewDetail: "Xem & phản hồi",
  detailTitle: "Chi tiết đánh giá",
  back: "Quay lại",
  respondLabel: "Phản hồi",
  respondPlaceholder: "Nhập nội dung phản hồi cho khách...",
  statusLabel: "Trạng thái xử lý",
  save: "Lưu phản hồi",
  cancel: "Hủy",
};
