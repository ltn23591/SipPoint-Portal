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
import { DATE_TIME_FORMAT } from "@/constants/application";
import { EmployeeApi, StaffRoleApi } from "@/apis";
import { EmployeeFormDialog } from "./EmployeeFormDialog";

const QUERY_KEY = ["employees"];

const STATUS_BADGE = {
  active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  inactive: "bg-muted text-muted-foreground",
  locked: "bg-destructive/10 text-destructive",
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};
const STATUS_LABEL = {
  active: "Đang hoạt động",
  inactive: "Ngưng hoạt động",
  locked: "Đã khoá",
  pending: "Chờ kích hoạt",
};

async function fetchEmployees() {
  const res = await EmployeeApi.getAll();
  if (!res?.data?.success) {
    throw new Error(res?.data?.message || "Không tải được danh sách nhân viên.");
  }
  return res.data.data || [];
}

export default function Staff() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const { data: employees = [], isLoading, isError } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchEmployees,
  });

  const { data: roles = [] } = useQuery({
    queryKey: ["staff-roles"],
    queryFn: async () => {
      const res = await StaffRoleApi.all();
      return res?.data?.success ? res.data.data || [] : [];
    },
    staleTime: 5 * 60_000,
  });

  const roleNameByCode = useMemo(() => {
    const map = {};
    roles.forEach((r) => {
      if (r.code) map[r.code] = r.name;
    });
    return map;
  }, [roles]);

  const filtered = useMemo(() => {
    if (!search) return employees;
    const q = search.toLowerCase();
    return employees.filter(
      (e) =>
        e.name?.toLowerCase().includes(q) || e.email?.toLowerCase().includes(q)
    );
  }, [employees, search]);

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      const res = editing?._id
        ? await EmployeeApi.update(editing._id, payload)
        : await EmployeeApi.create(payload);
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Lưu nhân viên thất bại.");
      }
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(
        data?.message || (editing?._id ? "Đã cập nhật nhân viên." : "Đã thêm nhân viên.")
      );
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      setFormOpen(false);
      setEditing(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await EmployeeApi.delete(id);
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Xoá nhân viên thất bại.");
      }
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Đã xoá nhân viên.");
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      setDeleting(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const columns = [
    {
      key: "name",
      title: "Nhân viên",
      minWidth: 200,
      render: (e) => (
        <div>
          <p className="font-medium text-foreground">{e.name}</p>
          <p className="text-xs text-muted-foreground">{e.email}</p>
        </div>
      ),
    },
    {
      key: "role",
      title: "Vai trò",
      width: 150,
      render: (e) => (
        <Badge variant="secondary">
          {e.roleId?.name || roleNameByCode[e.role] || e.role || "—"}
        </Badge>
      ),
    },
    {
      key: "status",
      title: "Trạng thái",
      width: 150,
      render: (e) => (
        <Badge className={STATUS_BADGE[e.status] || "bg-muted text-muted-foreground"}>
          {STATUS_LABEL[e.status] || e.status}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      title: "Ngày tạo",
      width: 160,
      render: (e) => formatDate(e.createdAt, DATE_TIME_FORMAT),
    },
    {
      key: "actions",
      title: "",
      width: 90,
      align: "right",
      render: (e) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            title="Sửa"
            onClick={() => {
              setEditing(e);
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
            onClick={() => setDeleting(e)}
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
        title="Nhân viên"
        description="Quản lý nhân viên và phân quyền."
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Thêm nhân viên
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
            placeholder="Tìm theo tên / email..."
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
        heightOffset={16}
        empty={isError ? "Không tải được dữ liệu." : "Chưa có nhân viên nào."}
      />

      <EmployeeFormDialog
        open={formOpen}
        onOpenChange={(v) => {
          setFormOpen(v);
          if (!v) setEditing(null);
        }}
        employee={editing}
        roles={roles}
        loading={saveMutation.isPending}
        onSubmit={(payload) => saveMutation.mutate(payload)}
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(null)}
        title="Xoá nhân viên"
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
