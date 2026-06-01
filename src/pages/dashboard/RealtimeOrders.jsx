import { MoreVertical, ListFilter } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatVND } from "@/helpers/format";
import { RECENT_ORDERS } from "./mockData";

export function RealtimeOrders() {
  const updatedLabel = format(new Date(), "'Cập nhật lúc' HH:mm:ss", {
    locale: vi,
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-base">
            Danh sách đơn hàng thời gian thực
          </CardTitle>
          <p className="text-xs text-muted-foreground">{updatedLabel}</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5">
          <ListFilter className="size-3.5" />
          Lọc dữ liệu
        </Button>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-5">Mã đơn</TableHead>
              <TableHead>Bàn</TableHead>
              <TableHead>Tổng tiền</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {RECENT_ORDERS.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="pl-5 font-semibold text-primary">
                  {order.id}
                </TableCell>
                <TableCell>{order.table}</TableCell>
                <TableCell className="font-medium">
                  {formatVND(order.total)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={order.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {order.timeAgo}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon-sm">
                    <MoreVertical className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="border-t border-border px-5 py-3 text-center">
          <Button variant="link" size="sm" className="text-primary">
            Xem tất cả đơn hàng
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
