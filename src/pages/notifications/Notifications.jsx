import { useState } from "react";
import { useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DataTable } from "@/components/common/DataTable";
import { PageHeader } from "@/components/common/PageHeader";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { formatDate } from "@/helpers/format";
import { DATE_TIME_FORMAT } from "@/constants/application";
import { ROUTE_PATH } from "@/constants/routePaths";
import { NotificationApi } from "@/apis";
import { useDebounce } from "@/hooks/useDebounce";
import { TEXT } from "./constants";

const RECIPIENT_LABEL = {
  all: "Tất cả",
  customer: "Khách hàng",
  segment: "Nhóm khách hàng",
  tier: "Hạng thành viên",
  staff: "Nhân viên",
};

const TYPE_LABEL = {
  system: "Hệ thống",
  promotion: "Khuyến mãi",
  order: "Đơn hàng",
};

export default function Notifications() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const keyword = useDebounce(search, 400);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState(null);

  const { data: resData, isLoading } = useQuery({
    queryKey: ["notifications", page, pageSize, keyword],
    queryFn: async () => {
      const res = await NotificationApi.search({ page, pageSize, search: keyword });
      if (res?.data?.success) {
        return res.data;
      }
      return { data: [], pagination: { total: 0 } };
    },
  });

  const notifications = resData?.data || [];
  const total = resData?.pagination?.total || 0;

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await NotificationApi.delete(id);
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Xóa thông báo thất bại");
      }
      return res.data;
    },
    onSuccess: () => {
      toast.success("Đã xóa thông báo");
      qc.invalidateQueries({ queryKey: ["notifications"] });
      setDeletingId(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const columns = [
    {
      key: "title",
      title: TEXT.colTitle,
      minWidth: 200,
      render: (n) => <span className="font-medium text-foreground">{n.title}</span>,
    },
    {
      key: "content",
      title: "Nội dung",
      minWidth: 250,
      render: (n) => <span className="text-sm text-muted-foreground line-clamp-1">{n.content}</span>,
    },
    {
      key: "type",
      title: "Loại thông báo",
      width: 130,
      render: (n) => <Badge variant="outline">{TYPE_LABEL[n.type] || n.type}</Badge>,
    },
    {
      key: "recipientType",
      title: "Đối tượng nhận",
      width: 140,
      render: (n) => <span className="text-sm text-muted-foreground">{RECIPIENT_LABEL[n.recipientType] || n.recipientType}</span>,
    },
    {
      key: "status",
      title: TEXT.colStatus,
      width: 120,
      render: (n) => (
        <Badge variant={n.status === "active" ? "success" : "secondary"}>
          {n.status === "active" ? "Đang gửi" : "Tạm dừng"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      title: TEXT.colDate,
      width: 150,
      render: (n) => (
        <span className="text-sm text-muted-foreground">{formatDate(n.createdAt, DATE_TIME_FORMAT)}</span>
      ),
    },
    {
      key: "actions",
      title: TEXT.colActions,
      width: 120,
      align: "center",
      render: (row) => (
        <TooltipProvider delayDuration={300}>
          <div className="flex items-center justify-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="size-8 text-muted-foreground hover:text-foreground"
                  onClick={() =>
                    navigate(ROUTE_PATH.NOTIFICATIONS_DETAIL.replace(":id", row._id), {
                      state: { mode: "view" },
                    })
                  }
                >
                  <Eye className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">{TEXT.viewDetail}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="size-8 text-muted-foreground hover:text-foreground"
                  onClick={() =>
                    navigate(ROUTE_PATH.NOTIFICATIONS_DETAIL.replace(":id", row._id), {
                      state: { mode: "edit" },
                    })
                  }
                >
                  <Pencil className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Chỉnh sửa thông báo</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="size-8 text-destructive hover:text-destructive"
                  onClick={() => setDeletingId(row._id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Xóa thông báo</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      ),
    },
  ];

  return (
    <div className="flex h-full flex-col gap-4">
      <PageHeader
        title={TEXT.pageTitle}
        description={TEXT.pageDesc}
        actions={
          <Button size="sm" onClick={() => navigate(ROUTE_PATH.NOTIFICATIONS_DETAIL.replace(":id", "new"), { state: { mode: "create" } })}>
            <Plus className="size-4" />
            {TEXT.addItem}
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
            placeholder={TEXT.searchPlaceholder}
            className="h-8 w-64 rounded-md border border-input bg-background pl-8 pr-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        dataSource={notifications}
        rowKey="_id"
        loading={isLoading}
        total={total}
        pageIndex={page}
        pageSize={pageSize}
        onChange={(p, ps) => { setPage(p); setPageSize(ps); }}
        heightOffset={220}
      />

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(v) => !v && setDeletingId(null)}
        title="Xóa thông báo"
        description="Bạn có chắc chắn muốn xóa thông báo này không?"
        confirmText="Xóa"
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(deletingId)}
      />
    </div>
  );
}
