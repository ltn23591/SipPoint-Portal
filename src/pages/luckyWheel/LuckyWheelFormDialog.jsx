import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/helpers/format";
import {
  PRIZE_TYPE,
  PRIZE_TYPE_LABEL,
  WHEEL_TARGET_TYPE,
  WHEEL_TARGET_TYPE_LABEL,
} from "@/constants/application";
import { CustomerSegmentApi, MembershipTierApi, VoucherApi } from "@/apis";

const toDateInput = (value) => (value ? String(value).slice(0, 10) : "");

const newSlot = () => ({
  key: `${Date.now()}-${Math.round(Math.random() * 1e6)}`,
  label: "",
  prizeType: PRIZE_TYPE.NONE,
  voucherId: "",
  points: "",
  probability: 0,
  stockLimit: 0,
  color: "",
});

const EMPTY = {
  name: "",
  description: "",
  startDate: "",
  endDate: "",
  targetType: WHEEL_TARGET_TYPE.ALL,
  segmentIds: [],
  tierIds: [],
  spinLimitPerCustomer: 1,
  spinCost: 0,
};

export function LuckyWheelFormDialog({ open, onOpenChange, wheel, onSubmit, loading }) {
  const isEdit = !!wheel?._id;
  const [form, setForm] = useState(EMPTY);
  const [slots, setSlots] = useState([newSlot()]);
  const [errors, setErrors] = useState({});

  const { data: vouchers = [] } = useQuery({
    queryKey: ["vouchers-options"],
    enabled: open,
    queryFn: async () => {
      const res = await VoucherApi.getAll();
      return res?.data?.success ? res.data.data || [] : [];
    },
  });

  const { data: segments = [] } = useQuery({
    queryKey: ["customer-segments-options"],
    enabled: open,
    queryFn: async () => {
      const res = await CustomerSegmentApi.getAll({ page: 1, limit: 100 });
      return res?.data?.success ? res.data.data || [] : [];
    },
  });

  const { data: tiers = [] } = useQuery({
    queryKey: ["membership-tiers-options"],
    enabled: open,
    queryFn: async () => {
      const res = await MembershipTierApi.getAllCurrent();
      return res?.data?.success ? res.data.data || [] : [];
    },
  });

  useEffect(() => {
    if (!open) return;
    setForm({
      name: wheel?.name ?? "",
      description: wheel?.description ?? "",
      startDate: toDateInput(wheel?.startDate),
      endDate: toDateInput(wheel?.endDate),
      targetType: wheel?.targetType ?? WHEEL_TARGET_TYPE.ALL,
      segmentIds: (wheel?.segmentIds || []).map((s) => (typeof s === "object" ? s._id : s)),
      tierIds: (wheel?.tierIds || []).map((t) => (typeof t === "object" ? t._id : t)),
      spinLimitPerCustomer: wheel?.spinLimitPerCustomer ?? 1,
      spinCost: wheel?.spinCost ?? 0,
    });
    setSlots(
      wheel?.slots?.length
        ? wheel.slots.map((s) => ({
            key: s._id || `${Date.now()}-${Math.random()}`,
            label: s.label ?? "",
            prizeType: s.prizeType ?? PRIZE_TYPE.NONE,
            voucherId: (typeof s.voucherId === "object" ? s.voucherId?._id : s.voucherId) ?? "",
            points: s.points ?? "",
            probability: s.probability ?? 0,
            stockLimit: s.stockLimit ?? 0,
            color: s.color ?? "",
          }))
        : [newSlot()]
    );
    setErrors({});
  }, [open, wheel]);

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const setSlot = (key, field, value) =>
    setSlots((prev) => prev.map((s) => (s.key === key ? { ...s, [field]: value } : s)));

  const addSlot = () => setSlots((prev) => [...prev, newSlot()]);
  const removeSlot = (key) => setSlots((prev) => prev.filter((s) => s.key !== key));

  const toggleFromList = (field, id) =>
    setField(field, form[field].includes(id) ? form[field].filter((x) => x !== id) : [...form[field], id]);

  const totalProb = useMemo(
    () => slots.reduce((s, x) => s + (Number(x.probability) || 0), 0),
    [slots]
  );
  const probValid = Math.abs(totalProb - 100) < 0.01;

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = "Vui lòng nhập tên vòng quay.";
    if (!form.endDate) next.endDate = "Chọn ngày kết thúc.";
    if (form.startDate && form.endDate && form.startDate >= form.endDate)
      next.endDate = "Ngày kết thúc phải sau ngày bắt đầu.";
    if (form.targetType === WHEEL_TARGET_TYPE.SEGMENT && form.segmentIds.length === 0)
      next.target = "Chọn ít nhất một nhóm khách hàng.";
    if (form.targetType === WHEEL_TARGET_TYPE.TIER && form.tierIds.length === 0)
      next.target = "Chọn ít nhất một bậc hạng.";

    for (const s of slots) {
      if (!s.label.trim()) next.slots = "Mỗi ô phải có nhãn hiển thị.";
      if (s.prizeType === PRIZE_TYPE.VOUCHER && !s.voucherId)
        next.slots = "Ô phần thưởng voucher phải chọn voucher.";
      if (s.prizeType === PRIZE_TYPE.POINTS && (!s.points || Number(s.points) <= 0))
        next.slots = "Ô phần thưởng điểm phải có số điểm > 0.";
    }
    if (!probValid) next.slots = `Tổng tỉ lệ phải bằng 100% (hiện tại: ${totalProb}%).`;

    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }

    onSubmit({
      name: form.name.trim(),
      description: form.description.trim(),
      startDate: form.startDate || undefined,
      endDate: form.endDate,
      targetType: form.targetType,
      segmentIds: form.targetType === WHEEL_TARGET_TYPE.SEGMENT ? form.segmentIds : [],
      tierIds: form.targetType === WHEEL_TARGET_TYPE.TIER ? form.tierIds : [],
      spinLimitPerCustomer: Number(form.spinLimitPerCustomer) || 0,
      spinCost: Number(form.spinCost) || 0,
      slots: slots.map((s) => ({
        label: s.label.trim(),
        color: s.color || undefined,
        prizeType: s.prizeType,
        voucherId: s.prizeType === PRIZE_TYPE.VOUCHER ? s.voucherId : undefined,
        points: s.prizeType === PRIZE_TYPE.POINTS ? Number(s.points) : 0,
        probability: Number(s.probability) || 0,
        stockLimit: Number(s.stockLimit) || 0,
      })),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Sửa vòng quay" : "Tạo vòng quay may mắn"}</DialogTitle>
            <DialogDescription>
              Cấu hình phần thưởng, tỉ lệ (tổng = 100%), kho quà và phạm vi khách hàng áp dụng.
            </DialogDescription>
          </DialogHeader>

          {/* Thông tin chung */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="lw-name">
                Tên vòng quay <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lw-name"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="VD: Vòng quay Tết 2026"
                autoFocus
              />
              {errors.name ? <p className="text-sm text-destructive">{errors.name}</p> : null}
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="lw-desc">Mô tả</Label>
              <Input
                id="lw-desc"
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lw-start">Ngày bắt đầu</Label>
              <Input
                id="lw-start"
                type="date"
                value={form.startDate}
                onChange={(e) => setField("startDate", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lw-end">
                Ngày kết thúc <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lw-end"
                type="date"
                value={form.endDate}
                onChange={(e) => setField("endDate", e.target.value)}
              />
              {errors.endDate ? <p className="text-sm text-destructive">{errors.endDate}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lw-limit">Số lượt / khách (0 = không giới hạn)</Label>
              <Input
                id="lw-limit"
                type="number"
                min="0"
                value={form.spinLimitPerCustomer}
                onChange={(e) => setField("spinLimitPerCustomer", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lw-cost">Điểm / lượt quay (0 = miễn phí)</Label>
              <Input
                id="lw-cost"
                type="number"
                min="0"
                value={form.spinCost}
                onChange={(e) => setField("spinCost", e.target.value)}
              />
            </div>
          </div>

          {/* Phạm vi khách hàng */}
          <div className="space-y-2 rounded-lg border border-border p-3">
            <Label>Phạm vi áp dụng</Label>
            <Select value={form.targetType} onValueChange={(v) => setField("targetType", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(WHEEL_TARGET_TYPE_LABEL).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {form.targetType === WHEEL_TARGET_TYPE.SEGMENT && (
              <div className="max-h-28 space-y-1.5 overflow-y-auto rounded-md border border-border p-2">
                {segments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Chưa có nhóm khách hàng nào.</p>
                ) : (
                  segments.map((s) => (
                    <label key={s._id} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={form.segmentIds.includes(s._id)}
                        onCheckedChange={() => toggleFromList("segmentIds", s._id)}
                      />
                      <span className="flex-1">{s.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatNumber(s.memberCount ?? 0)} KH
                      </span>
                    </label>
                  ))
                )}
              </div>
            )}

            {form.targetType === WHEEL_TARGET_TYPE.TIER && (
              <div className="max-h-28 space-y-1.5 overflow-y-auto rounded-md border border-border p-2">
                {tiers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Chưa có bậc hạng nào.</p>
                ) : (
                  tiers.map((t) => (
                    <label key={t._id} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={form.tierIds.includes(t._id)}
                        onCheckedChange={() => toggleFromList("tierIds", t._id)}
                      />
                      <span className="flex-1">{t.name}</span>
                    </label>
                  ))
                )}
              </div>
            )}
            {errors.target ? <p className="text-sm text-destructive">{errors.target}</p> : null}
          </div>

          {/* Slots */}
          <div className="space-y-2 rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <Label>Ô giải thưởng</Label>
              <Button type="button" variant="outline" size="sm" onClick={addSlot}>
                <Plus className="size-3.5" /> Thêm ô
              </Button>
            </div>

            <div className="space-y-2">
              {slots.map((s) => (
                <div key={s.key} className="rounded-md border border-border p-2">
                  <div className="flex items-center gap-2">
                    <Input
                      className="flex-1"
                      placeholder="Nhãn ô (VD: Giảm 20%)"
                      value={s.label}
                      onChange={(e) => setSlot(s.key, "label", e.target.value)}
                    />
                    <Select value={s.prizeType} onValueChange={(v) => setSlot(s.key, "prizeType", v)}>
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(PRIZE_TYPE_LABEL).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="shrink-0 text-destructive hover:bg-destructive/10"
                      onClick={() => removeSlot(s.key)}
                      disabled={slots.length === 1}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>

                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {s.prizeType === PRIZE_TYPE.VOUCHER && (
                      <Select value={s.voucherId} onValueChange={(v) => setSlot(s.key, "voucherId", v)}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Chọn voucher" />
                        </SelectTrigger>
                        <SelectContent>
                          {vouchers.map((v) => (
                            <SelectItem key={v._id} value={v._id}>
                              {v.code} — {v.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {s.prizeType === PRIZE_TYPE.POINTS && (
                      <div className="col-span-3">
                        <Input
                          type="number"
                          min="1"
                          placeholder="Số điểm thưởng"
                          value={s.points}
                          onChange={(e) => setSlot(s.key, "points", e.target.value)}
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Tỉ lệ %"
                        value={s.probability}
                        onChange={(e) => setSlot(s.key, "probability", e.target.value)}
                      />
                      <span className="text-xs text-muted-foreground">%</span>
                    </div>
                    <Input
                      type="number"
                      min="0"
                      placeholder="Kho (0 = ∞)"
                      value={s.stockLimit}
                      onChange={(e) => setSlot(s.key, "stockLimit", e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div
              className={cn(
                "flex items-center gap-2 text-sm font-medium",
                probValid ? "text-success" : "text-destructive"
              )}
            >
              {probValid ? <CheckCircle2 className="size-4" /> : <AlertTriangle className="size-4" />}
              Tổng tỉ lệ: {totalProb}%
            </div>
            {errors.slots ? <p className="text-sm text-destructive">{errors.slots}</p> : null}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Huỷ
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : null}
              {isEdit ? "Lưu thay đổi" : "Tạo vòng quay"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
