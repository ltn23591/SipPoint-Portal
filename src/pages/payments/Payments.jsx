import { useState } from "react";
import { Banknote, CreditCard, QrCode, Wallet } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/common/PageHeader";
import { formatPercent } from "@/helpers/format";

const ICONS = { CASH: Banknote, TRANSFER: QrCode, CARD: CreditCard, EWALLET: Wallet };

const INITIAL_METHODS = [
  { _id: "665f25000000000000f10001", type: "CASH", name: "Tiền mặt", fee: 0, enabled: true },
  { _id: "665f25000000000000f10002", type: "TRANSFER", name: "Chuyển khoản / QR", fee: 0, enabled: true },
  { _id: "665f25000000000000f10003", type: "CARD", name: "Thẻ ngân hàng", fee: 0.011, enabled: false },
  { _id: "665f25000000000000f10004", type: "EWALLET", name: "Ví điện tử (Momo/ZaloPay)", fee: 0.02, enabled: true },
];

export default function Payments() {
  const [methods, setMethods] = useState(INITIAL_METHODS);

  const toggle = (id) => {
    setMethods((prev) =>
      prev.map((m) => (m._id === id ? { ...m, enabled: !m.enabled } : m))
    );
    const m = methods.find((x) => x._id === id);
    toast.success(`${m?.enabled ? "Tắt" : "Bật"} phương thức ${m?.name}`);
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <PageHeader
        title="Phương thức thanh toán"
        description="Cấu hình các phương thức thanh toán được phép sử dụng."
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {methods.map((m) => {
          const Icon = ICONS[m.type] ?? Banknote;
          return (
            <div
              key={m._id}
              className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Icon className="size-5" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{m.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.fee > 0 ? `Phí ${formatPercent(m.fee * 100, 1)}` : "Miễn phí"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={m.enabled ? "success" : "secondary"}>
                  {m.enabled ? "Đang bật" : "Đã tắt"}
                </Badge>
                <Switch checked={m.enabled} onCheckedChange={() => toggle(m._id)} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
