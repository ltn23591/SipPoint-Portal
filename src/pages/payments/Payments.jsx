import { useEffect, useState } from "react";
import { Banknote, QrCode, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/common/PageHeader";
import { StoreApi } from "@/apis";

const ICONS = { CASH: Banknote, TRANSFER: QrCode };

const METHOD_DEFINITIONS = [
  { type: "CASH", name: "Tiền mặt", fee: "Miễn phí" },
  { type: "TRANSFER", name: "Chuyển khoản / Mã QR Ngân hàng", fee: "Miễn phí" },
];

export default function Payments() {
  const queryClient = useQueryClient();

  const { data: storeConfig, isLoading } = useQuery({
    queryKey: ["store-config"],
    queryFn: async () => {
      const res = await StoreApi.getConfig();
      return res?.data?.data || res?.data || {};
    },
  });

  const activeMethods = storeConfig?.paymentMethods || ["CASH", "TRANSFER"];

  const updateMutation = useMutation({
    mutationFn: async (newPaymentMethods) => {
      return await StoreApi.updateConfig({ paymentMethods: newPaymentMethods });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["store-config"]);
      toast.success("Cập nhật phương thức thanh toán thành công!");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || err?.message || "Lỗi cập nhật cấu hình.");
    },
  });

  const handleToggle = (type) => {
    let nextMethods;
    if (activeMethods.includes(type)) {
      if (activeMethods.length === 1) {
        toast.warning("Hệ thống phải có ít nhất 1 phương thức thanh toán hoạt động!");
        return;
      }
      nextMethods = activeMethods.filter((m) => m !== type);
    } else {
      nextMethods = [...activeMethods, type];
    }
    updateMutation.mutate(nextMethods);
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <PageHeader
        title="Phương thức thanh toán"
        description="Cấu hình các phương thức thanh toán được phép sử dụng khi đặt hàng."
      />

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {METHOD_DEFINITIONS.map((m) => {
            const Icon = ICONS[m.type] ?? Banknote;
            const isEnabled = activeMethods.includes(m.type);
            return (
              <div
                key={m.type}
                className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.fee}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={isEnabled ? "success" : "secondary"}>
                    {isEnabled ? "Đang bật" : "Đã tắt"}
                  </Badge>
                  <Switch
                    checked={isEnabled}
                    disabled={updateMutation.isPending}
                    onCheckedChange={() => handleToggle(m.type)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
