import { useQuery } from "@tanstack/react-query";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/helpers/format";
import { PRIZE_TYPE, PRIZE_TYPE_LABEL } from "@/constants/application";
import { LuckyWheelApi } from "@/apis";

export function WheelSpinsDialog({ open, onOpenChange, wheel }) {
  const { data: spins = [], isLoading } = useQuery({
    queryKey: ["lucky-wheel-spins", wheel?._id],
    enabled: open && !!wheel?._id,
    queryFn: async () => {
      const res = await LuckyWheelApi.getSpins(wheel._id, { page: 1, limit: 100 });
      return res?.data?.success ? res.data.data || [] : [];
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Lịch sử trúng thưởng</DialogTitle>
          <DialogDescription>{wheel?.name}</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Đang tải...</p>
        ) : spins.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Chưa có lượt quay nào.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Phần thưởng</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead className="text-right">Thời gian</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {spins.map((s) => (
                <TableRow key={s._id}>
                  <TableCell>
                    <div className="font-medium text-foreground">
                      {s.customerId?.fullName || "—"}
                    </div>
                    <div className="text-xs text-muted-foreground">{s.customerId?.phone || ""}</div>
                  </TableCell>
                  <TableCell>
                    {s.prizeLabel}
                    {s.prizeType === PRIZE_TYPE.POINTS && s.points ? ` (+${s.points}đ)` : ""}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{PRIZE_TYPE_LABEL[s.prizeType] || s.prizeType}</Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatDate(s.spunAt, "dd/MM/yyyy HH:mm")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}
