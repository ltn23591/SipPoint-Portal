import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/helpers/format";
import { ROUTE_PATH } from "@/constants/routePaths";
import { MaterialApi } from "@/apis";
import { UNIT_OPTIONS, MATERIAL_STATUS, STATUS_META, TEXT } from "./constants";

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

const EMPTY = { name: "", code: "", unit: "g", onHand: 0, minThreshold: 0, cost: 0 };

export default function InventoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();
  const isCreate = id === "new";

  const [mode, setMode] = useState(isCreate ? "create" : location.state?.mode ?? "view");
  const [form, setForm] = useState(EMPTY);

  const { data: material, isLoading } = useQuery({
    queryKey: ["material", id],
    enabled: !isCreate,
    queryFn: async () => {
      const res = await MaterialApi.getById(id);
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Không tải được nguyên liệu.");
      }
      return res.data.data;
    },
  });

  useEffect(() => {
    if (material) {
      setForm({
        name: material.name ?? "",
        code: material.code ?? "",
        unit: material.unit ?? "g",
        onHand: material.onHand ?? 0,
        minThreshold: material.minThreshold ?? 0,
        cost: material.cost ?? 0,
      });
    }
  }, [material]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        code: form.code || undefined,
        unit: form.unit,
        minThreshold: Number(form.minThreshold) || 0,
        cost: Number(form.cost) || 0,
      };
      if (isCreate) payload.onHand = Number(form.onHand) || 0;
      const res = isCreate
        ? await MaterialApi.create(payload)
        : await MaterialApi.update(id, payload);
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Lưu nguyên liệu thất bại.");
      }
      return res.data;
    },
    onSuccess: (res) => {
      toast.success(res?.message || (isCreate ? "Đã thêm nguyên liệu." : "Đã cập nhật."));
      qc.invalidateQueries({ queryKey: ["materials"] });
      qc.invalidateQueries({ queryKey: ["material", id] });
      navigate(ROUTE_PATH.INVENTORY);
    },
    onError: (err) => toast.error(err.message),
  });

  if (!isCreate && isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" /> Đang tải...
      </div>
    );
  }

  if (!isCreate && !material) {
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
  const title = mode === "create" ? TEXT.createTitle : readOnly ? TEXT.detailTitle : TEXT.editTitle;
  const statusMeta = material ? STATUS_META[material.status] || STATUS_META[MATERIAL_STATUS.IN_STOCK] : null;

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto pb-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">
            {TEXT.pageTitle} / {title}
          </p>
          <h1 className="text-2xl font-semibold">{title}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(ROUTE_PATH.INVENTORY)}>
            <ArrowLeft className="size-4" /> {TEXT.back}
          </Button>
          {readOnly && (
            <Button onClick={() => setMode("edit")}>
              <Pencil className="size-4" /> {TEXT.edit}
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Thông tin nguyên liệu</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Tên nguyên liệu">
            <Input value={form.name ?? ""} disabled={readOnly} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label="Mã (tùy chọn)">
            <Input value={form.code ?? ""} disabled={readOnly} onChange={(e) => set("code", e.target.value)} />
          </Field>
        </div>

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
            <Input type="number" value={form.cost ?? 0} disabled={readOnly} onChange={(e) => set("cost", Number(e.target.value))} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label={isCreate ? "Tồn kho ban đầu" : "Tồn kho hiện tại"}>
            <Input
              type="number"
              value={form.onHand ?? 0}
              disabled={!isCreate}
              onChange={(e) => set("onHand", Number(e.target.value))}
            />
            {!isCreate && (
              <p className="text-xs text-muted-foreground">
                Dùng “Nhập kho” / “Điều chỉnh” để thay đổi tồn.
              </p>
            )}
          </Field>
          <Field label="Tồn tối thiểu (ngưỡng cảnh báo)">
            <Input type="number" value={form.minThreshold ?? 0} disabled={readOnly} onChange={(e) => set("minThreshold", Number(e.target.value))} />
          </Field>
        </div>

        {!isCreate && material && (
          <div className="flex flex-wrap items-center gap-4 rounded-lg bg-muted/40 p-3 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Trạng thái:</span>
              {statusMeta && <Badge className={cn(statusMeta.className)}>{statusMeta.label}</Badge>}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Đang giữ chỗ:</span>
              <span className="font-medium">{formatNumber(material.reserved)} {material.unit}</span>
            </div>
          </div>
        )}
      </div>

      {!readOnly && (
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            disabled={saveMutation.isPending}
            onClick={() => (isCreate ? navigate(ROUTE_PATH.INVENTORY) : setMode("view"))}
          >
            {TEXT.cancel}
          </Button>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !form.name}>
            {saveMutation.isPending && <Loader2 className="mr-1.5 size-4 animate-spin" />}
            {TEXT.save}
          </Button>
        </div>
      )}
    </div>
  );
}
