import { ORDER_STATUS } from "@/constants/application";

export const STATS = [
  {
    key: "revenue",
    label: "Tổng doanh thu hôm nay",
    value: "12.450.000 ₫",
    trend: "+12.5%",
    trendDirection: "up",
    iconKey: "wallet",
  },
  {
    key: "orders",
    label: "Đơn hàng mới",
    value: "142",
    trend: "85 đơn",
    trendDirection: "up",
    iconKey: "bag",
  },
  {
    key: "members",
    label: "Khách thành viên",
    value: "1,284",
    trend: "+4",
    trendDirection: "up",
    iconKey: "users",
  },
  {
    key: "avg",
    label: "Trung bình đơn",
    value: "4,250",
    trend: "+2.1%",
    trendDirection: "up",
    iconKey: "star",
  },
];

export const REVENUE_THIS_WEEK = [
  { day: "T2", value: 6_500_000 },
  { day: "T3", value: 7_200_000 },
  { day: "T4", value: 8_400_000 },
  { day: "T5", value: 12_450_000 },
  { day: "T6", value: 9_100_000 },
  { day: "T7", value: 6_800_000 },
  { day: "CN", value: 7_900_000 },
];

export const REVENUE_LAST_WEEK = [
  { day: "T2", value: 5_900_000 },
  { day: "T3", value: 6_500_000 },
  { day: "T4", value: 7_800_000 },
  { day: "T5", value: 9_200_000 },
  { day: "T6", value: 8_100_000 },
  { day: "T7", value: 5_400_000 },
  { day: "CN", value: 6_900_000 },
];

export const TOP_PRODUCTS = [
  { name: "Cà phê muối", sold: 142 },
  { name: "Bạc xỉu Brew", sold: 118 },
  { name: "Trà đào cam sả", sold: 95 },
  { name: "Latte Hạnh nhân", sold: 82 },
  { name: "Croissant Trứng muối", sold: 64 },
];

export const RECENT_ORDERS = [
  {
    id: "#ORD-5821",
    table: "Bàn 04",
    total: 125_000,
    status: ORDER_STATUS.PENDING,
    timeAgo: "2 phút trước",
  },
  {
    id: "#ORD-5820",
    table: "Bàn 12",
    total: 85_000,
    status: ORDER_STATUS.CONFIRMED,
    timeAgo: "5 phút trước",
  },
  {
    id: "#ORD-5819",
    table: "Bàn 01",
    total: 240_000,
    status: ORDER_STATUS.PREPARING,
    timeAgo: "12 phút trước",
  },
  {
    id: "#ORD-5818",
    table: "Mang đi",
    total: 45_000,
    status: ORDER_STATUS.COMPLETED,
    timeAgo: "18 phút trước",
  },
  {
    id: "#ORD-5817",
    table: "Bàn 08",
    total: 310_000,
    status: ORDER_STATUS.CANCELLED,
    timeAgo: "25 phút trước",
  },
];
