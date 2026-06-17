import { CHANNEL, NOTI_STATUS } from "./constants";

// Lịch sử thông báo (M16) — _id ObjectId.
export const MOCK_NOTIFICATIONS = [
  {
    _id: "665f24000000000000e10001",
    title: "Ưu đãi hè cho khách Gold",
    channel: CHANNEL.PUSH,
    tier: "GOLD",
    body: "Tặng voucher WELCOME15 cho đơn tiếp theo của bạn!",
    targeted: 154,
    status: NOTI_STATUS.SENT,
    scheduleAt: null,
    createdAt: "2026-06-12T08:00:00.000Z",
  },
  {
    _id: "665f24000000000000e10002",
    title: "Nhắc khách lâu chưa ghé",
    channel: CHANNEL.EMAIL,
    tier: "ALL",
    body: "Lâu rồi không gặp! Ghé SipPoint nhận quà nhé.",
    targeted: 980,
    status: NOTI_STATUS.SCHEDULED,
    scheduleAt: "2026-06-20T09:00:00.000Z",
    createdAt: "2026-06-14T10:30:00.000Z",
  },
  {
    _id: "665f24000000000000e10003",
    title: "Thông báo bảo trì hệ thống",
    channel: CHANNEL.SMS,
    tier: "ALL",
    body: "Hệ thống bảo trì 23:00-23:30 hôm nay.",
    targeted: 0,
    status: NOTI_STATUS.DRAFT,
    scheduleAt: null,
    createdAt: "2026-06-15T14:00:00.000Z",
  },
];
