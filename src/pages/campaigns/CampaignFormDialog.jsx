import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

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
import { formatNumber } from "@/helpers/format";
import { CustomerSegmentApi, VoucherApi } from "@/apis";

const EMPTY = {
  name: "",
  description: "",
  segmentIds: [],
  voucherId: "",
  minOrderValue: "",
  timeStart: "",
  timeEnd: "",
  startDate: "",
  endDate: "",
};

const toDateInput = (value) => (value ? String(value).slice(0, 10) : "");

export function CampaignFormDialog({ open, onOpenChange, campaign, onSubmit, loading }) {
  const isEdit = !!campaign?._id;
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  const { data: segments = [] } = useQuery({
    queryKey: ["customer-segments-options"],
    enabled: open,
    queryFn: async () => {
      const res = await CustomerSegmentApi.getAll({ page: 1, limit: 100 });
      return res?.data?.success ? res.data.data || [] : [];
    },
  });

  const { data: vouchers = [] } = useQuery({
    queryKey: ["vouchers-options"],
    enabled: open,
    queryFn: async () => {
      const res = await VoucherApi.getAll();
      return res?.data?.success ? res.data.data || [] : [];
    },
  });

  useEffect(() => {
    if (open) {
      const c = campaign?.conditions || {};
      setForm({
        name: campaign?.name ?? "",
        description: campaign?.description ?? "",
        segmentIds: (campaign?.segmentIds || []).map((s) => (typeof s === "object" ? s._id : s)),
        voucherId: campaign?.voucherId?._id || campaign?.voucherId || "",
        minOrderValue: c.minOrderValue ?? "",
        timeStart: c.timeWindow?.startHour ?? "",
        timeEnd: c.timeWindow?.endHour ?? "",
        startDate: toDateInput(campaign?.startDate),
        endDate: toDateInput(campaign?.endDate),
      });
      setErrors({});
    }
  }, [open, campaign]);

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const toggleSegment = (id) => {
    setField(
      "segmentIds",
      form.segmentIds.includes(id)
        ? form.segmentIds.filter((s) => s !== id)
        : [...form.segmentIds, id]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = "Vui lòng nhập tên chiến dịch.";
    if (form.segmentIds.length === 0) next.segmentIds = "Chọn ít nhất một nhóm khách hàng.";
    if (!form.voucherId) next.voucherId = "Chọn voucher phát hành.";
    if (!form.endDate) next.endDate = "Chọn ngày kết thúc.";
    const hasStart = form.timeStart !== "";
    const hasEnd = form.timeEnd !== "";
    if (hasStart !== hasEnd) next.timeWindow = "Khung giờ phải có đủ giờ bắt đầu và kết thúc.";
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }

    const conditions = {};
    if (form.minOrderValue !== "") conditions.minOrderValue = Number(form.minOrderValue);
    if (hasStart && hasEnd) {
      conditions.timeWindow = {
        startHour: Number(form.timeStart),
        endHour: Number(form.timeEnd),
      };
    }

    onSubmit({
      name: form.name.trim(),
      description: form.description.trim(),
      segmentIds: form.segmentIds,
      voucherId: form.voucherId,
      conditions,
      startDate: form.startDate || undefined,
      endDate: form.endDate,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Sửa chiến dịch" : "Tạo chiến dịch khuyến mãi"}</DialogTitle>
            <DialogDescription>
              Khi kích hoạt, voucher được phát vào ví toàn bộ thành viên của các nhóm mục tiêu.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="cam-name">
              Tên chiến dịch <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cam-name"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="VD: Tri ân sinh nhật tháng 7"
              autoFocus
            />
            {errors.name ? <p className="text-sm text-destructive">{errors.name}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cam-desc">Mô tả</Label>
            <Input
              id="cam-desc"
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>
              Nhóm khách hàng mục tiêu <span className="text-destructive">*</span>
            </Label>
            <div className="max-h-32 space-y-1.5 overflow-y-auto rounded-lg border border-border p-2">
              {segments.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Chưa có nhóm nào — tạo nhóm ở trang "Nhóm khách hàng" trước.
                </p>
              ) : (
                segments.map((s) => (
                  <label key={s._id} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={form.segmentIds.includes(s._id)}
                      onCheckedChange={() => toggleSegment(s._id)}
                    />
                    <span className="flex-1">{s.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatNumber(s.memberCount ?? 0)} KH
                    </span>
                  </label>
                ))
              )}
            </div>
            {errors.segmentIds ? (
              <p className="text-sm text-destructive">{errors.segmentIds}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>
              Voucher phát hành <span className="text-destructive">*</span>
            </Label>
            <Select value={form.voucherId} onValueChange={(v) => setField("voucherId", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn voucher" />
              </SelectTrigger>
              <SelectContent>
                {vouchers.map((v) => (
                  <SelectItem key={v._id} value={v._id}>
                    {v.code} — {v.title} (kho còn{" "}
                    {formatNumber(Math.max(0, (v.usageLimit ?? 0) - (v.issuedCount ?? 0)))})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.voucherId ? (
              <p className="text-sm text-destructive">{errors.voucherId}</p>
            ) : null}
          </div>

          <div className="space-y-3 rounded-lg border border-border p-3">
            <p className="text-sm font-semibold text-foreground">Điều kiện bổ sung</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="cam-minorder">Hóa đơn tối thiểu (đ)</Label>
                <Input
                  id="cam-minorder"
                  type="number"
                  min="0"
                  value={form.minOrderValue}
                  onChange={(e) => setField("minOrderValue", e.target.value)}
                  placeholder="Bỏ trống = theo voucher"
                />
              </div>
              <div className="space-y-2">
                <Label>Khung giờ vàng (0-23h)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="23"
                    value={form.timeStart}
                    onChange={(e) => setField("timeStart", e.target.value)}
                    placeholder="14"
                  />
                  <span className="text-muted-foreground">—</span>
                  <Input
                    type="number"
                    min="0"
                    max="23"
                    value={form.timeEnd}
                    onChange={(e) => setField("timeEnd", e.target.value)}
                    placeholder="16"
                  />
                </div>
              </div>
            </div>
            {errors.timeWindow ? (
              <p className="text-sm text-destructive">{errors.timeWindow}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="cam-start">Ngày bắt đầu</Label>
              <Input
                id="cam-start"
                type="date"
                value={form.startDate}
                onChange={(e) => setField("startDate", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cam-end">
                Ngày kết thúc <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cam-end"
                type="date"
                value={form.endDate}
                onChange={(e) => setField("endDate", e.target.value)}
              />
              {errors.endDate ? (
                <p className="text-sm text-destructive">{errors.endDate}</p>
              ) : null}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Huỷ
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : null}
              {isEdit ? "Lưu thay đổi" : "Tạo chiến dịch"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
