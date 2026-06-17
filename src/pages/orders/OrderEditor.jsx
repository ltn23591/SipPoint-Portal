import { useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import {
  ArrowLeft,
  Search,
  Plus,
  Minus,
  Trash2,
  Coffee,
  Gift,
  Pencil,
  Armchair,
  User,
  StickyNote,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/common/Combobox";
import { NoteModal } from "./components/NoteModal";
import { cn } from "@/lib/utils";
import { formatVND } from "@/helpers/format";
import { ROUTE_PATH } from "@/constants/routePaths";
import { useOrdersStore } from "@/stores/ordersStore";
import { ORDER_STATUS, ORDER_TYPE } from "@/constants/application";
import {
  FX_CATEGORIES,
  FX_PRODUCTS,
  FX_TABLES,
  FX_CUSTOMERS,
  resolveTableName,
  resolveCustomer,
  validatePromotion,
} from "@/constants/mockFixtures";

const CATEGORY_TABS = [
  { value: "all", label: "Tất cả" },
  ...FX_CATEGORIES.map((c) => ({ value: c._id, label: c.name })),
];
const TABLE_OPTIONS = FX_TABLES.map((t) => ({ value: t._id, label: t.name }));
const CUSTOMER_OPTIONS = FX_CUSTOMERS.map((c) => ({
  value: c._id,
  label: `${c.fullName} - ${c.loyaltyTier}`,
  keywords: c.phone,
}));

const itemName = (product, variant) =>
  variant && variant.name && variant.name !== "Mặc định"
    ? `${product.name} - ${variant.name}`
    : product.name;

export default function OrderEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isCreate = !id || id === "new";

  const orders = useOrdersStore((s) => s.orders);
  const addOrder = useOrdersStore((s) => s.addOrder);
  const updateOrder = useOrdersStore((s) => s.updateOrder);

  const existing = isCreate ? null : orders.find((o) => o._id === id);
  const [mode, setMode] = useState(
    isCreate ? "create" : location.state?.mode ?? "view"
  );
  const readOnly = mode === "view";

  // ── State phiếu order ──
  const [items, setItems] = useState(
    existing?.items?.map((it) => ({ ...it })) ?? []
  );
  const [tableId, setTableId] = useState(existing?.tableId ?? "");
  const [customerId, setCustomerId] = useState(existing?.customerId ?? "");
  const [note, setNote] = useState(existing?.note ?? "");
  const [promo, setPromo] = useState({
    code: existing?.promotionCode ?? "",
    promotionId: existing?.promotionId ?? null,
    discount: existing?.discount ?? 0,
    valid: !!existing?.promotionId,
    message: "",
  });

  // ── Catalog + modal ghi chú ──
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [noteModal, setNoteModal] = useState({ open: false, idx: -1 });

  const catalog = useMemo(() => {
    const q = search.trim().toLowerCase();
    return FX_PRODUCTS.filter((p) => {
      if (tab !== "all" && p.categoryId !== tab) return false;
      if (q && !p.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [tab, search]);

  const subtotal = items.reduce((s, it) => s + it.unitPrice * it.qty, 0);
  const discount = promo.valid ? promo.discount : 0;
  const total = Math.max(0, subtotal - discount);

  if (!isCreate && !existing) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p>Không tìm thấy đơn hàng này.</p>
        <Button variant="link" onClick={() => navigate(ROUTE_PATH.ORDERS)}>
          Quay lại
        </Button>
      </div>
    );
  }

  const addProduct = (product) => {
    if (readOnly) return;
    const variant = product.variants[0];
    const unitPrice = product.basePrice + (variant?.priceDelta ?? 0);
    setItems((prev) => {
      const idx = prev.findIndex(
        (it) => it.productId === product._id && it.variantId === variant?._id
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
        return next;
      }
      return [
        ...prev,
        {
          productId: product._id,
          variantId: variant?._id ?? "",
          name: itemName(product, variant),
          qty: 1,
          unitPrice,
        },
      ];
    });
  };

  const changeQty = (idx, delta) =>
    setItems((prev) => {
      const next = [...prev];
      const qty = next[idx].qty + delta;
      if (qty <= 0) return next.filter((_, i) => i !== idx);
      next[idx] = { ...next[idx], qty };
      return next;
    });

  const removeItem = (idx) =>
    setItems((prev) => prev.filter((_, i) => i !== idx));

  const setItemNote = (idx, note) =>
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, note } : it)));

  const applyPromo = () => {
    if (!promo.code.trim()) {
      setPromo((p) => ({ ...p, valid: false, discount: 0, message: "" }));
      return;
    }
    const r = validatePromotion(promo.code, subtotal);
    setPromo((p) => ({
      ...p,
      valid: r.valid,
      discount: r.discount,
      promotionId: r.promotionId ?? null,
      message: r.message,
    }));
  };

  const handleSave = () => {
    if (!items.length) {
      toast.error("Đơn hàng cần ít nhất 1 món");
      return;
    }
    const customer = resolveCustomer(customerId);
    const base = {
      tableId: tableId || null,
      tableName: tableId ? resolveTableName(tableId) : "Mang đi",
      customerId: customerId || null,
      customerName: customer ? customer.fullName : "Khách lẻ",
      promotionId: promo.valid ? promo.promotionId : null,
      promotionCode: promo.valid ? promo.code : "",
      note,
      items,
      subtotal,
      discount,
      total,
      totalAmount: total,
    };

    if (isCreate) {
      const seq = String(Math.floor(Math.random() * 900) + 100);
      addOrder({
        _id: `local-${Date.now()}`,
        code: `DH-${seq}`,
        orderNumber: `DH-${seq}`,
        status: ORDER_STATUS.PENDING,
        type: tableId ? ORDER_TYPE.DINE_IN : ORDER_TYPE.TAKEAWAY,
        isUrgent: false,
        isPickup: false,
        isPaid: false,
        createdAt: new Date().toISOString(),
        completedAt: null,
        ...base,
      });
      toast.success("Tạo đơn thành công");
    } else {
      updateOrder({ ...existing, ...base });
      toast.success("Cập nhật đơn thành công");
    }
    navigate(ROUTE_PATH.ORDERS);
  };

  const headerTitle = isCreate
    ? "Tạo đơn mới"
    : mode === "edit"
    ? `Sửa đơn ${existing.code}`
    : `Đơn ${existing.code}`;

  return (
    <div className="flex h-full gap-4">
      {/* ── Catalog (trái) ── */}
      <div className="flex flex-1 flex-col gap-3 overflow-hidden">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon-sm" onClick={() => navigate(ROUTE_PATH.ORDERS)}>
            <ArrowLeft className="size-4" />
          </Button>
          <h1 className="text-lg font-bold text-secondary">{headerTitle}</h1>
        </div>

        {/* Tabs danh mục */}
        <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1">
          {CATEGORY_TABS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTab(t.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                tab === t.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Nhập mã/Tên món cần tìm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Grid sản phẩm */}
        <div className="grid flex-1 auto-rows-min grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3 lg:grid-cols-4">
          {catalog.map((p) => (
            <button
              key={p._id}
              type="button"
              disabled={readOnly}
              onClick={() => addProduct(p)}
              className={cn(
                "group flex flex-col overflow-hidden rounded-xl border border-border bg-card text-left shadow-sm transition-all",
                !readOnly && "hover:border-primary hover:shadow-md",
                readOnly && "cursor-default opacity-90"
              )}
            >
              <div className="flex h-24 items-center justify-center bg-muted text-muted-foreground">
                <Coffee className="size-8 opacity-40" />
              </div>
              <div className="space-y-0.5 p-2">
                <p className="line-clamp-1 text-sm font-medium text-foreground">{p.name}</p>
                <p className="text-sm font-semibold text-primary">{formatVND(p.basePrice)}</p>
              </div>
            </button>
          ))}
          {catalog.length === 0 && (
            <p className="col-span-full py-10 text-center text-sm text-muted-foreground">
              Không tìm thấy món phù hợp
            </p>
          )}
        </div>
      </div>

      {/* ── Phiếu order (phải) ── */}
      <div className="flex w-[400px] shrink-0 flex-col rounded-xl border border-border bg-card shadow-sm">
        {/* Header phiếu */}
        <div className="space-y-3 border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Armchair className="size-4 text-primary" />
              {readOnly
                ? tableId
                  ? resolveTableName(tableId)
                  : "Mang đi"
                : null}
            </div>
            {readOnly && mode === "view" && (
              <Button variant="outline" size="sm" onClick={() => setMode("edit")}>
                <Pencil className="mr-1.5 size-3.5" />
                Chỉnh sửa
              </Button>
            )}
          </div>

          {!readOnly && (
            <div className="grid grid-cols-1 gap-2">
              <Combobox
                value={tableId}
                onChange={setTableId}
                options={TABLE_OPTIONS}
                placeholder="Chọn bàn (trống = Mang đi)"
                searchPlaceholder="Tìm bàn..."
                allowClear
              />
              <Combobox
                value={customerId}
                onChange={setCustomerId}
                options={CUSTOMER_OPTIONS}
                placeholder="Khách lẻ"
                searchPlaceholder="Tìm theo tên / SĐT..."
                allowClear
              />
            </div>
          )}

          {readOnly && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="size-4" />
              {customerId ? resolveCustomer(customerId)?.fullName : "Khách lẻ"}
            </div>
          )}
        </div>

        {/* Cột tiêu đề */}
        <div className="flex items-center justify-between border-b border-border px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <span>Tên món</span>
          <div className="flex items-center gap-6">
            <span>Số lượng</span>
            <span>Thành tiền</span>
          </div>
        </div>

        {/* Danh sách món */}
        <div className="flex-1 divide-y divide-border overflow-y-auto">
          {items.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Chưa có món nào. {readOnly ? "" : "Chọn món bên trái để thêm."}
            </p>
          ) : (
            items.map((it, idx) => (
              <div key={`${it.productId}-${it.variantId}-${idx}`} className="px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="flex-1 text-sm font-medium text-foreground">{it.name}</span>
                  {readOnly ? (
                    <span className="w-16 text-center text-sm">{it.qty}</span>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon-sm"
                        className="size-6"
                        onClick={() => changeQty(idx, -1)}
                      >
                        <Minus className="size-3" />
                      </Button>
                      <span className="w-6 text-center text-sm font-medium">{it.qty}</span>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        className="size-6"
                        onClick={() => changeQty(idx, 1)}
                      >
                        <Plus className="size-3" />
                      </Button>
                    </div>
                  )}
                  <span className="w-24 text-right text-sm font-semibold tabular-nums">
                    {formatVND(it.unitPrice * it.qty)}
                  </span>
                  {!readOnly && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="size-6 text-destructive hover:bg-destructive/10"
                      onClick={() => removeItem(idx)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </div>

                {/* Ghi chú theo món */}
                <div className="mt-1">
                  {it.note ? (
                    readOnly ? (
                      <p className="flex items-start gap-1 text-xs italic text-muted-foreground">
                        <StickyNote className="mt-0.5 size-3 shrink-0" />
                        {it.note}
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setNoteModal({ open: true, idx })}
                        className="flex items-start gap-1 text-left text-xs italic text-muted-foreground hover:text-foreground"
                      >
                        <StickyNote className="mt-0.5 size-3 shrink-0" />
                        {it.note}
                      </button>
                    )
                  ) : (
                    !readOnly && (
                      <button
                        type="button"
                        onClick={() => setNoteModal({ open: true, idx })}
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        <Plus className="size-3" />
                        Ghi chú
                      </button>
                    )
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Voucher + tổng */}
        <div className="space-y-3 border-t border-border p-4">
          {!readOnly && (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Gift className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Mã khuyến mãi"
                  value={promo.code}
                  onChange={(e) =>
                    setPromo((p) => ({ ...p, code: e.target.value, valid: false, message: "" }))
                  }
                />
              </div>
              <Button type="button" variant="outline" onClick={applyPromo}>
                Áp dụng
              </Button>
            </div>
          )}
          {promo.message && (
            <p className={cn("text-xs", promo.valid ? "text-success" : "text-destructive")}>
              {promo.message}
            </p>
          )}

          {discount > 0 && (
            <div className="flex items-center justify-between text-sm text-success">
              <span>Giảm giá</span>
              <span className="tabular-nums">-{formatVND(discount)}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">Tổng tiền</span>
            <span className="text-lg font-bold text-primary tabular-nums">{formatVND(total)}</span>
          </div>

          {!readOnly && (
            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() =>
                  isCreate || mode === "create"
                    ? navigate(ROUTE_PATH.ORDERS)
                    : setMode("view")
                }
              >
                Hủy
              </Button>
              <Button className="flex-1" onClick={handleSave}>
                {isCreate ? "Tạo đơn" : "Lưu"}
              </Button>
            </div>
          )}
        </div>
      </div>

      <NoteModal
        open={noteModal.open}
        onOpenChange={(open) => setNoteModal((s) => ({ ...s, open }))}
        itemName={items[noteModal.idx]?.name}
        initialValue={items[noteModal.idx]?.note ?? ""}
        onConfirm={(note) => setItemNote(noteModal.idx, note)}
      />
    </div>
  );
}
