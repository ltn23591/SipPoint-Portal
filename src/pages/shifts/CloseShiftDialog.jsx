import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatVND } from "@/helpers/format";

export function CloseShiftDialog({ open, onOpenChange, shift, onSubmit, loading }) {
  const [actualEndingCash, setActualEndingCash] = useState("");

  useEffect(() => {
    if (open) setActualEndingCash("");
  }, [open]);

  const systemEndingCash = shift?.systemEndingCash ?? 0;
  const actual = Number(actualEndingCash) || 0;
  const diff = actual - systemEndingCash;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ actualEndingCash: actual });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Đóng ca làm việc</DialogTitle>
            <DialogDescription>
              Đối soát tiền mặt thực tế trong quỹ khi kết thúc ca.
            </DialogDescription>
          </DialogHeader>

          <dl className="grid grid-cols-2 gap-2 rounded-md border border-border bg-muted/30 p-3 text-sm">
            <dt className="text-muted-foreground">Tiền đầu ca</dt>
            <dd className="text-right font-medium">{formatVND(shift?.startingCash ?? 0)}</dd>
            <dt className="text-muted-foreground">Doanh thu</dt>
            <dd className="text-right font-medium">{formatVND(shift?.totalRevenue ?? 0)}</dd>
            <dt className="text-muted-foreground">Tiền hệ thống dự kiến</dt>
            <dd className="text-right font-medium">{formatVND(systemEndingCash)}</dd>
          </dl>

          <div className="space-y-2">
            <Label htmlFor="actual-cash">Tiền mặt thực tế (đ)</Label>
            <Input
              id="actual-cash"
              type="number"
              min={0}
              value={actualEndingCash}
              onChange={(e) => setActualEndingCash(e.target.value)}
              placeholder="Nhập số tiền đếm được"
              autoFocus
            />
            {actualEndingCash !== "" ? (
              <p
                className={
                  diff === 0
                    ? "text-sm text-muted-foreground"
                    : diff > 0
                    ? "text-sm text-emerald-600 dark:text-emerald-400"
                    : "text-sm text-destructive"
                }
              >
                Chênh lệch: {diff > 0 ? "+" : ""}
                {formatVND(diff)}
                {diff === 0 ? " (khớp quỹ)" : diff > 0 ? " (thừa)" : " (thiếu)"}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Huỷ
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : null}
              Đóng ca
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
