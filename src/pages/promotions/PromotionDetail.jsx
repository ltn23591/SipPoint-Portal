import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROUTE_PATH } from "@/constants/routePaths";
import { VoucherApi } from "@/apis";
import { PROMO_TYPE, PROMO_TYPE_OPTIONS, TEXT } from "./constants";

function Field({ label, hint, children }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

const EMPTY = {
  code: "",
  title: "",
  description: "",
  discountType: PROMO_TYPE.PERCENT,
  discountValue: 0,
  maxDiscountLimit: 0,
  minOrderValue: 0,
  usageLimit: 1,
  perCustomerLimit: 0,
  pointsCost: 0,
  startDate: "",
  endDate: "",
  isActive: "active",
};

const toDateInput = (value) => (value ? String(value).slice(0, 10) : "");

export default function PromotionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();
  const isCreate = id === "new";
  const initialMode = isCreate ? "create" : location.state?.mode ?? "view";

  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState(EMPTY);

  const { data: voucher, isLoading } = useQuery({
    queryKey: ["voucher-detail", id],
    enabled: !isCreate,
    queryFn: async () => {
      const res = await VoucherApi.detail(id);
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Không tải được voucher.");
      }
      return res.data.data;
    },
  });

  useEffect(() => {
    if (voucher) {
      setForm({
        ...EMPTY,
        ...voucher,
        maxDiscountLimit: voucher.maxDiscountLimit ?? 0,
        startDate: toDateInput(voucher.startDate),
        endDate: toDateInput(voucher.endDate),
      });
    }
  }, [voucher]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        code: form.code.trim().toUpperCase(),
        title: form.title.trim(),
        description: form.description?.trim() || "",
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        maxDiscountLimit: Number(form.maxDiscountLimit) || undefined,
        minOrderValue: Number(form.minOrderValue) || 0,
        usageLimit: Number(form.usageLimit),
        perCustomerLimit: Number(form.perCustomerLimit) || 0,
        pointsCost: Number(form.pointsCost) || 0,
        startDate: form.startDate || undefined,
        endDate: form.endDate,
        isActive: form.isActive,
      };
      const res = isCreate
        ? await VoucherApi.create(payload)
        : await VoucherApi.update(id, payload);
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Lưu voucher thất bại.");
      }
      return res.data;
    },
    onSuccess: (res) => {
      toast.success(res?.message || (isCreate ? "Tạo voucher thành công." : "Cập nhật thành công."));
      qc.invalidateQueries({ queryKey: ["vouchers"] });
      qc.invalidateQueries({ queryKey: ["voucher-detail", id] });
      navigate(ROUTE_PATH.PROMOTIONS);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSave = () => {
    if (!form.code.trim()) return toast.error("Vui lòng nhập mã voucher.");
    if (!form.title.trim()) return toast.error("Vui lòng nhập tên chương trình.");
    if (!form.endDate) return toast.error("Vui lòng chọn ngày kết thúc.");
    if (Number(form.usageLimit) < 1) return toast.error("Số lượng phát hành phải ≥ 1.");
    saveMutation.mutate();
  };

  if (!isCreate && isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }

  if (!isCreate && !isLoading && !voucher) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p>Không tìm thấy khuyến mãi này.</p>
        <Button variant="link" onClick={() => navigate(ROUTE_PATH.PROMOTIONS)}>
          {TEXT.back}
        </Button>
      </div>
    );
  }

  const readOnly = mode === "view";
  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const title =
    mode === "create" ? TEXT.createTitle : readOnly ? TEXT.detailTitle : TEXT.editTitle;

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto pb-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">
            {TEXT.pageTitle} / {title}
          </p>
          <h1 className="text-2xl font-semibold">{title}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(ROUTE_PATH.PROMOTIONS)}>
            <ArrowLeft className="size-4" /> {TEXT.back}
          </Button>
          {readOnly && (
            <Button onClick={() => setMode("edit")}>
              <Pencil className="size-4" /> {TEXT.edit}
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Thông tin chung</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Mã voucher">
            <Input
              value={form.code ?? ""}
              disabled={readOnly || !isCreate}
              onChange={(e) => set("code", e.target.value.toUpperCase())}
            />
          </Field>
          <Field label="Loại giảm">
            <Select
              value={form.discountType}
              onValueChange={(v) => set("discountType", v)}
              disabled={readOnly}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROMO_TYPE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field label="Tên chương trình">
          <Input
            value={form.title ?? ""}
            disabled={readOnly}
            onChange={(e) => set("title", e.target.value)}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label={form.discountType === PROMO_TYPE.PERCENT ? "Giá trị (%)" : "Giá trị (đ)"}>
            <Input
              type="number"
              min="0"
              value={form.discountValue ?? 0}
              disabled={readOnly}
              onChange={(e) => set("discountValue", e.target.value)}
            />
          </Field>
          <Field label="Giảm tối đa (đ)" hint="Áp dụng cho loại giảm theo %.">
            <Input
              type="number"
              min="0"
              value={form.maxDiscountLimit ?? 0}
              disabled={readOnly}
              onChange={(e) => set("maxDiscountLimit", e.target.value)}
            />
          </Field>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Điều kiện & thời gian áp dụng</h2>
        <div className="grid grid-cols-3 gap-4">
          <Field label="Đơn tối thiểu (đ)">
            <Input
              type="number"
              min="0"
              value={form.minOrderValue ?? 0}
              disabled={readOnly}
              onChange={(e) => set("minOrderValue", e.target.value)}
            />
          </Field>
          <Field label="Số lượng phát hành">
            <Input
              type="number"
              min="1"
              value={form.usageLimit ?? 1}
              disabled={readOnly}
              onChange={(e) => set("usageLimit", e.target.value)}
            />
          </Field>
          <Field label="Giới hạn mỗi khách" hint="0 = không giới hạn.">
            <Input
              type="number"
              min="0"
              value={form.perCustomerLimit ?? 0}
              disabled={readOnly}
              onChange={(e) => set("perCustomerLimit", e.target.value)}
            />
          </Field>
        </div>

        <Field
          label="Điểm cần để đổi voucher"
          hint="Đặt > 0 để khách hàng có thể tự đổi điểm lấy voucher này trên app. 0 = không cho đổi điểm."
        >
          <Input
            type="number"
            min="0"
            value={form.pointsCost ?? 0}
            disabled={readOnly}
            onChange={(e) => set("pointsCost", e.target.value)}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Bắt đầu">
            <Input
              type="date"
              value={form.startDate ?? ""}
              disabled={readOnly}
              onChange={(e) => set("startDate", e.target.value)}
            />
          </Field>
          <Field label="Kết thúc">
            <Input
              type="date"
              value={form.endDate ?? ""}
              disabled={readOnly}
              onChange={(e) => set("endDate", e.target.value)}
            />
          </Field>
        </div>

        <Field label="Trạng thái">
          <Select
            value={form.isActive}
            onValueChange={(v) => set("isActive", v)}
            disabled={readOnly}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Đang chạy</SelectItem>
              <SelectItem value="inactive">Tạm dừng</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

      {!readOnly && (
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            disabled={saveMutation.isPending}
            onClick={() => (isCreate ? navigate(ROUTE_PATH.PROMOTIONS) : setMode("view"))}
          >
            {TEXT.cancel}
          </Button>
          <Button onClick={handleSave} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            {TEXT.save}
          </Button>
        </div>
      )}
    </div>
  );
}
