import { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import { ArrowLeft, Pencil } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROUTE_PATH } from "@/constants/routePaths";
import { MOCK_PROMOTIONS } from "./mockData";
import { PROMO_TYPE, PROMO_TYPE_OPTIONS, TEXT } from "./constants";

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

const EMPTY = {
  code: "",
  name: "",
  type: PROMO_TYPE.PERCENT,
  value: 0,
  maxDiscount: 0,
  minOrder: 0,
  usageLimit: 0,
  perCustomerLimit: 1,
  status: "ACTIVE",
};

export default function PromotionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isCreate = id === "new";
  const initialMode = isCreate ? "create" : location.state?.mode ?? "view";

  const original = isCreate ? EMPTY : MOCK_PROMOTIONS.find((p) => p._id === id);
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState(original ?? EMPTY);

  if (!original) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p>Không tìm thấy khuyến mãi này.</p>
        <Button variant="link" onClick={() => navigate(ROUTE_PATH.PROMOTIONS)}>
          {TEXT.back}
        </Button>
      </div>
    );
  }

  const readOnly = mode === "view";
  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = () => {
    // Thực tế: gọi PromotionProgramApi.create/update rồi invalidate query.
    toast.success(isCreate ? "Tạo khuyến mãi thành công" : "Cập nhật thành công");
    navigate(ROUTE_PATH.PROMOTIONS);
  };

  const title =
    mode === "create"
      ? TEXT.createTitle
      : readOnly
      ? TEXT.detailTitle
      : TEXT.editTitle;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" onClick={() => navigate(ROUTE_PATH.PROMOTIONS)}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-secondary">{title}</h1>
            {!isCreate && <p className="text-sm text-muted-foreground">{original.code}</p>}
          </div>
        </div>
        {readOnly && (
          <Button variant="outline" size="sm" onClick={() => setMode("edit")}>
            <Pencil className="mr-1.5 size-3.5" />
            {TEXT.edit}
          </Button>
        )}
      </div>

      <div className="space-y-5 rounded-xl border bg-card p-6 shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Mã voucher">
            <Input
              value={form.code ?? ""}
              disabled={readOnly}
              onChange={(e) => set("code", e.target.value.toUpperCase())}
            />
          </Field>
          <Field label="Loại giảm">
            <Select value={form.type} onValueChange={(v) => set("type", v)} disabled={readOnly}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROMO_TYPE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field label="Tên chương trình">
          <Input
            value={form.name ?? ""}
            disabled={readOnly}
            onChange={(e) => set("name", e.target.value)}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label={form.type === PROMO_TYPE.PERCENT ? "Giá trị (%)" : "Giá trị (đ)"}>
            <Input
              type="number"
              value={form.value ?? 0}
              disabled={readOnly}
              onChange={(e) => set("value", Number(e.target.value))}
            />
          </Field>
          <Field label="Giảm tối đa (đ)">
            <Input
              type="number"
              value={form.maxDiscount ?? 0}
              disabled={readOnly}
              onChange={(e) => set("maxDiscount", Number(e.target.value))}
            />
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Đơn tối thiểu (đ)">
            <Input
              type="number"
              value={form.minOrder ?? 0}
              disabled={readOnly}
              onChange={(e) => set("minOrder", Number(e.target.value))}
            />
          </Field>
          <Field label="Giới hạn lượt">
            <Input
              type="number"
              value={form.usageLimit ?? 0}
              disabled={readOnly}
              onChange={(e) => set("usageLimit", Number(e.target.value))}
            />
          </Field>
          <Field label="Mỗi khách">
            <Input
              type="number"
              value={form.perCustomerLimit ?? 0}
              disabled={readOnly}
              onChange={(e) => set("perCustomerLimit", Number(e.target.value))}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Bắt đầu">
            <Input
              type="date"
              value={(form.startAt ?? "").slice(0, 10)}
              disabled={readOnly}
              onChange={(e) => set("startAt", e.target.value)}
            />
          </Field>
          <Field label="Kết thúc">
            <Input
              type="date"
              value={(form.endAt ?? "").slice(0, 10)}
              disabled={readOnly}
              onChange={(e) => set("endAt", e.target.value)}
            />
          </Field>
        </div>
      </div>

      {!readOnly && (
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() =>
              isCreate ? navigate(ROUTE_PATH.PROMOTIONS) : setMode("view")
            }
          >
            {TEXT.cancel}
          </Button>
          <Button onClick={handleSave}>{TEXT.save}</Button>
        </div>
      )}
    </div>
  );
}
