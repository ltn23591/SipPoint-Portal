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

const EMPTY = { name: "", description: "" };

export function CategoryFormDialog({ open, onOpenChange, category, onSubmit, loading }) {
  const isEdit = !!category?._id;
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm({
        name: category?.name ?? "",
        description: category?.description ?? "",
      });
      setError("");
    }
  }, [open, category]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) {
      setError("Vui lòng nhập tên danh mục.");
      return;
    }
    onSubmit({ name, description: form.description.trim() });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Sửa danh mục" : "Thêm danh mục"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Cập nhật thông tin danh mục sản phẩm."
                : "Tạo danh mục sản phẩm mới."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="cat-name">
              Tên danh mục <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cat-name"
              value={form.name}
              onChange={(e) => {
                setForm((f) => ({ ...f, name: e.target.value }));
                if (error) setError("");
              }}
              placeholder="VD: Cà phê"
              autoFocus
            />
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cat-desc">Mô tả</Label>
            <Textarea
              id="cat-desc"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Mô tả ngắn về danh mục..."
              rows={3}
            />
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
