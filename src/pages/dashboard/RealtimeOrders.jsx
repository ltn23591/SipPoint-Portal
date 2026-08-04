import { useNavigate } from "react-router";
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
import { formatVND, formatDate } from "@/helpers/format";
import { ROUTE_PATH } from "@/constants/routePaths";

export function RealtimeOrders({ orders = [], isLoading }) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">
            Đơn hàng gần đây
          </CardTitle>
          <p className="text-xs text-muted-foreground">Cập nhật thời gian thực</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate(ROUTE_PATH.ORDERS)}>
          Xem tất cả đơn hàng
        </Button>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-5">Mã đơn</TableHead>
              <TableHead>Khách hàng / Bàn</TableHead>
              <TableHead>Tổng tiền</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thời gian</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  Đang tải đơn hàng...
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  Hôm nay chưa có đơn hàng nào.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell className="pl-5 font-semibold text-primary">
                    {order.code || order._id}
                  </TableCell>
                  <TableCell>
                    {order.customerId?.fullName || order.tableId?.name || "Khách lẻ"}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatVND(order.total)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(order.createdAt, "HH:mm dd/MM")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
