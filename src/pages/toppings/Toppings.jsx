import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/helpers/format";
import { DATE_TIME_FORMAT } from "@/constants/application";
import { ToppingApi } from "@/apis";
import { ToppingFormDialog } from "./ToppingFormDialog";

const QUERY_KEY = ["toppings"];

async function fetchToppings() {
  const res = await ToppingApi.getAll();
  if (!res?.data?.success) {
    throw new Error(res?.data?.message || "Không tải được danh sách topping.");
  }
  return res.data.data || [];
}

export default function Toppings() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const { data: toppings = [], isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchToppings,
  });

  const filtered = useMemo(() => {
    if (!search) return toppings;
    const q = search.toLowerCase();
    return toppings.filter(
      (t) =>
        t.name?.toLowerCase().includes(q)
    );
  }, [toppings, search]);

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      const res = editing?._id
        ? await ToppingApi.update(editing._id, payload)
        : await ToppingApi.create(payload);
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Lưu topping thất bại.");
      }
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(
        data?.message || (editing?._id ? "Đã cập nhật topping." : "Đã thêm topping.")
      );
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      setFormOpen(false);
      setEditing(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await ToppingApi.delete(id);
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Xoá topping thất bại.");
      }
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Đã xoá topping.");
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      setDeleting(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (topping) => {
    setEditing(topping);
    setFormOpen(true);
  };

  const columns = [
    {
      key: "name",
      title: "Tên topping",
      minWidth: 180,
      render: (t) => <span className="font-medium text-foreground">{t.name}</span>,
    },
    {
      key: "price",
      title: "Giá (VNĐ)",
      minWidth: 150,
      render: (t) => t.price.toLocaleString("vi-VN") + "đ",
    },
    {
      key: "createdAt",
      title: "Ngày tạo",
      width: 160,
      render: (t) => formatDate(t.createdAt, DATE_TIME_FORMAT),
    },
    {
      key: "actions",
      title: "",
      width: 90,
      align: "right",
      render: (t) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            title="Sửa"
            onClick={() => openEdit(t)}
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
      ),
    },
  ];

  return (
    <div className="flex h-full flex-col gap-4">
      <PageHeader
        title="Topping"
        description="Quản lý danh sách các loại topping."
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Thêm topping
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
            placeholder="Tìm theo tên..."
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
        empty="Chưa có topping nào."
      />

      <ToppingFormDialog
        open={formOpen}
        onOpenChange={(v) => {
          setFormOpen(v);
          if (!v) setEditing(null);
        }}
        topping={editing}
        loading={saveMutation.isPending}
        onSubmit={(payload) => saveMutation.mutate(payload)}
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(null)}
        title="Xoá topping"
        description={
          deleting
            ? `Bạn có chắc muốn xoá topping "${deleting.name}"? Hành động này không thể hoàn tác.`
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
