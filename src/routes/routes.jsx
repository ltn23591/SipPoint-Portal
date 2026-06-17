import { createBrowserRouter, Navigate } from "react-router";

import { AppLayout } from "@/components/layout/AppLayout";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { PrivateRoute } from "./PrivateRoute";
import { PublicRoute } from "./PublicRoute";
import { ROUTE_PATH } from "@/constants/routePaths";

import Login from "@/pages/auth/Login";
import Dashboard from "@/pages/dashboard/Dashboard";
import Orders from "@/pages/orders/Orders";
import OrderEditor from "@/pages/orders/OrderEditor";
import Menu from "@/pages/menu/Menu";
import MenuDetail from "@/pages/menu/MenuDetail";
import Inventory from "@/pages/inventory/Inventory";
import InventoryDetail from "@/pages/inventory/InventoryDetail";
import Promotions from "@/pages/promotions/Promotions";
import PromotionDetail from "@/pages/promotions/PromotionDetail";
import Reviews from "@/pages/reviews/Reviews";
import ReviewDetail from "@/pages/reviews/ReviewDetail";
import Notifications from "@/pages/notifications/Notifications";
import NotificationDetail from "@/pages/notifications/NotificationDetail";
import Payments from "@/pages/payments/Payments";
import LuckyWheel from "@/pages/luckyWheel/LuckyWheel";
import Tables from "@/pages/tables/Tables";
import Customers from "@/pages/customers/Customers";
import Loyalty from "@/pages/loyalty/Loyalty";
import Staff from "@/pages/staff/Staff";
import Reports from "@/pages/reports/Reports";
import Settings from "@/pages/settings/Settings";
import NotFound from "@/pages/NotFound";

export const router = createBrowserRouter([
  {
    element: (
      <PublicRoute>
        <AuthLayout />
      </PublicRoute>
    ),
    children: [{ path: ROUTE_PATH.LOGIN, element: <Login /> }],
  },
  {
    element: (
      <PrivateRoute>
        <AppLayout />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <Navigate to={ROUTE_PATH.DASHBOARD} replace /> },
      { path: ROUTE_PATH.DASHBOARD, element: <Dashboard /> },

      // M1 — Đơn hàng: list kanban + trang thao tác POS riêng
      { path: ROUTE_PATH.ORDERS, element: <Orders /> },
      { path: ROUTE_PATH.ORDER_NEW, element: <OrderEditor /> },
      { path: ROUTE_PATH.ORDER_DETAIL, element: <OrderEditor /> },

      // M3 — Menu
      { path: ROUTE_PATH.MENU, element: <Menu /> },
      { path: ROUTE_PATH.MENU_DETAIL, element: <MenuDetail /> },

      // M4 — Bàn & QR
      { path: ROUTE_PATH.TABLES, element: <Tables /> },

      // M5 — Khách hàng
      { path: ROUTE_PATH.CUSTOMERS, element: <Customers /> },

      // M6 — Loyalty & Events
      { path: ROUTE_PATH.LOYALTY, element: <Loyalty /> },

      // M9 — Thanh toán
      { path: ROUTE_PATH.PAYMENTS, element: <Payments /> },

      // M10 — Vòng quay may mắn
      { path: ROUTE_PATH.LUCKY_WHEEL, element: <LuckyWheel /> },

      // M11 — Kho & Nguyên liệu
      { path: ROUTE_PATH.INVENTORY, element: <Inventory /> },
      { path: ROUTE_PATH.INVENTORY_DETAIL, element: <InventoryDetail /> },

      // M14 — Khuyến mãi / Voucher
      { path: ROUTE_PATH.PROMOTIONS, element: <Promotions /> },
      { path: ROUTE_PATH.PROMOTIONS_DETAIL, element: <PromotionDetail /> },

      // M15 — Đánh giá & Phản hồi
      { path: ROUTE_PATH.REVIEWS, element: <Reviews /> },
      { path: ROUTE_PATH.REVIEWS_DETAIL, element: <ReviewDetail /> },

      // M16 — Trung tâm Thông báo
      { path: ROUTE_PATH.NOTIFICATIONS, element: <Notifications /> },
      { path: ROUTE_PATH.NOTIFICATIONS_DETAIL, element: <NotificationDetail /> },

      // M7 — Nhân viên
      { path: ROUTE_PATH.STAFF, element: <Staff /> },

      // M8 — Báo cáo
      { path: ROUTE_PATH.REPORTS, element: <Reports /> },

      // M13 — Cài đặt
      { path: ROUTE_PATH.SETTINGS, element: <Settings /> },
    ],
  },
  { path: ROUTE_PATH.NOT_FOUND, element: <NotFound /> },
]);
