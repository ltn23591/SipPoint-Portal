import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/helpers/format";
import {
  ACTIVE_STATUS,
  ACTIVE_STATUS_LABEL,
  DATE_TIME_FORMAT,
} from "@/constants/application";
import { ZoneApi } from "@/apis";
import { ZoneFormDialog } from "./ZoneFormDialog";

const QUERY_KEY = ["zones"];

async function fetchZones() {
  const res = await ZoneApi.getAll();
  if (!res?.data?.success) {
    throw new Error(res?.data?.message || "Không tải được danh sách khu vực.");
  }
  return res.data.data || [];
}

export default function Zones() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const { data: zones = [], isLoading, isError } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchZones,
  });

  const filtered = useMemo(() => {
    if (!search) return zones;
    const q = search.toLowerCase();
    return zones.filter(
      (z) =>
        z.name?.toLowerCase().includes(q) ||
        z.description?.toLowerCase().includes(q)
    );
  }, [zones, search]);

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      const res = editing?._id
        ? await ZoneApi.update(editing._id, payload)
        : await ZoneApi.create(payload);
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Lưu khu vực thất bại.");
      }
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(
        data?.message || (editing?._id ? "Đã cập nhật khu vực." : "Đã thêm khu vực.")
      );
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      setFormOpen(false);
      setEditing(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await ZoneApi.delete(id);
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Xoá khu vực thất bại.");
      }
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Đã xoá khu vực.");
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      setDeleting(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (zone) => {
    setEditing(zone);
    setFormOpen(true);
  };

  const columns = [
    {
      key: "name",
      title: "Tên khu vực",
      minWidth: 180,
      render: (z) => <span className="font-medium text-foreground">{z.name}</span>,
    },
    {
      key: "description",
      title: "Mô tả",
      minWidth: 240,
      render: (z) =>
        z.description || <span className="text-muted-foreground">—</span>,
    },
    {
      key: "isActive",
      title: "Trạng thái",
      width: 150,
      render: (z) =>
        z.isActive === ACTIVE_STATUS.ACTIVE ? (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            {ACTIVE_STATUS_LABEL[ACTIVE_STATUS.ACTIVE]}
          </Badge>
        ) : (
          <Badge variant="secondary">
            {ACTIVE_STATUS_LABEL[z.isActive] || "Ngưng hoạt động"}
          </Badge>
        ),
    },
    {
      key: "createdAt",
      title: "Ngày tạo",
      width: 160,
      render: (z) => formatDate(z.createdAt, DATE_TIME_FORMAT),
    },
    {
      key: "actions",
      title: "",
      width: 90,
      align: "right",
      render: (z) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon-sm" title="Sửa" onClick={() => openEdit(z)}>
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            title="Xoá"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleting(z)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-full flex-col gap-4">
      <PageHeader
        title="Khu vực"
        description="Quản lý khu vực để nhóm các bàn ăn."
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Thêm khu vực
          </Button>
        }
      />

      <div className="flex justify-end">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm theo tên / mô tả..."
            className="h-8 w-64 rounded-md border border-input bg-background pl-8 pr-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        dataSource={paginated}
        rowKey="_id"
        loading={isLoading}
        total={filtered.length}
        pageIndex={page}
        pageSize={pageSize}
        onChange={(p, ps) => {
          setPage(p);
          setPageSize(ps);
        }}
        heightOffset={220}
        empty={isError ? "Không tải được dữ liệu." : "Chưa có khu vực nào."}
      />

      <ZoneFormDialog
        open={formOpen}
        onOpenChange={(v) => {
          setFormOpen(v);
          if (!v) setEditing(null);
        }}
        zone={editing}
        loading={saveMutation.isPending}
        onSubmit={(payload) => saveMutation.mutate(payload)}
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(null)}
        title="Xoá khu vực"
        description={
          deleting
            ? `Bạn có chắc muốn xoá khu vực "${deleting.name}"? Hành động này không thể hoàn tác.`
            : ""
        }
        confirmText="Xoá"
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(deleting._id)}
      />
    </div>
  );
}
