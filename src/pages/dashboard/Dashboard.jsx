import { Wallet, ShoppingBag, Users, Star, Plus } from "lucide-react";

import { StatCard } from "@/components/common/StatCard";
import { Button } from "@/components/ui/button";
import { STATS } from "./mockData";
import { RevenueChart } from "./RevenueChart";
import { TopProducts } from "./TopProducts";
import { RealtimeOrders } from "./RealtimeOrders";

const STAT_ICONS = {
  wallet: Wallet,
  bag: ShoppingBag,
  users: Users,
  star: Star,
};

const STAT_ICON_STYLE = {
  wallet: "bg-primary/10 text-primary",
  bag: "bg-secondary/10 text-secondary",
  users: "bg-tertiary/10 text-tertiary",
  star: "bg-warning/10 text-warning",
};

export default function Dashboard() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <StatCard
            key={stat.key}
            icon={STAT_ICONS[stat.iconKey]}
            label={stat.label}
            value={stat.value}
            trend={stat.trend}
            trendDirection={stat.trendDirection}
            iconClassName={STAT_ICON_STYLE[stat.iconKey]}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <TopProducts />
      </div>

      <RealtimeOrders />

      <Button
        size="icon-lg"
        className="fixed bottom-6 right-6 size-12 rounded-full shadow-glow"
      >
        <Plus className="size-5" />
      </Button>
    </div>
  );
}
