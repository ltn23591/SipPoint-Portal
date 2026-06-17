import { create } from "zustand";
import { MOCK_ORDERS } from "@/pages/orders/mockData";
import { ORDER_STATUS } from "@/constants/application";

export const useOrdersStore = create((set) => ({
  orders: MOCK_ORDERS,

  updateStatus: (id, status) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o._id === id
          ? {
              ...o,
              status,
              completedAt:
                status === ORDER_STATUS.COMPLETED
                  ? new Date().toISOString()
                  : o.completedAt,
            }
          : o
      ),
    })),

  updateOrder: (updated) =>
    set((state) => ({
      orders: state.orders.map((o) => (o._id === updated._id ? updated : o)),
    })),

  addOrder: (order) =>
    set((state) => ({ orders: [...state.orders, order] })),
}));
