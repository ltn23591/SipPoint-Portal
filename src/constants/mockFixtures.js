// ─── Mock fixtures liên kết giữa các module (ObjectId 24-hex) ─────────────────
// Theo "Mock data liên kết" mục 4 của tài liệu Prompt CRUD.
// Mọi *Id là ObjectId; KHÔNG hiển thị Id cho người dùng — luôn resolve ra TÊN.
// Các fixtures này dùng tạm cho FK Combobox trước khi nối API thật
// (TableApi.getAll, CustomerApi.search, ProductApi.search, VoucherApi.search).

// --- M2 Danh mục ---
export const FX_CATEGORIES = [
  { _id: "665f1a0000000000000000c1", name: "Cà phê" },
  { _id: "665f1a0000000000000000c2", name: "Trà" },
  { _id: "665f1a0000000000000000c3", name: "Bánh" },
  { _id: "665f1a0000000000000000c4", name: "Khác" },
];

// --- M3 Menu (Sản phẩm + ProductVariant) -> categoryId trỏ M2 ---
export const FX_PRODUCTS = [
  {
    _id: "665f1b0000000000000000d1",
    name: "Cà phê sữa đá",
    categoryId: "665f1a0000000000000000c1",
    basePrice: 30000,
    variants: [
      { _id: "665f1c000000000000000e01", name: "Size M", priceDelta: 0, sku: "CPSD-M" },
      { _id: "665f1c000000000000000e02", name: "Size L", priceDelta: 5000, sku: "CPSD-L" },
    ],
  },
  {
    _id: "665f1b0000000000000000d2",
    name: "Trà đào cam sả",
    categoryId: "665f1a0000000000000000c2",
    basePrice: 35000,
    variants: [
      { _id: "665f1c000000000000000e03", name: "Mặc định", priceDelta: 0, sku: "TDCS" },
    ],
  },
  {
    _id: "665f1b0000000000000000d3",
    name: "Latte Hạnh nhân",
    categoryId: "665f1a0000000000000000c1",
    basePrice: 60000,
    variants: [
      { _id: "665f1c000000000000000e04", name: "Nóng", priceDelta: 0, sku: "LTHN-H" },
      { _id: "665f1c000000000000000e05", name: "Đá", priceDelta: 5000, sku: "LTHN-D" },
    ],
  },
  {
    _id: "665f1b0000000000000000d4",
    name: "Croissant Trứng muối",
    categoryId: "665f1a0000000000000000c3",
    basePrice: 45000,
    variants: [
      { _id: "665f1c000000000000000e06", name: "Mặc định", priceDelta: 0, sku: "CRTM" },
    ],
  },
  // Catalog POS — mỗi món 1 variant mặc định để click thêm nhanh
  {
    _id: "665f1b0000000000000000d5",
    name: "Cappuccino",
    categoryId: "665f1a0000000000000000c1",
    basePrice: 65000,
    variants: [{ _id: "665f1c000000000000000e07", name: "Mặc định", priceDelta: 0, sku: "CAPU" }],
  },
  {
    _id: "665f1b0000000000000000d6",
    name: "Espresso",
    categoryId: "665f1a0000000000000000c1",
    basePrice: 39000,
    variants: [{ _id: "665f1c000000000000000e08", name: "Mặc định", priceDelta: 0, sku: "ESPR" }],
  },
  {
    _id: "665f1b0000000000000000d7",
    name: "Black Coffee",
    categoryId: "665f1a0000000000000000c1",
    basePrice: 25000,
    variants: [{ _id: "665f1c000000000000000e09", name: "Mặc định", priceDelta: 0, sku: "BLCK" }],
  },
  {
    _id: "665f1b0000000000000000d8",
    name: "Cafe Latte",
    categoryId: "665f1a0000000000000000c1",
    basePrice: 65000,
    variants: [{ _id: "665f1c000000000000000e10", name: "Mặc định", priceDelta: 0, sku: "LATT" }],
  },
  {
    _id: "665f1b0000000000000000d9",
    name: "Flat White",
    categoryId: "665f1a0000000000000000c1",
    basePrice: 45000,
    variants: [{ _id: "665f1c000000000000000e11", name: "Mặc định", priceDelta: 0, sku: "FLWH" }],
  },
  {
    _id: "665f1b0000000000000000da",
    name: "Irish Coffee",
    categoryId: "665f1a0000000000000000c1",
    basePrice: 50000,
    variants: [{ _id: "665f1c000000000000000e12", name: "Mặc định", priceDelta: 0, sku: "IRSH" }],
  },
  {
    _id: "665f1b0000000000000000db",
    name: "Trà thạch đào",
    categoryId: "665f1a0000000000000000c2",
    basePrice: 49000,
    variants: [{ _id: "665f1c000000000000000e13", name: "Mặc định", priceDelta: 0, sku: "TTHD" }],
  },
  {
    _id: "665f1b0000000000000000dc",
    name: "Phô mai Caramel",
    categoryId: "665f1a0000000000000000c3",
    basePrice: 29000,
    variants: [{ _id: "665f1c000000000000000e14", name: "Mặc định", priceDelta: 0, sku: "PMCR" }],
  },
  {
    _id: "665f1b0000000000000000dd",
    name: "Mousse Cacao",
    categoryId: "665f1a0000000000000000c3",
    basePrice: 29000,
    variants: [{ _id: "665f1c000000000000000e15", name: "Mặc định", priceDelta: 0, sku: "MOCA" }],
  },
  {
    _id: "665f1b0000000000000000de",
    name: "Nước suối",
    categoryId: "665f1a0000000000000000c4",
    basePrice: 15000,
    variants: [{ _id: "665f1c000000000000000e16", name: "Mặc định", priceDelta: 0, sku: "WATR" }],
  },
];

// --- M4 Bàn ---
export const FX_TABLES = [
  { _id: "665f1e00000000000000b001", name: "Bàn 01" },
  { _id: "665f1e00000000000000b002", name: "Bàn 02" },
  { _id: "665f1e00000000000000b005", name: "Bàn 05" },
  { _id: "665f1e00000000000000b008", name: "Bàn 08" },
  { _id: "665f1e00000000000000b012", name: "Bàn 12" },
];

// --- M5 Khách hàng ---
export const FX_CUSTOMERS = [
  {
    _id: "665f1f0000000000000c0001",
    fullName: "Trần Thị Mai",
    phone: "0905123456",
    loyaltyTier: "GOLD",
    points: 1850,
  },
  {
    _id: "665f1f0000000000000c0002",
    fullName: "Nguyễn Văn Bình",
    phone: "0912345678",
    loyaltyTier: "SILVER",
    points: 420,
  },
];

// --- M14 Khuyến mãi/Voucher ("code" là string) ---
export const FX_PROMOTIONS = [
  {
    _id: "665f20000000000000af0001",
    code: "HE2024",
    name: "Giảm hè 20%",
    type: "PERCENT",
    value: 20,
    maxDiscount: 30000,
    minOrder: 50000,
  },
  {
    _id: "665f20000000000000af0002",
    code: "GIAM10K",
    name: "Giảm 10K",
    type: "FIXED",
    value: 10000,
    maxDiscount: 10000,
    minOrder: 30000,
  },
];

// ─── Helpers resolve TÊN từ ObjectId (ưu tiên BE populate; fallback lookup) ────
export const resolveTableName = (tableId) =>
  FX_TABLES.find((t) => t._id === tableId)?.name ?? "";

export const resolveCustomer = (customerId) =>
  FX_CUSTOMERS.find((c) => c._id === customerId) ?? null;

export const resolveProduct = (productId) =>
  FX_PRODUCTS.find((p) => p._id === productId) ?? null;

export const resolveVariant = (productId, variantId) =>
  resolveProduct(productId)?.variants.find((v) => v._id === variantId) ?? null;

export const variantUnitPrice = (productId, variantId) => {
  const product = resolveProduct(productId);
  if (!product) return 0;
  const variant = product.variants.find((v) => v._id === variantId);
  return product.basePrice + (variant?.priceDelta ?? 0);
};

// Mô phỏng POST /promotions/validate: trả { valid, discount, finalTotal, message }
export const validatePromotion = (code, subtotal) => {
  const promo = FX_PROMOTIONS.find(
    (p) => p.code.toUpperCase() === String(code).trim().toUpperCase()
  );
  if (!promo) {
    return { valid: false, discount: 0, finalTotal: subtotal, message: "Mã không tồn tại" };
  }
  if (subtotal < promo.minOrder) {
    return {
      valid: false,
      discount: 0,
      finalTotal: subtotal,
      message: `Đơn tối thiểu ${promo.minOrder.toLocaleString("vi-VN")}đ`,
    };
  }
  let discount =
    promo.type === "PERCENT" ? Math.round((subtotal * promo.value) / 100) : promo.value;
  if (promo.maxDiscount) discount = Math.min(discount, promo.maxDiscount);
  return {
    valid: true,
    promotionId: promo._id,
    discount,
    finalTotal: subtotal - discount,
    message: `Áp dụng ${promo.name}`,
  };
};
