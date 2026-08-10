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

const EMPTY = {
  name: "",
  minPoints: 0,
  status: "active",
  description: "",
};

export function TierFormDialog({ open, onOpenChange, tier, onSubmit, loading }) {
  const isEdit = !!tier?._id;
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm({
        name: tier?.name ?? "",
        minPoints: tier?.minPoints ?? 0,
        status: tier?.status ?? "active",
        description: tier?.description ?? "",
      });
      setErrors({});
    }
  }, [open, tier]);

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = "Vui lòng nhập tên hạng thành viên.";
    if (form.minPoints === "" || isNaN(form.minPoints) || Number(form.minPoints) < 0) {
      next.minPoints = "Điểm tối thiểu không hợp lệ.";
    }

    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }

    onSubmit({
      name: form.name.trim(),
      minPoints: Number(form.minPoints),
      status: form.status,
      description: form.description.trim(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Sửa hạng thành viên" : "Thêm hạng thành viên mới"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Cập nhật điều kiện và ưu đãi của hạng thành viên."
                : "Tạo hạng thành viên mới trong chương trình tích điểm."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="tier-name">
              Tên hạng <span className="text-destructive">*</span>
            </Label>
            <Input
              id="tier-name"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="VD: Bạc, Vàng, Kim Cương..."
              autoFocus
            />
            {errors.name ? <p className="text-sm text-destructive">{errors.name}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tier-minPoints">
              Điểm tối thiểu <span className="text-destructive">*</span>
            </Label>
            <Input
              id="tier-minPoints"
              type="number"
              min={0}
              value={form.minPoints}
              onChange={(e) => setField("minPoints", e.target.value)}
              placeholder="VD: 500"
            />
            {errors.minPoints ? (
              <p className="text-sm text-destructive">{errors.minPoints}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Trạng thái</Label>
            <Select value={form.status} onValueChange={(v) => setField("status", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Đang áp dụng (Active)</SelectItem>
                <SelectItem value="inactive">Tạm ngưng (Inactive)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tier-desc">Mô tả / Quyền lợi</Label>
            <Textarea
              id="tier-desc"
              rows={3}
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Nhập mô tả quyền lợi của hạng thành viên này..."
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
