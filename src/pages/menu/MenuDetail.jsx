import { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import { ArrowLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRODUCT_STATUS_LABEL, PRODUCT_STATUS_OPTIONS } from "@/constants/application";
import { ROUTE_PATH } from "@/constants/routePaths";
import { MOCK_MENU_ITEMS } from "./mockData";
import { MENU_CATEGORY_LABEL, MENU_CATEGORY_OPTIONS, TEXT } from "./constants";

const STATUS_VARIANT = {
  active: "success",
  inactive: "secondary",
  out_of_stock: "destructive",
};

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

export default function MenuDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const initialMode = location.state?.mode ?? "view";

  const original = MOCK_MENU_ITEMS.find((m) => m.id === id);
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState(original ?? {});

  if (!original) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p>Không tìm thấy món này.</p>
        <Button variant="link" onClick={() => navigate(ROUTE_PATH.MENU)}>
          {TEXT.back}
        </Button>
      </div>
    );
  }

  const readOnly = mode === "view";

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = () => {
    // In real app: call API to update, then navigate back
    navigate(ROUTE_PATH.MENU);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => navigate(ROUTE_PATH.MENU)}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-secondary">
              {readOnly ? TEXT.detailTitle : TEXT.editTitle}
            </h1>
            <p className="text-sm text-muted-foreground">{original.name}</p>
          </div>
        </div>
        {readOnly && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMode("edit")}
          >
            <Pencil className="mr-1.5 size-3.5" />
            {TEXT.edit}
          </Button>
        )}
      </div>

      {/* Form card */}
      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-5">
        {/* Image placeholder */}
        <div className="flex items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 h-40 text-sm text-muted-foreground">
          Ảnh món (chưa có)
        </div>

        <Field label={TEXT.fieldName}>
          <input
            type="text"
            value={form.name ?? ""}
            disabled={readOnly}
            onChange={(e) => set("name", e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label={TEXT.fieldCategory}>
            <Select
              value={form.category ?? ""}
              onValueChange={(v) => set("category", v)}
              disabled={readOnly}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MENU_CATEGORY_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label={TEXT.fieldPrice}>
            <input
              type="number"
              value={form.price ?? ""}
              disabled={readOnly}
              onChange={(e) => set("price", Number(e.target.value))}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </Field>
        </div>

        <Field label={TEXT.fieldStatus}>
          {readOnly ? (
            <div className="pt-1">
              <Badge variant={STATUS_VARIANT[form.status]}>
                {PRODUCT_STATUS_LABEL[form.status]}
              </Badge>
            </div>
          ) : (
            <Select
              value={form.status ?? ""}
              onValueChange={(v) => set("status", v)}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </Field>

        <Field label={TEXT.fieldDescription}>
          <textarea
            value={form.description ?? ""}
            disabled={readOnly}
            onChange={(e) => set("description", e.target.value)}
            rows={3}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
          />
        </Field>
      </div>

      {/* Footer buttons */}
      {!readOnly && (
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setMode("view")}>
            {TEXT.cancel}
          </Button>
          <Button onClick={handleSave}>{TEXT.save}</Button>
        </div>
      )}
    </div>
  );
}
