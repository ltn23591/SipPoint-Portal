// Cài đặt hệ thống (M13) — GET /settings
export const SETTINGS = {
  store: {
    name: "SipPoint Coffee — CN Quận 1",
    address: "12 Nguyễn Huệ, Q.1, TP.HCM",
    taxCode: "0312345678",
    phone: "02838230001",
  },
  tax: { vatRate: 0.1, priceIncludesVat: true },
  currency: "VND",
  timezone: "Asia/Ho_Chi_Minh",
  operatingHours: {
    "mon-fri": { open: "07:00", close: "22:00" },
    "sat-sun": { open: "07:30", close: "23:00" },
  },
};
