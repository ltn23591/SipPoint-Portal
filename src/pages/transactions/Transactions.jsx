import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Search, History, ArrowUpRight, ArrowDownLeft, ShoppingBag, Filter, Calendar, Eye, CircleDollarSign } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/useDebounce";
import { formatNumber, formatVND, formatDate } from "@/helpers/format";
import { DATE_TIME_FORMAT } from "@/constants/application";
import { ROUTE_PATH } from "@/constants/routePaths";
import { CustomersApi } from "@/apis";
import { POINT_TRANSACTION_TYPE_LABEL } from "../customers/constants";
import { OrderDetailDialog } from "../orders/components/OrderDetailDialog";

const ALL_TYPES = "ALL";

const TYPE_VARIANTS = {
  ORDER: "success",
  REWARD: "destructive",
  BIRTHDAY_GIFT: "secondary",
  ADJUSTMENT: "outline",
  REFUND: "warning",
  LUCKY_WHEEL: "secondary",
  LUCKY_GAME: "success",
  LUCKY_GAME_EXCHANGE_TURN: "destructive",
};

export default function Transactions() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 400);
  const [transactionType, setTransactionType] = useState(ALL_TYPES);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const params = useMemo(
    () => ({
      page,
      limit: pageSize,
      ...(search ? { search } : {}),
      ...(transactionType !== ALL_TYPES ? { transactionType } : {}),
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
    }),
    [page, pageSize, search, transactionType, startDate, endDate]
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: ["all-point-transactions", params],
    queryFn: async ({ signal }) => {
      const res = await CustomersApi.getAllPointHistories(params, signal);
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Không tải được danh sách giao dịch.");
      }
      return {
        list: res.data.data || [],
        total: res.data.pagination?.total ?? 0,
      };
    },
    placeholderData: keepPreviousData,
  });

  const transactions = data?.list ?? [];
  const total = data?.total ?? 0;

  // Tính thống kê nhanh của trang hiện tại
  const stats = useMemo(() => {
    let earned = 0;
    let redeemed = 0;
    let totalMoney = 0;
    transactions.forEach((tx) => {
      if (tx.pointsChange > 0) earned += tx.pointsChange;
      else redeemed += Math.abs(tx.pointsChange);

      if (tx.orderId) {
        const money = tx.orderId.total ?? tx.orderId.finalAmount;
        if (money !== undefined && money !== null) {
          totalMoney += money;
        }
      } else if (tx.transactionType === "ORDER") {
        const match = tx.description?.match(/(\d+[\d\.]*)\s*đ/i);
        if (match) {
          const rawNum = parseInt(match[1].replace(/\./g, ""), 10);
          if (!isNaN(rawNum)) totalMoney += rawNum;
        }
      }
    });
    return { earned, redeemed, totalMoney };
  }, [transactions]);

  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const columns = [
    {
      key: "createdAt",
      title: "Thời gian",
      width: 150,
      render: (t) => (t.createdAt ? formatDate(t.createdAt, DATE_TIME_FORMAT) : "—"),
    },
    {
      key: "customer",
      title: "Khách hàng",
      minWidth: 180,
      render: (t) => {
        const cust = t.customerId;
        if (!cust) return <span className="text-muted-foreground">—</span>;
        return (
          <div
            className="group cursor-pointer"
            onClick={() => navigate(ROUTE_PATH.CUSTOMER_DETAIL.replace(":id", cust._id))}
          >
            <p className="font-medium text-foreground group-hover:text-primary transition-colors">
              {cust.fullName || "—"}
            </p>
            <p className="text-xs text-muted-foreground">{cust.phone || cust.email || "—"}</p>
          </div>
        );
      },
    },
    {
      key: "transactionType",
      title: "Loại giao dịch",
      width: 160,
      render: (t) => {
        const label = POINT_TRANSACTION_TYPE_LABEL[t.transactionType] || t.transactionType;
        const variant = TYPE_VARIANTS[t.transactionType] || "secondary";
        return <Badge variant={variant}>{label}</Badge>;
      },
    },
    {
      key: "title",
      title: "Nội dung",
      minWidth: 200,
      render: (t) => (
        <div>
          <p className="font-medium text-foreground">{t.title || "—"}</p>
          {t.description && <p className="text-xs text-muted-foreground">{t.description}</p>}
        </div>
      ),
    },
    {
      key: "order",
      title: "Mã đơn hàng",
      width: 140,
      render: (t) => {
        const order = t.orderId;
        if (!order) return <span className="text-muted-foreground">—</span>;
        const code = order.code || order.orderCode || (order._id ? order._id.slice(-6).toUpperCase() : null);
        return (
          <button
            onClick={() => {
              setSelectedOrderId(order._id);
              setIsDetailOpen(true);
            }}
            className="flex items-center gap-1 font-mono text-xs text-primary hover:underline"
          >
            <ShoppingBag className="size-3" />
            #{code}
          </button>
        );
      },
    },
    {
      key: "orderAmount",
      title: "Số tiền giao dịch",
      width: 150,
      align: "right",
      render: (t) => {
        if (t.orderId) {
          const total = t.orderId.total ?? t.orderId.finalAmount;
          if (total !== undefined && total !== null) {
            return <span className="font-bold text-foreground">{formatVND(total)}</span>;
          }
        }
        if (t.transactionType === "ORDER") {
          const match = t.description?.match(/(\d+[\d\.]*)\s*đ/i);
          if (match) {
            return <span className="font-bold text-foreground">{match[1]} đ</span>;
          }
        }
        return <span className="text-muted-foreground">—</span>;
      },
    },
    {
      key: "pointsChange",
      title: "Biến động điểm",
      width: 130,
      align: "right",
      render: (t) => {
        const isPositive = t.pointsChange > 0;
        return (
          <span
            className={
              isPositive
                ? "font-semibold text-emerald-600 dark:text-emerald-400"
                : "font-semibold text-destructive"
            }
          >
            {isPositive ? "+" : ""}
            {formatNumber(t.pointsChange ?? 0)} đ
          </span>
        );
      },
    },
    {
      key: "actions",
      title: "Hóa đơn",
      width: 90,
      align: "center",
      render: (t) => {
        const orderId = t.orderId?._id || t.orderId;
        if (!orderId) return <span className="text-muted-foreground">—</span>;
        return (
          <Button
            variant="ghost"
            size="icon-sm"
            title="Xem chi tiết hóa đơn thanh toán"
            onClick={() => {
              setSelectedOrderId(orderId);
              setIsDetailOpen(true);
            }}
          >
            <Eye className="size-4 text-primary" />
          </Button>
        );
      },
    },
  ];

  return (
    <div className="flex h-full flex-col gap-4">
      <PageHeader
        title="Lịch sử giao dịch"
        description="Quản lý và theo dõi toàn bộ biến động tích điểm, đổi điểm trong hệ thống."
      />

      {/* Thẻ thống kê KPI */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs text-muted-foreground">Tổng số giao dịch</p>
              <h3 className="text-2xl font-bold text-foreground">{formatNumber(total)}</h3>
            </div>
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <History className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs text-muted-foreground">Tổng tiền giao dịch</p>
              <h3 className="text-xl font-bold text-foreground">
                {formatVND(stats.totalMoney)}
              </h3>
            </div>
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
              <CircleDollarSign className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs text-muted-foreground">Tổng điểm tích lũy </p>
              <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                +{formatNumber(stats.earned)}
              </h3>
            </div>
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <ArrowUpRight className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs text-muted-foreground">Tổng điểm đã tiêu </p>
              <h3 className="text-2xl font-bold text-destructive">
                -{formatNumber(stats.redeemed)}
              </h3>
            </div>
            <div className="flex size-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <ArrowDownLeft className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Thanh lọc & tìm kiếm */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-1">
            <Filter className="size-3.5" /> Bộ lọc:
          </div>

          <Select
            value={transactionType}
            onValueChange={(v) => {
              setTransactionType(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-44">
              <SelectValue placeholder="Loại giao dịch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_TYPES}>Tất cả loại giao dịch</SelectItem>
              {Object.entries(POINT_TRANSACTION_TYPE_LABEL).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1 text-xs">
            <Calendar className="size-3.5 text-muted-foreground" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <span className="text-muted-foreground">đến</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm theo tên KH, SĐT, nội dung..."
            className="h-8 w-64 rounded-md border border-input bg-background pl-8 pr-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </div>

      {/* Bảng danh sách */}
      <DataTable
        columns={columns}
        dataSource={transactions}
        rowKey="_id"
        loading={isLoading}
        total={total}
        pageIndex={page}
        pageSize={pageSize}
        onChange={(p, ps) => {
          setPage(p);
          setPageSize(ps);
        }}
        heightOffset={16}
        empty={isError ? "Không tải được dữ liệu giao dịch." : "Chưa có giao dịch điểm nào."}
      />

      {/* Order Detail Modal */}
      <OrderDetailDialog
        orderId={selectedOrderId}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  );
}
