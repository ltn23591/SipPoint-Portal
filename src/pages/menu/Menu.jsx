import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Eye, Pencil, Trash2, Plus, Search, RotateCcw } from "lucide-react";
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
import { formatVND, formatNumber } from "@/helpers/format";
import { ROUTE_PATH } from "@/constants/routePaths";
import { CategoryApi, ProductsApi } from "@/apis";
import { ALL_CATEGORIES, TEXT } from "./constants";

const isProductActive = (p) => p?.isActive === "active" || p?.isActive === true;

function parseList(body) {
  const list = body?.data || [];
  const total =
    body?.total ??
    body?.totalCount ??
    body?.count ??
    body?.pagination?.total ??
    body?.pagination?.totalItems ??
    list.length;
  return { list, total };
}

export default function Menu() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [searchInput, setSearchInput] = useState("");
  const keyword = useDebounce(searchInput, 400);
  const [category, setCategory] = useState(ALL_CATEGORIES);
  const [statusFilter, setStatusFilter] = useState("active");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleting, setDeleting] = useState(null);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await CategoryApi.getAll();
      return res?.data?.success ? res.data.data || [] : [];
    },
    staleTime: 5 * 60_000,
  });

  const params = useMemo(
    () => ({
      page,
      limit: pageSize,
      ...(keyword ? { keyword } : {}),
      ...(category !== ALL_CATEGORIES ? { category } : {}),
      ...(statusFilter === "deleted" ? { status: "deleted" } : statusFilter === "all" ? { includeDeleted: true } : {}),
    }),
    [page, pageSize, keyword, category, statusFilter]
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", params],
    queryFn: async ({ signal }) => {
      const res = await ProductsApi.getAll(params, signal);
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Không tải được danh sách món.");
      }
      return parseList(res.data);
    },
    placeholderData: keepPreviousData,
  });

  const products = data?.list ?? [];
  const total = data?.total ?? 0;

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await ProductsApi.delete(id);
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Xoá món thất bại.");
      }
      return res.data;
    },
    onSuccess: (res) => {
      toast.success(res?.message || "Đã ẩn và ngừng kinh doanh món này.");
      qc.invalidateQueries({ queryKey: ["products"] });
      setDeleting(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const restoreMutation = useMutation({
    mutationFn: async (id) => {
      const res = await ProductsApi.restore(id);
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Khôi phục món thất bại.");
      }
      return res.data;
    },
    onSuccess: (res) => {
      toast.success(res?.message || "Đã khôi phục sản phẩm kinh doanh trở lại.");
      qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const goDetail = (id, mode) =>
    navigate(ROUTE_PATH.MENU_DETAIL.replace(":id", id), { state: { mode } });

  const columns = [
    {
      key: "name",
      title: TEXT.colName,
      minWidth: 200,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-xs text-muted-foreground">
            {typeof row.image === "string" && row.image.startsWith("http") ? (
              <img
                src={row.image}
                alt={row.name}
                className="h-full w-full object-cover"
              />
            ) : (
              "☕"
            )}
          </div>
          <span className="font-medium text-foreground">{row.name}</span>
        </div>
      ),
    },
    {
      key: "category",
      title: TEXT.colCategory,
      width: 160,
      render: (row) => (
        <span className="text-sm text-muted-foreground">
          {row.category?.name || "—"}
        </span>
      ),
    },
    {
      key: "price",
      title: TEXT.colPrice,
      width: 120,
      align: "right",
      render: (row) => (
        <span className="font-medium text-foreground">{formatVND(row.price)}</span>
      ),
    },
    {
      key: "stock",
      title: TEXT.colStock,
      width: 100,
      align: "right",
      render: (row) =>
        row.stock == null ? (
          <span className="text-muted-foreground">—</span>
        ) : (
          formatNumber(row.stock)
        ),
    },
    {
      key: "status",
      title: TEXT.colStatus,
      width: 170,
      render: (row) =>
        row.isDeleted ? (
          <Badge variant="destructive">Đã ẩn / Ngừng bán</Badge>
        ) : (
          <div className="flex flex-wrap items-center gap-1">
            {isProductActive(row) ? (
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                Đang bán
              </Badge>
            ) : (
              <Badge variant="secondary">Tạm ngưng</Badge>
            )}
            {row.stockStatus === "out_of_stock" && (
              <Badge className="bg-destructive/10 text-destructive">Hết hàng</Badge>
            )}
          </div>
        ),
    },
    {
      key: "actions",
      title: TEXT.colActions,
      width: 130,
      align: "center",
      render: (row) => (
        <TooltipProvider delayDuration={300}>
          <div className="flex items-center justify-center gap-0.5">
            {row.isDeleted ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="size-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                    disabled={restoreMutation.isPending}
                    onClick={() => restoreMutation.mutate(row._id)}
                  >
                    <RotateCcw className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Khôi phục kinh doanh</TooltipContent>
              </Tooltip>
            ) : (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="size-8 text-muted-foreground hover:text-foreground"
                      onClick={() => goDetail(row._id, "view")}
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
                      onClick={() => goDetail(row._id, "edit")}
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
                      className="size-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleting(row)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">{TEXT.delete}</TooltipContent>
                </Tooltip>
              </>
            )}
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
          <Button size="sm" onClick={() => goDetail("new", "create")}>
            <Plus className="size-4" />
            {TEXT.addItem}
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-8 w-44">
            <SelectValue placeholder="Lọc trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Đang kinh doanh</SelectItem>
            <SelectItem value="deleted">Đã ẩn / Ngừng bán</SelectItem>
            <SelectItem value="all">Tất cả sản phẩm</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={category}
          onValueChange={(v) => {
            setCategory(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-8 w-48">
            <SelectValue placeholder={TEXT.allCategories} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_CATEGORIES}>{TEXT.allCategories}</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c._id} value={c._id}>
                {c.name}
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
            placeholder={TEXT.searchPlaceholder}
            className="h-8 w-56 rounded-md border border-input bg-background pl-8 pr-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        dataSource={products}
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
        confirmText={TEXT.delete}
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(deleting._id)}
      />
    </div>
  );
}
