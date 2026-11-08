import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Store, Percent, Clock, Wifi, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { StoreApi } from "@/apis";

const DEFAULT_FORM = {
  name: "",
  address: "",
  phone: "",
  email: "",
  taxCode: "",
  description: "",
  vatRatePercent: 10,
  priceIncludesVat: true,
  currency: "VND",
  timezone: "Asia/Ho_Chi_Minh",
  wifiName: "",
  wifiPassword: "",
  monFriOpen: "07:00",
  monFriClose: "22:00",
  satSunOpen: "07:30",
  satSunClose: "23:00",
};

export default function Settings() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(DEFAULT_FORM);

  const { data: storeConfig, isLoading } = useQuery({
    queryKey: ["store-config"],
    queryFn: async () => {
      const res = await StoreApi.getConfig();
      return res?.data?.data || res?.data || {};
    },
  });

  useEffect(() => {
    if (!storeConfig) return;
    const hours = storeConfig.operatingHours || {};
    setForm({
      name: storeConfig.name || "",
      address: storeConfig.address || "",
      phone: storeConfig.phone || "",
      email: storeConfig.email || "",
      taxCode: storeConfig.taxCode || "",
      description: storeConfig.description || "",
      vatRatePercent:
        storeConfig.vatRate !== undefined ? Math.round(Number(storeConfig.vatRate) * 100) : 10,
      priceIncludesVat:
        storeConfig.priceIncludesVat !== undefined ? Boolean(storeConfig.priceIncludesVat) : true,
      currency: storeConfig.currency || "VND",
      timezone: storeConfig.timezone || "Asia/Ho_Chi_Minh",
      wifiName: storeConfig.wifiName || "",
      wifiPassword: storeConfig.wifiPassword || "",
      monFriOpen: hours.monFriOpen || hours["mon-fri"]?.open || "07:00",
      monFriClose: hours.monFriClose || hours["mon-fri"]?.close || "22:00",
      satSunOpen: hours.satSunOpen || hours["sat-sun"]?.open || "07:30",
      satSunClose: hours.satSunClose || hours["sat-sun"]?.close || "23:00",
    });
  }, [storeConfig]);

  const updateMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await StoreApi.updateConfig(payload);
      if (res?.data && res.data.success === false) {
        throw new Error(res.data.message || "Cập nhật cài đặt thất bại.");
      }
      return res?.data?.data || res?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-config"] });
      toast.success("Đã lưu cài đặt cửa hàng thành công!");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || err?.message || "Lỗi cập nhật cài đặt.");
    },
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Tên cửa hàng không được để trống.");
      return;
    }
    const vatNum = Math.min(100, Math.max(0, Number(form.vatRatePercent) || 0));
    updateMutation.mutate({
      name: form.name.trim(),
      address: form.address.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      taxCode: form.taxCode.trim(),
      description: form.description.trim(),
      vatRate: vatNum / 100,
      priceIncludesVat: Boolean(form.priceIncludesVat),
      currency: form.currency.trim() || "VND",
      timezone: form.timezone.trim() || "Asia/Ho_Chi_Minh",
      wifiName: form.wifiName.trim(),
      wifiPassword: form.wifiPassword.trim(),
      operatingHours: {
        monFriOpen: form.monFriOpen || "07:00",
        monFriClose: form.monFriClose || "22:00",
        satSunOpen: form.satSunOpen || "07:30",
        satSunClose: form.satSunClose || "23:00",
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" />
        Đang tải cấu hình cửa hàng...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PageHeader
        title="Cài đặt"
        description="Thiết lập thông tin cửa hàng, thuế, giờ hoạt động và thông tin in hóa đơn."
        actions={
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? (
              <Loader2 className="mr-1.5 size-4 animate-spin" />
            ) : (
              <Save className="mr-1.5 size-4" />
            )}
            Lưu cấu hình
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Store className="size-4 text-primary" />
            Thông tin cửa hàng
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="store-name">Tên cửa hàng *</Label>
            <Input
              id="store-name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="SipPoint Coffee"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="store-phone">Điện thoại / Hotline</Label>
            <Input
              id="store-phone"
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="0123 456 789"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="store-address">Địa chỉ</Label>
            <Input
              id="store-address"
              value={form.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="123 Đường Cà Phê, Quận 1, TP.HCM"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="store-tax">Mã số thuế</Label>
            <Input
              id="store-tax"
              value={form.taxCode}
              onChange={(e) => handleChange("taxCode", e.target.value)}
              placeholder="0312345678"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="store-email">Email liên hệ</Label>
            <Input
              id="store-email"
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="contact@sippoint.vn"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Percent className="size-4 text-primary" />
              Thuế & tiền tệ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="vat-rate">Thuế VAT (%)</Label>
                <Input
                  id="vat-rate"
                  type="number"
                  min={0}
                  max={100}
                  value={form.vatRatePercent}
                  onChange={(e) => handleChange("vatRatePercent", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="currency">Tiền tệ</Label>
                <Input
                  id="currency"
                  value={form.currency}
                  onChange={(e) => handleChange("currency", e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium text-foreground">Giá bán đã bao gồm VAT</p>
                <p className="text-xs text-muted-foreground">
                  Hiển thị giá cuối cùng đã gồm thuế trên menu và hóa đơn
                </p>
              </div>
              <Switch
                checked={form.priceIncludesVat}
                onCheckedChange={(v) => handleChange("priceIncludesVat", v)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="timezone">Múi giờ</Label>
              <Input
                id="timezone"
                value={form.timezone}
                onChange={(e) => handleChange("timezone", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="size-4 text-primary" />
                Giờ hoạt động
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Thứ 2 - Thứ 6 (Mở cửa)</Label>
                  <Input
                    type="time"
                    value={form.monFriOpen}
                    onChange={(e) => handleChange("monFriOpen", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Thứ 2 - Thứ 6 (Đóng cửa)</Label>
                  <Input
                    type="time"
                    value={form.monFriClose}
                    onChange={(e) => handleChange("monFriClose", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Thứ 7 - Chủ nhật (Mở cửa)</Label>
                  <Input
                    type="time"
                    value={form.satSunOpen}
                    onChange={(e) => handleChange("satSunOpen", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Thứ 7 - Chủ nhật (Đóng cửa)</Label>
                  <Input
                    type="time"
                    value={form.satSunClose}
                    onChange={(e) => handleChange("satSunClose", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Wifi className="size-4 text-primary" />
                Thông tin Wi-Fi trên hóa đơn in
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="wifi-name">Tên Wi-Fi</Label>
                <Input
                  id="wifi-name"
                  value={form.wifiName}
                  onChange={(e) => handleChange("wifiName", e.target.value)}
                  placeholder="SipPoint_Guest"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="wifi-pass">Mật khẩu Wi-Fi</Label>
                <Input
                  id="wifi-pass"
                  value={form.wifiPassword}
                  onChange={(e) => handleChange("wifiPassword", e.target.value)}
                  placeholder="sippoint888"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
