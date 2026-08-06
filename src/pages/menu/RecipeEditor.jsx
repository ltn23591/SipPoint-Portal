import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Trình soạn công thức (định mức nguyên liệu) cho một món.
 * value: [{ materialId, quantity }]; onChange(nextItems); materials: danh sách nguyên liệu.
 * Sản phẩm không có công thức thì để trống -> tồn kho quản lý qua field "Tồn kho".
 */
export function RecipeEditor({ value = [], onChange, readOnly, materials = [] }) {
  const materialById = new Map(materials.map((m) => [String(m._id), m]));

  const addRow = () => onChange([...value, { materialId: "", quantity: "" }]);
  const removeRow = (idx) => onChange(value.filter((_, i) => i !== idx));
  const setRow = (idx, patch) =>
    onChange(value.map((row, i) => (i === idx ? { ...row, ...patch } : row)));

  const usedIds = new Set(value.map((r) => String(r.materialId)).filter(Boolean));

  if (readOnly) {
    if (value.length === 0) {
      return <p className="text-sm text-muted-foreground">Món này không dùng công thức nguyên liệu.</p>;
    }
    return (
      <ul className="space-y-1.5">
        {value.map((row, idx) => {
          const m = materialById.get(String(row.materialId));
          return (
            <li key={idx} className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-1.5 text-sm">
              <span>{m ? m.name : "Nguyên liệu"}</span>
              <span className="text-muted-foreground">
                {row.quantity} {m?.unit || ""}
              </span>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className="space-y-2">
      {value.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Chưa có nguyên liệu. Thêm định mức để hệ thống tự trừ kho khi bán món này.
        </p>
      )}
      {value.map((row, idx) => {
        const m = materialById.get(String(row.materialId));
        return (
          <div key={idx} className="flex items-center gap-2">
            <Select
              value={row.materialId ? String(row.materialId) : ""}
              onValueChange={(v) => setRow(idx, { materialId: v })}
            >
              <SelectTrigger className="h-9 flex-1 text-sm">
                <SelectValue placeholder="Chọn nguyên liệu" />
              </SelectTrigger>
              <SelectContent>
                {materials
                  .filter((mat) => !usedIds.has(String(mat._id)) || String(mat._id) === String(row.materialId))
                  .map((mat) => (
                    <SelectItem key={mat._id} value={String(mat._id)}>
                      {mat.name} ({mat.unit})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <input
              type="number"
              min="0"
              step="any"
              placeholder="Định mức"
              value={row.quantity}
              onChange={(e) => setRow(idx, { quantity: e.target.value })}
              className="h-9 w-28 rounded-md border border-input bg-background px-2 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <span className="w-10 shrink-0 text-xs text-muted-foreground">{m?.unit || ""}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="size-8 text-destructive hover:bg-destructive/10"
              onClick={() => removeRow(idx)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        );
      })}
      <Button type="button" variant="outline" size="sm" onClick={addRow}>
        <Plus className="mr-1.5 size-3.5" />
        Thêm nguyên liệu
      </Button>
    </div>
  );
}
