import { REVIEW_STATUS } from "./constants";

// Đánh giá (M15) — _id ObjectId; tham chiếu customer & orderId.
export const MOCK_REVIEWS = [
  {
    _id: "665f23000000000000d10001",
    customer: { _id: "665f1f0000000000000c0001", fullName: "Trần Thị Mai" },
    orderId: "665f21000000000000aa0106",
    rating: 2,
    comment: "Cà phê hôm nay loãng, phục vụ hơi chậm.",
    status: REVIEW_STATUS.OPEN,
    response: null,
    createdAt: "2026-06-12T09:05:00.000Z",
  },
  {
    _id: "665f23000000000000d10002",
    customer: { _id: "665f1f0000000000000c0002", fullName: "Nguyễn Văn Bình" },
    orderId: "665f21000000000000aa0103",
    rating: 5,
    comment: "Đồ uống ngon, nhân viên thân thiện. Sẽ quay lại!",
    status: REVIEW_STATUS.RESOLVED,
    response: "Cảm ơn anh đã ủng hộ quán ạ!",
    createdAt: "2026-06-11T16:20:00.000Z",
  },
  {
    _id: "665f23000000000000d10003",
    customer: { _id: "665f1f0000000000000c0001", fullName: "Trần Thị Mai" },
    orderId: "665f21000000000000aa0101",
    rating: 4,
    comment: "Ổn, nhưng chỗ ngồi hơi chật vào giờ cao điểm.",
    status: REVIEW_STATUS.IN_PROGRESS,
    response: null,
    createdAt: "2026-06-10T11:40:00.000Z",
  },
];
