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
import {
  ACTIVE_STATUS,
  ACTIVE_STATUS_OPTIONS,
  TABLE_STATUS,
  TABLE_STATUS_OPTIONS,
} from "@/constants/application";

const EMPTY = {
  name: "",
  zoneId: "",
  capacity: "",
  status: TABLE_STATUS.AVAILABLE,
  isActive: ACTIVE_STATUS.ACTIVE,
};

export function TableFormDialog({ open, onOpenChange, table, zones = [], onSubmit, loading }) {
  const isEdit = !!table?._id;
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm({
        name: table?.name ?? "",
        zoneId: table?.zoneId?._id ?? table?.zoneId ?? "",
        capacity: table?.capacity ?? "",
        status: table?.status ?? TABLE_STATUS.AVAILABLE,
        isActive: table?.isActive ?? ACTIVE_STATUS.ACTIVE,
      });
      setError("");
    }
  }, [open, table]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) {
      setError("Vui lòng nhập tên bàn.");
      return;
    }
    if (!form.zoneId) {
      setError("Vui lòng chọn khu vực.");
      return;
    }
    const payload = {
      name,
      zoneId: form.zoneId,
      status: form.status,
      isActive: form.isActive,
    };
    if (form.capacity !== "" && form.capacity != null) {
      payload.capacity = Number(form.capacity);
    }
    onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Sửa bàn" : "Thêm bàn"}</DialogTitle>
            <DialogDescription>
              {isEdit ? "Cập nhật thông tin bàn ăn." : "Tạo bàn ăn mới trong khu vực."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="table-name">
                Tên bàn <span className="text-destructive">*</span>
              </Label>
              <Input
                id="table-name"
                value={form.name}
                onChange={(e) => {
                  setForm((f) => ({ ...f, name: e.target.value }));
                  if (error) setError("");
                }}
                placeholder="VD: Bàn 01"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="table-capacity">Sức chứa</Label>
              <Input
                id="table-capacity"
                type="number"
                min={1}
                value={form.capacity}
                onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
                placeholder="VD: 4"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              Khu vực <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.zoneId}
              onValueChange={(v) => {
                setForm((f) => ({ ...f, zoneId: v }));
                if (error) setError("");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn khu vực" />
              </SelectTrigger>
              <SelectContent>
                {zones.map((z) => (
                  <SelectItem key={z._id} value={z._id}>
                    {z.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Trạng thái bàn</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {TABLE_STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Kích hoạt</Label>
              <Select
                value={form.isActive}
                onValueChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kích hoạt" />
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
              {isEdit ? "Lưu thay đổi" : "Tạo mới"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
