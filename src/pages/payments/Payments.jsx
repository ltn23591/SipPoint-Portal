import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Banknote,
  QrCode,
  Loader2,
  Receipt,
  CircleDollarSign,
  CreditCard,
  CheckCircle2,
  Search,
  Filter,
  Calendar,
  Eye,
  ShoppingBag,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { useDebounce } from "@/hooks/useDebounce";
import { formatNumber, formatVND, formatDate } from "@/helpers/format";
import { DATE_TIME_FORMAT, ORDER_STATUS_LABEL, ORDER_STATUS_VARIANT } from "@/constants/application";
import { ROUTE_PATH } from "@/constants/routePaths";
import { StoreApi, OrdersApi } from "@/apis";

const ICONS = { CASH: Banknote, TRANSFER: QrCode };

const METHOD_DEFINITIONS = [
  { type: "CASH", name: "Tiền mặt", fee: "Miễn phí" },
  { type: "TRANSFER", name: "Chuyển khoản / Mã QR Ngân hàng", fee: "Miễn phí" },
];

const ALL_FILTER = "ALL";

export default function Payments() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Filter states
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 400);
  const [paymentMethod, setPaymentMethod] = useState(ALL_FILTER);
  const [statusFilter, setStatusFilter] = useState(ALL_FILTER);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Store payment config query
  const { data: storeConfig, isLoading: isConfigLoading } = useQuery({
    queryKey: ["store-config"],
    queryFn: async () => {
      const res = await StoreApi.getConfig();
      return res?.data?.data || res?.data || {};
    },
  });

  const activeMethods = storeConfig?.paymentMethods || ["CASH", "TRANSFER"];

  // Toggle payment method mutation
  const updateMutation = useMutation({
    mutationFn: async (newPaymentMethods) => {
      return await StoreApi.updateConfig({ paymentMethods: newPaymentMethods });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["store-config"]);
      toast.success("Cập nhật phương thức thanh toán thành công!");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || err?.message || "Lỗi cập nhật cấu hình.");
    },
  });

  const handleToggle = (type) => {
    let nextMethods;
    if (activeMethods.includes(type)) {
      if (activeMethods.length === 1) {
        toast.warning("Hệ thống phải có ít nhất 1 phương thức thanh toán hoạt động!");
        return;
      }
      nextMethods = activeMethods.filter((m) => m !== type);
    } else {
      nextMethods = [...activeMethods, type];
    }
    updateMutation.mutate(nextMethods);
  };

  // Payment transactions query
  const queryParams = useMemo(
    () => ({
      page,
      limit: pageSize,
      ...(search ? { search } : {}),
      ...(paymentMethod !== ALL_FILTER ? { paymentMethod } : {}),
      ...(statusFilter !== ALL_FILTER ? { status: statusFilter } : {}),
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
    }),
    [page, pageSize, search, paymentMethod, statusFilter, startDate, endDate]
  );

  const { data: ordersData, isLoading: isOrdersLoading, isError } = useQuery({
    queryKey: ["payment-transactions", queryParams],
    queryFn: async ({ signal }) => {
      const res = await OrdersApi.getAll(queryParams, signal);
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Không tải được danh sách hóa đơn thanh toán.");
      }
      return {
        list: res.data.data || [],
        total: res.data.pagination?.total ?? 0,
      };
    },
    placeholderData: keepPreviousData,
  });

  // Financial summary KPI query
  const { data: summaryData } = useQuery({
    queryKey: ["payment-summary", startDate, endDate],
    queryFn: async ({ signal }) => {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const res = await OrdersApi.getPaymentSummary(params, signal);
      return res?.data?.data || { totalRevenue: 0, cashRevenue: 0, transferRevenue: 0, paidOrdersCount: 0, totalOrdersCount: 0 };
    },
  });

  const orders = ordersData?.list ?? [];
  const totalOrders = ordersData?.total ?? 0;

  const columns = [
    {
      key: "code",
      title: "Mã hóa đơn",
      width: 140,
      render: (o) => (
        <button
          onClick={() => navigate(ROUTE_PATH.ORDER_DETAIL.replace(":id", o._id))}
          className="flex items-center gap-1.5 font-mono text-xs font-semibold text-primary hover:underline"
        >
          <Receipt className="size-3.5" />
          #{o.code || (o._id ? o._id.slice(-6).toUpperCase() : "—")}
        </button>
      ),
    },
    {
      key: "createdAt",
      title: "Thời gian tạo",
      width: 150,
      render: (o) => (o.createdAt ? formatDate(o.createdAt, DATE_TIME_FORMAT) : "—"),
    },
    {
      key: "customer",
      title: "Khách hàng & Bàn",
      minWidth: 180,
      render: (o) => {
        const cust = o.customerId;
        const table = o.tableId;
        return (
          <div>
            <p className="font-medium text-foreground">{cust?.fullName || "Khách vãng lai"}</p>
            <p className="text-xs text-muted-foreground">
              {cust?.phone ? `SĐT: ${cust.phone}` : ""}
              {table?.name ? ` · Bàn ${table.name}` : " · Mang đi"}
            </p>
          </div>
        );
      },
    },
    {
      key: "paymentMethod",
      title: "Phương thức",
      width: 160,
      render: (o) => {
        const isCash = o.paymentMethod === "CASH";
        return (
          <Badge variant={isCash ? "secondary" : "outline"} className="gap-1 font-normal">
            {isCash ? <Banknote className="size-3 text-[#855300]" /> : <QrCode className="size-3 text-blue-600" />}
            {isCash ? "Tiền mặt" : "Chuyển khoản QR"}
          </Badge>
        );
      },
    },
    {
      key: "status",
      title: "Trạng thái đơn",
      width: 150,
      render: (o) => {
        const label = ORDER_STATUS_LABEL[o.status] || o.status;
        const variant = ORDER_STATUS_VARIANT[o.status] || "secondary";
        return <Badge variant={variant}>{label}</Badge>;
      },
    },
    {
      key: "total",
      title: "Tổng tiền",
      width: 130,
      align: "right",
      render: (o) => (
        <span className="font-bold text-foreground">
          {formatVND(o.total ?? 0)}
        </span>
      ),
    },
    {
      key: "actions",
      title: "",
      width: 80,
      align: "right",
      render: (o) => (
        <Button
          variant="ghost"
          size="icon-sm"
          title="Xem chi tiết đơn hàng"
          onClick={() => navigate(ROUTE_PATH.ORDER_DETAIL.replace(":id", o._id))}
        >
          <Eye className="size-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="flex h-full flex-col gap-4">
      <PageHeader
        title="Quản lý Thanh toán"
        description="Theo dõi lịch sử giao dịch tiền, hóa đơn thanh toán và cấu hình các phương thức thanh toán."
      />

      <Tabs defaultValue="transactions" className="flex flex-1 flex-col gap-4">
        <TabsList className="w-fit">
          <TabsTrigger value="transactions" className="gap-1.5">
            <Receipt className="size-4" /> Lịch sử giao dịch tiền (Hóa đơn)
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-1.5">
            <CreditCard className="size-4" /> Cấu hình phương thức thanh toán
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Lịch sử giao dịch tiền */}
        <TabsContent value="transactions" className="flex flex-1 flex-col gap-4 m-0">
          {/* Thẻ KPI tổng quan tài chính */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-xs text-muted-foreground">Tổng doanh thu thực nhận</p>
                  <h3 className="text-xl font-bold text-foreground">
                    {formatVND(summaryData?.totalRevenue ?? 0)}
                  </h3>
                </div>
                <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                  <CircleDollarSign className="size-5" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-xs text-muted-foreground">Doanh thu Tiền mặt</p>
                  <h3 className="text-xl font-bold text-[#855300]">
                    {formatVND(summaryData?.cashRevenue ?? 0)}
                  </h3>
                </div>
                <div className="flex size-10 items-center justify-center rounded-lg bg-[#f59e0b]/10 text-[#855300]">
                  <Banknote className="size-5" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-xs text-muted-foreground">Doanh thu Chuyển khoản QR</p>
                  <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {formatVND(summaryData?.transferRevenue ?? 0)}
                  </h3>
                </div>
                <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                  <QrCode className="size-5" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-xs text-muted-foreground">Hóa đơn đã thanh toán</p>
                  <h3 className="text-xl font-bold text-foreground">
                    {formatNumber(summaryData?.paidOrdersCount ?? 0)} / {formatNumber(summaryData?.totalOrdersCount ?? 0)}
                  </h3>
                </div>
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <CheckCircle2 className="size-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bộ lọc giao dịch tiền */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-3 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-1">
                <Filter className="size-3.5" /> Lọc:
              </div>

              <Select
                value={paymentMethod}
                onValueChange={(v) => {
                  setPaymentMethod(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-44">
                  <SelectValue placeholder="Phương thức" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_FILTER}>Tất cả phương thức</SelectItem>
                  <SelectItem value="CASH">Tiền mặt</SelectItem>
                  <SelectItem value="TRANSFER">Chuyển khoản QR</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={statusFilter}
                onValueChange={(v) => {
                  setStatusFilter(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-44">
                  <SelectValue placeholder="Trạng thái đơn" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_FILTER}>Tất cả trạng thái</SelectItem>
                  <SelectItem value="COMPLETED">Hoàn tất (Đã thanh toán)</SelectItem>
                  <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                  <SelectItem value="CONFIRMED">Đã nhận đơn</SelectItem>
                  <SelectItem value="PREPARING">Đang chuẩn bị</SelectItem>
                  <SelectItem value="READY">Sẵn sàng</SelectItem>
                  <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                  <SelectItem value="REFUNDED">Đã hoàn tiền</SelectItem>
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
                placeholder="Tìm mã hóa đơn (#OD...), tên KH, SĐT..."
                className="h-8 w-64 rounded-md border border-input bg-background pl-8 pr-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>

          {/* Bảng danh sách hóa đơn thanh toán */}
          <DataTable
            columns={columns}
            dataSource={orders}
            rowKey="_id"
            loading={isOrdersLoading}
            total={totalOrders}
            pageIndex={page}
            pageSize={pageSize}
            onChange={(p, ps) => {
              setPage(p);
              setPageSize(ps);
            }}
            heightOffset={16}
            empty={isError ? "Không tải được danh sách hóa đơn thanh toán." : "Không có hóa đơn thanh toán nào."}
          />
        </TabsContent>

        {/* Tab 2: Cấu hình phương thức thanh toán */}
        <TabsContent value="settings" className="m-0">
          {isConfigLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {METHOD_DEFINITIONS.map((m) => {
                const Icon = ICONS[m.type] ?? Banknote;
                const isEnabled = activeMethods.includes(m.type);
                return (
                  <div
                    key={m.type}
                    className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <Icon className="size-5" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{m.name}</p>
                        <p className="text-xs text-muted-foreground">{m.fee}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={isEnabled ? "success" : "secondary"}>
                        {isEnabled ? "Đang bật" : "Đã tắt"}
                      </Badge>
                      <Switch
                        checked={isEnabled}
                        disabled={updateMutation.isPending}
                        onCheckedChange={() => handleToggle(m.type)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
