import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Users } from "lucide-react";
import { toast } from "sonner";

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
import { CustomerSegmentApi, MembershipTierApi } from "@/apis";

const NO_MONTH = "__none__";

const EMPTY = {
  name: "",
  description: "",
  tierIds: [],
  birthdayMonth: NO_MONTH,
  minPoints: "",
  minDaysSinceLastVisit: "",
  maxDaysSinceLastVisit: "",
};

function buildCriteria(form) {
  const criteria = {};
  if (form.tierIds.length > 0) criteria.tierIds = form.tierIds;
  if (form.birthdayMonth !== NO_MONTH) criteria.birthdayMonth = Number(form.birthdayMonth);
  if (form.minPoints !== "") criteria.minPoints = Number(form.minPoints);
  if (form.minDaysSinceLastVisit !== "")
    criteria.minDaysSinceLastVisit = Number(form.minDaysSinceLastVisit);
  if (form.maxDaysSinceLastVisit !== "")
    criteria.maxDaysSinceLastVisit = Number(form.maxDaysSinceLastVisit);
  return criteria;
}

export function SegmentFormDialog({ open, onOpenChange, segment, onSubmit, loading }) {
  const isEdit = !!segment?._id;
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(null);
  const [previewing, setPreviewing] = useState(false);

  const { data: tiers = [] } = useQuery({
    queryKey: ["membership-tiers-current"],
    queryFn: async () => {
      const res = await MembershipTierApi.getAllCurrent();
      return res?.data?.success ? res.data.data || [] : [];
    },
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    if (open) {
      const c = segment?.criteria || {};
      setForm({
        name: segment?.name ?? "",
        description: segment?.description ?? "",
        tierIds: (c.tierIds || []).map((t) => (typeof t === "object" ? t._id : t)),
        birthdayMonth: c.birthdayMonth ? String(c.birthdayMonth) : NO_MONTH,
        minPoints: c.minPoints ?? "",
        minDaysSinceLastVisit: c.minDaysSinceLastVisit ?? "",
        maxDaysSinceLastVisit: c.maxDaysSinceLastVisit ?? "",
      });
      setErrors({});
      setPreview(null);
    }
  }, [open, segment]);

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
    setPreview(null);
  };

  const toggleTier = (tierId) => {
    setField(
      "tierIds",
      form.tierIds.includes(tierId)
        ? form.tierIds.filter((id) => id !== tierId)
        : [...form.tierIds, tierId]
    );
  };

  const criteria = useMemo(() => buildCriteria(form), [form]);
  const hasCriteria = Object.keys(criteria).length > 0;

  const handlePreview = async () => {
    if (!hasCriteria) {
      setErrors((e) => ({ ...e, criteria: "Thiết lập ít nhất một tiêu chí để xem thử." }));
      return;
    }
    setPreviewing(true);
    try {
      const res = await CustomerSegmentApi.preview({ criteria });
      if (!res?.data?.success) throw new Error(res?.data?.message || "Xem thử thất bại.");
      setPreview(res.data.data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPreviewing(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = "Vui lòng nhập tên nhóm.";
    if (!hasCriteria) next.criteria = "Phải thiết lập ít nhất một tiêu chí lọc.";
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    onSubmit({
      name: form.name.trim(),
      description: form.description.trim(),
      criteria,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Sửa nhóm khách hàng" : "Tạo nhóm khách hàng"}</DialogTitle>
            <DialogDescription>
              Nhóm được đồng bộ thành viên tự động mỗi ngày lúc 00:00 theo bộ tiêu chí.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="seg-name">
              Tên nhóm <span className="text-destructive">*</span>
            </Label>
            <Input
              id="seg-name"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="VD: Khách VIP có sinh nhật tháng 7"
              autoFocus
            />
            {errors.name ? <p className="text-sm text-destructive">{errors.name}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="seg-desc">Mô tả</Label>
            <Input
              id="seg-desc"
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Ghi chú mục đích sử dụng nhóm"
            />
          </div>

          <div className="space-y-3 rounded-lg border border-border p-3">
            <p className="text-sm font-semibold text-foreground">Tiêu chí lọc</p>

            <div className="space-y-2">
              <Label>Hạng thành viên</Label>
              <div className="flex flex-wrap gap-3">
                {tiers.map((t) => (
                  <label key={t._id} className="flex items-center gap-1.5 text-sm">
                    <Checkbox
                      checked={form.tierIds.includes(t._id)}
                      onCheckedChange={() => toggleTier(t._id)}
                    />
                    {t.name}
                  </label>
                ))}
                {tiers.length === 0 && (
                  <span className="text-sm text-muted-foreground">Chưa có hạng thành viên.</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Tháng sinh nhật</Label>
                <Select
                  value={form.birthdayMonth}
                  onValueChange={(v) => setField("birthdayMonth", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Không áp dụng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_MONTH}>Không áp dụng</SelectItem>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <SelectItem key={m} value={String(m)}>
                        Tháng {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seg-minpoints">Điểm tối thiểu</Label>
                <Input
                  id="seg-minpoints"
                  type="number"
                  min="0"
                  value={form.minPoints}
                  onChange={(e) => setField("minPoints", e.target.value)}
                  placeholder="VD: 50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seg-mindays">Chưa ghé quán ≥ (ngày)</Label>
                <Input
                  id="seg-mindays"
                  type="number"
                  min="0"
                  value={form.minDaysSinceLastVisit}
                  onChange={(e) => setField("minDaysSinceLastVisit", e.target.value)}
                  placeholder="VD: 30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seg-maxdays">Có ghé trong vòng (ngày)</Label>
                <Input
                  id="seg-maxdays"
                  type="number"
                  min="0"
                  value={form.maxDaysSinceLastVisit}
                  onChange={(e) => setField("maxDaysSinceLastVisit", e.target.value)}
                  placeholder="VD: 7"
                />
              </div>
            </div>

            {errors.criteria ? (
              <p className="text-sm text-destructive">{errors.criteria}</p>
            ) : null}

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePreview}
                disabled={previewing}
              >
                {previewing ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Users className="size-4" />
                )}
                Xem thử kết quả
              </Button>
              {preview ? (
                <span className="text-sm text-foreground">
                  Có <b>{formatNumber(preview.count)}</b> khách hàng phù hợp.
                </span>
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
              {isEdit ? "Lưu thay đổi" : "Tạo nhóm"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
