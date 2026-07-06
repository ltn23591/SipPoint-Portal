import { useMemo, useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, Trash2, RefreshCw, Users } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "@/hooks/useDebounce";
import { formatNumber, formatDate } from "@/helpers/format";
import { CustomerSegmentApi } from "@/apis";
import { SegmentFormDialog } from "./SegmentFormDialog";
import { SegmentMembersDialog } from "./SegmentMembersDialog";

function describeCriteria(criteria = {}, tierNames = []) {
  const parts = [];
  if (tierNames.length > 0) parts.push(`Hạng: ${tierNames.join(", ")}`);
  if (criteria.birthdayMonth) parts.push(`Sinh nhật tháng ${criteria.birthdayMonth}`);
  if (criteria.minPoints != null) parts.push(`≥ ${formatNumber(criteria.minPoints)} điểm`);
  if (criteria.minDaysSinceLastVisit != null)
    parts.push(`Chưa ghé ≥ ${criteria.minDaysSinceLastVisit} ngày`);
  if (criteria.maxDaysSinceLastVisit != null)
    parts.push(`Ghé trong ${criteria.maxDaysSinceLastVisit} ngày`);
  return parts.join(" · ") || "—";
}

export default function Segments() {
  const qc = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 400);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [membersFor, setMembersFor] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const params = useMemo(
    () => ({ page, limit: pageSize, ...(search ? { search } : {}) }),
    [page, pageSize, search]
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

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      const res = editing?._id
        ? await CustomerSegmentApi.update(editing._id, payload)
        : await CustomerSegmentApi.create(payload);
      if (!res?.data?.success) throw new Error(res?.data?.message || "Lưu nhóm thất bại.");
      return res.data;
    },
    onSuccess: (res) => {
      toast.success(res?.message || "Đã lưu nhóm khách hàng.");
      qc.invalidateQueries({ queryKey: ["customer-segments"] });
      setFormOpen(false);
      setEditing(null);
    },
    onError: (err) => toast.error(err.message),
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
      key: "criteria",
      title: "Tiêu chí",
      minWidth: 220,
      render: (s) => (
        <span className="text-sm text-muted-foreground">
          {describeCriteria(s.criteria, (s.criteria?.tierIds || []).map((t) => t?.name).filter(Boolean))}
        </span>
      ),
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
      key: "lastSyncedAt",
      title: "Đồng bộ lần cuối",
      width: 140,
      render: (s) => (s.lastSyncedAt ? formatDate(s.lastSyncedAt) : "—"),
    },
    {
      key: "actions",
      title: "",
      width: 150,
      align: "right",
      render: (s) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon-sm" title="Xem thành viên" onClick={() => setMembersFor(s)}>
            <Users className="size-4" />
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
          <Button variant="ghost" size="icon-sm" title="Sửa" onClick={() => { setEditing(s); setFormOpen(true); }}>
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
          <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Plus className="size-4" />
            Tạo nhóm
          </Button>
        }
      />

      <div className="flex items-center justify-end">
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
            className="h-8 w-64 rounded-md border border-input bg-background pl-8 pr-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
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

      <SegmentFormDialog
        open={formOpen}
        onOpenChange={(v) => {
          setFormOpen(v);
          if (!v) setEditing(null);
        }}
        segment={editing}
        loading={saveMutation.isPending}
        onSubmit={(payload) => saveMutation.mutate(payload)}
      />

      <SegmentMembersDialog
        segment={membersFor}
        open={!!membersFor}
        onOpenChange={(v) => !v && setMembersFor(null)}
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
