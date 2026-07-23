import { useMemo, useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, Trash2, Play, Square, Trophy } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/useDebounce";
import { formatDate } from "@/helpers/format";
import {
  LUCKY_WHEEL_STATUS,
  LUCKY_WHEEL_STATUS_LABEL,
  WHEEL_TARGET_TYPE,
  WHEEL_TARGET_TYPE_LABEL,
} from "@/constants/application";
import { LuckyWheelApi } from "@/apis";
import { LuckyWheelFormDialog } from "./LuckyWheelFormDialog";
import { WheelSpinsDialog } from "./WheelSpinsDialog";

const ALL_STATUS = "__all__";

const STATUS_BADGE_CLASS = {
  [LUCKY_WHEEL_STATUS.DRAFT]: "bg-muted text-muted-foreground",
  [LUCKY_WHEEL_STATUS.ACTIVE]: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  [LUCKY_WHEEL_STATUS.FINISHED]: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
};

const targetLabel = (w) => {
  if (w.targetType === WHEEL_TARGET_TYPE.SEGMENT)
    return `${WHEEL_TARGET_TYPE_LABEL.SEGMENT} (${(w.segmentIds || []).length})`;
  if (w.targetType === WHEEL_TARGET_TYPE.TIER)
    return `${WHEEL_TARGET_TYPE_LABEL.TIER} (${(w.tierIds || []).length})`;
  return WHEEL_TARGET_TYPE_LABEL.ALL;
};

export default function LuckyWheel() {
  const qc = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 400);
  const [status, setStatus] = useState(ALL_STATUS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [spinsWheel, setSpinsWheel] = useState(null);
  const [confirming, setConfirming] = useState(null); // { type, wheel }

  const params = useMemo(
    () => ({
      page,
      limit: pageSize,
      ...(search ? { search } : {}),
      ...(status !== ALL_STATUS ? { status } : {}),
    }),
    [page, pageSize, search, status]
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: ["lucky-wheels", params],
    queryFn: async ({ signal }) => {
      const res = await LuckyWheelApi.getAll(params, signal);
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Không tải được danh sách vòng quay.");
      }
      return { list: res.data.data || [], total: res.data.pagination?.total ?? 0 };
    },
    placeholderData: keepPreviousData,
  });

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      const res = editing?._id
        ? await LuckyWheelApi.update(editing._id, payload)
        : await LuckyWheelApi.create(payload);
      if (!res?.data?.success) throw new Error(res?.data?.message || "Lưu vòng quay thất bại.");
      return res.data;
    },
    onSuccess: (res) => {
      toast.success(res?.message || "Đã lưu vòng quay.");
      qc.invalidateQueries({ queryKey: ["lucky-wheels"] });
      setFormOpen(false);
      setEditing(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const actionMutation = useMutation({
    mutationFn: async ({ type, wheel }) => {
      let res;
      if (type === "activate") res = await LuckyWheelApi.updateStatus(wheel._id, { status: LUCKY_WHEEL_STATUS.ACTIVE });
      else if (type === "finish") res = await LuckyWheelApi.updateStatus(wheel._id, { status: LUCKY_WHEEL_STATUS.FINISHED });
      else res = await LuckyWheelApi.delete(wheel._id);
      if (!res?.data?.success) throw new Error(res?.data?.message || "Thao tác thất bại.");
      return res.data;
    },
    onSuccess: (res) => {
      toast.success(res?.message || "Thao tác thành công.");
      qc.invalidateQueries({ queryKey: ["lucky-wheels"] });
      setConfirming(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const CONFIRM_TEXT = {
    activate: {
      title: "Kích hoạt vòng quay",
      description: `Mở "${confirming?.wheel?.name}" cho khách quay? Sau khi kích hoạt sẽ không sửa được cấu hình.`,
      confirmText: "Kích hoạt",
      variant: "default",
    },
    finish: {
      title: "Kết thúc vòng quay",
      description: `Kết thúc "${confirming?.wheel?.name}"? Khách sẽ không quay được nữa.`,
      confirmText: "Kết thúc",
      variant: "destructive",
    },
    delete: {
      title: "Xóa vòng quay",
      description: `Xóa vòng quay nháp "${confirming?.wheel?.name}"?`,
      confirmText: "Xóa",
      variant: "destructive",
    },
  };

  const columns = [
    {
      key: "name",
      title: "Vòng quay",
      minWidth: 180,
      render: (w) => (
        <div>
          <p className="font-medium text-foreground">{w.name}</p>
          {w.description ? <p className="text-xs text-muted-foreground">{w.description}</p> : null}
        </div>
      ),
    },
    {
      key: "target",
      title: "Phạm vi",
      minWidth: 150,
      render: (w) => <span className="text-sm">{targetLabel(w)}</span>,
    },
    {
      key: "slots",
      title: "Số ô",
      width: 80,
      align: "right",
      render: (w) => (w.slots || []).length,
    },
    {
      key: "endDate",
      title: "Kết thúc",
      width: 110,
      render: (w) => (w.endDate ? formatDate(w.endDate) : "—"),
    },
    {
      key: "status",
      title: "Trạng thái",
      width: 110,
      render: (w) => (
        <Badge className={STATUS_BADGE_CLASS[w.status]}>
          {LUCKY_WHEEL_STATUS_LABEL[w.status] || w.status}
        </Badge>
      ),
    },
    {
      key: "actions",
      title: "",
      width: 150,
      align: "right",
      render: (w) => (
        <div className="flex justify-end gap-1">
          {w.status !== LUCKY_WHEEL_STATUS.DRAFT && (
            <Button variant="ghost" size="icon-sm" title="Người trúng" onClick={() => setSpinsWheel(w)}>
              <Trophy className="size-4 text-amber-500" />
            </Button>
          )}
          {w.status === LUCKY_WHEEL_STATUS.DRAFT && (
            <>
              <Button
                variant="ghost"
                size="icon-sm"
                title="Kích hoạt"
                onClick={() => setConfirming({ type: "activate", wheel: w })}
              >
                <Play className="size-4 text-emerald-600" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                title="Sửa"
                onClick={() => {
                  setEditing(w);
                  setFormOpen(true);
                }}
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                title="Xóa"
                onClick={() => setConfirming({ type: "delete", wheel: w })}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </>
          )}
          {w.status === LUCKY_WHEEL_STATUS.ACTIVE && (
            <Button
              variant="ghost"
              size="icon-sm"
              title="Kết thúc"
              onClick={() => setConfirming({ type: "finish", wheel: w })}
            >
              <Square className="size-4 text-destructive" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const confirmCfg = confirming ? CONFIRM_TEXT[confirming.type] : null;

  return (
    <div className="flex h-full flex-col gap-4">
      <PageHeader
        title="Vòng quay may mắn"
        description="Cấu hình phần thưởng theo nhóm khách hàng, tỉ lệ trúng và kho quà. Kích hoạt để khách bắt đầu quay."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="size-4" />
            Tạo vòng quay
          </Button>
        }
      />

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-8 w-40">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_STATUS}>Tất cả trạng thái</SelectItem>
            {Object.entries(LUCKY_WHEEL_STATUS_LABEL).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm theo tên vòng quay..."
            className="h-8 w-64 rounded-md border border-input bg-background pl-8 pr-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        dataSource={data?.list ?? []}
        rowKey="_id"
        loading={isLoading}
        total={data?.total ?? 0}
        pageIndex={page}
        pageSize={pageSize}
        onChange={(p, ps) => {
          setPage(p);
          setPageSize(ps);
        }}
        heightOffset={220}
        empty={isError ? "Không tải được dữ liệu." : "Chưa có vòng quay nào."}
      />

      <LuckyWheelFormDialog
        open={formOpen}
        onOpenChange={(v) => {
          setFormOpen(v);
          if (!v) setEditing(null);
        }}
        wheel={editing}
        loading={saveMutation.isPending}
        onSubmit={(payload) => saveMutation.mutate(payload)}
      />

      <WheelSpinsDialog
        open={!!spinsWheel}
        onOpenChange={(v) => !v && setSpinsWheel(null)}
        wheel={spinsWheel}
      />

      <ConfirmDialog
        open={!!confirming}
        onOpenChange={(v) => !v && setConfirming(null)}
        title={confirmCfg?.title}
        description={confirmCfg?.description}
        confirmText={confirmCfg?.confirmText}
        variant={confirmCfg?.variant}
        loading={actionMutation.isPending}
        onConfirm={() => actionMutation.mutate(confirming)}
      />
    </div>
  );
}
