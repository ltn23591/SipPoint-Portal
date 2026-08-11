import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatNumber } from "@/helpers/format";
import { ROUTE_PATH } from "@/constants/routePaths";
import { CAMPAIGN_STATUS, CAMPAIGN_STATUS_LABEL } from "@/constants/application";
import { CampaignApi, CustomerSegmentApi, VoucherApi } from "@/apis";

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

const STATUS_BADGE_CLASS = {
  [CAMPAIGN_STATUS.DRAFT]: "bg-muted text-muted-foreground",
  [CAMPAIGN_STATUS.ACTIVE]: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  [CAMPAIGN_STATUS.FINISHED]: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  [CAMPAIGN_STATUS.CANCELLED]: "bg-destructive/10 text-destructive",
};

export default function CampaignForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  const { data: segments = [] } = useQuery({
    queryKey: ["customer-segments-options"],
    queryFn: async () => {
      const res = await CustomerSegmentApi.getAll({ page: 1, limit: 100 });
      return res?.data?.success ? res.data.data || [] : [];
    },
  });

  const { data: vouchers = [] } = useQuery({
    queryKey: ["vouchers-options"],
    queryFn: async () => {
      const res = await VoucherApi.getAll();
      return res?.data?.success ? res.data.data || [] : [];
    },
  });

  const { data: campaign, isLoading: isDetailLoading } = useQuery({
    queryKey: ["campaign-detail", id],
    enabled: isEdit,
    queryFn: async () => {
      const res = await CampaignApi.getById(id);
      if (!res?.data?.success) throw new Error(res?.data?.message || "Không tải được chiến dịch.");
      return res.data.data;
    },
  });

  const isReadOnly = isEdit && campaign?.status && campaign.status !== CAMPAIGN_STATUS.DRAFT;

  useEffect(() => {
    if (!campaign) return;
    const c = campaign.conditions || {};
    /* eslint-disable react-hooks/set-state-in-effect */
    setForm({
      name: campaign.name ?? "",
      description: campaign.description ?? "",
      segmentIds: (campaign.segmentIds || []).map((s) => (typeof s === "object" ? s._id : s)),
      voucherId: campaign.voucherId?._id || campaign.voucherId || "",
      minOrderValue: c.minOrderValue ?? "",
      timeStart: c.timeWindow?.startHour ?? "",
      timeEnd: c.timeWindow?.endHour ?? "",
      startDate: toDateInput(campaign.startDate),
      endDate: toDateInput(campaign.endDate),
    });
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [campaign]);

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const toggleSegment = (segId) => {
    setField(
      "segmentIds",
      form.segmentIds.includes(segId)
        ? form.segmentIds.filter((s) => s !== segId)
        : [...form.segmentIds, segId]
    );
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
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
        throw new Error("__validation__");
      }

      const conditions = {};
      if (form.minOrderValue !== "") conditions.minOrderValue = Number(form.minOrderValue);
      if (hasStart && hasEnd) {
        conditions.timeWindow = {
          startHour: Number(form.timeStart),
          endHour: Number(form.timeEnd),
        };
      }

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        segmentIds: form.segmentIds,
        voucherId: form.voucherId,
        conditions,
        startDate: form.startDate || undefined,
        endDate: form.endDate,
      };

      const res = isEdit ? await CampaignApi.update(id, payload) : await CampaignApi.create(payload);
      if (!res?.data?.success) throw new Error(res?.data?.message || "Lưu chiến dịch thất bại.");
      return res.data;
    },
    onSuccess: (res) => {
      toast.success(res?.message || "Đã lưu chiến dịch.");
      qc.invalidateQueries({ queryKey: ["campaigns"] });
      navigate(ROUTE_PATH.CAMPAIGNS);
    },
    onError: (err) => {
      if (err.message !== "__validation__") toast.error(err.message);
    },
  });

  const loading = saveMutation.isPending || (isEdit && isDetailLoading);

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">
            Chiến dịch khuyến mãi / {isEdit ? (isReadOnly ? "Chi tiết chiến dịch" : "Sửa chiến dịch") : "Tạo chiến dịch"}
          </p>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">
              {isEdit ? (isReadOnly ? "Chi tiết chiến dịch" : "Sửa chiến dịch") : "Tạo chiến dịch"}
            </h1>
            {campaign?.status && (
              <Badge className={STATUS_BADGE_CLASS[campaign.status]}>
                {CAMPAIGN_STATUS_LABEL[campaign.status] || campaign.status}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(ROUTE_PATH.CAMPAIGNS)} disabled={saveMutation.isPending}>
            <ArrowLeft className="size-4" /> Quay lại
          </Button>
          {!isReadOnly && (
            <Button onClick={() => saveMutation.mutate()} disabled={loading}>
              {saveMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null} Lưu
            </Button>
          )}
        </div>
      </div>

      {isEdit && campaign?.issuedCount != null && (
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">
            Đã phát <strong className="text-foreground">{formatNumber(campaign.issuedCount ?? 0)}</strong> voucher
            {campaign.voucherId?.code ? (
              <>
                {" "}(mã <span className="font-mono">{campaign.voucherId.code}</span>)
              </>
            ) : null}
          </p>
        </div>
      )}

      {/* Thông tin chung */}
      <div className="space-y-4 rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Thông tin chung</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="cam-name">
              Tên chiến dịch <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cam-name"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="VD: Tri ân sinh nhật tháng 7"
              disabled={isReadOnly}
            />
            {errors.name ? <p className="text-sm text-destructive">{errors.name}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cam-desc">Mô tả</Label>
            <Input
              id="cam-desc"
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              disabled={isReadOnly}
            />
          </div>
        </div>
      </div>

      {/* Nhóm khách hàng + Voucher */}
      <div className="grid gap-6 rounded-xl border border-border bg-card p-6 lg:grid-cols-2">
        <div className="space-y-2">
          <Label>
            Nhóm khách hàng mục tiêu <span className="text-destructive">*</span>
          </Label>
          <div className="max-h-48 space-y-1.5 overflow-y-auto rounded-lg border border-border p-2">
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
                    disabled={isReadOnly}
                  />
                  <span className="flex-1">{s.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatNumber(s.memberCount ?? 0)} KH
                  </span>
                </label>
              ))
            )}
          </div>
          {errors.segmentIds ? <p className="text-sm text-destructive">{errors.segmentIds}</p> : null}
        </div>

        <div className="space-y-2">
          <Label>
            Voucher phát hành <span className="text-destructive">*</span>
          </Label>
          <Select value={form.voucherId} onValueChange={(v) => setField("voucherId", v)} disabled={isReadOnly}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn voucher" />
            </SelectTrigger>
            <SelectContent>
              {vouchers.map((v) => (
                <SelectItem key={v._id} value={v._id}>
                  {v.code} — {v.title} (kho còn{" "}
                  {formatNumber(Math.max(0, (v.usageLimit ?? 0) - (v.issuedCount ?? 0) - (v.usedCount ?? 0)))})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.voucherId ? <p className="text-sm text-destructive">{errors.voucherId}</p> : null}
        </div>
      </div>

      {/* Điều kiện bổ sung + Thời gian */}
      <div className="grid gap-6 rounded-xl border border-border bg-card p-6 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Điều kiện bổ sung</h2>
          <div className="space-y-2">
            <Label htmlFor="cam-minorder">Hóa đơn tối thiểu (đ)</Label>
            <Input
              id="cam-minorder"
              type="number"
              min="0"
              value={form.minOrderValue}
              onChange={(e) => setField("minOrderValue", e.target.value)}
              placeholder="Bỏ trống = theo voucher"
              disabled={isReadOnly}
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
                disabled={isReadOnly}
              />
              <span className="text-muted-foreground">—</span>
              <Input
                type="number"
                min="0"
                max="23"
                value={form.timeEnd}
                onChange={(e) => setField("timeEnd", e.target.value)}
                placeholder="16"
                disabled={isReadOnly}
              />
            </div>
            {errors.timeWindow ? <p className="text-sm text-destructive">{errors.timeWindow}</p> : null}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Thời gian áp dụng</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="cam-start">Ngày bắt đầu</Label>
              <Input
                id="cam-start"
                type="date"
                value={form.startDate}
                onChange={(e) => setField("startDate", e.target.value)}
                disabled={isReadOnly}
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
                disabled={isReadOnly}
              />
              {errors.endDate ? <p className="text-sm text-destructive">{errors.endDate}</p> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
