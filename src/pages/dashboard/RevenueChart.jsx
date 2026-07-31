import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatVND } from "@/helpers/format";
import { ReportApi } from "@/apis";

export function RevenueChart() {
  const { data: revenueData = [], isLoading } = useQuery({
    queryKey: ["report-revenue"],
    queryFn: async () => {
      const res = await ReportApi.revenue();
      const raw = res?.data?.data || res?.data || [];
      return raw.map((item) => ({
        day: item._id ? item._id.slice(5) : "",
        value: item.revenue || 0,
        count: item.count || 0,
      }));
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Doanh thu theo ngày</CardTitle>
      </CardHeader>
      <CardContent className="h-64 pr-2">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Đang tải dữ liệu biểu đồ...
          </div>
        ) : revenueData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Chưa có dữ liệu doanh thu.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData} barCategoryGap={24}>
              <defs>
                <linearGradient id="revenueBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(38 92% 60%)" />
                  <stop offset="100%" stopColor="hsl(38 92% 45%)" />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <YAxis
                tickFormatter={(v) => (v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}tr` : `${v / 1000}k`)}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--popover))",
                  color: "hsl(var(--popover-foreground))",
                  fontSize: 12,
                }}
                formatter={(value) => [formatVND(value), "Doanh thu"]}
                labelFormatter={(label) => `Ngày ${label}`}
              />
              <Bar
                dataKey="value"
                fill="url(#revenueBar)"
                radius={[8, 8, 0, 0]}
                maxBarSize={42}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
