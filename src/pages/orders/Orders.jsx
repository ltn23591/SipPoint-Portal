import { useState, useMemo } from "react";
import { useNavigate } from "react-router";

import { OrderFilters } from "./components/OrderFilters";
import { OrderKanban } from "./components/OrderKanban";
import { useOrdersStore } from "@/stores/ordersStore";
import { ORDER_TYPE } from "@/constants/application";
import { ROUTE_PATH } from "@/constants/routePaths";

const DEFAULT_FILTERS = { date: "today", table: "all", status: "all" };

export default function Orders() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const orders = useOrdersStore((s) => s.orders);
  const updateStatus = useOrdersStore((s) => s.updateStatus);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (filters.table !== "all") {
        const match =
          o.tableId === filters.table ||
          (filters.table === "takeaway" && o.type === ORDER_TYPE.TAKEAWAY);
        if (!match) return false;
      }
      if (filters.status !== "all" && o.status !== filters.status) return false;
      return true;
    });
  }, [orders, filters]);

  const goEditor = (order, mode) =>
    navigate(ROUTE_PATH.ORDER_DETAIL.replace(":id", order._id), { state: { mode } });

  return (
    <div className="flex h-full flex-col gap-4">
      <OrderFilters
        filters={filters}
        onFiltersChange={setFilters}
        onNewOrder={() => navigate(ROUTE_PATH.ORDER_NEW)}
      />

      <OrderKanban
        orders={filteredOrders}
        onStatusChange={updateStatus}
        onView={(order) => goEditor(order, "view")}
        onEdit={(order) => goEditor(order, "edit")}
      />
    </div>
  );
}
