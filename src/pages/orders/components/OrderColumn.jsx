import { cn } from "@/lib/utils";
import { TEXT } from "../constants";
import { OrderCard } from "./OrderCard";

export function OrderColumn({ status, dotClass, label, orders, onStatusChange, onView, onEdit }) {
  return (
    <div className="flex min-w-[220px] max-w-[260px] flex-1 flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className={cn("size-2 shrink-0 rounded-full", dotClass)} />
        <span className="text-sm font-semibold text-foreground">{label}</span>
        <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
          {orders.length}
        </span>
      </div>

      <div className="flex flex-col gap-2.5 overflow-y-auto pr-0.5">
        {orders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-6 text-center text-xs text-muted-foreground">
            {TEXT.noOrders}
          </div>
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onStatusChange={onStatusChange}
              onView={onView}
              onEdit={onEdit}
            />
          ))
        )}
      </div>
    </div>
  );
}
