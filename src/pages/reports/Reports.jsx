import { useMemo, useState } from "react";
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
import {
  DollarSign,
  ShoppingBag,
  Receipt,
  CheckCircle2,
  Download,
  Loader2,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatVND, formatNumber } from "@/helpers/format";
import { ReportApi, OrdersApi } from "@/apis";
import { InventoryReport } from "./InventoryReport";

const toDateInput = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const getPresetDates = (preset) => {
  const now = new Date();
  const end = toDateInput(now);
  if (preset === "today") {
    return { startDate: end, endDate: end };
  }
  if (preset === "7d") {
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    return { startDate: toDateInput(start), endDate: end };
  }
  if (preset === "30d") {
    const start = new Date(now);
    start.setDate(now.getDate() - 29);
    return { startDate: toDateInput(start), endDate: end };
  }
  return { startDate: "", endDate: "" };
};

export default function Reports() {
  const [preset, setPreset] = useState("7d");
  const initialRange = useMemo(() => getPresetDates("7d"), []);
  const [startDate, setStartDate] = useState(initialRange.startDate);
  const [endDate, setEndDate] = useState(initialRange.endDate);
  const [exportingType, setExportingType] = useState(null);

  const handleSelectPreset = (nextPreset) => {
    setPreset(nextPreset);
    const { startDate: s, endDate: e } = getPresetDates(nextPreset);
    setStartDate(s);
    setEndDate(e);
  };

  const queryParams = useMemo(() => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return params;
  }, [startDate, endDate]);

  const { data: revenueRows = [], isLoading: isRevenueLoading } = useQuery({
    queryKey: ["report-revenue", queryParams],
    queryFn: async () => {
      const res = await ReportApi.revenue(queryParams);
      return res?.data?.data || res?.data || [];
    },
  });

  const { data: topProducts = [], isLoading: isTopLoading } = useQuery({
    queryKey: ["report-top-products", queryParams],
    queryFn: async () => {
      const res = await ReportApi.topProducts({ ...queryParams, limit: 10 });
      return res?.data?.data || res?.data || [];
    },
  });

  const { data: paymentSummary } = useQuery({
    queryKey: ["payment-summary", startDate, endDate],
    queryFn: async ({ signal }) => {
      const res = await OrdersApi.getPaymentSummary(queryParams, signal);
      return (
        res?.data?.data || {
          totalRevenue: 0,
          cashRevenue: 0,
          transferRevenue: 0,
          paidOrdersCount: 0,
          totalOrdersCount: 0,
        }
      );
    },
  });

  const summary = useMemo(() => {
    const totalRevenue = revenueRows.reduce((sum, item) => sum + (item.revenue || 0), 0);
    const completedOrders = revenueRows.reduce((sum, item) => sum + (item.count || 0), 0);
    const avgOrderValue = completedOrders > 0 ? Math.round(totalRevenue / completedOrders) : 0;
    return {
      totalRevenue,
      completedOrders,
      avgOrderValue,
      paidOrdersCount: paymentSummary?.paidOrdersCount ?? completedOrders,
    };
  }, [revenueRows, paymentSummary]);

  const chartData = useMemo(
    () =>
      revenueRows.map((item) => ({
        day: item._id ? item._id.slice(5) : "",
        value: item.revenue || 0,
        count: item.count || 0,
      })),
    [revenueRows]
  );

  const handleExport = async (type) => {
    setExportingType(type);
    try {
      const res =
        type === "revenue"
          ? await ReportApi.exportRevenue(queryParams)
          : await ReportApi.exportOrders(queryParams);
      if (!res?.data || res.data.size === 0) {
        throw new Error("Không có dữ liệu để xuất.");
      }
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download =
        type === "revenue" ? "bao-cao-doanh-thu.xlsx" : "bao-cao-don-hang.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success(
        type === "revenue"
          ? "Đã xuất báo cáo doanh thu."
          : "Đã xuất báo cáo đơn hàng."
      );
    } catch (err) {
      toast.error(err.message || "Xuất báo cáo thất bại.");
    } finally {
      setExportingType(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Báo cáo"
        description="Thống kê doanh thu, sản phẩm bán chạy, đơn hàng và tiêu hao nguyên liệu theo thời gian thực."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("revenue")}
              disabled={exportingType !== null}
            >
              {exportingType === "revenue" ? (
                <Loader2 className="mr-1.5 size-4 animate-spin" />
              ) : (
                <Download className="mr-1.5 size-4" />
              )}
              Xuất doanh thu (Excel)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("orders")}
              disabled={exportingType !== null}
            >
              {exportingType === "orders" ? (
                <Loader2 className="mr-1.5 size-4 animate-spin" />
              ) : (
                <Download className="mr-1.5 size-4" />
              )}
              Xuất đơn hàng (Excel)
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { key: "today", label: "Hôm nay" },
            { key: "7d", label: "7 ngày qua" },
            { key: "30d", label: "30 ngày qua" },
            { key: "all", label: "Tất cả" },
          ].map((item) => (
            <Button
              key={item.key}
              type="button"
              size="sm"
              variant={preset === item.key ? "default" : "outline"}
              className="h-8 text-xs"
              onClick={() => handleSelectPreset(item.key)}
            >
              {item.label}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <Calendar className="size-3.5 text-muted-foreground" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPreset("custom");
            }}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <span className="text-muted-foreground">đến</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPreset("custom");
            }}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={DollarSign}
          label="Doanh thu hoàn tất"
          value={formatVND(summary.totalRevenue)}
        />
        <StatCard
          icon={ShoppingBag}
          label="Số đơn hoàn tất"
          value={formatNumber(summary.completedOrders)}
        />
        <StatCard
          icon={Receipt}
          label="TB / đơn"
          value={formatVND(summary.avgOrderValue)}
        />
        <StatCard
          icon={CheckCircle2}
          label="Đơn đã thanh toán"
          value={formatNumber(summary.paidOrdersCount)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Diễn biến doanh thu theo ngày</CardTitle>
          </CardHeader>
          <CardContent className="h-64 pr-2">
            {isRevenueLoading ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Đang tải dữ liệu doanh thu...
              </div>
            ) : chartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Chưa có dữ liệu doanh thu trong khoảng thời gian này.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barCategoryGap={24}>
                  <defs>
                    <linearGradient id="reportRevenueBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(38 92% 60%)" />
                      <stop offset="100%" stopColor="hsl(38 92% 45%)" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  />
                  <YAxis
                    tickFormatter={(v) =>
                      v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}tr` : `${v / 1000}k`
                    }
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
                    fill="url(#reportRevenueBar)"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={42}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sản phẩm bán chạy</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {isTopLoading ? (
              <p className="px-6 py-8 text-center text-sm text-muted-foreground">
                Đang tải sản phẩm bán chạy...
              </p>
            ) : topProducts.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-muted-foreground">
                Chưa có sản phẩm bán ra trong khoảng thời gian này.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Sản phẩm</TableHead>
                    <TableHead className="text-right">Số lượng</TableHead>
                    <TableHead className="pr-6 text-right">Doanh thu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((p) => (
                    <TableRow key={p._id || p.name}>
                      <TableCell className="pl-6 font-medium">{p.name}</TableCell>
                      <TableCell className="text-right">{formatNumber(p.qty)}</TableCell>
                      <TableCell className="pr-6 text-right font-medium">
                        {formatVND(p.revenue)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <InventoryReport />
    </div>
  );
}
