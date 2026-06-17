import { TABLE_STATUS } from "@/constants/application";

// Bàn (M4) — _id ObjectId (trùng id fixtures để khớp đơn hàng khi cần).
export const MOCK_TABLES = [
  { _id: "665f1e00000000000000b001", name: "Bàn 01", area: "Tầng 1", capacity: 4, status: TABLE_STATUS.OCCUPIED },
  { _id: "665f1e00000000000000b002", name: "Bàn 02", area: "Tầng 1", capacity: 2, status: TABLE_STATUS.AVAILABLE },
  { _id: "665f1e00000000000000b003", name: "Bàn 03", area: "Tầng 1", capacity: 4, status: TABLE_STATUS.RESERVED },
  { _id: "665f1e00000000000000b004", name: "Bàn 04", area: "Tầng 1", capacity: 6, status: TABLE_STATUS.AVAILABLE },
  { _id: "665f1e00000000000000b005", name: "Bàn 05", area: "Tầng 2", capacity: 4, status: TABLE_STATUS.OCCUPIED },
  { _id: "665f1e00000000000000b006", name: "Bàn 06", area: "Tầng 2", capacity: 2, status: TABLE_STATUS.CLEANING },
  { _id: "665f1e00000000000000b008", name: "Bàn 08", area: "Tầng 2", capacity: 8, status: TABLE_STATUS.AVAILABLE },
  { _id: "665f1e00000000000000b012", name: "Bàn 12", area: "Sân vườn", capacity: 4, status: TABLE_STATUS.RESERVED },
];

export const TABLE_STATUS_VARIANT = {
  available: "success",
  occupied: "warning",
  reserved: "info",
  cleaning: "secondary",
};
