import { ROLE } from "@/constants/application";

// Nhân viên (M7) — _id ObjectId.
export const MOCK_STAFF = [
  {
    _id: "665f1a2b3c4d5e6f7a8b0001",
    fullName: "Nguyễn Văn An",
    email: "an.nguyen@sippoint.vn",
    phone: "0901000001",
    role: ROLE.ADMIN,
    active: true,
  },
  {
    _id: "665f1a2b3c4d5e6f7a8b0002",
    fullName: "Trần Thị Bích",
    email: "bich.tran@sippoint.vn",
    phone: "0901000002",
    role: ROLE.MANAGER,
    active: true,
  },
  {
    _id: "665f1a2b3c4d5e6f7a8b0003",
    fullName: "Lê Hoàng Phúc",
    email: "phuc.le@sippoint.vn",
    phone: "0356789012",
    role: ROLE.STAFF,
    active: true,
  },
  {
    _id: "665f1a2b3c4d5e6f7a8b0004",
    fullName: "Phạm Minh Quân",
    email: "quan.pham@sippoint.vn",
    phone: "0901000004",
    role: ROLE.BARISTA,
    active: false,
  },
  {
    _id: "665f1a2b3c4d5e6f7a8b0005",
    fullName: "Võ Thị Hồng",
    email: "hong.vo@sippoint.vn",
    phone: "0901000005",
    role: ROLE.CASHIER,
    active: true,
  },
];

export const ROLE_VARIANT = {
  ADMIN: "destructive",
  MANAGER: "warning",
  STAFF: "secondary",
  BARISTA: "info",
  CASHIER: "info",
};
