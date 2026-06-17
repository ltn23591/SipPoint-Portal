import { useState } from "react";
import { Plus, Search, Ban } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatVND, formatNumber } from "@/helpers/format";
import { MOCK_CUSTOMERS, TIER_LABEL, TIER_VARIANT } from "./mockData";

export default function Customers() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = MOCK_CUSTOMERS.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.fullName.toLowerCase().includes(q) || c.phone.includes(q);
  });
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const columns = [
    {
      key: "fullName",
      title: "Khách hàng",
      minWidth: 180,
      render: (c) => (
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-foreground">{c.fullName}</span>
          {c.isBlacklisted && (
            <Badge variant="destructive" className="gap-1">
              <Ban className="size-3" />
              Khóa
            </Badge>
          )}
        </div>
      ),
    },
    { key: "phone", title: "Điện thoại", width: 130 },
    {
      key: "loyaltyTier",
      title: "Hạng",
      width: 110,
      render: (c) => <Badge variant={TIER_VARIANT[c.loyaltyTier]}>{TIER_LABEL[c.loyaltyTier]}</Badge>,
    },
    { key: "points", title: "Điểm", width: 90, align: "right", render: (c) => formatNumber(c.points) },
    { key: "totalSpent", title: "Tổng chi tiêu", width: 140, align: "right", render: (c) => formatVND(c.totalSpent) },
    { key: "orderCount", title: "Số đơn", width: 80, align: "right", render: (c) => formatNumber(c.orderCount) },
  ];

  return (
    <div className="flex h-full flex-col gap-4">
      <PageHeader
        title="Khách hàng"
        description="Hồ sơ khách hàng, điểm tích luỹ và lịch sử mua."
        actions={
          <Button>
            <Plus className="size-4" />
            Thêm khách hàng
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
            placeholder="Tìm theo tên / SĐT..."
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
