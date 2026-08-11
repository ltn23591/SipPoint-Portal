import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Eye, Pencil, Trash2, Plus, Search, PackagePlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DataTable } from "@/components/common/DataTable";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { PageHeader } from "@/components/common/PageHeader";
import { useDebounce } from "@/hooks/useDebounce";
import { formatNumber } from "@/helpers/format";
import { cn } from "@/lib/utils";
import { ROUTE_PATH } from "@/constants/routePaths";
import { MaterialApi } from "@/apis";
import { StockDialog } from "./StockDialog";
import { MATERIAL_STATUS, STATUS_META, TEXT } from "./constants";

const ALL_STATUS = "__all__";

function parseList(body) {
  const data = body?.data || {};
  const list = data.materials ?? (Array.isArray(data) ? data : []);
  const total = data.pagination?.total ?? list.length;
  return { list, total };
}

export default function Inventory() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [searchInput, setSearchInput] = useState("");
  const keyword = useDebounce(searchInput, 400);
  const [status, setStatus] = useState(ALL_STATUS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleting, setDeleting] = useState(null);
  const [importing, setImporting] = useState(null);

  const params = useMemo(
    () => ({
      page,
      limit: pageSize,
      ...(keyword ? { keyword } : {}),
      ...(status !== ALL_STATUS ? { status } : {}),
    }),
    [page, pageSize, keyword, status]
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: ["materials", params],
    queryFn: async ({ signal }) => {
      const res = await MaterialApi.getAll(params, signal);
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || TEXT.loadError);
      }
      return parseList(res.data);
    },
    placeholderData: keepPreviousData,
  });

  const materials = data?.list ?? [];
  const total = data?.total ?? 0;

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await MaterialApi.delete(id);
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Xóa nguyên liệu thất bại.");
      }
      return res.data;
    },
    onSuccess: (res) => {
      toast.success(res?.message || "Đã xóa nguyên liệu.");
      qc.invalidateQueries({ queryKey: ["materials"] });
      setDeleting(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const importMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const res = await MaterialApi.importStock(id, payload);
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Nhập kho thất bại.");
      }
      return res.data;
    },
    onSuccess: (res) => {
      toast.success(res?.message || "Nhập kho thành công.");
      qc.invalidateQueries({ queryKey: ["materials"] });
      setImporting(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const goDetail = (row, mode) =>
    navigate(ROUTE_PATH.INVENTORY_DETAIL.replace(":id", row._id), {
      state: { mode },
    });

  const columns = [
    {
      key: "name",
      title: TEXT.colName,
      minWidth: 180,
      render: (r) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{r.name}</span>
          {r.code && <span className="text-xs text-muted-foreground">{r.code}</span>}
        </div>
      ),
    },
    {
      key: "unit",
      title: TEXT.colUnit,
      width: 80,
      render: (r) => <span className="text-sm text-muted-foreground">{r.unit}</span>,
    },
    {
      key: "onHand",
      title: TEXT.colStock,
      width: 110,
      align: "right",
      render: (r) => formatNumber(r.onHand),
    },
    {
      key: "reserved",
      title: TEXT.colReserved,
      width: 100,
      align: "right",
      render: (r) =>
        r.reserved > 0 ? (
          <span className="text-amber-600 dark:text-amber-400">{formatNumber(r.reserved)}</span>
        ) : (
          <span className="text-muted-foreground">0</span>
        ),
    },
    {
      key: "minThreshold",
      title: TEXT.colMinStock,
      width: 120,
      align: "right",
      render: (r) => formatNumber(r.minThreshold),
    },
    {
      key: "cost",
      title: TEXT.colCost,
      width: 140,
      align: "right",
      render: (r) => `${formatNumber(r.cost, { maximumFractionDigits: 2 })} đ/${r.unit}`,
    },
    {
      key: "status",
      title: TEXT.colStatus,
      width: 110,
      render: (r) => {
        const meta = STATUS_META[r.status] || STATUS_META[MATERIAL_STATUS.IN_STOCK];
        return <Badge className={cn(meta.className)}>{meta.label}</Badge>;
      },
    },
    {
      key: "actions",
      title: TEXT.colActions,
      width: 150,
      align: "center",
      render: (row) => (
        <TooltipProvider delayDuration={300}>
          <div className="flex items-center justify-center gap-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="size-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                  onClick={() => setImporting(row)}
                >
                  <PackagePlus className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">{TEXT.importStock}</TooltipContent>
            </Tooltip>
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
                  onClick={() => setDeleting(row)}
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
          <Button
            size="sm"
            onClick={() =>
              navigate(ROUTE_PATH.INVENTORY_DETAIL.replace(":id", "new"), {
                state: { mode: "create" },
              })
            }
          >
            <Plus className="size-4" />
            {TEXT.addItem}
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
          <SelectTrigger className="h-8 w-44">
            <SelectValue placeholder={TEXT.allStatus} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_STATUS}>{TEXT.allStatus}</SelectItem>
            <SelectItem value={MATERIAL_STATUS.IN_STOCK}>Đủ tồn</SelectItem>
            <SelectItem value={MATERIAL_STATUS.LOW}>Sắp hết</SelectItem>
            <SelectItem value={MATERIAL_STATUS.OUT_OF_STOCK}>Hết hàng</SelectItem>
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
            placeholder={TEXT.searchPlaceholder}
            className="h-8 w-64 rounded-md border border-input bg-background pl-8 pr-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        dataSource={materials}
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
        empty={isError ? TEXT.loadError : TEXT.empty}
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(null)}
        title={TEXT.confirmDeleteTitle}
        description={deleting ? TEXT.confirmDeleteDesc(deleting.name) : ""}
        confirmText={TEXT.confirmYes}
        cancelText={TEXT.confirmNo}
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(deleting._id)}
      />

      <StockDialog
        open={!!importing}
        onOpenChange={(v) => !v && setImporting(null)}
        mode="import"
        material={importing}
        loading={importMutation.isPending}
        onSubmit={(payload) => importMutation.mutate({ id: importing._id, payload })}
      />
    </div>
  );
}
