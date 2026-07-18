import React, { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { toast } from "sonner";
import { queryClient } from "@/helpers/queryClient";

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);

  if (!socketRef.current) {
    const backendUrl = import.meta.env.VITE_APP_API_URL;
    socketRef.current = io(backendUrl, {
      transports: ["websocket"],
      autoConnect: true,
    });
  }

  useEffect(() => {
    const socketInstance = socketRef.current;

    socketInstance.on("connect", () => {
      console.log("🔌 [Socket.io] Connected to server:", socketInstance.id);
    });

    // Lắng nghe sự kiện tạo đơn hàng mới
    socketInstance.on("order_created", (newOrder) => {
      console.log("🔔 [Socket.io] New order created:", newOrder);
      
      // Hiển thị Toast thông báo
      toast.success(`Đơn hàng mới ${newOrder.code} vừa được đặt!`, {
        description: `Bàn: ${newOrder.tableId?.name || "Mang đi"} - Tổng: ${newOrder.total?.toLocaleString("vi-VN")}đ`,
        duration: 8000,
      });

      // Tự động reload danh sách đơn hàng của React Query
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    });

    // Lắng nghe sự kiện cập nhật trạng thái đơn hàng
    socketInstance.on("order_status_updated", (updatedOrder) => {
      console.log("🔔 [Socket.io] Order status updated:", updatedOrder);
      
      // Hiển thị Toast thông báo
      toast.info(`Đơn hàng ${updatedOrder.code} đã cập nhật trạng thái: ${updatedOrder.status}`, {
        duration: 5000,
      });

      // Tự động reload danh sách đơn hàng
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    });

    socketInstance.on("disconnect", () => {
      console.log("🔌 [Socket.io] Disconnected from server");
    });

    return () => {
      socketInstance.off("connect");
      socketInstance.off("order_created");
      socketInstance.off("order_status_updated");
      socketInstance.off("disconnect");
    };
  }, []);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};
