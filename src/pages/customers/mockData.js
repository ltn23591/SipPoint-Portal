// Khách hàng (M5) — _id ObjectId (khớp fixtures khi cần).
export const MOCK_CUSTOMERS = [
  {
    _id: "665f1f0000000000000c0001",
    fullName: "Trần Thị Mai",
    phone: "0905123456",
    loyaltyTier: "GOLD",
    points: 1850,
    totalSpent: 4250000,
    orderCount: 38,
    isBlacklisted: false,
    joinedAt: "2023-11-02T10:00:00.000Z",
  },
  {
    _id: "665f1f0000000000000c0002",
    fullName: "Nguyễn Văn Bình",
    phone: "0912345678",
    loyaltyTier: "SILVER",
    points: 420,
    totalSpent: 980000,
    orderCount: 11,
    isBlacklisted: false,
    joinedAt: "2024-02-18T09:30:00.000Z",
  },
  {
    _id: "665f1f0000000000000c0003",
    fullName: "Lê Hoàng Phúc",
    phone: "0356789012",
    loyaltyTier: "PLATINUM",
    points: 6200,
    totalSpent: 12800000,
    orderCount: 96,
    isBlacklisted: false,
    joinedAt: "2023-06-10T14:00:00.000Z",
  },
  {
    _id: "665f1f0000000000000c0004",
    fullName: "Phạm Thu Hà",
    phone: "0978112233",
    loyaltyTier: "SILVER",
    points: 150,
    totalSpent: 320000,
    orderCount: 4,
    isBlacklisted: true,
    joinedAt: "2024-05-01T11:15:00.000Z",
  },
];

export const TIER_LABEL = {
  SILVER: "Bạc",
  GOLD: "Vàng",
  PLATINUM: "Bạch kim",
};

export const TIER_VARIANT = {
  SILVER: "secondary",
  GOLD: "warning",
  PLATINUM: "info",
};
