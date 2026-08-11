import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Plus, Trash2, Upload, Users } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROUTE_PATH } from "@/constants/routePaths";
import { GAME_REWARD_TYPE, GAME_REWARD_TYPE_LABEL, GAME_STATUS, GAME_STATUS_LABEL } from "@/constants/application";
import { GameApi, VoucherApi, CustomerSegmentApi, UploadApi } from "@/apis";
import { SegmentPickerDialog } from "./SegmentPickerDialog";

const toDateInput = (v) => (v ? String(v).slice(0, 10) : "");
const uid = () => `${Date.now()}-${Math.round(Math.random() * 1e6)}`;

const newReward = (overrides = {}) => ({
  key: uid(),
  displayName: "",
  type: GAME_REWARD_TYPE.VOUCHER,
  voucherId: "",
  rewardValue: "",
  message: "",
  totalReward: "",
  quantity: 1,
  isDefault: false,
  allowManyTimes: false,
  ...overrides,
});

const newDist = () => ({
  key: uid(),
  rewardIndex: "",
  segmentId: "",
  rate: "",
  maxQuantity: "",
  dateFrom: "",
  dateTo: "",
  allowManyTimes: false,
});

export default function GameForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();
  // Nhân bản: dữ liệu game nguồn được điều hướng kèm theo (xem LuckyWheel.jsx), dùng để
  // tiền điền y hệt màn hình tạo mới, cho phép setup lại trước khi lưu.
  const cloneFrom = !isEdit ? location.state?.cloneFrom : null;

  const [form, setForm] = useState({
    name: "",
    description: "",
    backgroundUrl: "",
    gameUrl: "",
    content: "",
    startDate: "",
    endDate: "",
    timeFrom: "",
    timeTo: "",
    defaultTurnCount: "",
    dailyEnabled: false,
    dailyQuantity: 1,
    isExchangeTurnEnabled: false,
    turnRewardAmount: "",
    appliedSegmentIds: [],
    publishNow: false,
  });
  const [rewards, setRewards] = useState([newReward({ isDefault: false })]);
  const [distributions, setDistributions] = useState([]);
  const [segPickerOpen, setSegPickerOpen] = useState(false);
  const [uploading, setUploading] = useState({ bg: false, wheel: false });
  const bgRef = useRef(null);
  const wheelRef = useRef(null);

  // Options
  const { data: vouchers = [] } = useQuery({
    queryKey: ["voucher-options"],
    queryFn: async () => {
      const res = await VoucherApi.getAll();
      return res?.data?.success ? res.data.data || [] : [];
    },
  });
  const { data: segments = [] } = useQuery({
    queryKey: ["segment-options"],
    queryFn: async () => {
      const res = await CustomerSegmentApi.getAll({ page: 1, limit: 100 });
      return res?.data?.success ? res.data.data || [] : [];
    },
  });

  // Load khi sửa
  const { data: queryDetail } = useQuery({
    queryKey: ["game-detail", id],
    enabled: isEdit,
    queryFn: async () => {
      const res = await GameApi.getById(id);
      if (!res?.data?.success) throw new Error(res?.data?.message || "Không tải được trò chơi.");
      return res.data.data;
    },
  });
  // Khi sửa: dữ liệu tải từ API. Khi nhân bản: dữ liệu game nguồn truyền qua điều hướng.
  const detail = isEdit ? queryDetail : cloneFrom;

  // Trò chơi đang chạy (đã xuất bản/tạm dừng): chỉ cho sửa nội dung hiển thị, không đụng
  // tới ô thưởng/tỉ lệ phân bổ/nhóm áp dụng vì ảnh hưởng công bằng đang chơi.
  const isRunningEdit = isEdit && (detail?.status === GAME_STATUS.PUBLISHED || detail?.status === GAME_STATUS.PAUSED);
  const isTerminalEdit = isEdit && (detail?.status === GAME_STATUS.EXPIRED || detail?.status === GAME_STATUS.CANCELLED);
  const lockConfig = isRunningEdit || isTerminalEdit; // khoá ô thưởng/tỉ lệ/nhóm/số lượt
  const lockContent = isTerminalEdit; // khoá cả nội dung hiển thị

  useEffect(() => {
    if (!detail) return;
    const rw = (detail.rewards || [])
      .slice()
      .sort((a, b) => a.index - b.index)
      .map((r) =>
        newReward({
          key: r._id || uid(),
          _id: r._id,
          displayName: r.displayName ?? "",
          type: r.type,
          voucherId: (typeof r.voucherId === "object" ? r.voucherId?._id : r.voucherId) ?? "",
          rewardValue: r.rewardValue ?? "",
          message: r.message ?? "",
          totalReward: r.totalReward ?? "",
          quantity: r.quantity ?? 1,
          isDefault: !!r.isDefault,
          allowManyTimes: !!r.allowManyTimes,
        })
      );
    // map gameRewardId -> vị trí trong mảng rewards
    const idToIndex = {};
    rw.forEach((r, i) => { if (r._id) idToIndex[String(r._id)] = i; });
    const dist = (detail.distributions || []).map((d) =>
      Object.assign(newDist(), {
        rewardIndex: idToIndex[String(typeof d.gameRewardId === "object" ? d.gameRewardId?._id : d.gameRewardId)] ?? "",
        segmentId: (typeof d.segmentId === "object" ? d.segmentId?._id : d.segmentId) ?? "",
        rate: d.rate ?? "",
        maxQuantity: d.maxQuantity ?? "",
        dateFrom: toDateInput(d.dateFrom),
        dateTo: toDateInput(d.dateTo),
        allowManyTimes: !!d.allowManyTimes,
      })
    );
    const daily = (detail.activityConfigs || []).find((c) => c.activityType === "DAILY_CHECKIN");
    /* eslint-disable react-hooks/set-state-in-effect */
    setForm({
      name: detail.name ? (isEdit ? detail.name : `${detail.name} (sao chép)`) : "",
      description: detail.description ?? "",
      backgroundUrl: detail.backgroundUrl ?? "",
      gameUrl: detail.gameUrl ?? "",
      content: detail.content ?? "",
      startDate: toDateInput(detail.startDate),
      endDate: toDateInput(detail.endDate),
      timeFrom: detail.timeFrom ?? "",
      timeTo: detail.timeTo ?? "",
      defaultTurnCount: detail.defaultTurnCount ?? "",
      dailyEnabled: !!daily,
      dailyQuantity: daily?.turnQuantity ?? 1,
      isExchangeTurnEnabled: !!detail.isExchangeTurnEnabled,
      turnRewardAmount: detail.turnRewardAmount ?? "",
      appliedSegmentIds: (detail.appliedSegmentIds || []).map((s) => (typeof s === "object" ? s._id : s)),
      publishNow: false,
    });
    setRewards(rw.length ? rw : [newReward()]);
    setDistributions(dist);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [detail, isEdit]);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setReward = (key, patch) =>
    setRewards((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const setDist = (key, patch) =>
    setDistributions((prev) => prev.map((d) => (d.key === key ? { ...d, ...patch } : d)));

  // Chọn ô mặc định: chỉ 1 ô, ép MESSAGE + allowManyTimes
  const chooseDefault = (key) =>
    setRewards((prev) =>
      prev.map((r) =>
        r.key === key
          ? { ...r, isDefault: true, type: GAME_REWARD_TYPE.MESSAGE, allowManyTimes: true }
          : { ...r, isDefault: false }
      )
    );

  const segmentName = (segId) => segments.find((s) => s._id === segId)?.name || segId;
  const appliedSegments = useMemo(
    () =>
      form.appliedSegmentIds.map((sid) => ({
        id: sid,
        name: segments.find((s) => s._id === sid)?.name || sid,
      })),
    [form.appliedSegmentIds, segments]
  );

  const uploadImage = async (file, field) => {
    if (!file) return;
    const key = field === "backgroundUrl" ? "bg" : "wheel";
    setUploading((u) => ({ ...u, [key]: true }));
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "games");
      const res = await UploadApi.cloudinaryFile(fd);
      const url = res?.data?.data?.secure_url;
      if (url) setField(field, url);
      else toast.error("Tải ảnh thất bại.");
    } catch {
      toast.error("Tải ảnh thất bại.");
    } finally {
      setUploading((u) => ({ ...u, [key]: false }));
    }
  };

  const buildPayload = () => {
    const displayFields = {
      description: form.description.trim() || undefined,
      backgroundUrl: form.backgroundUrl || undefined,
      gameUrl: form.gameUrl || undefined,
      content: form.content || undefined,
      startDate: form.startDate || undefined,
      endDate: form.endDate,
      timeFrom: form.timeFrom || undefined,
      timeTo: form.timeTo || undefined,
    };
    // Trò chơi đang chạy: chỉ gửi các trường nội dung hiển thị, không đụng tới cấu hình
    // ảnh hưởng vận hành/công bằng đang chơi (BE cũng chặn nếu gửi kèm các trường đó).
    if (isRunningEdit) return displayFields;

    return {
      name: form.name.trim(),
      ...displayFields,
      defaultTurnCount: Number(form.defaultTurnCount) || 0,
      isExchangeTurnEnabled: form.isExchangeTurnEnabled,
      turnRewardAmount: form.isExchangeTurnEnabled ? Number(form.turnRewardAmount) || 0 : undefined,
      appliedSegmentIds: form.appliedSegmentIds,
      rewards: rewards.map((r) => ({
        displayName: r.displayName.trim(),
        type: r.type,
        voucherId: r.type === GAME_REWARD_TYPE.VOUCHER ? r.voucherId || undefined : undefined,
        rewardValue: r.type === GAME_REWARD_TYPE.POINTS ? Number(r.rewardValue) || 0 : undefined,
        message: r.type === GAME_REWARD_TYPE.MESSAGE ? r.message : undefined,
        totalReward: Number(r.totalReward) || 0,
        quantity: Number(r.quantity) || 1,
        isDefault: !!r.isDefault,
        allowManyTimes: !!r.allowManyTimes,
      })),
      distributions: distributions
        .filter((d) => d.segmentId && d.rewardIndex !== "")
        .map((d) => ({
          gameRewardIndex: Number(d.rewardIndex),
          segmentId: d.segmentId,
          rate: Number(d.rate) || 0,
          maxQuantity: Number(d.maxQuantity) || 0,
          dateFrom: d.dateFrom || undefined,
          dateTo: d.dateTo || undefined,
          allowManyTimes: !!d.allowManyTimes,
        })),
      activityConfigs: form.dailyEnabled
        ? [{ activityType: "DAILY_CHECKIN", turnQuantity: Number(form.dailyQuantity) || 1, isActive: true }]
        : [],
    };
  };

  const validate = () => {
    if (!form.endDate) return "Vui lòng chọn ngày kết thúc.";
    if (form.startDate && form.startDate >= form.endDate) return "Ngày kết thúc phải sau ngày bắt đầu.";
    if (isRunningEdit) return null;
    if (!form.name.trim()) return "Vui lòng nhập tên trò chơi.";
    if (form.isExchangeTurnEnabled && !(Number(form.turnRewardAmount) > 0)) {
      return "Vui lòng nhập số điểm cần để đổi 1 lượt chơi.";
    }
    if (rewards.length === 0) return "Cần ít nhất một ô phần thưởng.";
    const defaults = rewards.filter((r) => r.isDefault);
    if (defaults.length !== 1) return "Phải có đúng một ô mặc định (lời chúc).";
    for (const r of rewards) {
      if (!r.displayName.trim()) return "Mỗi ô phải có tên hiển thị.";
      if (r.type === GAME_REWARD_TYPE.VOUCHER && !r.voucherId) return `Ô "${r.displayName}" chưa chọn quà tặng.`;
      if (r.type === GAME_REWARD_TYPE.POINTS && !(Number(r.rewardValue) > 0)) return `Ô "${r.displayName}" chưa nhập số xu.`;
    }
    return null;
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = buildPayload();
      const res = isEdit ? await GameApi.update(id, payload) : await GameApi.create(payload);
      if (!res?.data?.success) throw new Error(res?.data?.message || "Lưu trò chơi thất bại.");
      const saved = res.data.data;
      if (form.publishNow && saved?._id) {
        const pub = await GameApi.publish(saved._id);
        if (!pub?.data?.success) {
          // Đã lưu nháp nhưng xuất bản lỗi -> báo cảnh báo, không coi là thất bại
          toast.warning(pub?.data?.message || "Đã lưu nháp nhưng chưa xuất bản được.");
        }
      }
      return res.data;
    },
    onSuccess: (res) => {
      toast.success(res?.message || "Đã lưu trò chơi.");
      qc.invalidateQueries({ queryKey: ["games"] });
      navigate(ROUTE_PATH.LUCKY_WHEEL);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSave = () => {
    const msg = validate();
    if (msg) {
      toast.error(msg);
      return;
    }
    saveMutation.mutate();
  };

  const loading = saveMutation.isPending;

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">
            Trò chơi may mắn / {isEdit ? "Sửa trò chơi" : "Thêm trò chơi"}
          </p>
          <h1 className="text-2xl font-semibold">{isEdit ? "Sửa trò chơi" : "Thêm trò chơi"}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(ROUTE_PATH.LUCKY_WHEEL)} disabled={loading}>
            <ArrowLeft className="size-4" /> Quay lại
          </Button>
          {!lockContent && (
            <Button onClick={handleSave} disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : null} Lưu
            </Button>
          )}
        </div>
      </div>

      {isRunningEdit && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
          Trò chơi đang {GAME_STATUS_LABEL[detail?.status]?.toLowerCase()}: chỉ có thể chỉnh sửa mô tả, thể lệ, ngày/giờ áp dụng
          và hình ảnh. Ô thưởng, tỉ lệ phân bổ, nhóm khách hàng và số lượt chơi đã bị khoá để đảm bảo công bằng.
        </div>
      )}
      {isTerminalEdit && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          Trò chơi đã {GAME_STATUS_LABEL[detail?.status]?.toLowerCase()}, không thể chỉnh sửa.
        </div>
      )}

      {/* Thông tin chung */}
      <div className="grid gap-6 rounded-xl border border-border bg-card p-6 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Thông tin chung</h2>
          <div className="space-y-2">
            <Label>Tên trò chơi <span className="text-destructive">*</span></Label>
            <Input value={form.name} disabled={lockConfig} onChange={(e) => setField("name", e.target.value)} placeholder="Nhập tên trò chơi" />
          </div>
          <div className="space-y-2">
            <Label>Mô tả</Label>
            <Textarea value={form.description} disabled={lockContent} onChange={(e) => setField("description", e.target.value)} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Loại trò chơi</Label>
              <Input value="Trò chơi may mắn" disabled />
            </div>
            <div className="space-y-2">
              <Label>Giao diện</Label>
              <Input value="Cơ bản" disabled />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Ngày bắt đầu</Label>
              <Input type="date" value={form.startDate} disabled={lockContent} onChange={(e) => setField("startDate", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Ngày kết thúc <span className="text-destructive">*</span></Label>
              <Input type="date" value={form.endDate} disabled={lockContent} onChange={(e) => setField("endDate", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Giờ bắt đầu</Label>
              <Input type="time" value={form.timeFrom} disabled={lockContent} onChange={(e) => setField("timeFrom", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Giờ kết thúc</Label>
              <Input type="time" value={form.timeTo} disabled={lockContent} onChange={(e) => setField("timeTo", e.target.value)} />
            </div>
          </div>
          {!isEdit && (
            <div className="flex items-center gap-3">
              <Switch checked={form.publishNow} onCheckedChange={(v) => setField("publishNow", v)} />
              <span className="text-sm">Xuất bản ngay sau khi lưu</span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <ImagePicker
              label="Hình ảnh"
              url={form.backgroundUrl}
              uploading={uploading.bg}
              disabled={lockContent}
              inputRef={bgRef}
              onPick={(f) => uploadImage(f, "backgroundUrl")}
            />
            <ImagePicker
              label="Hình ảnh vòng xoay"
              url={form.gameUrl}
              uploading={uploading.wheel}
              disabled={lockContent}
              inputRef={wheelRef}
              onPick={(f) => uploadImage(f, "gameUrl")}
            />
          </div>
          <div className="space-y-2">
            <Label>Thông tin chi tiết (thể lệ)</Label>
            <Textarea value={form.content} disabled={lockContent} onChange={(e) => setField("content", e.target.value)} rows={8} placeholder="Thể lệ trò chơi..." />
          </div>
        </div>
      </div>

      {/* Quy định + Nhóm KH */}
      <div className="grid gap-6 rounded-xl border border-border bg-card p-6 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Quy định trò chơi</h2>
          <div className="space-y-2">
            <Label>Số lượt chơi mặc định <span className="text-destructive">*</span></Label>
            <Input type="number" min="0" value={form.defaultTurnCount} disabled={lockConfig} onChange={(e) => setField("defaultTurnCount", e.target.value)} />
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={form.dailyEnabled} disabled={lockConfig} onCheckedChange={(v) => setField("dailyEnabled", v)} />
            <span className="text-sm">Tặng thêm lượt miễn phí mỗi ngày (điểm danh)</span>
          </div>
          {form.dailyEnabled && (
            <div className="space-y-2">
              <Label>Số lượt tặng mỗi ngày</Label>
              <Input type="number" min="1" value={form.dailyQuantity} disabled={lockConfig} onChange={(e) => setField("dailyQuantity", e.target.value)} />
            </div>
          )}
          <div className="flex items-center gap-3">
            <Switch checked={form.isExchangeTurnEnabled} disabled={lockConfig} onCheckedChange={(v) => setField("isExchangeTurnEnabled", v)} />
            <span className="text-sm">Cho phép dùng điểm mua lượt quay</span>
          </div>
          {form.isExchangeTurnEnabled && (
            <div className="space-y-2">
              <Label>Số điểm cho 1 lượt <span className="text-destructive">*</span></Label>
              <Input type="number" min="1" value={form.turnRewardAmount} disabled={lockConfig} onChange={(e) => setField("turnRewardAmount", e.target.value)} />
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Nhóm khách hàng áp dụng</h2>
            <Button type="button" variant="outline" size="sm" disabled={lockConfig} onClick={() => setSegPickerOpen(true)}>
              <Users className="size-4" /> Thêm nhóm khách hàng
            </Button>
          </div>
          {appliedSegments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa chọn nhóm (để trống = áp dụng tất cả khách).</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {appliedSegments.map((s) => (
                <span key={s.id} className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm">
                  {s.name}
                  {!lockConfig && (
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => setField("appliedSegmentIds", form.appliedSegmentIds.filter((x) => x !== s.id))}
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ô phần thưởng */}
      <div className="space-y-3 rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Ô phần thưởng</h2>
        {rewards.map((r, i) => (
          <div key={r.key} className="rounded-lg border border-border p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-medium">Ô {i + 1}</span>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 text-sm">
                  <input type="radio" name="defaultReward" checked={r.isDefault} disabled={lockConfig} onChange={() => chooseDefault(r.key)} />
                  Ô mặc định
                </label>
                <label className="flex items-center gap-1.5 text-sm">
                  <Checkbox
                    checked={r.allowManyTimes}
                    disabled={lockConfig || r.isDefault}
                    onCheckedChange={(v) => setReward(r.key, { allowManyTimes: !!v })}
                  />
                  Trúng nhiều lần
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive"
                  disabled={lockConfig || rewards.length === 1}
                  onClick={() => setRewards((prev) => prev.filter((x) => x.key !== r.key))}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Tên hiển thị <span className="text-destructive">*</span></Label>
                <Input value={r.displayName} disabled={lockConfig} onChange={(e) => setReward(r.key, { displayName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Tổng phần thưởng</Label>
                <Input type="number" min="0" value={r.totalReward} disabled={lockConfig} onChange={(e) => setReward(r.key, { totalReward: e.target.value })} />
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-4">
              {Object.entries(GAME_REWARD_TYPE_LABEL).map(([value, label]) => (
                <label key={value} className="flex items-center gap-1.5 text-sm">
                  <input
                    type="radio"
                    name={`type-${r.key}`}
                    checked={r.type === value}
                    disabled={lockConfig || r.isDefault}
                    onChange={() => setReward(r.key, { type: value })}
                  />
                  {label}
                </label>
              ))}
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {r.type === GAME_REWARD_TYPE.VOUCHER && (
                <>
                  <div className="space-y-2">
                    <Label>Quà tặng (voucher)</Label>
                    <Select value={r.voucherId} disabled={lockConfig} onValueChange={(v) => setReward(r.key, { voucherId: v })}>
                      <SelectTrigger><SelectValue placeholder="Chọn voucher" /></SelectTrigger>
                      <SelectContent>
                        {vouchers.map((v) => (
                          <SelectItem key={v._id} value={v._id}>{v.code} — {v.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Số lượng tặng</Label>
                    <Input type="number" min="1" value={r.quantity} disabled={lockConfig} onChange={(e) => setReward(r.key, { quantity: e.target.value })} />
                  </div>
                </>
              )}
              {r.type === GAME_REWARD_TYPE.POINTS && (
                <div className="space-y-2">
                  <Label>Số xu (điểm)</Label>
                  <Input type="number" min="1" value={r.rewardValue} disabled={lockConfig} onChange={(e) => setReward(r.key, { rewardValue: e.target.value })} />
                </div>
              )}
              {r.type === GAME_REWARD_TYPE.MESSAGE && (
                <div className="space-y-2 md:col-span-2">
                  <Label>Lời chúc</Label>
                  <Input value={r.message} disabled={lockConfig} onChange={(e) => setReward(r.key, { message: e.target.value })} placeholder="VD: Chúc bạn may mắn lần sau!" />
                </div>
              )}
            </div>
          </div>
        ))}
        {!lockConfig && (
          <Button type="button" variant="outline" className="w-full" onClick={() => setRewards((prev) => [...prev, newReward()])}>
            <Plus className="size-4" /> Thêm ô phần thưởng
          </Button>
        )}
      </div>

      {/* Phân bổ tỉ lệ trúng */}
      <div className="space-y-3 rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Phân bổ tỉ lệ trúng</h2>
        <p className="text-xs text-muted-foreground">
          Chia tỉ lệ trúng theo nhóm khách hàng. Bỏ trống toàn bộ = quay theo kho (weighted). Nhóm phải nằm trong danh sách áp dụng ở trên.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-2">Tên nhóm</th>
                <th className="p-2">Phần thưởng</th>
                <th className="p-2 w-24">Tỉ lệ %</th>
                <th className="p-2 w-28">SL tối đa</th>
                <th className="p-2">Ngày hiệu lực</th>
                <th className="p-2 w-16 text-center">Nhiều lần</th>
                <th className="p-2 w-12" />
              </tr>
            </thead>
            <tbody>
              {distributions.length === 0 ? (
                <tr><td colSpan={7} className="p-3 text-center text-muted-foreground">Chưa có dòng phân bổ.</td></tr>
              ) : (
                distributions.map((d) => (
                  <tr key={d.key} className="border-t border-border">
                    <td className="p-2 min-w-40">
                      <Select value={d.segmentId} disabled={lockConfig} onValueChange={(v) => setDist(d.key, { segmentId: v })}>
                        <SelectTrigger><SelectValue placeholder="Chọn nhóm" /></SelectTrigger>
                        <SelectContent>
                          {form.appliedSegmentIds.length === 0 ? (
                            <div className="px-2 py-1.5 text-xs text-muted-foreground">Chọn nhóm áp dụng trước</div>
                          ) : (
                            form.appliedSegmentIds.map((sid) => (
                              <SelectItem key={sid} value={sid}>{segmentName(sid)}</SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-2 min-w-40">
                      <Select value={String(d.rewardIndex)} disabled={lockConfig} onValueChange={(v) => setDist(d.key, { rewardIndex: v })}>
                        <SelectTrigger><SelectValue placeholder="Chọn ô" /></SelectTrigger>
                        <SelectContent>
                          {rewards.map((r, i) =>
                            r.isDefault ? null : (
                              <SelectItem key={r.key} value={String(i)}>
                                Ô {i + 1}: {r.displayName || "(chưa đặt tên)"}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-2"><Input type="number" min="0" max="100" value={d.rate} disabled={lockConfig} onChange={(e) => setDist(d.key, { rate: e.target.value })} /></td>
                    <td className="p-2"><Input type="number" min="0" value={d.maxQuantity} disabled={lockConfig} onChange={(e) => setDist(d.key, { maxQuantity: e.target.value })} /></td>
                    <td className="p-2">
                      <div className="flex items-center gap-1">
                        <Input type="date" value={d.dateFrom} disabled={lockConfig} onChange={(e) => setDist(d.key, { dateFrom: e.target.value })} />
                        <span>→</span>
                        <Input type="date" value={d.dateTo} disabled={lockConfig} onChange={(e) => setDist(d.key, { dateTo: e.target.value })} />
                      </div>
                    </td>
                    <td className="p-2 text-center">
                      <Checkbox checked={d.allowManyTimes} disabled={lockConfig} onCheckedChange={(v) => setDist(d.key, { allowManyTimes: !!v })} />
                    </td>
                    <td className="p-2">
                      <Button type="button" variant="ghost" size="icon-sm" className="text-destructive" disabled={lockConfig} onClick={() => setDistributions((prev) => prev.filter((x) => x.key !== d.key))}>
                        <Trash2 className="size-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!lockConfig && (
          <Button type="button" variant="outline" className="w-full" onClick={() => setDistributions((prev) => [...prev, newDist()])}>
            <Plus className="size-4" /> Thêm dòng
          </Button>
        )}
      </div>

      <SegmentPickerDialog
        open={segPickerOpen}
        onOpenChange={setSegPickerOpen}
        value={form.appliedSegmentIds}
        onConfirm={(ids) => setField("appliedSegmentIds", ids)}
      />
    </div>
  );
}

function ImagePicker({ label, url, uploading, inputRef, onPick, disabled = false }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-muted/30 hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {uploading ? (
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        ) : url ? (
          <img src={url} alt={label} className="h-full w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <Upload className="size-6" />
            <span className="text-xs">Chọn file</span>
          </div>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onPick(e.target.files?.[0])}
      />
    </div>
  );
}
