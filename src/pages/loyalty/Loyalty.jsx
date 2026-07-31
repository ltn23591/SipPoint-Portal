import { Gift, Coins, Crown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/helpers/format";
import { MembershipTierApi, CampaignApi } from "@/apis";

export default function Loyalty() {
  const { data: tiers = [], isLoading: isTiersLoading } = useQuery({
    queryKey: ["membership-tiers-current"],
    queryFn: async () => {
      const res = await MembershipTierApi.getAllCurrent();
      return res?.data?.data || res?.data || [];
    },
  });

  const { data: campaigns = [], isLoading: isCampaignsLoading } = useQuery({
    queryKey: ["campaigns-list"],
    queryFn: async () => {
      const res = await CampaignApi.search({ pageSize: 10 });
      return res?.data?.data || [];
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Loyalty & Events"
        description="Chương trình tích điểm và các hạng thành viên hệ thống."
      />

      {/* Quy tắc tích điểm */}
      <Card className="py-5">
        <CardContent className="flex items-center gap-4 px-5">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Coins className="size-5" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Quy tắc tích điểm hệ thống
            </p>
            <p className="mt-1 text-lg font-bold text-foreground">
              10.000đ thanh toán = 1 điểm tích lũy
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
        {isTiersLoading ? (
          <p className="text-sm text-muted-foreground">Đang tải danh sách hạng...</p>
        ) : tiers.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có hạng thành viên nào được tạo.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {tiers.map((t) => (
              <Card key={t._id || t.name} className="py-5">
                <CardContent className="px-5">
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold text-primary">{t.name}</p>
                    <Badge variant={t.status === "active" ? "success" : "secondary"}>
                      {t.status === "active" ? "Đang áp dụng" : "Khóa"}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Điều kiện: Từ <strong className="text-foreground">{formatNumber(t.minPoints)}</strong> điểm
                  </p>
                  {t.discountPercentage > 0 && (
                    <p className="mt-1 text-xs text-emerald-600 font-semibold">
                      Ưu đãi: Giảm {t.discountPercentage}% hóa đơn
                    </p>
                  )}
                  {t.description && (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {t.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Sự kiện */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Gift className="size-4 text-primary" />
          Chiến dịch / Sự kiện Marketing
        </h2>
        {isCampaignsLoading ? (
          <p className="text-sm text-muted-foreground">Đang tải danh sách chiến dịch...</p>
        ) : campaigns.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có chiến dịch nào.</p>
        ) : (
          <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {campaigns.map((e) => (
              <div key={e._id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="font-medium text-foreground">{e.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Loại: {e.type} · {new Date(e.startDate).toLocaleDateString("vi-VN")} - {new Date(e.endDate).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <Badge variant={e.status === "ACTIVE" ? "success" : "secondary"}>
                  {e.status === "ACTIVE" ? "Đang chạy" : "Đã kết thúc"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
