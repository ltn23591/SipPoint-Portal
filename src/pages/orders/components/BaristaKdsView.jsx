import { useEffect, useMemo, useState } from "react";
import {
  Check,
  CheckCircle2,
  ChefHat,
  Clock,
  Coffee,
  Eye,
  Flame,
  Play,
  Sparkles,
  Utensils,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ORDER_STATUS } from "@/constants/application";
import { cn } from "@/lib/utils";

const KDS_ACTIVE_STATUSES = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.CONFIRMED,
  ORDER_STATUS.PREPARING,
  ORDER_STATUS.READY,
];

function getElapsedInfo(createdAt, nowMs) {
  if (!createdAt) {
    return { minutes: 0, label: "00:00", level: "normal" };
  }
  const diffSec = Math.max(0, Math.floor((nowMs - new Date(createdAt).getTime()) / 1000));
  const mins = Math.floor(diffSec / 60);
  const secs = diffSec % 60;
  const label = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  if (mins >= 10) return { minutes: mins, label, level: "critical" };
  if (mins >= 5) return { minutes: mins, label, level: "warning" };
  return { minutes: mins, label, level: "normal" };
}

export function BaristaKdsView({ orders = [], onStatusChange, onView }) {
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [stageFilter, setStageFilter] = useState("ALL_ACTIVE");
  const [checkedItems, setCheckedItems] = useState({});

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const kdsOrders = useMemo(() => {
    return orders
      .filter((o) => KDS_ACTIVE_STATUSES.includes(o.status))
      .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
  }, [orders]);

  const displayedOrders = useMemo(() => {
    if (stageFilter === "ALL_ACTIVE") return kdsOrders;
    return kdsOrders.filter((o) => o.status === stageFilter);
  }, [kdsOrders, stageFilter]);

  // Gom nhóm tổng số lượng món cần pha trong các đơn CONFIRMED + PREPARING (Batching)
  const batchSummary = useMemo(() => {
    const map = new Map();
    kdsOrders
      .filter((o) => o.status === ORDER_STATUS.CONFIRMED || o.status === ORDER_STATUS.PREPARING)
      .forEach((order) => {
        (order.items || []).forEach((item) => {
          const variantText = Array.isArray(item.variants)
            ? item.variants.map((v) => v.name).filter(Boolean).join(", ")
            : "";
          const key = `${item.name}__${variantText}`;
          const prev = map.get(key) || {
            key,
            name: item.name,
            variantText,
            qty: 0,
            orderCount: 0,
          };
          prev.qty += Number(item.qty || 1);
          prev.orderCount += 1;
          map.set(key, prev);
        });
      });
    return Array.from(map.values()).sort((a, b) => b.qty - a.qty);
  }, [kdsOrders]);

  const counts = useMemo(() => {
    return {
      all: kdsOrders.length,
      [ORDER_STATUS.PENDING]: kdsOrders.filter((o) => o.status === ORDER_STATUS.PENDING).length,
      [ORDER_STATUS.CONFIRMED]: kdsOrders.filter((o) => o.status === ORDER_STATUS.CONFIRMED).length,
      [ORDER_STATUS.PREPARING]: kdsOrders.filter((o) => o.status === ORDER_STATUS.PREPARING).length,
      [ORDER_STATUS.READY]: kdsOrders.filter((o) => o.status === ORDER_STATUS.READY).length,
    };
  }, [kdsOrders]);

  const toggleItemCheck = (orderId, idx) => {
    const key = `${orderId}_${idx}`;
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex flex-1 flex-col gap-4">
      {/* Thanh tổng hợp mẻ pha chế (Batching Bar) */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2 pt-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-sm font-bold text-foreground">
              <ChefHat className="size-4 text-primary" />
              Tổng hợp món cần pha ngay (Gom mẻ: Đã xác nhận + Đang pha)
            </CardTitle>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-emerald-500" /> &lt; 5 phút (Đúng hạn)
              </span>
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-amber-500" /> 5–10 phút (Ưu tiên)
              </span>
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-destructive" /> &ge; 10 phút (Quá hạn SLA)
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          {batchSummary.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Hiện không có món nào đang chờ pha chế.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {batchSummary.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center gap-2 rounded-lg border bg-card px-3 py-1.5 shadow-sm"
                >
                  <Coffee className="size-3.5 text-primary" />
                  <div className="text-xs">
                    <span className="font-semibold text-foreground">{item.name}</span>
                    {item.variantText && (
                      <span className="ml-1 text-muted-foreground">({item.variantText})</span>
                    )}
                  </div>
                  <Badge variant="default" className="ml-1 px-1.5 py-0 text-xs font-bold">
                    ×{item.qty}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bộ lọc trạng thái KDS */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { key: "ALL_ACTIVE", label: "Tất cả đang xử lý", count: counts.all },
          { key: ORDER_STATUS.PENDING, label: "Chờ xác nhận", count: counts[ORDER_STATUS.PENDING] },
          { key: ORDER_STATUS.CONFIRMED, label: "Chờ pha chế", count: counts[ORDER_STATUS.CONFIRMED] },
          { key: ORDER_STATUS.PREPARING, label: "Đang pha chế", count: counts[ORDER_STATUS.PREPARING] },
          { key: ORDER_STATUS.READY, label: "Sẵn sàng trả món", count: counts[ORDER_STATUS.READY] },
        ].map((tab) => (
          <Button
            key={tab.key}
            size="sm"
            variant={stageFilter === tab.key ? "default" : "outline"}
            className="h-8 gap-1.5 text-xs"
            onClick={() => setStageFilter(tab.key)}
          >
            <span>{tab.label}</span>
            <span
              className={cn(
                "rounded-full px-1.5 py-0.2 text-[11px] font-bold",
                stageFilter === tab.key
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {tab.count}
            </span>
          </Button>
        ))}
      </div>

      {/* Danh sách thẻ KDS (FIFO - Đơn chờ lâu nhất lên đầu) */}
      {displayedOrders.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <Sparkles className="mb-2 size-8 text-muted-foreground/50" />
          <p className="text-sm font-medium text-foreground">Quầy pha chế đã xử lý hết đơn!</p>
          <p className="text-xs text-muted-foreground">
            Đơn hàng mới sẽ tự động hiển thị kèm chuông báo theo thời gian thực.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {displayedOrders.map((order) => {
            const elapsed = getElapsedInfo(order.createdAt, nowMs);
            const totalItemsQty = (order.items || []).reduce((s, it) => s + Number(it.qty || 1), 0);

            return (
              <Card
                key={order._id}
                className={cn(
                  "flex flex-col justify-between border-2 transition-all",
                  elapsed.level === "critical" && order.status !== ORDER_STATUS.READY
                    ? "border-destructive/70 shadow-md"
                    : elapsed.level === "warning" && order.status !== ORDER_STATUS.READY
                    ? "border-amber-500/60"
                    : "border-border"
                )}
              >
                <div>
                  {/* Ticket Header */}
                  <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-extrabold text-foreground">
                          #{order.orderNumber}
                        </span>
                        <Badge variant="outline" className="text-[11px] font-semibold">
                          {order.tableName || "Mang đi"}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {order.customerName} • {totalItemsQty} món
                      </p>
                    </div>

                    <div
                      className={cn(
                        "flex items-center gap-1 rounded-lg border px-2.5 py-1 font-mono text-xs font-bold",
                        elapsed.level === "critical" && order.status !== ORDER_STATUS.READY
                          ? "border-destructive/40 bg-destructive/10 text-destructive animate-pulse"
                          : elapsed.level === "warning" && order.status !== ORDER_STATUS.READY
                          ? "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      )}
                    >
                      {elapsed.level === "critical" ? (
                        <Flame className="size-3.5" />
                      ) : (
                        <Clock className="size-3.5" />
                      )}
                      <span>{elapsed.label}</span>
                    </div>
                  </div>

                  {/* Items Checklist */}
                  <div className="divide-y px-4 py-2">
                    {(order.items || []).map((item, idx) => {
                      const checkKey = `${order._id}_${idx}`;
                      const isDone = !!checkedItems[checkKey];
                      const variantText = Array.isArray(item.variants)
                        ? item.variants.map((v) => v.name).filter(Boolean).join(", ")
                        : "";

                      return (
                        <div
                          key={idx}
                          onClick={() => toggleItemCheck(order._id, idx)}
                          className={cn(
                            "flex cursor-pointer items-start justify-between gap-2 py-2.5 transition-colors hover:bg-muted/20",
                            isDone && "opacity-50 line-through"
                          )}
                        >
                          <div className="flex items-start gap-2.5">
                            <div
                              className={cn(
                                "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border",
                                isDone
                                  ? "border-emerald-600 bg-emerald-600 text-white"
                                  : "border-muted-foreground/40"
                              )}
                            >
                              {isDone && <Check className="size-3" />}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">{item.name}</p>
                              {variantText && (
                                <p className="text-xs font-medium text-primary">{variantText}</p>
                              )}
                              {item.note && (
                                <p className="mt-0.5 rounded bg-amber-500/10 px-1.5 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-300">
                                  Ghi chú: {item.note}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="rounded-md bg-secondary/10 px-2 py-0.5 font-mono text-sm font-bold text-foreground">
                            ×{item.qty}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {order.note && (
                    <div className="mx-4 mb-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-800 dark:text-amber-300">
                      <strong>Ghi chú đơn:</strong> {order.note}
                    </div>
                  )}
                </div>

                {/* Ticket Footer Actions */}
                <div className="flex items-center gap-2 border-t bg-muted/20 px-4 py-2.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2.5 text-xs"
                    onClick={() => onView(order)}
                  >
                    <Eye className="mr-1 size-3.5" />
                    Chi tiết
                  </Button>

                  {order.status === ORDER_STATUS.PENDING && (
                    <Button
                      size="sm"
                      className="h-8 flex-1 text-xs font-semibold"
                      onClick={() => onStatusChange(order._id, ORDER_STATUS.CONFIRMED)}
                    >
                      <Check className="mr-1 size-3.5" />
                      Nhận đơn
                    </Button>
                  )}

                  {order.status === ORDER_STATUS.CONFIRMED && (
                    <Button
                      size="sm"
                      className="h-8 flex-1 bg-amber-600 text-xs font-semibold text-white hover:bg-amber-700"
                      onClick={() => onStatusChange(order._id, ORDER_STATUS.PREPARING)}
                    >
                      <Play className="mr-1 size-3.5" />
                      Bắt đầu pha
                    </Button>
                  )}

                  {order.status === ORDER_STATUS.PREPARING && (
                    <Button
                      size="sm"
                      className="h-8 flex-1 bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-700"
                      onClick={() => onStatusChange(order._id, ORDER_STATUS.READY)}
                    >
                      <Utensils className="mr-1 size-3.5" />
                      Hoàn tất món (Báo khách)
                    </Button>
                  )}

                  {order.status === ORDER_STATUS.READY && (
                    <Button
                      size="sm"
                      className="h-8 flex-1 text-xs font-semibold"
                      onClick={() => onStatusChange(order._id, ORDER_STATUS.COMPLETED)}
                    >
                      <CheckCircle2 className="mr-1 size-3.5" />
                      Đã giao khách
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

