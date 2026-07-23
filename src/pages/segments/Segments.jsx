import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, Trash2, RefreshCw, Eye, Zap } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/useDebounce";
import { formatNumber, formatDate } from "@/helpers/format";
import { ROUTE_PATH } from "@/constants/routePaths";
import { SEGMENT_FIELDS, SEGMENT_MODE } from "@/constants/application";
import { CustomerSegmentApi } from "@/apis";

const ALL = "__all__";

// Tóm tắt tiêu chí AUTO: số nhóm điều kiện + các trường tham gia
function describeCriteria(segment) {
  if (segment?.mode === SEGMENT_MODE.MANUAL) return "Danh sách chọn thủ công";
  const groups = segment?.criteria?.groups || [];
  if (groups.length === 0) return "—";
  const fields = new Set();
  groups.forEach((g) => (g.conditions || []).forEach((c) => fields.add(SEGMENT_FIELDS[c.field]?.label || c.field)));
  const labels = [...fields].slice(0, 3).join(", ");
  const suffix = fields.size > 3 ? "…" : "";
  return `${groups.length} nhóm điều kiện · ${labels}${suffix}`;
}

export default function Segments() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 400);
  const [modeFilter, setModeFilter] = useState(ALL);
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [deleting, setDeleting] = useState(null);

  const goDetail = (id, mode) =>
    navigate(ROUTE_PATH.SEGMENT_DETAIL.replace(":id", id), { state: { mode } });

  const params = useMemo(
    () => ({
      page,
      limit: pageSize,
      ...(search ? { search } : {}),
      ...(modeFilter !== ALL ? { mode: modeFilter } : {}),
      ...(statusFilter !== ALL ? { isActive: statusFilter } : {}),
    }),
    [page, pageSize, search, modeFilter, statusFilter]
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: ["customer-segments", params],
    queryFn: async ({ signal }) => {
      const res = await CustomerSegmentApi.getAll(params, signal);
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Không tải được danh sách nhóm khách hàng.");
      }
      return { list: res.data.data || [], total: res.data.pagination?.total ?? 0 };
    },
    placeholderData: keepPreviousData,
  });

  const syncMutation = useMutation({
    mutationFn: async (id) => {
      const res = await CustomerSegmentApi.sync(id);
      if (!res?.data?.success) throw new Error(res?.data?.message || "Đồng bộ thất bại.");
      return res.data;
    },
    onSuccess: (res) => {
      toast.success(
        `Đồng bộ xong — nhóm hiện có ${formatNumber(res?.data?.memberCount ?? 0)} thành viên.`
      );
      qc.invalidateQueries({ queryKey: ["customer-segments"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const toggleMutation = useMutation({
    mutationFn: async (id) => {
      const res = await CustomerSegmentApi.toggleActive(id);
      if (!res?.data?.success) throw new Error(res?.data?.message || "Đổi trạng thái thất bại.");
      return res.data;
    },
    onSuccess: (res) => {
      toast.success(res?.message || "Đã đổi trạng thái nhóm.");
      qc.invalidateQueries({ queryKey: ["customer-segments"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await CustomerSegmentApi.delete(id);
      if (!res?.data?.success) throw new Error(res?.data?.message || "Xóa nhóm thất bại.");
      return res.data;
    },
    onSuccess: (res) => {
      toast.success(res?.message || "Đã xóa nhóm khách hàng.");
      qc.invalidateQueries({ queryKey: ["customer-segments"] });
      setDeleting(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const columns = [
    {
      key: "name",
      title: "Tên nhóm",
      minWidth: 180,
      render: (s) => (
        <div>
          <p className="font-medium text-foreground">{s.name}</p>
          {s.description ? (
            <p className="text-xs text-muted-foreground">{s.description}</p>
          ) : null}
        </div>
      ),
    },
    {
      key: "mode",
      title: "Loại",
      width: 150,
      render: (s) => (
        <div className="flex items-center gap-1.5">
          <Badge variant={s.mode === SEGMENT_MODE.MANUAL ? "outline" : "secondary"}>
            {s.mode === SEGMENT_MODE.MANUAL ? "Tĩnh" : "Động"}
          </Badge>
          {s.mode === SEGMENT_MODE.AUTO && s.isRealtimeUpdate && (
            <Zap className="size-3.5 text-teal-500" title="Cập nhật realtime" />
          )}
        </div>
      ),
    },
    {
      key: "criteria",
      title: "Tiêu chí",
      minWidth: 200,
      render: (s) => <span className="text-sm text-muted-foreground">{describeCriteria(s)}</span>,
    },
    {
      key: "memberCount",
      title: "Thành viên",
      width: 110,
      align: "right",
      render: (s) => (
        <Badge variant="secondary" className="tabular-nums">
          {formatNumber(s.memberCount ?? 0)}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      title: "Ngày tạo",
      width: 120,
      render: (s) => (s.createdAt ? formatDate(s.createdAt) : "—"),
    },
    {
      key: "lastSyncedAt",
      title: "Đồng bộ lần cuối",
      width: 140,
      render: (s) => (s.lastSyncedAt ? formatDate(s.lastSyncedAt) : "—"),
    },
    {
      key: "isActive",
      title: "Hoạt động",
      width: 90,
      align: "center",
      render: (s) => (
        <Switch
          checked={s.isActive === "active"}
          disabled={toggleMutation.isPending}
          onCheckedChange={() => toggleMutation.mutate(s._id)}
        />
      ),
    },
    {
      key: "actions",
      title: "",
      width: 150,
      align: "right",
      render: (s) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon-sm" title="Xem chi tiết" onClick={() => goDetail(s._id, "view")}>
            <Eye className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            title="Đồng bộ lại"
            disabled={syncMutation.isPending}
            onClick={() => syncMutation.mutate(s._id)}
          >
            <RefreshCw className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" title="Sửa" onClick={() => goDetail(s._id, "edit")}>
            <Pencil className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" title="Xóa" onClick={() => setDeleting(s)}>
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-full flex-col gap-4">
      <PageHeader
        title="Nhóm khách hàng"
        description="Phân cụm khách hàng theo tiêu chí động, dùng làm mục tiêu cho chiến dịch khuyến mãi."
        actions={
          <Button onClick={() => goDetail("new", "create")}>
            <Plus className="size-4" />
            Tạo nhóm
          </Button>
        }
      />

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Select
          value={modeFilter}
          onValueChange={(v) => {
            setModeFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-8 w-36">
            <SelectValue placeholder="Loại nhóm" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Tất cả loại</SelectItem>
            <SelectItem value={SEGMENT_MODE.AUTO}>Động (tự động)</SelectItem>
            <SelectItem value={SEGMENT_MODE.MANUAL}>Tĩnh (thủ công)</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-8 w-36">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Tất cả trạng thái</SelectItem>
            <SelectItem value="active">Hoạt động</SelectItem>
            <SelectItem value="inactive">Tạm ngưng</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm theo tên nhóm..."
            className="h-8 w-56 rounded-md border border-input bg-background pl-8 pr-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-8"
          onClick={() => qc.invalidateQueries({ queryKey: ["customer-segments"] })}
        >
          <RefreshCw className="size-3.5" /> Làm mới
        </Button>
      </div>

      <DataTable
        columns={columns}
        dataSource={data?.list ?? []}
        rowKey="_id"
        loading={isLoading}
        total={data?.total ?? 0}
        pageIndex={page}
        pageSize={pageSize}
        onChange={(p, ps) => {
          setPage(p);
          setPageSize(ps);
        }}
        heightOffset={220}
        empty={isError ? "Không tải được dữ liệu." : "Chưa có nhóm khách hàng nào."}
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(null)}
        title="Xóa nhóm khách hàng"
        description={`Bạn có chắc muốn xóa nhóm "${deleting?.name}"? Nhóm đang được chiến dịch sử dụng sẽ không xóa được.`}
        confirmText="Xóa"
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(deleting._id)}
      />
    </div>
  );
}
