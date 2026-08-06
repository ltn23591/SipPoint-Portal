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
import { Boxes, Wallet, AlertTriangle, XCircle, Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { StatCard } from "@/components/common/StatCard";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";
import { ReportApi } from "@/apis";
import { STATUS_META, MATERIAL_STATUS } from "@/pages/inventory/constants";

export function InventoryReport() {
  const [exporting, setExporting] = useState(false);

  const { data: dashboard } = useQuery({
    queryKey: ["inventory-dashboard"],
    queryFn: async () => {
      const res = await ReportApi.inventoryDashboard();
      return res?.data?.success ? res.data.data : null;
    },
  });

  const { data: series = [], isLoading: seriesLoading } = useQuery({
    queryKey: ["material-consumption-series"],
    queryFn: async () => {
      const res = await ReportApi.materialConsumptionSeries();
      const raw = res?.data?.data || [];
      return raw.map((item) => ({
        day: item._id ? item._id.slice(5) : "",
        value: item.consumed || 0,
      }));
    },
  });

  const lowStockList = dashboard?.lowStockList || [];

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await ReportApi.exportMaterialConsumption();
      if (!res?.data || res.data.size === 0) throw new Error("Không có dữ liệu để xuất.");
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "bao-cao-tieu-hao-nguyen-lieu.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Đã xuất báo cáo tiêu hao.");
    } catch (err) {
      toast.error(err.message || "Xuất báo cáo thất bại.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-secondary">Tồn kho & Nguyên liệu</h2>
        <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
          {exporting ? (
            <Loader2 className="mr-1.5 size-4 animate-spin" />
          ) : (
            <Download className="mr-1.5 size-4" />
          )}
          Xuất tiêu hao (Excel)
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Wallet} label="Giá trị tồn" value={formatVND(dashboard?.stockValue || 0)} />
        <StatCard icon={Boxes} label="Số nguyên liệu" value={formatNumber(dashboard?.totalMaterials || 0)} />
        <StatCard
          icon={AlertTriangle}
          label="Sắp hết"
          value={formatNumber(dashboard?.lowCount || 0)}
          iconClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />
        <StatCard
          icon={XCircle}
          label="Hết hàng"
          value={formatNumber(dashboard?.outCount || 0)}
          iconClassName="bg-destructive/10 text-destructive"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tiêu hao nguyên liệu theo ngày</CardTitle>
          </CardHeader>
          <CardContent className="h-64 pr-2">
            {seriesLoading ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Đang tải dữ liệu biểu đồ...
              </div>
            ) : series.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Chưa có dữ liệu tiêu hao.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={series} barCategoryGap={24}>
                  <defs>
                    <linearGradient id="consumeBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(160 84% 45%)" />
                      <stop offset="100%" stopColor="hsl(160 84% 32%)" />
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
                    formatter={(value) => [formatNumber(value), "Tiêu hao"]}
                    labelFormatter={(label) => `Ngày ${label}`}
                  />
                  <Bar dataKey="value" fill="url(#consumeBar)" radius={[8, 8, 0, 0]} maxBarSize={42} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nguyên liệu cần nhập thêm</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {lowStockList.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-muted-foreground">
                Tất cả nguyên liệu đang đủ tồn. 🎉
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Nguyên liệu</TableHead>
                    <TableHead className="text-right">Tồn</TableHead>
                    <TableHead className="text-right">Ngưỡng</TableHead>
                    <TableHead className="pr-6">Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockList.map((m) => {
                    const meta = STATUS_META[m.status] || STATUS_META[MATERIAL_STATUS.LOW];
                    return (
                      <TableRow key={m._id}>
                        <TableCell className="pl-6 font-medium">{m.name}</TableCell>
                        <TableCell className="text-right">
                          {formatNumber(m.onHand)} {m.unit}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatNumber(m.minThreshold)} {m.unit}
                        </TableCell>
                        <TableCell className="pr-6">
                          <Badge className={cn(meta.className)}>{meta.label}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
