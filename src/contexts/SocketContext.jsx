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
      
      // Phát chuông báo âm thanh Ting-Ting-Ting
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          const ctx = new AudioContext();
          const playTone = (freq, startTime, duration) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
            gain.gain.setValueAtTime(0.15, ctx.currentTime + startTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startTime + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + startTime);
            osc.stop(ctx.currentTime + startTime + duration);
          };
          playTone(523.25, 0.0, 0.4);
          playTone(659.25, 0.15, 0.4);
          playTone(784.00, 0.3, 0.6);
        }
      } catch (err) {
        console.warn("Lỗi phát âm thanh thông báo:", err);
      }

      // Hiển thị Toast thông báo
      toast.success(`🔔 DÙNG CHUÔNG: Đơn hàng mới ${newOrder.code} vừa được đặt!`, {
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
