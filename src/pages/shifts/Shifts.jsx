import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, LockKeyhole } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatVND, formatNumber, formatDate } from "@/helpers/format";
import {
  DATE_TIME_FORMAT,
  SHIFT_STATUS,
  SHIFT_STATUS_LABEL,
} from "@/constants/application";
import { ShiftApi } from "@/apis";
import { OpenShiftDialog } from "./OpenShiftDialog";
import { CloseShiftDialog } from "./CloseShiftDialog";

const QUERY_KEY = ["shifts"];

const STATUS_BADGE = {
  [SHIFT_STATUS.OPEN]: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  [SHIFT_STATUS.CLOSED]: "bg-muted text-muted-foreground",
};

async function fetchShifts() {
  const res = await ShiftApi.search();
  if (!res?.data?.success) {
    throw new Error(res?.data?.message || "Không tải được danh sách ca.");
  }
  return res.data.data || [];
}

export default function Shifts() {
  const qc = useQueryClient();
  const [openShiftOpen, setOpenShiftOpen] = useState(false);
  const [closing, setClosing] = useState(null);

  const { data: shifts = [], isLoading, isError } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchShifts,
  });

  const openMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await ShiftApi.open(payload);
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Mở ca thất bại.");
      }
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Đã mở ca làm việc.");
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      setOpenShiftOpen(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const closeMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await ShiftApi.close(closing._id, payload);
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Đóng ca thất bại.");
      }
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Đã đóng ca làm việc.");
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      setClosing(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const columns = [
    {
      key: "employee",
      title: "Nhân viên",
      minWidth: 170,
      render: (s) =>
        s.employeeId?.name || (
          <span className="text-muted-foreground">Chưa gán</span>
        ),
    },
    {
      key: "startingCash",
      title: "Tiền đầu ca",
      width: 130,
      align: "right",
      render: (s) => formatVND(s.startingCash ?? 0),
    },
    {
      key: "totalRevenue",
      title: "Doanh thu",
      width: 130,
      align: "right",
      render: (s) => formatVND(s.totalRevenue ?? 0),
    },
    {
      key: "totalOrders",
      title: "Số đơn",
      width: 90,
      align: "right",
      render: (s) => formatNumber(s.totalOrders ?? 0),
    },
    {
      key: "status",
      title: "Trạng thái",
      width: 120,
      render: (s) => (
        <Badge className={STATUS_BADGE[s.status] || "bg-muted text-muted-foreground"}>
          {SHIFT_STATUS_LABEL[s.status] || s.status}
        </Badge>
      ),
    },
    {
      key: "startTime",
      title: "Bắt đầu",
      width: 160,
      render: (s) => formatDate(s.startTime, DATE_TIME_FORMAT),
    },
    {
      key: "actions",
      title: "",
      width: 110,
      align: "right",
      render: (s) =>
        s.status === SHIFT_STATUS.OPEN ? (
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1 text-xs"
            onClick={() => setClosing(s)}
          >
            <LockKeyhole className="size-3.5" />
            Đóng ca
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="flex h-full flex-col gap-4">
      <PageHeader
        title="Ca làm việc"
        description="Mở / đóng ca và đối soát tiền quỹ."
        actions={
          <Button onClick={() => setOpenShiftOpen(true)}>
            <Plus className="size-4" />
            Mở ca
          </Button>
        }
      />

      <DataTable
        columns={columns}
        dataSource={shifts}
        rowKey="_id"
        loading={isLoading}
        total={0}
        heightOffset={200}
        empty={isError ? "Không tải được dữ liệu." : "Chưa có ca làm việc nào."}
      />

      <OpenShiftDialog
        open={openShiftOpen}
        onOpenChange={setOpenShiftOpen}
        loading={openMutation.isPending}
        onSubmit={(payload) => openMutation.mutate(payload)}
      />

      <CloseShiftDialog
        open={!!closing}
        onOpenChange={(v) => !v && setClosing(null)}
        shift={closing}
        loading={closeMutation.isPending}
        onSubmit={(payload) => closeMutation.mutate(payload)}
      />
    </div>
  );
}
