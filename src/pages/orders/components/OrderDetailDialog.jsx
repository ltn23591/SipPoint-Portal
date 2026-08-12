import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Armchair, User, Clock, StickyNote, Tag, Undo2, Printer } from "lucide-react";
import { toast } from "sonner";
import { printReceipt } from "@/helpers/printReceipt";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatVND, formatDate } from "@/helpers/format";
import {
  ORDER_STATUS,
  ORDER_STATUS_LABEL,
  ORDER_TYPE_LABEL,
  DATE_TIME_FORMAT,
} from "@/constants/application";
import { OrdersApi } from "@/apis";
import { normalizeOrder } from "../helpers";

const STATUS_BADGE_CLASS = {
  [ORDER_STATUS.PENDING]: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  [ORDER_STATUS.CONFIRMED]: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  [ORDER_STATUS.PREPARING]: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  [ORDER_STATUS.READY]: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  [ORDER_STATUS.COMPLETED]: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  [ORDER_STATUS.CANCELLED]: "bg-destructive/10 text-destructive",
  [ORDER_STATUS.REFUNDED]: "bg-destructive/10 text-destructive",
};

function RefundSection({ orderId }) {
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [reason, setReason] = useState("");

  const refundMutation = useMutation({
    mutationFn: async () => {
      const res = await OrdersApi.refund(orderId, { reason: reason.trim() });
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Hoàn trả đơn hàng thất bại.");
      }
      return res.data;
    },
    onSuccess: (res) => {
      toast.success(res?.message || "Đã hoàn trả đơn hàng.");
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["order-detail", orderId] });
      setExpanded(false);
      setReason("");
    },
    onError: (err) => toast.error(err.message),
  });

  if (!expanded) {
    return (
      <Button
        type="button"
        variant="outline"
        className="w-full text-destructive hover:text-destructive"
        onClick={() => setExpanded(true)}
      >
        <Undo2 className="size-4" />
        Hoàn trả đơn hàng
      </Button>
    );
  }

  return (
    <div className="space-y-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
      <p className="text-sm font-medium text-foreground">
        Hoàn trả đơn hàng — điểm tích luỹ đã cộng sẽ bị trừ lại và voucher đã dùng được hoàn về ví.
      </p>
      <Textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Lý do hoàn trả (bắt buộc)..."
        rows={2}
      />
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setExpanded(false)}
          disabled={refundMutation.isPending}
        >
          Huỷ
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          disabled={!reason.trim() || refundMutation.isPending}
          onClick={() => refundMutation.mutate()}
        >
          {refundMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          Xác nhận hoàn trả
        </Button>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium text-foreground">{children}</span>
    </div>
  );
}

export function OrderDetailDialog({ orderId, open, onOpenChange }) {
  const { data: order, isLoading, isError } = useQuery({
    queryKey: ["order-detail", orderId],
    enabled: open && !!orderId,
    queryFn: async () => {
      const res = await OrdersApi.getById(orderId);
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Không tải được chi tiết đơn hàng.");
      }
      return normalizeOrder(res.data.data);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="flex items-center gap-2">
              {order ? `Đơn ${order.orderNumber}` : "Chi tiết đơn hàng"}
              {order?.status && (
                <Badge className={cn(STATUS_BADGE_CLASS[order.status])}>
                  {ORDER_STATUS_LABEL[order.status] || order.status}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription className="mt-1">
              {order?.createdAt
                ? `Tạo lúc ${formatDate(order.createdAt, DATE_TIME_FORMAT)}`
                : "Thông tin chi tiết đơn hàng."}
            </DialogDescription>
          </div>
          {order && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => printReceipt(order)}
              className="gap-1.5 shrink-0"
            >
              <Printer className="size-4" />
              In hóa đơn
            </Button>
          )}
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : isError || !order ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Không tải được chi tiết đơn hàng.
          </p>
        ) : (
          <div className="space-y-4">
            {/* Thông tin chung */}
            <div className="grid grid-cols-1 gap-2 rounded-lg border border-border bg-muted/30 p-3 sm:grid-cols-2">
              <InfoRow icon={Armchair} label="Bàn">
                {order.tableName}
              </InfoRow>
              <InfoRow icon={User} label="Khách">
                {order.customerName}
              </InfoRow>
              <InfoRow icon={Tag} label="Loại">
                {ORDER_TYPE_LABEL[order.type] || order.type || "—"}
              </InfoRow>
              {order.completedAt && (
                <InfoRow icon={Clock} label="Hoàn tất">
                  {formatDate(order.completedAt, DATE_TIME_FORMAT)}
                </InfoRow>
              )}
            </div>

            {/* Danh sách món */}
            <div className="rounded-lg border border-border">
              <div className="flex items-center justify-between border-b border-border px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <span>Món ({order.items.length})</span>
                <span>Thành tiền</span>
              </div>
              <div className="max-h-64 divide-y divide-border overflow-y-auto">
                {order.items.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    Không có món nào.
                  </p>
                ) : (
                  order.items.map((it, idx) => (
                    <div key={`${it.productId || it.name}-${idx}`} className="px-3 py-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {it.name}
                          <span className="ml-1 text-muted-foreground">× {it.qty}</span>
                        </span>
                        <span className="shrink-0 text-sm font-semibold tabular-nums">
                          {formatVND(it.lineTotal)}
                        </span>
                      </div>
                      {it.variants?.length > 0 && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {it.variants.map((v) => v.name).join(", ")}
                        </p>
                      )}
                      {it.note && (
                        <p className="mt-0.5 flex items-start gap-1 text-xs italic text-muted-foreground">
                          <StickyNote className="mt-0.5 size-3 shrink-0" />
                          {it.note}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Ghi chú đơn */}
            {order.note && (
              <div className="flex items-start gap-2 rounded-lg bg-muted/30 p-3 text-sm">
                <StickyNote className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <span className="text-foreground">{order.note}</span>
              </div>
            )}

            {/* Tổng tiền */}
            <div className="space-y-1.5 border-t border-border pt-3">
              {order.subtotal > 0 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Tạm tính</span>
                  <span className="tabular-nums">{formatVND(order.subtotal)}</span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex items-center justify-between text-sm text-emerald-600">
                  <span>
                    Giảm giá{order.promotionCode ? ` (${order.promotionCode})` : ""}
                  </span>
                  <span className="tabular-nums">-{formatVND(order.discount)}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Tổng tiền</span>
                <span className="text-lg font-bold text-primary tabular-nums">
                  {formatVND(order.totalAmount)}
                </span>
              </div>
            </div>

            {/* Hoàn trả: chỉ đơn đã hoàn tất mới trừ lại điểm được */}
            {order.status === ORDER_STATUS.COMPLETED && <RefundSection orderId={orderId} />}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
