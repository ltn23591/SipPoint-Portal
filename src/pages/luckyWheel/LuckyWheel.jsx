import { useState } from "react";
import { Plus, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/common/PageHeader";
import { cn } from "@/lib/utils";

const INITIAL_REWARDS = [
  { _id: "665f26000000000000a10001", label: "Voucher 10K", probability: 30 },
  { _id: "665f26000000000000a10002", label: "Free upsize", probability: 25 },
  { _id: "665f26000000000000a10003", label: "Tích x2 điểm", probability: 15 },
  { _id: "665f26000000000000a10004", label: "Chúc may mắn lần sau", probability: 30 },
];

export default function LuckyWheel() {
  const [rewards, setRewards] = useState(INITIAL_REWARDS);

  const total = rewards.reduce((s, r) => s + (Number(r.probability) || 0), 0);
  const valid = total === 100;

  const update = (id, field, value) =>
    setRewards((prev) => prev.map((r) => (r._id === id ? { ...r, [field]: value } : r)));

  const add = () =>
    setRewards((prev) => [
      ...prev,
      { _id: `local-${prev.length + 1}-${prev.reduce((s, r) => s + r.probability, 0)}`, label: "", probability: 0 },
    ]);

  const remove = (id) => setRewards((prev) => prev.filter((r) => r._id !== id));

  const handleSave = () => {
    if (!valid) {
      toast.error(`Tổng xác suất phải bằng 100% (hiện tại: ${total}%)`);
      return;
    }
    toast.success("Đã lưu cấu hình vòng quay");
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <PageHeader
        title="Vòng quay may mắn"
        description="Thiết lập phần thưởng và tỷ lệ trúng (tổng phải bằng 100%)."
        actions={
          <Button size="sm" onClick={add}>
            <Plus className="size-4" />
            Thêm phần thưởng
          </Button>
        }
      />

      <div className="space-y-2 rounded-xl border bg-card p-4 shadow-sm">
        {rewards.map((r) => (
          <div key={r._id} className="flex items-center gap-2">
            <Input
              className="flex-1"
              placeholder="Tên phần thưởng"
              value={r.label}
              onChange={(e) => update(r._id, "label", e.target.value)}
            />
            <div className="flex w-28 items-center gap-1">
              <Input
                type="number"
                min={0}
                max={100}
                className="text-center"
                value={r.probability}
                onChange={(e) => update(r._id, "probability", Number(e.target.value))}
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="size-9 shrink-0 text-destructive hover:bg-destructive/10"
              onClick={() => remove(r._id)}
              disabled={rewards.length === 1}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div
          className={cn(
            "flex items-center gap-2 text-sm font-medium",
            valid ? "text-success" : "text-destructive"
          )}
        >
          {valid ? <CheckCircle2 className="size-4" /> : <AlertTriangle className="size-4" />}
          Tổng tỷ lệ: {total}%
        </div>
        <Button onClick={handleSave} disabled={!valid}>
          Lưu cấu hình
        </Button>
      </div>
    </div>
  );
}
