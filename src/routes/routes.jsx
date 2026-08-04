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
import Categories from "@/pages/categories/Categories";
import Zones from "@/pages/zones/Zones";
import Inventory from "@/pages/inventory/Inventory";
import InventoryDetail from "@/pages/inventory/InventoryDetail";
import Promotions from "@/pages/promotions/Promotions";
import PromotionDetail from "@/pages/promotions/PromotionDetail";
import Notifications from "@/pages/notifications/Notifications";
import NotificationDetail from "@/pages/notifications/NotificationDetail";
import Payments from "@/pages/payments/Payments";
import LuckyWheel from "@/pages/luckyWheel/LuckyWheel";
import Tables from "@/pages/tables/Tables";
import Customers from "@/pages/customers/Customers";
import Segments from "@/pages/segments/Segments";
import SegmentEditor from "@/pages/segments/SegmentEditor";
import Campaigns from "@/pages/campaigns/Campaigns";
import Loyalty from "@/pages/loyalty/Loyalty";
import Staff from "@/pages/staff/Staff";
import Roles from "@/pages/roles/Roles";
import ActivityLogs from "@/pages/activityLogs/ActivityLogs";
import Banners from "@/pages/banners/Banners";
import Reports from "@/pages/reports/Reports";
import Settings from "@/pages/settings/Settings";
import Profile from "@/pages/profile/Profile";
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

      { path: ROUTE_PATH.PROFILE, element: <Profile /> },

      { path: ROUTE_PATH.ORDERS, element: <Orders /> },
      { path: ROUTE_PATH.ORDER_NEW, element: <OrderEditor /> },
      { path: ROUTE_PATH.ORDER_DETAIL, element: <OrderEditor /> },

      { path: ROUTE_PATH.MENU, element: <Menu /> },
      { path: ROUTE_PATH.MENU_DETAIL, element: <MenuDetail /> },

      { path: ROUTE_PATH.CATEGORIES, element: <Categories /> },

      { path: ROUTE_PATH.ZONES, element: <Zones /> },

      { path: ROUTE_PATH.TABLES, element: <Tables /> },

      { path: ROUTE_PATH.CUSTOMERS, element: <Customers /> },

      { path: ROUTE_PATH.SEGMENTS, element: <Segments /> },
      { path: ROUTE_PATH.SEGMENT_DETAIL, element: <SegmentEditor /> },
      { path: ROUTE_PATH.CAMPAIGNS, element: <Campaigns /> },

      { path: ROUTE_PATH.LOYALTY, element: <Loyalty /> },

      { path: ROUTE_PATH.PAYMENTS, element: <Payments /> },

      { path: ROUTE_PATH.LUCKY_WHEEL, element: <LuckyWheel /> },

      { path: ROUTE_PATH.INVENTORY, element: <Inventory /> },
      { path: ROUTE_PATH.INVENTORY_DETAIL, element: <InventoryDetail /> },

      { path: ROUTE_PATH.PROMOTIONS, element: <Promotions /> },
      { path: ROUTE_PATH.PROMOTIONS_DETAIL, element: <PromotionDetail /> },

      { path: ROUTE_PATH.NOTIFICATIONS, element: <Notifications /> },
      { path: ROUTE_PATH.NOTIFICATIONS_DETAIL, element: <NotificationDetail /> },

      { path: ROUTE_PATH.STAFF, element: <Staff /> },

      { path: ROUTE_PATH.ROLES, element: <Roles /> },

      { path: ROUTE_PATH.ACTIVITY_LOGS, element: <ActivityLogs /> },

      { path: ROUTE_PATH.BANNERS, element: <Banners /> },

      { path: ROUTE_PATH.REPORTS, element: <Reports /> },

      { path: ROUTE_PATH.SETTINGS, element: <Settings /> },
    ],
  },
  { path: ROUTE_PATH.NOT_FOUND, element: <NotFound /> },
]);
