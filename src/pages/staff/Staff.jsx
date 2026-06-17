import { useState } from "react";
import { Plus, Search } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABEL } from "@/constants/application";
import { MOCK_STAFF, ROLE_VARIANT } from "./mockData";

export default function Staff() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = MOCK_STAFF.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.fullName.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
  });
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const columns = [
    {
      key: "fullName",
      title: "Nhân viên",
      minWidth: 180,
      render: (s) => (
        <div>
          <p className="font-medium text-foreground">{s.fullName}</p>
          <p className="text-xs text-muted-foreground">{s.email}</p>
        </div>
      ),
    },
    { key: "phone", title: "Điện thoại", width: 130 },
    {
      key: "role",
      title: "Vai trò",
      width: 140,
      render: (s) => <Badge variant={ROLE_VARIANT[s.role]}>{ROLE_LABEL[s.role]}</Badge>,
    },
    {
      key: "active",
      title: "Trạng thái",
      width: 120,
      render: (s) => (
        <Badge variant={s.active ? "success" : "secondary"}>
          {s.active ? "Đang hoạt động" : "Đã khóa"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="flex h-full flex-col gap-4">
      <PageHeader
        title="Nhân viên"
        description="Quản lý nhân viên, ca làm và phân quyền."
        actions={
          <Button>
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
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm theo tên / email..."
            className="h-8 w-64 rounded-md border border-input bg-background pl-8 pr-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        dataSource={paginated}
        rowKey="_id"
        total={filtered.length}
        pageIndex={page}
        pageSize={pageSize}
        onChange={(p, ps) => { setPage(p); setPageSize(ps); }}
        heightOffset={220}
      />
    </div>
  );
}
