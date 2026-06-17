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
import { MOCK_INGREDIENTS } from "./mockData";
import { UNIT_OPTIONS, TEXT } from "./constants";

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

const EMPTY = { name: "", unit: "g", stock: 0, minStock: 0, costPerUnit: 0 };

export default function InventoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isCreate = id === "new";
  const initialMode = isCreate ? "create" : location.state?.mode ?? "view";

  const original = isCreate ? EMPTY : MOCK_INGREDIENTS.find((i) => i._id === id);
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState(original ?? EMPTY);

  if (!original) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p>Không tìm thấy nguyên liệu này.</p>
        <Button variant="link" onClick={() => navigate(ROUTE_PATH.INVENTORY)}>
          {TEXT.back}
        </Button>
      </div>
    );
  }

  const readOnly = mode === "view";
  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = () => {
    toast.success(isCreate ? "Thêm nguyên liệu thành công" : "Cập nhật thành công");
    navigate(ROUTE_PATH.INVENTORY);
  };

  const title = mode === "create" ? TEXT.createTitle : readOnly ? TEXT.detailTitle : TEXT.editTitle;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" onClick={() => navigate(ROUTE_PATH.INVENTORY)}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-secondary">{title}</h1>
            {!isCreate && <p className="text-sm text-muted-foreground">{original.name}</p>}
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
        <Field label="Tên nguyên liệu">
          <Input value={form.name ?? ""} disabled={readOnly} onChange={(e) => set("name", e.target.value)} />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Đơn vị">
            <Select value={form.unit} onValueChange={(v) => set("unit", v)} disabled={readOnly}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {UNIT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Giá vốn / đơn vị (đ)">
            <Input type="number" value={form.costPerUnit ?? 0} disabled={readOnly} onChange={(e) => set("costPerUnit", Number(e.target.value))} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Tồn kho hiện tại">
            <Input type="number" value={form.stock ?? 0} disabled={readOnly} onChange={(e) => set("stock", Number(e.target.value))} />
          </Field>
          <Field label="Tồn tối thiểu">
            <Input type="number" value={form.minStock ?? 0} disabled={readOnly} onChange={(e) => set("minStock", Number(e.target.value))} />
          </Field>
        </div>
      </div>

      {!readOnly && (
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => (isCreate ? navigate(ROUTE_PATH.INVENTORY) : setMode("view"))}>
            {TEXT.cancel}
          </Button>
          <Button onClick={handleSave}>{TEXT.save}</Button>
        </div>
      )}
    </div>
  );
}
