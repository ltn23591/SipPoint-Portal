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
import { ACTIVE_STATUS, ACTIVE_STATUS_OPTIONS } from "@/constants/application";

const EMPTY = {
  name: "",
  email: "",
  password: "",
  role: "",
  status: ACTIVE_STATUS.ACTIVE,
};

export function EmployeeFormDialog({ open, onOpenChange, employee, roles = [], onSubmit, loading }) {
  const isEdit = !!employee?._id;
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm({
        name: employee?.name ?? "",
        email: employee?.email ?? "",
        password: "",
        role: employee?.roleId?.code ?? employee?.role ?? "",
        status: employee?.status ?? ACTIVE_STATUS.ACTIVE,
      });
      setError("");
    }
  }, [open, employee]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = form.name.trim();
    const email = form.email.trim();
    if (!name) return setError("Vui lòng nhập tên nhân viên.");
    if (!email) return setError("Vui lòng nhập email.");
    if (!form.role) return setError("Vui lòng chọn vai trò.");
    if (!isEdit && !form.password) return setError("Vui lòng nhập mật khẩu.");

    const payload = {
      name,
      email,
      role: form.role,
      status: form.status,
    };
    if (form.password) payload.password = form.password;

    onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Sửa nhân viên" : "Thêm nhân viên"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Cập nhật thông tin và phân quyền nhân viên."
                : "Tạo tài khoản nhân viên mới."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="emp-name">
              Tên nhân viên <span className="text-destructive">*</span>
            </Label>
            <Input
              id="emp-name"
              value={form.name}
              onChange={(e) => {
                setForm((f) => ({ ...f, name: e.target.value }));
                if (error) setError("");
              }}
              placeholder="VD: Nguyễn Văn An"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emp-email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="emp-email"
              type="email"
              value={form.email}
              onChange={(e) => {
                setForm((f) => ({ ...f, email: e.target.value }));
                if (error) setError("");
              }}
              placeholder="VD: an.nguyen@sippoint.vn"
              disabled={isEdit}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emp-password">
              Mật khẩu {!isEdit && <span className="text-destructive">*</span>}
            </Label>
            <Input
              id="emp-password"
              type="password"
              value={form.password}
              onChange={(e) => {
                setForm((f) => ({ ...f, password: e.target.value }));
                if (error) setError("");
              }}
              placeholder={isEdit ? "Để trống nếu không đổi" : "Nhập mật khẩu"}
              autoComplete="new-password"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>
                Vai trò <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.role}
                onValueChange={(v) => {
                  setForm((f) => ({ ...f, role: v }));
                  if (error) setError("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r._id || r.code} value={r.code}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Trạng thái" />
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
