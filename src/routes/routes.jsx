import { createBrowserRouter, Navigate } from "react-router";

import { AppLayout } from "@/components/layout/AppLayout";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { PrivateRoute } from "./PrivateRoute";
import { PublicRoute } from "./PublicRoute";
import { ROUTE_PATH } from "@/constants/routePaths";

import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";
import Dashboard from "@/pages/dashboard/Dashboard";
import Orders from "@/pages/orders/Orders";
import Menu from "@/pages/menu/Menu";
import Tables from "@/pages/tables/Tables";
import Customers from "@/pages/customers/Customers";
import Loyalty from "@/pages/loyalty/Loyalty";
import Staff from "@/pages/staff/Staff";
import Reports from "@/pages/reports/Reports";
import Settings from "@/pages/settings/Settings";
import NotFound from "@/pages/NotFound";

const REUSED_ROUTE = ({ Component, paths }) =>
  paths.map((path) => ({ path, element: <Component /> }));

export const router = createBrowserRouter([
  {
    element: (
      <PublicRoute>
        <AuthLayout />
      </PublicRoute>
    ),
    children: [
      { path: ROUTE_PATH.LOGIN, element: <Login /> },
      { path: ROUTE_PATH.SIGNUP, element: <Signup /> },
    ],
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

      ...REUSED_ROUTE({
        Component: Orders,
        paths: [
          ROUTE_PATH.ORDERS,
          ROUTE_PATH.ORDERS_PENDING,
          ROUTE_PATH.ORDERS_COMPLETED,
          ROUTE_PATH.ORDERS_CANCELLED,
        ],
      }),
      ...REUSED_ROUTE({
        Component: Menu,
        paths: [
          ROUTE_PATH.MENU,
          ROUTE_PATH.MENU_CATEGORIES,
          ROUTE_PATH.MENU_COMBO,
          ROUTE_PATH.MENU_PRICE,
        ],
      }),
      ...REUSED_ROUTE({
        Component: Tables,
        paths: [ROUTE_PATH.TABLES, ROUTE_PATH.TABLES_QR, ROUTE_PATH.TABLES_MAP],
      }),
      ...REUSED_ROUTE({
        Component: Customers,
        paths: [
          ROUTE_PATH.CUSTOMERS,
          ROUTE_PATH.CUSTOMERS_SEGMENTS,
          ROUTE_PATH.CUSTOMERS_HISTORY,
        ],
      }),
      ...REUSED_ROUTE({
        Component: Loyalty,
        paths: [
          ROUTE_PATH.LOYALTY,
          ROUTE_PATH.LOYALTY_TIERS,
          ROUTE_PATH.LOYALTY_VOUCHERS,
          ROUTE_PATH.LOYALTY_EVENTS,
        ],
      }),
      ...REUSED_ROUTE({
        Component: Staff,
        paths: [ROUTE_PATH.STAFF, ROUTE_PATH.STAFF_ROLES, ROUTE_PATH.STAFF_SHIFTS],
      }),
      ...REUSED_ROUTE({
        Component: Reports,
        paths: [
          ROUTE_PATH.REPORTS,
          ROUTE_PATH.REPORTS_PRODUCTS,
          ROUTE_PATH.REPORTS_CUSTOMERS,
        ],
      }),
      ...REUSED_ROUTE({
        Component: Settings,
        paths: [
          ROUTE_PATH.SETTINGS,
          ROUTE_PATH.SETTINGS_PAYMENT,
          ROUTE_PATH.SETTINGS_PRINT,
          ROUTE_PATH.SETTINGS_INTEGRATION,
        ],
      }),
    ],
  },
  { path: ROUTE_PATH.NOT_FOUND, element: <NotFound /> },
]);
