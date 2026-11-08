import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { toast } from "sonner";
import { queryClient } from "@/helpers/queryClient";
import { useOrderSound } from "@/hooks/useOrderSound";

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const { playChime } = useOrderSound();
  const [socketInstance] = useState(() => {
    const rawUrl = import.meta.env.VITE_APP_API_URL || "http://localhost:5000";
    const backendUrl = rawUrl.startsWith("http")
      ? rawUrl.replace(/\/api(\/v1)?\/?$/, "")
      : window.location.origin;

    return io(backendUrl, {
      transports: ["websocket"],
      autoConnect: true,
    });
  });

  useEffect(() => {
    socketInstance.on("connect", () => {
      console.log("🔌 [Socket.io] Connected to server:", socketInstance.id);
    });

    // Lắng nghe sự kiện tạo đơn hàng mới
    socketInstance.on("order_created", (newOrder) => {
      console.log("🔔 [Socket.io] New order created:", newOrder);

      playChime();

      // Hiển thị Toast thông báo
      toast.success(`Đơn hàng mới ${newOrder.code} vừa được đặt!`, {
        description: `Bàn: ${newOrder.tableId?.name || "Mang đi"} - Tổng: ${newOrder.total?.toLocaleString("vi-VN")}đ`,
        duration: 8000,
      });

      // Tự động reload danh sách đơn hàng & trạng thái bàn
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      queryClient.invalidateQueries({ queryKey: ["zones"] });
      queryClient.invalidateQueries({ queryKey: ["report-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["payment-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["payment-summary"] });
    });

    // Lắng nghe sự kiện cập nhật trạng thái đơn hàng
    socketInstance.on("order_status_updated", (updatedOrder) => {
      console.log("🔔 [Socket.io] Order status updated:", updatedOrder);
      
      // Hiển thị Toast thông báo
      toast.info(`Đơn hàng ${updatedOrder.code} đã cập nhật trạng thái: ${updatedOrder.status}`, {
        duration: 5000,
      });

      // Tự động reload danh sách đơn hàng & trạng thái bàn
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      queryClient.invalidateQueries({ queryKey: ["zones"] });
      queryClient.invalidateQueries({ queryKey: ["report-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["payment-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["payment-summary"] });
    });

    // Lắng nghe sự kiện cập nhật trạng thái bàn
    socketInstance.on("table_updated", (updatedTable) => {
      console.log("🔔 [Socket.io] Table updated:", updatedTable);
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      queryClient.invalidateQueries({ queryKey: ["zones"] });
    });

    // Cảnh báo nguyên liệu sắp hết / đã hết
    socketInstance.on("low_stock", (payload) => {
      console.log("🔔 [Socket.io] Low stock:", payload);
      const isOut = payload?.status === "out_of_stock";
      toast[isOut ? "error" : "warning"](
        isOut
          ? `Nguyên liệu "${payload?.name}" đã hết hàng!`
          : `Nguyên liệu "${payload?.name}" sắp hết (còn ${payload?.onHand} ${payload?.unit || ""}).`,
        { duration: 8000 }
      );
      queryClient.invalidateQueries({ queryKey: ["materials"] });
    });

    // Sản phẩm bị chuyển sang Hết hàng do thiếu nguyên liệu
    socketInstance.on("product_out_of_stock", (payload) => {
      console.log("🔔 [Socket.io] Product out of stock:", payload);
      toast.error(
        `Có món chuyển sang Hết hàng do thiếu nguyên liệu${
          payload?.materialName ? ` "${payload.materialName}"` : ""
        }.`,
        { duration: 8000 }
      );
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["materials"] });
    });

    socketInstance.on("disconnect", () => {
      console.log("🔌 [Socket.io] Disconnected from server");
    });

    return () => {
      socketInstance.off("connect");
      socketInstance.off("order_created");
      socketInstance.off("order_status_updated");
      socketInstance.off("table_updated");
      socketInstance.off("low_stock");
      socketInstance.off("product_out_of_stock");
      socketInstance.off("disconnect");
    };
  }, [socketInstance, playChime]);

  return (
    <SocketContext.Provider value={socketInstance}>
      {children}
    </SocketContext.Provider>
  );
};
