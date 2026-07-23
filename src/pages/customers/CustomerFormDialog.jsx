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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { isEmail } from "@/helpers/validators";
import { GENDER_OPTIONS } from "@/constants/application";

const NO_GENDER = "__none__";

const EMPTY = { fullName: "", email: "", phone: "", dateOfBirth: "", gender: NO_GENDER };

const toDateInput = (value) => (value ? String(value).slice(0, 10) : "");

export function CustomerFormDialog({ open, onOpenChange, customer, onSubmit, loading }) {
  const isEdit = !!customer?._id;
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm({
        fullName: customer?.fullName ?? "",
        email: customer?.email ?? "",
        phone: customer?.phone ?? "",
        dateOfBirth: toDateInput(customer?.dateOfBirth),
        gender: customer?.gender ?? NO_GENDER,
      });
      setErrors({});
    }
  }, [open, customer]);

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.fullName.trim()) next.fullName = "Vui lòng nhập họ tên.";
    if (!form.phone.trim()) next.phone = "Vui lòng nhập số điện thoại.";
    if (form.email.trim() && !isEmail(form.email.trim()))
      next.email = "Email không hợp lệ.";
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    onSubmit({
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      dateOfBirth: form.dateOfBirth || null,
      gender: form.gender === NO_GENDER ? null : form.gender,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Sửa khách hàng" : "Thêm khách hàng"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Cập nhật thông tin khách hàng."
                : "Tạo hồ sơ khách hàng mới."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="cus-name">
              Họ tên <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cus-name"
              value={form.fullName}
              onChange={(e) => setField("fullName", e.target.value)}
              placeholder="VD: Trần Thị Mai"
              autoFocus
            />
            {errors.fullName ? (
              <p className="text-sm text-destructive">{errors.fullName}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cus-phone">
              Số điện thoại <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cus-phone"
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value)}
              placeholder="VD: 0905123456"
            />
            {errors.phone ? (
              <p className="text-sm text-destructive">{errors.phone}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cus-email">Email</Label>
            <Input
              id="cus-email"
              type="email"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              placeholder="VD: mai@email.com"
            />
            {errors.email ? (
              <p className="text-sm text-destructive">{errors.email}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="cus-dob">Ngày sinh</Label>
              <Input
                id="cus-dob"
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => setField("dateOfBirth", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Giới tính</Label>
              <Select value={form.gender} onValueChange={(v) => setField("gender", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chưa xác định" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_GENDER}>Chưa xác định</SelectItem>
                  {GENDER_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
