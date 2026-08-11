import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Mail, Phone, Cake, CalendarDays, Gift, Megaphone } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/common/DataTable";
import { formatNumber, formatVND, formatDate } from "@/helpers/format";
import { DATE_TIME_FORMAT, GENDER_LABEL } from "@/constants/application";
import { ROUTE_PATH } from "@/constants/routePaths";
import { CustomersApi } from "@/apis";
import { POINT_DIRECTION_LABEL, POINT_TRANSACTION_TYPE_LABEL } from "./constants";

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: customer, isLoading } = useQuery({
    queryKey: ["customer-detail", id],
    queryFn: async () => {
      const res = await CustomersApi.getById(id);
      if (!res?.data?.success) throw new Error(res?.data?.message || "Không tải được khách hàng.");
      return res.data.data.customer;
    },
  });

  const { data: vouchers = [], isLoading: isVouchersLoading } = useQuery({
    queryKey: ["customer-vouchers", id],
    queryFn: async () => {
      const res = await CustomersApi.getVouchers(id);
      return res?.data?.success ? res.data.data || [] : [];
    },
  });
  const timeline = vouchers.filter((v) => v.campaignId);

  const { data: pointsData, isLoading: isPointsLoading } = useQuery({
    queryKey: ["customer-point-history", id, page, pageSize],
    queryFn: async ({ signal }) => {
      const res = await CustomersApi.getPointHistory(id, { page, limit: pageSize }, signal);
      if (!res?.data?.success) return { list: [], total: 0 };
      return { list: res.data.data || [], total: res.data.pagination?.total ?? 0 };
    },
  });

  const initials = (customer?.fullName || "?")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const timelineColumns = [
    {
      key: "name",
      title: "Tên chiến dịch",
      minWidth: 200,
      render: (t) => t.campaignId?.name || "—",
    },
    {
      key: "issuedAt",
      title: "Thời gian được phát",
      width: 160,
      render: (t) => (t.createdAt ? formatDate(t.createdAt, DATE_TIME_FORMAT) : "—"),
    },
    {
      key: "voucher",
      title: "Voucher được phát",
      minWidth: 180,
      render: (t) =>
        t.voucherId?.code ? (
          <span className="font-mono text-xs">
            {t.voucherId.code}
            {t.voucherId.title ? ` — ${t.voucherId.title}` : ""}
          </span>
        ) : (
          t.title || "—"
        ),
    },
  ];

  const pointColumns = [
    {
      key: "createdAt",
      title: "Thời gian",
      width: 150,
      render: (t) => (t.createdAt ? formatDate(t.createdAt, DATE_TIME_FORMAT) : "—"),
    },
    {
      key: "user",
      title: "Người dùng",
      minWidth: 160,
      render: () => (
        <div>
          <p className="font-medium text-foreground">{customer?.fullName || "—"}</p>
          <p className="text-xs text-muted-foreground">{customer?.phone || "—"}</p>
        </div>
      ),
    },
    {
      key: "direction",
      title: "Loại",
      width: 130,
      render: (t) => POINT_DIRECTION_LABEL[t.pointsChange > 0 ? "EARN" : "USE"] || "—",
    },
    {
      key: "transactionType",
      title: "Hình thức",
      width: 150,
      render: (t) => POINT_TRANSACTION_TYPE_LABEL[t.transactionType] || t.transactionType || "—",
    },
    {
      key: "points",
      title: "Điểm",
      width: 100,
      align: "right",
      render: (t) => (
        <span className={t.pointsChange > 0 ? "font-semibold text-emerald-600" : "font-semibold text-destructive"}>
          {t.pointsChange > 0 ? "+" : ""}
          {formatNumber(t.pointsChange ?? 0)}
        </span>
      ),
    },
  ];

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto pb-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Khách hàng / Chi tiết khách hàng</p>
          <h1 className="text-2xl font-semibold">{customer?.fullName || (isLoading ? "Đang tải..." : "Khách hàng")}</h1>
        </div>
        <Button variant="outline" onClick={() => navigate(ROUTE_PATH.CUSTOMERS)}>
          <ArrowLeft className="size-4" /> Quay lại
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        {/* Cột trái: thông tin khách hàng */}
        <div className="space-y-4">
          <Card>
            <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
              <Avatar className="size-20">
                <AvatarFallback className="bg-primary/15 text-2xl font-bold text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-lg font-bold text-foreground">{customer?.fullName || "—"}</p>
                <p className="text-xs text-muted-foreground">ID: {customer?._id}</p>
              </div>
              <Badge variant={customer?.isActive === false ? "secondary" : "success"}>
                {customer?.isActive === false ? "Ngưng hoạt động" : "Hoạt động"}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Thông tin liên hệ
              </p>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="size-4 text-muted-foreground" />
                {customer?.phone || "—"}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="size-4 text-muted-foreground" />
                {customer?.email || "—"}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Cake className="size-4 text-muted-foreground" />
                {customer?.dateOfBirth ? formatDate(customer.dateOfBirth) : "—"}
                {customer?.gender ? ` · ${GENDER_LABEL[customer.gender] || customer.gender}` : ""}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CalendarDays className="size-4 text-muted-foreground" />
                Ngày đăng ký: {customer?.createdAt ? formatDate(customer.createdAt) : "—"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Tổng quan
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Hạng thành viên</span>
                {customer?.tierId?.name ? (
                  <Badge variant="secondary">{customer.tierId.name}</Badge>
                ) : (
                  "—"
                )}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Điểm hiện tại</span>
                <span className="font-semibold text-foreground">{formatNumber(customer?.currentPoints ?? 0)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tổng chi tiêu</span>
                <span className="font-semibold text-foreground">{formatVND(customer?.totalSpent ?? 0)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Gift className="size-4" />
                Số lần đổi quà: <span className="font-semibold text-foreground">{formatNumber(customer?.redeemCount ?? 0)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Megaphone className="size-4" />
                Chiến dịch tham gia: <span className="font-semibold text-foreground">{formatNumber(timeline.length)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cột phải: tabs */}
        <div>
          <Tabs defaultValue="timeline">
            <TabsList>
              <TabsTrigger value="timeline">Timeline chiến dịch</TabsTrigger>
              <TabsTrigger value="points">Giao dịch điểm</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline">
              <DataTable
                columns={timelineColumns}
                dataSource={timeline}
                rowKey="_id"
                loading={isVouchersLoading}
                total={timeline.length}
                showSizeChanger={false}
                heightOffset={16}
                empty="Khách hàng chưa được phát voucher từ chiến dịch nào."
              />
            </TabsContent>

            <TabsContent value="points">
              <DataTable
                columns={pointColumns}
                dataSource={pointsData?.list ?? []}
                rowKey="_id"
                loading={isPointsLoading}
                total={pointsData?.total ?? 0}
                pageIndex={page}
                pageSize={pageSize}
                onChange={(p, ps) => {
                  setPage(p);
                  setPageSize(ps);
                }}
                heightOffset={16}
                empty="Chưa có giao dịch điểm nào."
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
