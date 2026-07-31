import { useState } from "react";
import { History, Search, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ActivityLogApi } from "@/apis";
import { formatDate } from "@/helpers/format";
import { DATE_TIME_FORMAT } from "@/constants/application";

const getActionVariant = (action) => {
  const act = String(action || "").toUpperCase();
  if (act.includes("CREATE") || act.includes("ADD")) return "success";
  if (act.includes("UPDATE") || act.includes("EDIT")) return "warning";
  if (act.includes("DELETE") || act.includes("REMOVE")) return "destructive";
  if (act.includes("LOGIN")) return "info";
  return "secondary";
};

export default function ActivityLogs() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["activity-logs", search, page],
    queryFn: async () => {
      const res = await ActivityLogApi.search({
        search,
        page,
        pageSize,
      });
      return res?.data || { data: [], pagination: { total: 0, totalPages: 1 } };
    },
  });

  const logs = data?.data || [];
  const pagination = data?.pagination || { total: 0, totalPages: 1 };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nhật ký hoạt động"
        description="Theo dõi toàn bộ nhật ký thao tác hệ thống của nhân viên và quản trị viên."
      />

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm hành động, đối tượng..."
                className="pl-9"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="gap-1.5"
            >
              <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} />
              Làm mới
            </Button>
          </div>

          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Thời gian</TableHead>
                  <TableHead className="w-[200px]">Nhân viên</TableHead>
                  <TableHead className="w-[150px]">Hành động</TableHead>
                  <TableHead className="w-[200px]">Đối tượng</TableHead>
                  <TableHead>Chi tiết</TableHead>
                  <TableHead className="w-[120px] text-right">IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      Đang tải nhật ký hoạt động...
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      Chưa có nhật ký hoạt động nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log._id}>
                      <TableCell className="text-xs font-medium text-muted-foreground">
                        {formatDate(log.createdAt, DATE_TIME_FORMAT)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm text-foreground">
                            {log.employeeId?.fullName || "Quản trị viên"}
                          </span>
                          {log.employeeId?.phone && (
                            <span className="text-xs text-muted-foreground">
                              {log.employeeId.phone}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getActionVariant(log.action)}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {log.target || "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground line-clamp-2">
                        {log.details || "—"}
                      </TableCell>
                      <TableCell className="text-xs text-right font-mono text-muted-foreground">
                        {log.ipAddress || "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
              <span>
                Hiển thị trang {page} / {pagination.totalPages} ({pagination.total} bản ghi)
              </span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Trở lại
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Tiếp theo
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
