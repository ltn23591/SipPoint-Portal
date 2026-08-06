import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/**
 * Dialog nhập kho (mode="import") hoặc điều chỉnh tồn kho (mode="adjust").
 * onSubmit(payload) -> payload = { quantity, cost?, note } | { quantityChange, note }.
 */
export function StockDialog({ open, onOpenChange, mode, material, loading, onSubmit }) {
  const isImport = mode === "import";
  const [quantity, setQuantity] = useState("");
  const [cost, setCost] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open) {
      setQuantity("");
      setCost(material?.cost != null ? String(material.cost) : "");
      setNote("");
    }
  }, [open, material]);

  const handleSubmit = () => {
    const value = Number(quantity);
    if (!quantity || Number.isNaN(value) || value === 0) return;
    if (isImport) {
      onSubmit({
        quantity: value,
        ...(cost !== "" ? { cost: Number(cost) } : {}),
        note: note || undefined,
      });
    } else {
      onSubmit({ quantityChange: value, note: note || undefined });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isImport ? "Nhập kho" : "Điều chỉnh tồn kho"}
            {material ? ` — ${material.name}` : ""}
          </DialogTitle>
          <DialogDescription>
            {isImport
              ? "Nhập thêm số lượng nguyên liệu vào kho."
              : "Điều chỉnh tồn kho (nhập số âm để giảm, ví dụ hao hụt/kiểm kê)."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label>
              {isImport ? "Số lượng nhập" : "Lượng điều chỉnh"}
              {material?.unit ? ` (${material.unit})` : ""}
            </Label>
            <Input
              type="number"
              value={quantity}
              placeholder={isImport ? "Ví dụ: 10" : "Ví dụ: -3"}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          {isImport && (
            <div className="space-y-1.5">
              <Label>Giá vốn / đơn vị (tùy chọn)</Label>
              <Input
                type="number"
                value={cost}
                placeholder="Cập nhật giá vốn nếu thay đổi"
                onChange={(e) => setCost(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Ghi chú</Label>
            <Textarea
              value={note}
              placeholder={isImport ? "Ví dụ: Nhập hàng ngày 05/08" : "Lý do điều chỉnh"}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !quantity}>
            {loading && <Loader2 className="mr-1.5 size-4 animate-spin" />}
            {isImport ? "Nhập kho" : "Điều chỉnh"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
