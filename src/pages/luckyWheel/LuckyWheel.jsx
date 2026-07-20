import { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/common/PageHeader";
import { cn } from "@/lib/utils";
import { LuckyWheelApi, VoucherApi } from "@/apis";

export default function LuckyWheel() {
  const [rewards, setRewards] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchConfigs = async () => {
    try {
      const response = await LuckyWheelApi.getConfigs();
      if (response && response.data?.success) {
        setRewards(response.data.data);
      } else {
        toast.error("Lấy cấu hình thất bại");
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi lấy cấu hình vòng quay");
    }
  };

  const fetchVouchers = async () => {
    try {
      const response = await VoucherApi.getAll();
      if (response && response.data?.success) {
        setVouchers(response.data.data?.list || response.data.data || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const initData = async () => {
    setLoading(true);
    await Promise.all([fetchConfigs(), fetchVouchers()]);
    setLoading(false);
  };

  useEffect(() => {
    initData();
  }, []);

  const total = rewards.reduce((s, r) => s + (Number(r.probability) || 0), 0);
  const valid = total === 100 && rewards.length === 8;

  const update = (slotIndex, field, value) => {
    setRewards((prev) =>
      prev.map((r) => {
        if (r.slotIndex === slotIndex) {
          const updated = { ...r, [field]: value };
          // Reset fields when type changes
          if (field === "type") {
            if (value !== "VOUCHER") updated.voucherId = null;
            if (value === "LUCK") updated.value = 0;
          }
          return updated;
        }
        return r;
      })
    );
  };

  const handleSave = async () => {
    if (rewards.length !== 8) {
      toast.error("Vòng quay bắt buộc phải có đúng 8 phần thưởng để khớp với giao diện khách hàng");
      return;
    }
    if (!valid) {
      toast.error(`Tổng xác suất phải bằng 100% (hiện tại: ${total}%)`);
      return;
    }

    // Kiểm tra xem đã chọn voucher cho ô loại VOUCHER chưa
    const missingVoucher = rewards.find((r) => r.type === "VOUCHER" && !r.voucherId);
    if (missingVoucher) {
      toast.error(`Vui lòng chọn voucher cho ô #${missingVoucher.slotIndex + 1}`);
      return;
    }

    setSaving(true);
    try {
      // Map voucherId to string ID before sending
      const payload = rewards.map(r => ({
        ...r,
        voucherId: r.type === "VOUCHER" ? (r.voucherId?._id || r.voucherId) : null
      }));

      const response = await LuckyWheelApi.updateConfigs(payload);
      if (response && response.data?.success) {
        toast.success("Đã lưu cấu hình vòng quay thành công");
        setRewards(response.data.data);
      } else {
        toast.error(response?.data?.message || "Lưu cấu hình thất bại");
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi lưu cấu hình vòng quay");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <PageHeader
        title="Vòng quay may mắn"
        description="Thiết lập 8 ô phần thưởng và tỷ lệ trúng (tổng xác suất phải bằng 100%)."
      />

      <div className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
        <div className="grid grid-cols-12 gap-4 border-b pb-2 text-sm font-semibold text-muted-foreground">
          <div className="col-span-1 text-center">Ô số</div>
          <div className="col-span-4">Tên hiển thị</div>
          <div className="col-span-3">Loại phần thưởng</div>
          <div className="col-span-2">Giá trị / Chọn Voucher</div>
          <div className="col-span-2 text-center">Tỷ lệ trúng (%)</div>
        </div>

        {rewards.map((r) => (
          <div key={r.slotIndex} className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-1 text-center font-bold text-muted-foreground">
              #{r.slotIndex + 1}
            </div>
            <Input
              className="col-span-4"
              placeholder="Tên phần thưởng (ví dụ: Cộng 50 Điểm)"
              value={r.label}
              onChange={(e) => update(r.slotIndex, "label", e.target.value)}
            />
            <select
              className="col-span-3 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={r.type}
              onChange={(e) => update(r.slotIndex, "type", e.target.value)}
            >
              <option value="POINTS">Cộng điểm thưởng</option>
              <option value="VOUCHER">Voucher quà tặng</option>
              <option value="LUCK">Chúc may mắn</option>
            </select>
            
            {r.type === "VOUCHER" ? (
              <select
                className="col-span-2 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={r.voucherId?._id || r.voucherId || ""}
                onChange={(e) => update(r.slotIndex, "voucherId", e.target.value)}
              >
                <option value="">-- Chọn Voucher --</option>
                {vouchers.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.title}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                type="number"
                min={0}
                className="col-span-2 text-center"
                value={r.value}
                onChange={(e) => update(r.slotIndex, "value", Number(e.target.value))}
                disabled={r.type === "LUCK"}
              />
            )}

            <div className="col-span-2 flex items-center gap-1">
              <Input
                type="number"
                min={0}
                max={100}
                className="text-center"
                value={r.probability}
                onChange={(e) => update(r.slotIndex, "probability", Number(e.target.value))}
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div
          className={cn(
            "flex items-center gap-2 text-sm font-medium",
            valid ? "text-emerald-600" : "text-destructive"
          )}
        >
          {valid ? <CheckCircle2 className="size-4 text-emerald-600" /> : <AlertTriangle className="size-4" />}
          Tổng tỷ lệ: {total}% {rewards.length !== 8 && "(Yêu cầu đúng 8 phần thưởng)"}
        </div>
        <Button onClick={handleSave} disabled={!valid || saving} className="gap-2">
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Lưu cấu hình
        </Button>
      </div>
    </div>
  );
}
