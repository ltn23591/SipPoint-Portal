import { useState } from "react";
import { Coins, Crown, Plus, Pencil } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/helpers/format";
import { MembershipTierApi } from "@/apis";
import { TierFormDialog } from "./TierFormDialog";

export default function Loyalty() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);

  const { data: tiers = [], isLoading: isTiersLoading } = useQuery({
    queryKey: ["membership-tiers-current"],
    queryFn: async () => {
      const res = await MembershipTierApi.getAllCurrent();
      return res?.data?.data || res?.data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      if (selectedTier?._id) {
        return await MembershipTierApi.update({ ...payload, id: selectedTier._id });
      }
      return await MembershipTierApi.create(payload);
    },
    onSuccess: () => {
      toast.success(selectedTier?._id ? "Cập nhật hạng thành công!" : "Tạo hạng thành viên mới thành công!");
      queryClient.invalidateQueries(["membership-tiers-current"]);
      setDialogOpen(false);
      setSelectedTier(null);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || err?.message || "Thao tác thất bại.");
    },
  });

  const handleOpenAdd = () => {
    setSelectedTier(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (tier) => {
    setSelectedTier(tier);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hạng thành viên"
        description="Quy tắc tích điểm và quản lý các hạng thành viên hệ thống."
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
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Crown className="size-4 text-primary" />
            Hạng thành viên ({tiers.length})
          </h2>
          <Button size="sm" onClick={handleOpenAdd} className="h-8 gap-1 text-xs">
            <Plus className="size-3.5" />
            Thêm hạng thành viên
          </Button>
        </div>

        {isTiersLoading ? (
          <p className="text-sm text-muted-foreground">Đang tải danh sách hạng...</p>
        ) : tiers.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có hạng thành viên nào được tạo.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {tiers.map((t) => (
              <Card key={t._id || t.name} className="relative py-5">
                <CardContent className="px-5">
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold text-primary">{t.name}</p>
                    <div className="flex items-center gap-1.5">
                      <Badge variant={t.status === "active" ? "success" : "secondary"}>
                        {t.status === "active" ? "Áp dụng" : "Tạm ngưng"}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 rounded-full"
                        onClick={() => handleOpenEdit(t)}
                        title="Sửa hạng thành viên"
                      >
                        <Pencil className="size-3.5 text-muted-foreground hover:text-foreground" />
                      </Button>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Điều kiện: Từ <strong className="text-foreground">{formatNumber(t.minPoints)}</strong> điểm
                  </p>
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

      <TierFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tier={selectedTier}
        onSubmit={(payload) => saveMutation.mutate(payload)}
        loading={saveMutation.isPending}
      />
    </div>
  );
}
