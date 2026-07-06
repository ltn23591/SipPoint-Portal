import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PERMISSION_LABEL } from "@/constants/application";
import { StaffRoleApi } from "@/apis";
import { RoleFormDialog } from "./RoleFormDialog";

const QUERY_KEY = ["staff-roles"];

async function fetchRoles() {
  const res = await StaffRoleApi.all();
  if (!res?.data?.success) {
    throw new Error(res?.data?.message || "Không tải được danh sách vai trò.");
  }
  return res.data.data || [];
}

export default function Roles() {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data: roles = [], isLoading, isError } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchRoles,
  });

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      const res = editing?._id
        ? await StaffRoleApi.update(payload)
        : await StaffRoleApi.create(payload);
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Lưu vai trò thất bại.");
      }
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(
        data?.message || (editing?._id ? "Đã cập nhật vai trò." : "Đã thêm vai trò.")
      );
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      setFormOpen(false);
      setEditing(null);
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
      title: "Vai trò",
      minWidth: 160,
      render: (r) => <span className="font-medium text-foreground">{r.name}</span>,
    },
    {
      key: "code",
      title: "Mã",
      width: 120,
      render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.code}</span>,
    },
    {
      key: "description",
      title: "Mô tả",
      minWidth: 220,
      render: (r) => r.description || <span className="text-muted-foreground">—</span>,
    },
    {
      key: "permissions",
      title: "Quyền",
      minWidth: 240,
      render: (r) => {
        const perms = r.permissions || [];
        if (!perms.length) return <span className="text-muted-foreground">—</span>;
        const shown = perms.slice(0, 3);
        return (
          <div className="flex flex-wrap gap-1">
            {shown.map((p) => (
              <Badge key={p} variant="secondary" className="font-normal">
                {PERMISSION_LABEL[p] || p}
              </Badge>
            ))}
            {perms.length > shown.length ? (
              <Badge variant="outline" className="font-normal">
                +{perms.length - shown.length}
              </Badge>
            ) : null}
          </div>
        );
      },
    },
    {
      key: "actions",
      title: "",
      width: 70,
      align: "right",
      render: (r) => (
        <Button
          variant="ghost"
          size="icon-sm"
          title="Sửa"
          onClick={() => {
            setEditing(r);
            setFormOpen(true);
          }}
        >
          <Pencil className="size-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="flex h-full flex-col gap-4">
      <PageHeader
        title="Vai trò & Quyền"
        description="Quản lý vai trò nhân viên và các quyền hệ thống."
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Thêm vai trò
          </Button>
        }
      />

      <DataTable
        columns={columns}
        dataSource={roles}
        rowKey="_id"
        loading={isLoading}
        total={0}
        heightOffset={200}
        empty={isError ? "Không tải được dữ liệu." : "Chưa có vai trò nào."}
      />

      <RoleFormDialog
        open={formOpen}
        onOpenChange={(v) => {
          setFormOpen(v);
          if (!v) setEditing(null);
        }}
        role={editing}
        loading={saveMutation.isPending}
        onSubmit={(payload) => saveMutation.mutate(payload)}
      />
    </div>
  );
}
