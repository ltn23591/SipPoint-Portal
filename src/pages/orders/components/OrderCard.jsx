import { useState } from "react";
import { Clock, MapPin, MoreHorizontal, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { cn } from "@/lib/utils";
import { ORDER_STATUS } from "@/constants/application";
import { CARD_ACTIONS, ORDER_TYPE_BADGE, TEXT } from "../constants";

const formatTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const formatAmount = (n) => `${n.toLocaleString("vi-VN")}đ`;

export function OrderCard({ order, onStatusChange, onView, onEdit }) {
  const [cancelOpen, setCancelOpen] = useState(false);

  const actions = CARD_ACTIONS[order.status] ?? [];
  const isCompleted = order.status === ORDER_STATUS.COMPLETED;
  const isCancelled = order.status === ORDER_STATUS.CANCELLED;
  const isReady = order.status === ORDER_STATUS.READY;
  const typeBadge = ORDER_TYPE_BADGE[order.type];

  const handleAction = (target) => {
    if (target === ORDER_STATUS.CANCELLED) setCancelOpen(true);
    else onStatusChange?.(order._id, target);
  };

  return (
    <>
      <div
        className={cn(
          "rounded-xl border bg-card p-3 shadow-sm transition-shadow hover:shadow-md",
          order.isUrgent && "border-l-4 border-l-destructive",
          isReady && "border border-dashed border-cyan-400 bg-cyan-50/30",
          isCancelled && "opacity-60"
        )}
      >
        {/* Header */}
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-foreground">{order.orderNumber}</span>
          <div className="flex items-center gap-1">
            {order.isUrgent && (
              <Badge className="h-4 bg-destructive px-1.5 text-[10px] text-white">URGENT</Badge>
            )}
            {order.isPickup && (
              <Badge className="h-4 bg-cyan-500 px-1.5 text-[10px] text-white">PICK UP</Badge>
            )}
            {typeBadge && !order.isPickup && (
              <Badge className={cn("h-4 px-1.5 text-[10px]", typeBadge.className)}>
                {typeBadge.label}
              </Badge>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="size-5 text-muted-foreground">
                  <MoreHorizontal className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => onView?.(order)}>
                  {TEXT.viewDetail}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit?.(order)}>
                  {TEXT.edit}
                </DropdownMenuItem>
                {!isCancelled && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setCancelOpen(true)}
                    >
                      {TEXT.cancelOrder}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Table & items */}
        <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="size-3" />
            {order.tableName}
          </span>
          <span className="flex items-center gap-1">
            <UtensilsCrossed className="size-3" />
            {order.items.length} món
          </span>
        </div>

        {/* Items summary list */}
        {order.items && order.items.length > 0 && (
          <div className="mb-2 space-y-0.5 text-xs text-muted-foreground border-t border-b py-1.5 my-1.5">
            {order.items.slice(0, 3).map((it, idx) => (
              <div key={idx} className="flex items-center justify-between gap-1">
                <span className="truncate max-w-[150px] font-medium text-foreground">
                  {it.qty}x {it.name}
                </span>
                {it.note ? (
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 italic truncate max-w-[100px]">
                    ✍️ {it.note}
                  </span>
                ) : null}
              </div>
            ))}
            {order.items.length > 3 && (
              <p className="text-[10px] text-muted-foreground font-medium">
                + {order.items.length - 3} món khác...
              </p>
            )}
          </div>
        )}

        {/* Amount & time */}
        <div className="mb-3 flex items-center justify-between text-xs">
          <span className="font-semibold text-foreground">{formatAmount(order.totalAmount)}</span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Clock className="size-3" />
            {formatTime(order.createdAt)}
          </span>
        </div>

        {/* Completed state */}
        {isCompleted && (
          <div className="flex items-center justify-between border-t pt-2 text-xs text-muted-foreground">
            {order.isPaid && (
              <span className="font-medium text-emerald-600">{TEXT.paid}</span>
            )}
            {order.completedAt && (
              <span>{TEXT.completedAt} {formatTime(order.completedAt)}</span>
            )}
          </div>
        )}

        {/* Cancelled state */}
        {isCancelled && (
          <div className="border-t pt-2 text-xs text-destructive/70">{TEXT.cancelled}</div>
        )}

        {/* Action buttons */}
        {actions.length > 0 && (
          <div className="flex gap-2">
            {actions.map((action) => (
              <Button
                key={action.label}
                variant={action.variant}
                size="sm"
                className={cn("h-8 flex-1 text-xs", action.className)}
                onClick={() => handleAction(action.target)}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title={TEXT.confirmCancelTitle}
        description={TEXT.confirmCancelDesc(order.orderNumber)}
        confirmText={TEXT.cancelOrder}
        cancelText={TEXT.confirmNo}
        variant="destructive"
        onConfirm={() => {
          onStatusChange?.(order._id, ORDER_STATUS.CANCELLED);
          setCancelOpen(false);
        }}
      />
    </>
  );
}
