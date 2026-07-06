import { ORDER_TYPE } from "@/constants/application";

const firstOf = (...vals) => vals.find((v) => v !== undefined && v !== null && v !== "");

const nameFrom = (ref, keys) => {
  if (!ref || typeof ref !== "object") return null;
  for (const k of keys) {
    if (ref[k]) return ref[k];
  }
  return null;
};

const idFrom = (ref) => {
  if (!ref) return null;
  if (typeof ref === "string") return ref;
  return ref._id || ref.id || null;
};

export function normalizeOrder(raw) {
  if (!raw) return null;

  const tableRef = raw.table ?? raw.tableId;
  const customerRef = raw.customer ?? raw.customerId;
  const tableName = nameFrom(tableRef, ["name", "tableName", "code"]);
  const customerName = nameFrom(customerRef, ["fullName", "name"]);

  const items = Array.isArray(raw.items) ? raw.items : [];

  return {
    ...raw,
    _id: raw._id || raw.id,
    orderNumber: firstOf(raw.orderNumber, raw.code, raw.orderCode, raw.orderNo, raw._id),
    status: raw.status,
    type: firstOf(raw.type, tableName || idFrom(tableRef) ? ORDER_TYPE.DINE_IN : ORDER_TYPE.TAKEAWAY),
    tableId: idFrom(tableRef),
    tableName: tableName ?? (idFrom(tableRef) ? "—" : "Mang đi"),
    customerId: idFrom(customerRef),
    customerName: customerName ?? "Khách lẻ",
    items: items.map((it) => {
      const qty = Number(it.qty ?? it.quantity ?? 1);
      const unitPrice = Number(firstOf(it.unitPrice, it.price, 0));
      const variants = Array.isArray(it.variants) ? it.variants : [];
      const variantAdjust = variants.reduce(
        (sum, v) => sum + Number(v.priceAdjustment ?? v.price ?? 0),
        0
      );
      return {
        ...it,
        name: firstOf(it.name, nameFrom(it.product ?? it.productId, ["name"]), "Sản phẩm"),
        qty,
        unitPrice,
        variants,
        lineTotal: Number(firstOf(it.subtotal, it.total, (unitPrice + variantAdjust) * qty)),
        note: it.note ?? "",
      };
    }),
    subtotal: Number(firstOf(raw.subtotal, raw.subTotal, 0)),
    discount: Number(firstOf(raw.discount, raw.discountAmount, 0)),
    totalAmount: Number(firstOf(raw.totalAmount, raw.total, raw.grandTotal, raw.finalAmount, 0)),
    note: raw.note ?? "",
    promotionCode: raw.promotionCode ?? "",
    isUrgent: !!raw.isUrgent,
    isPickup: !!raw.isPickup,
    isPaid: firstOf(raw.isPaid, raw.paymentStatus === "PAID", false),
    createdAt: firstOf(raw.createdAt, raw.createdTime, raw.orderDate),
    completedAt: firstOf(raw.completedAt, raw.completedTime, null),
  };
}

export function parseOrderList(body) {
  const payload = body?.data ?? body;
  const rawList = Array.isArray(payload)
    ? payload
    : payload?.orders ?? payload?.items ?? payload?.data ?? [];
  const list = (Array.isArray(rawList) ? rawList : []).map(normalizeOrder);
  const pagination = payload?.pagination ?? body?.pagination ?? {};
  const total =
    pagination.total ??
    pagination.totalItems ??
    body?.total ??
    body?.totalCount ??
    body?.count ??
    list.length;
  return { list, total };
}

export function getDateRange(preset) {
  const now = new Date();
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  const endOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

  let start;
  let end = endOfDay(now);

  switch (preset) {
    case "yesterday": {
      const y = new Date(now);
      y.setDate(now.getDate() - 1);
      start = startOfDay(y);
      end = endOfDay(y);
      break;
    }
    case "week": {
      const w = new Date(now);
      w.setDate(now.getDate() - 6);
      start = startOfDay(w);
      break;
    }
    case "month": {
      start = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
      break;
    }
    case "today":
    default:
      start = startOfDay(now);
      break;
  }

  return { startDate: start.toISOString(), endDate: end.toISOString() };
}
