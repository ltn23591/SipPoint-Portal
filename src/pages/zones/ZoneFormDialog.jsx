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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ACTIVE_STATUS, ACTIVE_STATUS_OPTIONS } from "@/constants/application";

const EMPTY = { name: "", description: "", isActive: ACTIVE_STATUS.ACTIVE };

export function ZoneFormDialog({ open, onOpenChange, zone, onSubmit, loading }) {
  const isEdit = !!zone?._id;
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm({
        name: zone?.name ?? "",
        description: zone?.description ?? "",
        isActive: zone?.isActive ?? ACTIVE_STATUS.ACTIVE,
      });
      setError("");
    }
  }, [open, zone]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) {
      setError("Vui lòng nhập tên khu vực.");
      return;
    }
    onSubmit({
      name,
      description: form.description.trim(),
      isActive: form.isActive,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Sửa khu vực" : "Thêm khu vực"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Cập nhật thông tin khu vực bàn ăn."
                : "Tạo khu vực mới để nhóm các bàn ăn."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="zone-name">
              Tên khu vực <span className="text-destructive">*</span>
            </Label>
            <Input
              id="zone-name"
              value={form.name}
              onChange={(e) => {
                setForm((f) => ({ ...f, name: e.target.value }));
                if (error) setError("");
              }}
              placeholder="VD: Tầng trệt"
              autoFocus
            />
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="zone-desc">Mô tả</Label>
            <Textarea
              id="zone-desc"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Mô tả ngắn về khu vực..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="zone-status">Trạng thái</Label>
            <Select
              value={form.isActive}
              onValueChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
            >
              <SelectTrigger id="zone-status">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                {ACTIVE_STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
