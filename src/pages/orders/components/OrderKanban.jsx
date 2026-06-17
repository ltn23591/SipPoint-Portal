import { ORDER_STATUS_LABEL } from "@/constants/application";
import { KANBAN_COLUMNS } from "../constants";
import { OrderColumn } from "./OrderColumn";

export function OrderKanban({ orders, onStatusChange, onView, onEdit }) {
  const grouped = KANBAN_COLUMNS.reduce((acc, col) => {
    acc[col.status] = orders.filter((o) => o.status === col.status);
    return acc;
  }, {});

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {KANBAN_COLUMNS.map((col) => (
        <OrderColumn
          key={col.status}
          status={col.status}
          dotClass={col.dotClass}
          label={ORDER_STATUS_LABEL[col.status]}
          orders={grouped[col.status]}
          onStatusChange={onStatusChange}
          onView={onView}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
