import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Users, Search, Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/helpers/format";
import { useDebounce } from "@/hooks/useDebounce";
import { ROUTE_PATH } from "@/constants/routePaths";
import {
  SEGMENT_FIELDS,
  SEGMENT_MODE,
  SEGMENT_OPERATOR_LABEL,
  GENDER_LABEL,
} from "@/constants/application";
import { CustomersApi, CustomerSegmentApi, MembershipTierApi } from "@/apis";
import { SegmentRuleBuilder } from "./SegmentRuleBuilder";
import { SegmentPreviewDialog } from "./SegmentPreviewDialog";

const STARTER_GROUP = () => ({ conditions: [{ field: "gender", operator: "eq", value: "male" }] });

function cleanCondition(c) {
  const cfg = SEGMENT_FIELDS[c.field];
  if (!cfg) return null;
  if (cfg.valueType === "number") {
    if (c.operator === "between") {
      const a = c.value?.[0];
      const b = c.value?.[1];
      if (a === "" || b === "" || a == null || b == null) return null;
      return { field: c.field, operator: c.operator, value: [Number(a), Number(b)] };
    }
    if (c.value === "" || c.value == null) return null;
    return { field: c.field, operator: c.operator, value: Number(c.value) };
  }
  if (cfg.valueType === "months" || cfg.valueType === "tier") {
    if (!Array.isArray(c.value) || c.value.length === 0) return null;
    return { field: c.field, operator: c.operator, value: c.value };
  }
  return { field: c.field, operator: c.operator, value: c.value };
}

function cleanGroups(groups) {
  return groups
    .map((g) => ({ conditions: (g.conditions || []).map(cleanCondition).filter(Boolean) }))
    .filter((g) => g.conditions.length > 0);
}

// Diễn giải 1 điều kiện ra chữ (chế độ xem chi tiết)
function describeCondition(c, tiers) {
  const cfg = SEGMENT_FIELDS[c.field];
  if (!cfg) return "";
  const op = SEGMENT_OPERATOR_LABEL[c.operator] || c.operator;
  let val;
  if (cfg.valueType === "enum") val = GENDER_LABEL[c.value] ?? c.value;
  else if (cfg.valueType === "boolean") val = c.value ? "Có" : "Không";
  else if (cfg.valueType === "months") val = `tháng ${(c.value || []).join(", ")}`;
  else if (cfg.valueType === "tier")
    val = (c.value || []).map((id) => tiers.find((t) => t._id === id)?.name || id).join(", ");
  else if (c.operator === "between") val = `${c.value?.[0]} - ${c.value?.[1]}`;
  else val = c.value;
  return `${cfg.label} ${op} ${val}`;
}

export default function SegmentEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();
  const isCreate = !id || id === "new";

  const [mode, setMode] = useState(isCreate ? "create" : location.state?.mode ?? "view");
  const readOnly = mode === "view";

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [segMode, setSegMode] = useState(SEGMENT_MODE.AUTO);
  const [isRealtimeUpdate, setIsRealtimeUpdate] = useState(false);
  const [groups, setGroups] = useState([STARTER_GROUP()]);
  const [selected, setSelected] = useState([]);
  const [errors, setErrors] = useState({});
  const [previewCriteria, setPreviewCriteria] = useState(null);
  const [estimate, setEstimate] = useState(null); // số thành viên ước tính (inline)

  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 400);
  const [pickerPage, setPickerPage] = useState(1);
  const [memberPage, setMemberPage] = useState(1);
  const [memberSearchInput, setMemberSearchInput] = useState("");
  const memberSearch = useDebounce(memberSearchInput, 400);

  // Đơn nhóm đang xem/sửa
  const {
    data: existing,
    isLoading: segLoading,
    isError: segError,
  } = useQuery({
    queryKey: ["customer-segments", id],
    enabled: !isCreate,
    queryFn: async () => {
      const res = await CustomerSegmentApi.getById(id);
      if (!res?.data?.success) throw new Error(res?.data?.message || "Không tải được nhóm.");
      return res.data.data;
    },
  });

  const { data: tiers = [] } = useQuery({
    queryKey: ["membership-tiers-current"],
    queryFn: async () => {
      const res = await MembershipTierApi.getAllCurrent();
      return res?.data?.success ? res.data.data || [] : [];
    },
    staleTime: 5 * 60_000,
  });

  // Nạp form 1 lần khi có dữ liệu
  const seededRef = useRef(false);
  useEffect(() => {
    if (isCreate || !existing || seededRef.current) return;
    seededRef.current = true;
    setName(existing.name ?? "");
    setDescription(existing.description ?? "");
    setSegMode(existing.mode ?? SEGMENT_MODE.AUTO);
    setIsRealtimeUpdate(!!existing.isRealtimeUpdate);
    setGroups(existing.criteria?.groups?.length ? existing.criteria.groups : [STARTER_GROUP()]);
    setSelected((existing.memberIds || []).map((m) => (typeof m === "object" ? m._id : m)));
  }, [existing, isCreate]);

  // Danh sách KH cho chế độ thủ công
  const { data: pickerData } = useQuery({
    queryKey: ["customers-picker", { search, page: pickerPage }],
    enabled: !readOnly && segMode === SEGMENT_MODE.MANUAL,
    queryFn: async ({ signal }) => {
      const res = await CustomersApi.getAll({ page: pickerPage, limit: 10, ...(search ? { search } : {}) }, signal);
      if (!res?.data?.success) return { list: [], total: 0 };
      return { list: res.data.data || [], total: res.data.pagination?.total ?? 0 };
    },
  });

  // Thành viên nhóm (chế độ xem)
  const { data: memberData } = useQuery({
    queryKey: ["segment-members", id, memberPage, memberSearch],
    enabled: readOnly && !isCreate,
    queryFn: async ({ signal }) => {
      const res = await CustomerSegmentApi.getMembers(
        id,
        { page: memberPage, limit: 10, ...(memberSearch ? { search: memberSearch } : {}) },
        signal
      );
      if (!res?.data?.success) return { list: [], total: 0 };
      return { list: res.data.data || [], total: res.data.pagination?.total ?? 0 };
    },
  });

  const cleaned = useMemo(() => cleanGroups(groups), [groups]);

  const toggleCustomer = (cid) =>
    setSelected((prev) => (prev.includes(cid) ? prev.filter((x) => x !== cid) : [...prev, cid]));

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload =
        segMode === SEGMENT_MODE.AUTO
          ? {
              name: name.trim(),
              description: description.trim(),
              mode: segMode,
              isRealtimeUpdate,
              criteria: { groups: cleaned },
            }
          : { name: name.trim(), description: description.trim(), mode: segMode, memberIds: selected };
      const res = isCreate
        ? await CustomerSegmentApi.create(payload)
        : await CustomerSegmentApi.update(id, payload);
      if (!res?.data?.success) throw new Error(res?.data?.message || "Lưu nhóm thất bại.");
      return res.data;
    },
    onSuccess: (res) => {
      toast.success(res?.message || "Đã lưu nhóm khách hàng.");
      qc.invalidateQueries({ queryKey: ["customer-segments"] });
      navigate(ROUTE_PATH.SEGMENTS);
    },
    onError: (err) => toast.error(err.message),
  });

  // Ước tính số thành viên khớp điều kiện (inline)
  const estimateMutation = useMutation({
    mutationFn: async () => {
      const res = await CustomerSegmentApi.preview({ criteria: { groups: cleaned }, page: 1, limit: 1 });
      if (!res?.data?.success) throw new Error(res?.data?.message || "Tính lại thất bại.");
      return res.data.data?.count ?? res.data.pagination?.total ?? 0;
    },
    onSuccess: (count) => setEstimate(count),
    onError: (err) => toast.error(err.message),
  });

  const recalcEstimate = () => {
    if (cleaned.length === 0) {
      setErrors((e) => ({ ...e, criteria: "Thiết lập ít nhất một điều kiện hợp lệ để tính." }));
      return;
    }
    estimateMutation.mutate();
  };

  const openPreviewList = () => {
    if (cleaned.length === 0) {
      setErrors((e) => ({ ...e, criteria: "Thiết lập ít nhất một điều kiện hợp lệ để xem." }));
      return;
    }
    setPreviewCriteria({ groups: cleaned });
  };

  const setGroupsReset = (g) => {
    setGroups(g);
    setEstimate(null); // đổi điều kiện -> ước tính cũ hết hiệu lực
  };

  const handleSave = () => {
    const next = {};
    if (!name.trim()) next.name = "Vui lòng nhập tên nhóm.";
    if (segMode === SEGMENT_MODE.AUTO && cleaned.length === 0)
      next.criteria = "Phải thiết lập ít nhất một điều kiện hợp lệ.";
    if (segMode === SEGMENT_MODE.MANUAL && selected.length === 0)
      next.manual = "Chọn ít nhất một khách hàng.";
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    saveMutation.mutate();
  };

  if (!isCreate && segLoading) {
    return <div className="py-20 text-center text-muted-foreground">Đang tải nhóm...</div>;
  }
  if (!isCreate && (segError || !existing)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p>Không tìm thấy nhóm khách hàng.</p>
        <Button variant="link" onClick={() => navigate(ROUTE_PATH.SEGMENTS)}>
          Quay lại
        </Button>
      </div>
    );
  }

  const title = isCreate
    ? "Tạo nhóm khách hàng"
    : mode === "edit"
      ? `Sửa nhóm: ${existing?.name}`
      : `Nhóm: ${existing?.name}`;

  const pickerList = pickerData?.list ?? [];
  const pickerTotalPages = Math.max(1, Math.ceil((pickerData?.total ?? 0) / 10));
  const memberList = memberData?.list ?? [];
  const memberTotalPages = Math.max(1, Math.ceil((memberData?.total ?? 0) / 10));

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Nhóm khách hàng / {title}</p>
          <h1 className="text-2xl font-semibold">{title}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(ROUTE_PATH.SEGMENTS)}>
            <ArrowLeft className="size-4" /> Quay lại
          </Button>
          {readOnly && (
            <Button onClick={() => setMode("edit")}>
              <Pencil className="size-4" /> Chỉnh sửa
            </Button>
          )}
        </div>
      </div>

      {/* Thông tin chung */}
      <div className="space-y-4 rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Thông tin chung</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="seg-name">
              Tên nhóm {!readOnly && <span className="text-destructive">*</span>}
            </Label>
            {readOnly ? (
              <p className="text-sm font-medium">{existing?.name}</p>
            ) : (
              <>
                <Input
                  id="seg-name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrors((x) => ({ ...x, name: undefined }));
                  }}
                  placeholder="VD: Nữ 18-30"
                  autoFocus
                />
                {errors.name ? <p className="text-sm text-destructive">{errors.name}</p> : null}
              </>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="seg-desc">Mô tả</Label>
            {readOnly ? (
              <p className="text-sm text-muted-foreground">{existing?.description || "—"}</p>
            ) : (
              <Textarea
                id="seg-desc"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Đặt tên và mô tả để dễ nhận diện nhóm này sau."
              />
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">
          {readOnly ? "Điều kiện & thành viên" : "Cấu hình nhóm"}
        </h2>
        {/* Chọn chế độ (radio-card) - chỉ khi sửa/tạo */}
        {!readOnly && (
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              { v: SEGMENT_MODE.AUTO, title: "Bộ lọc tự động", desc: "Hệ thống tự động cập nhật thành viên dựa trên điều kiện" },
              { v: SEGMENT_MODE.MANUAL, title: "Chọn thủ công", desc: "Tìm kiếm và thêm từng thành viên vào nhóm" },
            ].map((opt) => (
              <button
                key={opt.v}
                type="button"
                onClick={() => setSegMode(opt.v)}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                  segMode === opt.v ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border",
                    segMode === opt.v ? "border-primary" : "border-muted-foreground"
                  )}
                >
                  {segMode === opt.v && <span className="size-2 rounded-full bg-primary" />}
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{opt.title}</p>
                  <p className="text-xs text-muted-foreground">{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ── VIEW MODE ── */}
        {readOnly ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant={existing?.mode === SEGMENT_MODE.MANUAL ? "outline" : "secondary"}>
                {existing?.mode === SEGMENT_MODE.MANUAL ? "Thủ công" : "Tự động"}
              </Badge>
              {existing?.isRealtimeUpdate && (
                <Badge className="bg-teal-500/10 text-teal-600 dark:text-teal-400">Realtime</Badge>
              )}
              <span className="text-sm text-muted-foreground">
                {formatNumber(existing?.memberCount ?? 0)} thành viên
              </span>
            </div>

            {existing?.mode === SEGMENT_MODE.AUTO && (
              <div className="space-y-2 rounded-lg border border-border p-3">
                <p className="text-sm font-semibold">Tiêu chí lọc</p>
                {(existing?.criteria?.groups || []).map((g, gi) => (
                  <div key={gi}>
                    {gi > 0 && <div className="my-1 text-xs font-semibold text-amber-600">HOẶC</div>}
                    <div className="rounded-md bg-muted/40 p-2 text-sm">
                      {(g.conditions || []).map((c, ci) => (
                        <span key={ci}>
                          {ci > 0 && <span className="font-semibold text-primary"> VÀ </span>}
                          {describeCondition(c, tiers)}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Danh sách thành viên */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Thành viên</p>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={memberSearchInput}
                    onChange={(e) => {
                      setMemberSearchInput(e.target.value);
                      setMemberPage(1);
                    }}
                    placeholder="Tìm tên / SĐT / email..."
                    className="h-8 w-56 rounded-md border border-input bg-background pl-8 pr-3 text-sm"
                  />
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Họ tên</TableHead>
                    <TableHead>SĐT</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Giới tính</TableHead>
                    <TableHead>Hạng</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {memberList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-6 text-center text-muted-foreground">
                        Chưa có thành viên.
                      </TableCell>
                    </TableRow>
                  ) : (
                    memberList.map((m) => (
                      <TableRow key={m._id}>
                        <TableCell className="font-medium text-foreground">{m.fullName}</TableCell>
                        <TableCell>{m.phone || "—"}</TableCell>
                        <TableCell className="text-muted-foreground">{m.email || "—"}</TableCell>
                        <TableCell>{GENDER_LABEL[m.gender] || "—"}</TableCell>
                        <TableCell>{m.tierId?.name || "—"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {memberTotalPages > 1 && (
                <div className="flex items-center justify-end gap-2">
                  <Button variant="outline" size="sm" disabled={memberPage <= 1} onClick={() => setMemberPage((p) => p - 1)}>
                    Trước
                  </Button>
                  <span className="text-sm text-muted-foreground">{memberPage}/{memberTotalPages}</span>
                  <Button variant="outline" size="sm" disabled={memberPage >= memberTotalPages} onClick={() => setMemberPage((p) => p + 1)}>
                    Sau
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : segMode === SEGMENT_MODE.AUTO ? (
          /* ── AUTO EDIT ── */
          <div className="space-y-3">
            {/* Card: cập nhật realtime */}
            <label className="flex items-start gap-3 rounded-lg border border-border p-3">
              <Checkbox
                className="mt-0.5"
                checked={isRealtimeUpdate}
                onCheckedChange={(v) => setIsRealtimeUpdate(!!v)}
              />
              <div>
                <p className="text-sm font-semibold text-foreground">Cập nhật nhóm realtime</p>
                <p className="text-xs text-muted-foreground">
                  Tự động cập nhật thành viên ngay khi có đơn/đổi quà (thay vì chờ đồng bộ hằng ngày).
                </p>
              </div>
            </label>

            {/* Ước tính thành viên inline */}
            <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm">
              <span className="text-muted-foreground">
                Ước tính thành viên khớp điều kiện:{" "}
                {estimate != null ? (
                  <button
                    type="button"
                    className="font-semibold text-primary underline-offset-2 hover:underline"
                    onClick={openPreviewList}
                  >
                    {formatNumber(estimate)} người
                  </button>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={recalcEstimate}
                disabled={estimateMutation.isPending}
              >
                <Users className="size-3.5" /> Tính lại
              </Button>
            </div>

            <SegmentRuleBuilder groups={groups} onChange={setGroupsReset} tiers={tiers} />
            {errors.criteria ? <p className="text-sm text-destructive">{errors.criteria}</p> : null}
          </div>
        ) : (
          /* ── MANUAL EDIT ── */
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Đã chọn {formatNumber(selected.length)} khách hàng</span>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setPickerPage(1);
                  }}
                  placeholder="Tìm tên / SĐT..."
                  className="h-8 w-52 rounded-md border border-input bg-background pl-8 pr-3 text-sm"
                />
              </div>
            </div>
            <div className="divide-y divide-border rounded-lg border border-border">
              {pickerList.length === 0 ? (
                <p className="p-4 text-center text-sm text-muted-foreground">Không có khách hàng.</p>
              ) : (
                pickerList.map((c) => (
                  <label key={c._id} className="flex items-center gap-3 p-2.5 text-sm">
                    <Checkbox checked={selected.includes(c._id)} onCheckedChange={() => toggleCustomer(c._id)} />
                    <span className="flex-1 font-medium text-foreground">{c.fullName}</span>
                    <span className="w-28 text-muted-foreground">{c.phone || "—"}</span>
                    <span className="w-40 truncate text-muted-foreground">{c.email || "—"}</span>
                    <span className="w-16 text-right text-xs">{c.tierId?.name || "—"}</span>
                  </label>
                ))
              )}
            </div>
            {pickerTotalPages > 1 && (
              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" size="sm" disabled={pickerPage <= 1} onClick={() => setPickerPage((p) => p - 1)}>
                  Trước
                </Button>
                <span className="text-sm text-muted-foreground">{pickerPage}/{pickerTotalPages}</span>
                <Button variant="outline" size="sm" disabled={pickerPage >= pickerTotalPages} onClick={() => setPickerPage((p) => p + 1)}>
                  Sau
                </Button>
              </div>
            )}
            {errors.manual ? <p className="text-sm text-destructive">{errors.manual}</p> : null}
          </div>
        )}
      </div>

      {/* Footer actions */}
      {!readOnly && (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            disabled={saveMutation.isPending}
            onClick={() => (mode === "edit" ? setMode("view") : navigate(ROUTE_PATH.SEGMENTS))}
          >
            Huỷ
          </Button>
          <Button onClick={handleSave} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            {isCreate ? "Tạo nhóm" : "Lưu thay đổi"}
          </Button>
        </div>
      )}

      <SegmentPreviewDialog
        open={!!previewCriteria}
        onOpenChange={(v) => !v && setPreviewCriteria(null)}
        criteria={previewCriteria}
      />
    </div>
  );
}
