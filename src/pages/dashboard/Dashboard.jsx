import { Wallet, ShoppingBag, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { StatCard } from "@/components/common/StatCard";
import { formatVND, formatNumber } from "@/helpers/format";
import { ReportApi } from "@/apis";
import { RevenueChart } from "./RevenueChart";
import { TopProducts } from "./TopProducts";
import { RealtimeOrders } from "./RealtimeOrders";

export default function Dashboard() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["report-dashboard"],
    queryFn: async () => {
      const res = await ReportApi.dashboard();
      return res?.data?.data || res?.data || {};
    },
    refetchInterval: 30000,
  });

  const totalRevenue = dashboardData?.totalRevenue || 0;
  const totalOrders = dashboardData?.totalOrders || 0;
  const totalCustomers = dashboardData?.totalCustomers || 0;
  const recentOrders = dashboardData?.recentOrders || [];

  const stats = [
    {
      key: "revenue",
      label: "Doanh thu hôm nay",
      value: formatVND(totalRevenue),
      icon: Wallet,
      iconClassName: "bg-primary/10 text-primary",
    },
    {
      key: "orders",
      label: "Đơn hàng hôm nay",
      value: `${formatNumber(totalOrders)} đơn`,
      icon: ShoppingBag,
      iconClassName: "bg-secondary/10 text-secondary",
    },
    {
      key: "customers",
      label: "Khách hàng hôm nay",
      value: `${formatNumber(totalCustomers)} khách`,
      icon: Users,
      iconClassName: "bg-tertiary/10 text-tertiary",
    },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <StatCard
            key={stat.key}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            iconClassName={stat.iconClassName}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <TopProducts />
      </div>

      <RealtimeOrders orders={recentOrders} isLoading={isLoading} />
    </div>
  );
}
