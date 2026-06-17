export const CHANNEL = {
  PUSH: "PUSH",
  EMAIL: "EMAIL",
  SMS: "SMS",
};

export const CHANNEL_LABEL = {
  [CHANNEL.PUSH]: "Push",
  [CHANNEL.EMAIL]: "Email",
  [CHANNEL.SMS]: "SMS",
};

export const CHANNEL_OPTIONS = Object.entries(CHANNEL_LABEL).map(([value, label]) => ({
  value,
  label,
}));

export const NOTI_STATUS = {
  DRAFT: "DRAFT",
  SCHEDULED: "SCHEDULED",
  SENT: "SENT",
};

export const NOTI_STATUS_LABEL = {
  [NOTI_STATUS.DRAFT]: "Nháp",
  [NOTI_STATUS.SCHEDULED]: "Đã lên lịch",
  [NOTI_STATUS.SENT]: "Đã gửi",
};

export const NOTI_STATUS_VARIANT = {
  [NOTI_STATUS.DRAFT]: "secondary",
  [NOTI_STATUS.SCHEDULED]: "info",
  [NOTI_STATUS.SENT]: "success",
};

export const TIER_OPTIONS = [
  { value: "ALL", label: "Tất cả khách" },
  { value: "SILVER", label: "Hạng Silver" },
  { value: "GOLD", label: "Hạng Gold" },
  { value: "PLATINUM", label: "Hạng Platinum" },
];

export const TEXT = {
  pageTitle: "Trung tâm Thông báo",
  pageDesc: "Soạn và gửi thông báo Push / Email / SMS theo phân khúc khách.",
  addItem: "Soạn thông báo",
  searchPlaceholder: "Tìm theo tiêu đề...",
  colTitle: "Tiêu đề",
  colChannel: "Kênh",
  colSegment: "Phân khúc",
  colTargeted: "Số lượng",
  colStatus: "Trạng thái",
  colDate: "Thời gian",
  colActions: "Thao tác",
  viewDetail: "Xem chi tiết",
  detailTitle: "Chi tiết thông báo",
  createTitle: "Soạn thông báo",
  back: "Quay lại",
  save: "Gửi",
  cancel: "Hủy",
};
