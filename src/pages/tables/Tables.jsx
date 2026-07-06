import { useMemo, useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, QrCode, Users, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/PageHeader";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TABLE_STATUS_LABEL } from "@/constants/application";
import { ZoneApi, TablesApi } from "@/apis";
import { TableFormDialog } from "./TableFormDialog";
import { QrCodeDialog } from "./QrCodeDialog";

const ALL_ZONES = "__all__";

const TABLE_STATUS_BADGE = {
  available: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  occupied: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  reserved: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  cleaning: "bg-muted text-muted-foreground",
};

export default function Tables() {
  const qc = useQueryClient();
  const [zoneFilter, setZoneFilter] = useState(ALL_ZONES);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [qrFor, setQrFor] = useState(null);

  const { data: zones = [] } = useQuery({
    queryKey: ["zones"],
    queryFn: async () => {
      const res = await ZoneApi.getAll();
      return res?.data?.success ? res.data.data || [] : [];
    },
    staleTime: 5 * 60_000,
  });

  const tablesParams = useMemo(
    () => (zoneFilter !== ALL_ZONES ? { zoneId: zoneFilter } : undefined),
    [zoneFilter]
  );

  const {
    data: tables = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["tables", zoneFilter],
    queryFn: async ({ signal }) => {
      const res = await TablesApi.getAll(tablesParams, signal);
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Không tải được danh sách bàn.");
      }
      return res.data.data || [];
    },
    placeholderData: keepPreviousData,
  });

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      const res = editing?._id
        ? await TablesApi.update(editing._id, payload)
        : await TablesApi.create(payload);
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Lưu bàn thất bại.");
      }
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || (editing?._id ? "Đã cập nhật bàn." : "Đã thêm bàn."));
      qc.invalidateQueries({ queryKey: ["tables"] });
      setFormOpen(false);
      setEditing(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await TablesApi.delete(id);
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Xoá bàn thất bại.");
      }
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Đã xoá bàn.");
      qc.invalidateQueries({ queryKey: ["tables"] });
      setDeleting(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const qrMutation = useMutation({
    mutationFn: async (id) => {
      const res = await TablesApi.generateQR(id);
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Sinh mã QR thất bại.");
      }
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Đã sinh mã QR.");
      qc.invalidateQueries({ queryKey: ["tables"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const qrTable = qrFor ? tables.find((t) => t._id === qrFor._id) || qrFor : null;

  return (
    <div className="flex h-full flex-col gap-4">
      <PageHeader
        title="Bàn & QR"
        description="Quản lý bàn theo khu vực, sinh mã QR cho đặt món."
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Thêm bàn
          </Button>
        }
      />

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Select value={zoneFilter} onValueChange={setZoneFilter}>
          <SelectTrigger className="h-8 w-48">
            <SelectValue placeholder="Khu vực" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_ZONES}>Tất cả khu vực</SelectItem>
            {zones.map((z) => (
              <SelectItem key={z._id} value={z._id}>
                {z.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isError ? (
        <p className="text-sm text-destructive">Không tải được danh sách bàn.</p>
      ) : isLoading ? (
        <p className="text-sm text-muted-foreground">Đang tải...</p>
      ) : tables.length === 0 ? (
        <p className="text-sm text-muted-foreground">Chưa có bàn nào.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {tables.map((t) => (
            <div
              key={t._id}
              className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-foreground">{t.name}</span>
                <Badge className={TABLE_STATUS_BADGE[t.status]}>
                  {TABLE_STATUS_LABEL[t.status] || t.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {t.zoneId?.name || "—"}
              </p>
              <div className="flex items-center justify-between pt-1">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="size-3.5" />
                  {t.capacity ?? 0} chỗ
                </span>
                <div className="flex items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    title="Mã QR"
                    className="text-primary"
                    onClick={() => setQrFor(t)}
                  >
                    <QrCode className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    title="Sửa"
                    onClick={() => {
                      setEditing(t);
                      setFormOpen(true);
                    }}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    title="Xoá"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleting(t)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <TableFormDialog
        open={formOpen}
        onOpenChange={(v) => {
          setFormOpen(v);
          if (!v) setEditing(null);
        }}
        table={editing}
        zones={zones}
        loading={saveMutation.isPending}
        onSubmit={(payload) => saveMutation.mutate(payload)}
      />

      <QrCodeDialog
        open={!!qrFor}
        onOpenChange={(v) => !v && setQrFor(null)}
        table={qrTable}
        loading={qrMutation.isPending}
        onGenerate={() => qrMutation.mutate(qrTable._id)}
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(null)}
        title="Xoá bàn"
        description={
          deleting
            ? `Bạn có chắc muốn xoá "${deleting.name}"? Hành động này không thể hoàn tác.`
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
