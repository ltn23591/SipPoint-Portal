import { Gift, Coins, Crown } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatNumber, formatVND } from "@/helpers/format";
import { EARN_RATE, LOYALTY_TIERS, LOYALTY_EVENTS } from "./mockData";

export default function Loyalty() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Loyalty & Events"
        description="Chương trình tích điểm và sự kiện khuyến mãi."
      />

      {/* Quy tắc tích điểm */}
      <Card className="py-5">
        <CardContent className="flex items-center gap-4 px-5">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Coins className="size-5" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Quy tắc tích điểm
            </p>
            <p className="mt-1 text-lg font-bold text-foreground">
              {formatVND(EARN_RATE.amountPerPoint)} = {EARN_RATE.points} điểm
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Hạng thành viên */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Crown className="size-4 text-primary" />
          Hạng thành viên
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {LOYALTY_TIERS.map((t) => (
            <Card key={t.name} className="py-5">
              <CardContent className="px-5">
                <p className={cn("text-lg font-bold", t.color)}>{t.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Từ {formatNumber(t.minPoints)} điểm
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Sự kiện */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Gift className="size-4 text-primary" />
          Chiến dịch / Sự kiện
        </h2>
        <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {LOYALTY_EVENTS.map((e) => (
            <div key={e._id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="font-medium text-foreground">{e.name}</p>
                <p className="text-xs text-muted-foreground">
                  {e.type} · {e.period}
                </p>
              </div>
              <Badge variant={e.status === "ACTIVE" ? "success" : "secondary"}>
                {e.status === "ACTIVE" ? "Đang chạy" : "Đã kết thúc"}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
