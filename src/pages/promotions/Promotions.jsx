import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Pencil, Trash2, Plus, Search, Coins } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DataTable } from "@/components/common/DataTable";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { PageHeader } from "@/components/common/PageHeader";
import { formatVND, formatNumber } from "@/helpers/format";
import { ROUTE_PATH } from "@/constants/routePaths";
import { VoucherApi } from "@/apis";
import {
  PROMO_STATUS_LABEL,
  PROMO_STATUS_VARIANT,
  PROMO_TYPE,
  PROMO_TYPE_LABEL,
  TEXT,
} from "./constants";

function displayStatus(v) {
  if (v.endDate && new Date(v.endDate) < new Date()) return "expired";
  return v.isActive === "active" ? "active" : "inactive";
}

export default function Promotions() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("ALL"); // ALL | VOUCHER | GIFT
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });

  const { data: items = [], isLoading, isError } = useQuery({
    queryKey: ["vouchers"],
    queryFn: async ({ signal }) => {
      const res = await VoucherApi.getAll(signal);
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Không tải được danh sách voucher.");
      }
      return res.data.data || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await VoucherApi.delete(id);
      if (!res?.data?.success) throw new Error(res?.data?.message || "Xóa voucher thất bại.");
      return res.data;
    },
    onSuccess: (res) => {
      toast.success(res?.message || "Đã xóa voucher.");
      qc.invalidateQueries({ queryKey: ["vouchers"] });
      setDeleteDialog({ open: false, item: null });
    },
    onError: (err) => toast.error(err.message),
  });

  const filtered = useMemo(() => {
    let list = items;
    if (filterType === "VOUCHER") {
      list = list.filter((p) => !p.pointsCost || p.pointsCost === 0);
    } else if (filterType === "GIFT") {
      list = list.filter((p) => p.pointsCost && p.pointsCost > 0);
    }

    if (!search) return list;
    const q = search.toLowerCase();
    return list.filter(
      (p) =>
        (p.code || "").toLowerCase().includes(q) ||
        (p.title || "").toLowerCase().includes(q)
    );
  }, [items, search, filterType]);

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const goDetail = (row, mode) =>
    navigate(ROUTE_PATH.PROMOTIONS_DETAIL.replace(":id", row._id), {
      state: { mode },
    });

  const columns = [
    {
      key: "code",
      title: TEXT.colCode,
      width: 130,
      render: (row) => (
        <span className="font-semibold text-primary">{row.code}</span>
      ),
    },
    { key: "title", title: TEXT.colName, minWidth: 180 },
    {
      key: "discountType",
      title: TEXT.colType,
      width: 120,
      render: (row) => (
        <span className="text-sm text-muted-foreground">
          {PROMO_TYPE_LABEL[row.discountType] || row.discountType}
        </span>
      ),
    },
    {
      key: "discountValue",
      title: TEXT.colValue,
      width: 100,
      align: "right",
      render: (row) => (
        <span className="font-medium">
          {row.discountType === PROMO_TYPE.PERCENT
            ? `${row.discountValue}%`
            : formatVND(row.discountValue)}
        </span>
      ),
    },
    {
      key: "minOrderValue",
      title: TEXT.colMinOrder,
      width: 120,
      align: "right",
      render: (row) => formatVND(row.minOrderValue ?? 0),
    },
    {
      key: "pointsCost",
      title: "Đổi điểm",
      width: 100,
      align: "right",
      render: (row) =>
        row.pointsCost > 0 ? (
          <span className="inline-flex items-center gap-1 text-sm font-medium text-amber-600">
            <Coins className="size-3.5" />
            {formatNumber(row.pointsCost)}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "usage",
      title: "Đã dùng / Phát / Kho",
      width: 140,
      align: "right",
      render: (row) => (
        <span className="text-sm tabular-nums text-muted-foreground">
          {formatNumber((row.usedCount ?? 0) + (row.walletUsedCount ?? 0))} / {formatNumber(row.issuedCount ?? 0)} /{" "}
          {formatNumber(row.usageLimit ?? 0)}
        </span>
      ),
    },
    {
      key: "status",
      title: TEXT.colStatus,
      width: 110,
      render: (row) => {
        const s = displayStatus(row);
        return <Badge variant={PROMO_STATUS_VARIANT[s]}>{PROMO_STATUS_LABEL[s]}</Badge>;
      },
    },
    {
      key: "actions",
      title: TEXT.colActions,
      width: 120,
      align: "center",
      render: (row) => (
        <TooltipProvider delayDuration={300}>
          <div className="flex items-center justify-center gap-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="size-8 text-muted-foreground hover:text-foreground"
                  onClick={() => goDetail(row, "view")}
                >
                  <Eye className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">{TEXT.viewDetail}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="size-8 text-muted-foreground hover:text-foreground"
                  onClick={() => goDetail(row, "edit")}
                >
                  <Pencil className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">{TEXT.edit}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="size-8 text-destructive hover:bg-destructive/10"
                  onClick={() => setDeleteDialog({ open: true, item: row })}
                >
                  <Trash2 className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">{TEXT.delete}</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      ),
    },
  ];

  return (
    <div className="flex h-full flex-col gap-4">
      <PageHeader
        title={TEXT.pageTitle}
        description={TEXT.pageDesc}
        actions={
          <Button size="sm" onClick={() => navigate(ROUTE_PATH.PROMOTIONS_DETAIL.replace(":id", "new"), { state: { mode: "create" } })}>
            <Plus className="size-4" />
            {TEXT.addItem}
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
          <Button
            type="button"
            variant={filterType === "ALL" ? "default" : "ghost"}
            size="xs"
            onClick={() => { setFilterType("ALL"); setPage(1); }}
            className="h-7 px-3 text-xs"
          >
            Tất cả ({items.length})
          </Button>
          <Button
            type="button"
            variant={filterType === "VOUCHER" ? "default" : "ghost"}
            size="xs"
            onClick={() => { setFilterType("VOUCHER"); setPage(1); }}
            className="h-7 px-3 text-xs"
          >
            Mã giảm giá ({items.filter(x => !x.pointsCost || x.pointsCost === 0).length})
          </Button>
          <Button
            type="button"
            variant={filterType === "GIFT" ? "default" : "ghost"}
            size="xs"
            onClick={() => { setFilterType("GIFT"); setPage(1); }}
            className="h-7 px-3 text-xs gap-1"
          >
            <Coins className="size-3.5 text-amber-500" />
            Quà đổi điểm ({items.filter(x => x.pointsCost && x.pointsCost > 0).length})
          </Button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={TEXT.searchPlaceholder}
            className="h-8 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        dataSource={paginated}
        rowKey="_id"
        loading={isLoading}
        total={filtered.length}
        pageIndex={page}
        pageSize={pageSize}
        onChange={(p, ps) => {
          setPage(p);
          setPageSize(ps);
        }}
        heightOffset={16}
        empty={isError ? "Không tải được dữ liệu." : "Chưa có voucher nào."}
      />

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog((s) => ({ ...s, open }))}
        title={TEXT.confirmDeleteTitle}
        description={
          deleteDialog.item ? TEXT.confirmDeleteDesc(deleteDialog.item.title) : ""
        }
        confirmText={TEXT.confirmYes}
        cancelText={TEXT.confirmNo}
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(deleteDialog.item._id)}
      />
    </div>
  );
}
