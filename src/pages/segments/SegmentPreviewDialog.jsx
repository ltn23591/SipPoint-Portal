import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/helpers/format";
import { GENDER_LABEL } from "@/constants/application";
import { CustomerSegmentApi } from "@/apis";

const PAGE_SIZE = 20;

export function SegmentPreviewDialog({ open, onOpenChange, criteria }) {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["segment-preview", criteria, page],
    enabled: open && !!criteria,
    queryFn: async () => {
      const res = await CustomerSegmentApi.preview({ criteria, page, limit: PAGE_SIZE });
      if (!res?.data?.success) throw new Error(res?.data?.message || "Xem thử thất bại.");
      return { ...res.data.data, total: res.data.pagination?.total ?? 0 };
    },
  });

  const members = data?.members ?? [];
  const total = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] sm:max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Xem thử khách hàng phù hợp</DialogTitle>
          <DialogDescription>
            {isLoading
              ? "Đang lọc..."
              : isError
                ? "Không lọc được danh sách."
                : `Có ${formatNumber(total)} khách hàng thỏa tiêu chí.`}
          </DialogDescription>
        </DialogHeader>

        {!isLoading && !isError && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Họ tên</TableHead>
                <TableHead>SĐT</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Giới tính</TableHead>
                <TableHead>Hạng</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-6 text-center text-muted-foreground">
                    Không có khách hàng phù hợp.
                  </TableCell>
                </TableRow>
              ) : (
                members.map((m) => (
                  <TableRow key={m._id}>
                    <TableCell className="font-medium text-foreground">{m.fullName}</TableCell>
                    <TableCell>{m.phone || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{m.email || "—"}</TableCell>
                    <TableCell>{GENDER_LABEL[m.gender] || "—"}</TableCell>
                    <TableCell>{m.tierId?.name || "—"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Trước
            </Button>
            <span className="text-sm text-muted-foreground">
              {page}/{totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Sau
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
