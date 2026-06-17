// Nguyên liệu (M11) — _id ObjectId. stock < minStock => cảnh báo tồn thấp.
export const MOCK_INGREDIENTS = [
  {
    _id: "665f1d000000000000000a01",
    name: "Cà phê hạt",
    unit: "g",
    stock: 12500,
    minStock: 2000,
    costPerUnit: 0.18,
  },
  {
    _id: "665f1d000000000000000a02",
    name: "Sữa đặc",
    unit: "ml",
    stock: 8400,
    minStock: 1500,
    costPerUnit: 0.05,
  },
  {
    _id: "665f1d000000000000000a03",
    name: "Ly nhựa size L",
    unit: "cái",
    stock: 320,
    minStock: 500,
    costPerUnit: 850,
  },
  {
    _id: "665f1d000000000000000a04",
    name: "Trà đào",
    unit: "g",
    stock: 4200,
    minStock: 1000,
    costPerUnit: 0.22,
  },
];
