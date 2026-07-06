import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/common/DataTable";
import { formatNumber, formatDate } from "@/helpers/format";
import { CustomerSegmentApi } from "@/apis";

export function SegmentMembersDialog({ segment, open, onOpenChange }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading } = useQuery({
    queryKey: ["segment-members", segment?._id, page, pageSize],
    enabled: open && !!segment?._id,
    queryFn: async ({ signal }) => {
      const res = await CustomerSegmentApi.getMembers(segment._id, { page, limit: pageSize }, signal);
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Không tải được danh sách thành viên.");
      }
      return { list: res.data.data || [], total: res.data.pagination?.total ?? 0 };
    },
    placeholderData: keepPreviousData,
  });

  const columns = [
    {
      key: "customerId",
      title: "Mã KH",
      width: 100,
      render: (c) => <span className="font-mono text-xs text-muted-foreground">{c.customerId || "—"}</span>,
    },
    { key: "fullName", title: "Khách hàng", minWidth: 150 },
    { key: "phone", title: "Điện thoại", width: 110 },
    {
      key: "tier",
      title: "Hạng",
      width: 90,
      render: (c) =>
        c.tierId?.name ? <Badge variant="secondary">{c.tierId.name}</Badge> : "—",
    },
    {
      key: "currentPoints",
      title: "Điểm",
      width: 70,
      align: "right",
      render: (c) => formatNumber(c.currentPoints ?? 0),
    },
    {
      key: "lastVisitAt",
      title: "Ghé gần nhất",
      width: 110,
      render: (c) => (c.lastVisitAt ? formatDate(c.lastVisitAt) : "—"),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Thành viên nhóm "{segment?.name}"</DialogTitle>
          <DialogDescription>
            {segment?.memberCount != null
              ? `${formatNumber(segment.memberCount)} khách hàng — đồng bộ lần cuối ${
                  segment.lastSyncedAt ? formatDate(segment.lastSyncedAt) : "—"
                }.`
              : "Danh sách khách hàng thuộc nhóm."}
          </DialogDescription>
        </DialogHeader>

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
          heightOffset={400}
          empty="Nhóm chưa có thành viên nào."
        />
      </DialogContent>
    </Dialog>
  );
}
