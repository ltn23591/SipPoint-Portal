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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { POINT_TRANSACTION_TYPE, POINT_TRANSACTION_TYPE_OPTIONS } from "./constants";

const EMPTY = {
  pointsChange: "",
  title: "",
  description: "",
  transactionType: POINT_TRANSACTION_TYPE.ADJUSTMENT,
};

export function PointsDialog({ open, onOpenChange, customer, onSubmit, loading }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm(EMPTY);
      setError("");
    }
  }, [open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const change = Number(form.pointsChange);
    if (!form.pointsChange || Number.isNaN(change) || change === 0) {
      setError("Nhập số điểm khác 0 (số âm để trừ điểm).");
      return;
    }
    if (!form.title.trim()) {
      setError("Vui lòng nhập tiêu đề.");
      return;
    }
    onSubmit({
      pointsChange: change,
      title: form.title.trim(),
      description: form.description.trim(),
      transactionType: form.transactionType,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Cộng / trừ điểm</DialogTitle>
            <DialogDescription>
              {customer?.fullName
                ? `Điều chỉnh điểm cho "${customer.fullName}". Nhập số âm để trừ điểm.`
                : "Nhập số âm để trừ điểm."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="pts-change">
              Số điểm thay đổi <span className="text-destructive">*</span>
            </Label>
            <Input
              id="pts-change"
              type="number"
              value={form.pointsChange}
              onChange={(e) => {
                setForm((f) => ({ ...f, pointsChange: e.target.value }));
                if (error) setError("");
              }}
              placeholder="VD: 100 (cộng) hoặc -50 (trừ)"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pts-type">Loại giao dịch</Label>
            <Select
              value={form.transactionType}
              onValueChange={(v) => setForm((f) => ({ ...f, transactionType: v }))}
            >
              <SelectTrigger id="pts-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {POINT_TRANSACTION_TYPE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pts-title">
              Tiêu đề <span className="text-destructive">*</span>
            </Label>
            <Input
              id="pts-title"
              value={form.title}
              onChange={(e) => {
                setForm((f) => ({ ...f, title: e.target.value }));
                if (error) setError("");
              }}
              placeholder="VD: Thưởng sinh nhật"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pts-desc">Mô tả</Label>
            <Textarea
              id="pts-desc"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Ghi chú thêm (không bắt buộc)..."
              rows={3}
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

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
              Xác nhận
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
