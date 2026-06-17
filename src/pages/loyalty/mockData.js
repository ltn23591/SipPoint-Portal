// Loyalty (M6).
export const EARN_RATE = { amountPerPoint: 1000, points: 1 };

export const LOYALTY_TIERS = [
  { name: "SILVER", label: "Bạc", minPoints: 0, color: "text-slate-500" },
  { name: "GOLD", label: "Vàng", minPoints: 1000, color: "text-amber-500" },
  { name: "PLATINUM", label: "Bạch kim", minPoints: 5000, color: "text-sky-500" },
];

export const LOYALTY_EVENTS = [
  {
    _id: "665f27000000000000ev0001",
    name: "Happy Hour 14h-16h",
    type: "Tích điểm x2",
    period: "01/06 - 30/06/2026",
    status: "ACTIVE",
  },
  {
    _id: "665f27000000000000ev0002",
    name: "Sinh nhật khách hàng",
    type: "Tặng 500 điểm",
    period: "Cả năm",
    status: "ACTIVE",
  },
  {
    _id: "665f27000000000000ev0003",
    name: "Tết 2026",
    type: "Tích điểm x3",
    period: "Đã kết thúc",
    status: "ENDED",
  },
];
