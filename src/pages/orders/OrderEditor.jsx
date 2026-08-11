import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Search,
  Plus,
  Minus,
  Trash2,
  Coffee,
  Gift,
  Armchair,
  StickyNote,
  Loader2,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NoteModal } from "./components/NoteModal";
import { TablePickerDialog } from "./components/TablePickerDialog";
import { CustomerPickerDialog } from "./components/CustomerPickerDialog";
import { cn } from "@/lib/utils";
import { formatVND } from "@/helpers/format";
import { useDebounce } from "@/hooks/useDebounce";
import { ROUTE_PATH } from "@/constants/routePaths";
import { ORDER_TYPE } from "@/constants/application";
import { CategoryApi, ProductsApi, VoucherApi, OrdersApi } from "@/apis";

const ALL_CATEGORY = "all";

export default function OrderEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isCreate = !id || id === "new";

  // ── State phiếu order (chỉ dùng khi tạo mới) ──
  const [items, setItems] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [tablePickerOpen, setTablePickerOpen] = useState(false);
  const [customerPickerOpen, setCustomerPickerOpen] = useState(false);
  const [note, setNote] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promo, setPromo] = useState({ valid: false, discount: 0, message: "" });
  const [noteModal, setNoteModal] = useState({ open: false, idx: -1 });

  const tableId = selectedTable?._id ?? "";
  const customerId = selectedCustomer?._id ?? "";

  // ── Catalog: danh mục + sản phẩm thật ──
  const [tab, setTab] = useState(ALL_CATEGORY);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 400);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    enabled: isCreate,
    queryFn: async () => {
      const res = await CategoryApi.getAll();
      return res?.data?.success ? res.data.data || [] : [];
    },
    staleTime: 5 * 60_000,
  });
  const categoryTabs = [
    { value: ALL_CATEGORY, label: "Tất cả" },
    ...categories.map((c) => ({ value: c._id, label: c.name })),
  ];

  const { data: products = [], isLoading: isProductsLoading } = useQuery({
    queryKey: ["order-editor-products", tab, search],
    enabled: isCreate,
    queryFn: async ({ signal }) => {
      const params = {
        ...(tab !== ALL_CATEGORY ? { category: tab } : {}),
        ...(search ? { keyword: search } : {}),
      };
      const res = await ProductsApi.getAll(params, signal);
      return res?.data?.success ? res.data.data || [] : [];
    },
  });

  const subtotal = items.reduce((s, it) => s + it.unitPrice * it.qty, 0);
  const discount = promo.valid ? promo.discount : 0;
  const total = Math.max(0, subtotal - discount);

  const addProduct = (product) => {
    setItems((prev) => {
      const idx = prev.findIndex((it) => it.productId === product._id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
        return next;
      }
      return [
        ...prev,
        { productId: product._id, name: product.name, qty: 1, unitPrice: product.price, note: "" },
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

  const removeItem = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const setItemNote = (idx, noteValue) =>
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, note: noteValue } : it)));

  const validateMutation = useMutation({
    mutationFn: async () => {
      const res = await VoucherApi.validate({ code: promoCode.trim(), orderValue: subtotal });
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Mã khuyến mãi không hợp lệ.");
      }
      return res.data.data;
    },
    onSuccess: (data) => {
      setPromo({ valid: true, discount: data.discountAmount, message: `Áp dụng "${data.title}" thành công.` });
    },
    onError: (err) => {
      setPromo({ valid: false, discount: 0, message: err.message });
    },
  });

  const applyPromo = () => {
    if (!promoCode.trim()) {
      setPromo({ valid: false, discount: 0, message: "" });
      return;
    }
    validateMutation.mutate();
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        tableId: tableId || undefined,
        customerId: customerId || undefined,
        items: items.map((it) => ({
          productId: it.productId,
          qty: it.qty,
          note: it.note || undefined,
        })),
        ...(promo.valid && promoCode.trim() ? { voucherCode: promoCode.trim() } : {}),
        note: note || undefined,
        type: tableId ? ORDER_TYPE.DINE_IN : ORDER_TYPE.TAKEAWAY,
      };
      const res = await OrdersApi.create(payload);
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Tạo đơn hàng thất bại.");
      }
      return res.data;
    },
    onSuccess: (res) => {
      toast.success(res?.message || "Tạo đơn thành công.");
      qc.invalidateQueries({ queryKey: ["orders"] });
      navigate(ROUTE_PATH.ORDERS);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSave = () => {
    if (!items.length) {
      toast.error("Đơn hàng cần ít nhất 1 món.");
      return;
    }
    createMutation.mutate();
  };

  if (!isCreate) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-muted-foreground">
        <p className="text-base font-medium text-foreground">
          Chỉnh sửa nội dung đơn hàng chưa được hỗ trợ.
        </p>
        <p className="text-sm">
          Vui lòng dùng "Xem chi tiết" ở danh sách đơn hàng để xem đơn này.
        </p>
        <Button variant="outline" onClick={() => navigate(ROUTE_PATH.ORDERS)}>
          <ArrowLeft className="size-4" />
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full gap-4">
      {/* ── Catalog (trái) ── */}
      <div className="flex flex-1 flex-col gap-3 overflow-hidden">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon-sm" onClick={() => navigate(ROUTE_PATH.ORDERS)}>
            <ArrowLeft className="size-4" />
          </Button>
          <h1 className="text-lg font-bold text-secondary">Tạo đơn mới</h1>
        </div>

        {/* Tabs danh mục */}
        <div className="flex items-center gap-1 overflow-x-auto rounded-lg border border-border bg-muted/40 p-1">
          {categoryTabs.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTab(t.value)}
              className={cn(
                "shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
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
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        {/* Grid sản phẩm */}
        <div className="grid flex-1 auto-rows-min grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3 lg:grid-cols-4">
          {isProductsLoading ? (
            <p className="col-span-full py-10 text-center text-sm text-muted-foreground">
              Đang tải danh sách món...
            </p>
          ) : products.length === 0 ? (
            <p className="col-span-full py-10 text-center text-sm text-muted-foreground">
              Không tìm thấy món phù hợp
            </p>
          ) : (
            products.map((p) => (
              <button
                key={p._id}
                type="button"
                onClick={() => addProduct(p)}
                className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card text-left shadow-sm transition-all hover:border-primary hover:shadow-md"
              >
                <div className="flex h-24 items-center justify-center overflow-hidden bg-muted text-muted-foreground">
                  {typeof p.image === "string" && p.image.startsWith("http") ? (
                    <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <Coffee className="size-8 opacity-40" />
                  )}
                </div>
                <div className="space-y-0.5 p-2">
                  <p className="line-clamp-1 text-sm font-medium text-foreground">{p.name}</p>
                  <p className="text-sm font-semibold text-primary">{formatVND(p.price)}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── Phiếu order (phải) ── */}
      <div className="flex w-[400px] shrink-0 flex-col rounded-xl border border-border bg-card shadow-sm">
        {/* Header phiếu */}
        <div className="space-y-3 border-b border-border p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Armchair className="size-4 text-primary" />
            Bàn & khách hàng
          </div>

          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => setTablePickerOpen(true)}
              className="flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm hover:bg-muted/40"
            >
              <span className={cn(!selectedTable && "text-muted-foreground")}>
                {selectedTable ? selectedTable.name : "Mang đi (chưa chọn bàn)"}
              </span>
              <Pencil className="size-3.5 text-muted-foreground" />
            </button>
            <button
              type="button"
              onClick={() => setCustomerPickerOpen(true)}
              className="flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm hover:bg-muted/40"
            >
              <span className={cn(!selectedCustomer && "text-muted-foreground")}>
                {selectedCustomer
                  ? `${selectedCustomer.fullName}${selectedCustomer.tierId?.name ? ` - ${selectedCustomer.tierId.name}` : ""}`
                  : "Khách lẻ (chưa chọn khách hàng)"}
              </span>
              <Pencil className="size-3.5 text-muted-foreground" />
            </button>
          </div>
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
              Chưa có món nào. Chọn món bên trái để thêm.
            </p>
          ) : (
            items.map((it, idx) => (
              <div key={`${it.productId}-${idx}`} className="px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="flex-1 text-sm font-medium text-foreground">{it.name}</span>
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
                  <span className="w-24 text-right text-sm font-semibold tabular-nums">
                    {formatVND(it.unitPrice * it.qty)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="size-6 text-destructive hover:bg-destructive/10"
                    onClick={() => removeItem(idx)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>

                {/* Ghi chú theo món */}
                <div className="mt-1">
                  {it.note ? (
                    <button
                      type="button"
                      onClick={() => setNoteModal({ open: true, idx })}
                      className="flex items-start gap-1 text-left text-xs italic text-muted-foreground hover:text-foreground"
                    >
                      <StickyNote className="mt-0.5 size-3 shrink-0" />
                      {it.note}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setNoteModal({ open: true, idx })}
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      <Plus className="size-3" />
                      Ghi chú
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Voucher + tổng */}
        <div className="space-y-3 border-t border-border p-4">
          <div className="relative">
            <StickyNote className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Ghi chú đơn hàng (không bắt buộc)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Gift className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Mã khuyến mãi"
                value={promoCode}
                onChange={(e) => {
                  setPromoCode(e.target.value);
                  setPromo({ valid: false, discount: 0, message: "" });
                }}
              />
            </div>
            <Button type="button" variant="outline" onClick={applyPromo} disabled={validateMutation.isPending}>
              {validateMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Áp dụng
            </Button>
          </div>
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

          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1" onClick={() => navigate(ROUTE_PATH.ORDERS)}>
              Hủy
            </Button>
            <Button className="flex-1" onClick={handleSave} disabled={createMutation.isPending}>
              {createMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Tạo đơn
            </Button>
          </div>
        </div>
      </div>

      <NoteModal
        open={noteModal.open}
        onOpenChange={(open) => setNoteModal((s) => ({ ...s, open }))}
        itemName={items[noteModal.idx]?.name}
        initialValue={items[noteModal.idx]?.note ?? ""}
        onConfirm={(noteValue) => setItemNote(noteModal.idx, noteValue)}
      />

      <TablePickerDialog
        open={tablePickerOpen}
        onOpenChange={setTablePickerOpen}
        value={tableId}
        onSelect={setSelectedTable}
      />

      <CustomerPickerDialog
        open={customerPickerOpen}
        onOpenChange={setCustomerPickerOpen}
        value={customerId}
        onSelect={setSelectedCustomer}
      />
    </div>
  );
}
