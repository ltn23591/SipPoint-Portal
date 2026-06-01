import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { formatVND } from "@/helpers/format";
import { REVENUE_THIS_WEEK, REVENUE_LAST_WEEK } from "./mockData";

export function RevenueChart() {
  const [range, setRange] = useState("this");
  const data = range === "this" ? REVENUE_THIS_WEEK : REVENUE_LAST_WEEK;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Doanh thu 7 ngày gần nhất</CardTitle>
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          <Button
            type="button"
            variant={range === "this" ? "default" : "ghost"}
            size="xs"
            onClick={() => setRange("this")}
            className="h-7 px-3 text-xs"
          >
            Tuần này
          </Button>
          <Button
            type="button"
            variant={range === "last" ? "default" : "ghost"}
            size="xs"
            onClick={() => setRange("last")}
            className="h-7 px-3 text-xs"
          >
            Tuần trước
          </Button>
        </div>
      </CardHeader>
      <CardContent className="h-64 pr-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap={24}>
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
              tickFormatter={(v) => `${v / 1_000_000}tr`}
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
              labelFormatter={(label) => `Thứ ${label}`}
            />
            <Bar
              dataKey="value"
              fill="url(#revenueBar)"
              radius={[8, 8, 0, 0]}
              maxBarSize={42}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
