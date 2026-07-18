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

const EMPTY = { name: "", price: "" };

export function ToppingFormDialog({ open, onOpenChange, topping, onSubmit, loading }) {
  const isEdit = !!topping?._id;
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm({
        name: topping?.name ?? "",
        price: topping?.price ?? "",
      });
      setError("");
    }
  }, [open, topping]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) {
      setError("Vui lòng nhập tên topping.");
      return;
    }
    const price = Number(form.price);
    if (isNaN(price) || price < 0) {
      setError("Vui lòng nhập giá trị hợp lệ.");
      return;
    }
    onSubmit({ name, price });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Sửa topping" : "Thêm topping"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Cập nhật thông tin topping."
                : "Tạo topping mới."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="top-name">
              Tên topping <span className="text-destructive">*</span>
            </Label>
            <Input
              id="top-name"
              value={form.name}
              onChange={(e) => {
                setForm((f) => ({ ...f, name: e.target.value }));
                if (error) setError("");
              }}
              placeholder="VD: Trân châu trắng"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="top-price">
              Giá (VNĐ) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="top-price"
              type="number"
              value={form.price}
              onChange={(e) => {
                setForm((f) => ({ ...f, price: e.target.value }));
                if (error) setError("");
              }}
              placeholder="VD: 5000"
            />
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
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
              {isEdit ? "Lưu thay đổi" : "Tạo mới"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
