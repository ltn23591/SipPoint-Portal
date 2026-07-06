import { useEffect, useMemo, useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { PERMISSION_LABEL } from "@/constants/application";

const EMPTY = { name: "", code: "", description: "", permissions: [] };

export function RoleFormDialog({ open, onOpenChange, role, onSubmit, loading }) {
  const isEdit = !!role?._id;
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm({
        name: role?.name ?? "",
        code: role?.code ?? "",
        description: role?.description ?? "",
        permissions: role?.permissions ?? [],
      });
      setError("");
    }
  }, [open, role]);

  const permOptions = useMemo(() => {
    const codes = new Set([
      ...Object.keys(PERMISSION_LABEL),
      ...(role?.permissions ?? []),
    ]);
    return [...codes];
  }, [role]);

  const togglePerm = (code, checked) => {
    setForm((f) => ({
      ...f,
      permissions: checked
        ? [...f.permissions, code]
        : f.permissions.filter((p) => p !== code),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = form.name.trim();
    const code = form.code.trim();
    if (!name) return setError("Vui lòng nhập tên vai trò.");
    if (!code) return setError("Vui lòng nhập mã vai trò.");

    const payload = {
      name,
      code,
      description: form.description.trim(),
      permissions: form.permissions,
    };
    if (isEdit) payload._id = role._id;

    onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Sửa vai trò" : "Thêm vai trò"}</DialogTitle>
            <DialogDescription>
              Phân quyền cho nhóm nhân viên qua các quyền hệ thống.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="role-name">
                Tên vai trò <span className="text-destructive">*</span>
              </Label>
              <Input
                id="role-name"
                value={form.name}
                onChange={(e) => {
                  setForm((f) => ({ ...f, name: e.target.value }));
                  if (error) setError("");
                }}
                placeholder="VD: Thu ngân"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-code">
                Mã vai trò <span className="text-destructive">*</span>
              </Label>
              <Input
                id="role-code"
                value={form.code}
                onChange={(e) => {
                  setForm((f) => ({ ...f, code: e.target.value }));
                  if (error) setError("");
                }}
                placeholder="VD: cashier"
                disabled={isEdit}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role-desc">Mô tả</Label>
            <Textarea
              id="role-desc"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Mô tả ngắn về vai trò..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Quyền</Label>
            <div className="grid max-h-56 grid-cols-2 gap-2 overflow-y-auto rounded-md border border-border p-3">
              {permOptions.map((code) => {
                const checked = form.permissions.includes(code);
                return (
                  <label
                    key={code}
                    className="flex cursor-pointer items-center gap-2 text-sm"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(v) => togglePerm(code, v === true)}
                    />
                    <span>{PERMISSION_LABEL[code] || code}</span>
                  </label>
                );
              })}
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
