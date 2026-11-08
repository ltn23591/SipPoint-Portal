import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { OrderFilters } from "./components/OrderFilters";
import { OrderKanban } from "./components/OrderKanban";
import { BaristaKdsView } from "./components/BaristaKdsView";
import { OrderDetailDialog } from "./components/OrderDetailDialog";
import { getDateRange, parseOrderList } from "./helpers";
import { OrdersApi, StoreApi } from "@/apis";
import { ORDER_STATUS_LABEL, ORDER_TYPE } from "@/constants/application";
import { ROUTE_PATH } from "@/constants/routePaths";

const DEFAULT_FILTERS = { date: "today", table: "all", status: "all" };

const KANBAN_LIMIT = 200;

export default function Orders() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [viewMode, setViewMode] = useState("kanban");
  const [detailId, setDetailId] = useState(null);

  useQuery({
    queryKey: ["store-config"],
    queryFn: async () => {
      const res = await StoreApi.getConfig();
      return res?.data?.data || res?.data || {};
    },
    staleTime: 5 * 60 * 1000,
  });

  const params = useMemo(() => {
    const { startDate, endDate } = getDateRange(filters.date);
    return { page: 1, limit: KANBAN_LIMIT, startDate, endDate };
  }, [filters.date]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["orders", params],
    queryFn: async ({ signal }) => {
      const res = await OrdersApi.getAll(params, signal);
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Không tải được danh sách đơn hàng.");
      }
      return parseOrderList(res.data);
    },
    placeholderData: keepPreviousData,
  });

  const orders = useMemo(() => data?.list ?? [], [data?.list]);

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

  const statusMutation = useMutation({
    mutationFn: async ({ id, status, reason }) => {
      const res = await OrdersApi.updateStatus(id, { status, reason });
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Cập nhật trạng thái thất bại.");
      }
      return { res: res.data, status };
    },
    onSuccess: ({ status }) => {
      toast.success(`Đã chuyển sang "${ORDER_STATUS_LABEL[status] || status}".`);
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="flex h-full flex-col gap-4">
      <OrderFilters
        filters={filters}
        onFiltersChange={setFilters}
        onNewOrder={() => navigate(ROUTE_PATH.ORDER_NEW)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {isError ? (
        <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
          Không tải được danh sách đơn hàng.
        </div>
      ) : isLoading ? (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          Đang tải đơn hàng...
        </div>
      ) : viewMode === "kds" ? (
        <BaristaKdsView
          orders={filteredOrders}
          onStatusChange={(id, status, reason) => statusMutation.mutate({ id, status, reason })}
          onView={(order) => setDetailId(order._id)}
        />
      ) : (
        <OrderKanban
          orders={filteredOrders}
          onStatusChange={(id, status, reason) => statusMutation.mutate({ id, status, reason })}
          onView={(order) => setDetailId(order._id)}
          onEdit={(order) =>
            navigate(ROUTE_PATH.ORDER_DETAIL.replace(":id", order._id), {
              state: { mode: "edit" },
            })
          }
        />
      )}

      <OrderDetailDialog
        orderId={detailId}
        open={!!detailId}
        onOpenChange={(v) => !v && setDetailId(null)}
      />
    </div>
  );
}
