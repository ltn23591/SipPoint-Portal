import { DollarSign, ShoppingBag, Receipt, TrendingUp } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
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
import { REPORT_SUMMARY, TOP_PRODUCTS } from "./mockData";

export default function Reports() {
  const s = REPORT_SUMMARY;
  return (
    <div className="space-y-6">
      <PageHeader
        title="Báo cáo"
        description="Doanh thu, sản phẩm, khách hàng theo thời gian (hôm nay)."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={DollarSign} label="Doanh thu" value={formatVND(s.revenue)} />
        <StatCard icon={ShoppingBag} label="Số đơn" value={formatNumber(s.orders)} />
        <StatCard icon={Receipt} label="TB / đơn" value={formatVND(s.avgOrderValue)} />
        <StatCard icon={TrendingUp} label="Lợi nhuận gộp" value={formatVND(s.grossProfit)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sản phẩm bán chạy</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Sản phẩm</TableHead>
                <TableHead className="text-right">Số lượng</TableHead>
                <TableHead className="pr-6 text-right">Doanh thu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {TOP_PRODUCTS.map((p) => (
                <TableRow key={p.name}>
                  <TableCell className="pl-6 font-medium">{p.name}</TableCell>
                  <TableCell className="text-right">{formatNumber(p.qty)}</TableCell>
                  <TableCell className="pr-6 text-right font-medium">{formatVND(p.revenue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
