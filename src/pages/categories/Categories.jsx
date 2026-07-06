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
import { CategoryApi } from "@/apis";
import { CategoryFormDialog } from "./CategoryFormDialog";

const QUERY_KEY = ["categories"];

async function fetchCategories() {
  const res = await CategoryApi.getAll();
  if (!res?.data?.success) {
    throw new Error(res?.data?.message || "Không tải được danh sách danh mục.");
  }
  return res.data.data || [];
}

export default function Categories() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchCategories,
  });

  const filtered = useMemo(() => {
    if (!search) return categories;
    const q = search.toLowerCase();
    return categories.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
    );
  }, [categories, search]);

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      const res = editing?._id
        ? await CategoryApi.update(editing._id, payload)
        : await CategoryApi.create(payload);
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Lưu danh mục thất bại.");
      }
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(
        data?.message || (editing?._id ? "Đã cập nhật danh mục." : "Đã thêm danh mục.")
      );
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      setFormOpen(false);
      setEditing(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await CategoryApi.delete(id);
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Xoá danh mục thất bại.");
      }
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Đã xoá danh mục.");
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      setDeleting(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (category) => {
    setEditing(category);
    setFormOpen(true);
  };

  const columns = [
    {
      key: "name",
      title: "Tên danh mục",
      minWidth: 180,
      render: (c) => <span className="font-medium text-foreground">{c.name}</span>,
    },
    {
      key: "description",
      title: "Mô tả",
      minWidth: 240,
      render: (c) =>
        c.description || <span className="text-muted-foreground">—</span>,
    },
    {
      key: "createdAt",
      title: "Ngày tạo",
      width: 160,
      render: (c) => formatDate(c.createdAt, DATE_TIME_FORMAT),
    },
    {
      key: "actions",
      title: "",
      width: 90,
      align: "right",
      render: (c) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            title="Sửa"
            onClick={() => openEdit(c)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            title="Xoá"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleting(c)}
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
        title="Danh mục"
        description="Quản lý danh mục sản phẩm."
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Thêm danh mục
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
        empty="Chưa có danh mục nào."
      />

      <CategoryFormDialog
        open={formOpen}
        onOpenChange={(v) => {
          setFormOpen(v);
          if (!v) setEditing(null);
        }}
        category={editing}
        loading={saveMutation.isPending}
        onSubmit={(payload) => saveMutation.mutate(payload)}
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(null)}
        title="Xoá danh mục"
        description={
          deleting
            ? `Bạn có chắc muốn xoá danh mục "${deleting.name}"? Hành động này không thể hoàn tác.`
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
