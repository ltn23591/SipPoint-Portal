import { useState } from "react";
import { useNavigate } from "react-router";
import { Eye, Pencil, RefreshCw, Plus, Search } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { PRODUCT_STATUS_LABEL } from "@/constants/application";
import { ROUTE_PATH } from "@/constants/routePaths";
import { MOCK_MENU_ITEMS } from "./mockData";
import {
  CATEGORY_TABS,
  MENU_CATEGORY_LABEL,
  STATUS_CHANGE_CYCLES,
  STATUS_CHANGE_LABEL,
  TEXT,
} from "./constants";

const STATUS_VARIANT = {
  active: "success",
  inactive: "secondary",
  out_of_stock: "destructive",
};

const formatPrice = (n) => `${Number(n).toLocaleString("vi-VN")}đ`;

export default function Menu() {
  const navigate = useNavigate();
  const [items, setItems] = useState(MOCK_MENU_ITEMS);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusDialog, setStatusDialog] = useState({ open: false, item: null });

  const filtered = items.filter((i) => {
    if (category !== "all" && i.category !== category) return false;
    if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleStatusChange = () => {
    const { item } = statusDialog;
    const next = STATUS_CHANGE_CYCLES[item.status];
    if (!next) return;
    setItems((prev) =>
      prev.map((m) => (m.id === item.id ? { ...m, status: next } : m))
    );
    setStatusDialog({ open: false, item: null });
  };

  const columns = [
    {
      key: "name",
      title: TEXT.colName,
      minWidth: 200,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
            ☕
          </div>
          <span className="font-medium text-foreground">{row.name}</span>
        </div>
      ),
    },
    {
      key: "category",
      title: TEXT.colCategory,
      width: 140,
      render: (row) => (
        <span className="text-sm text-muted-foreground">
          {MENU_CATEGORY_LABEL[row.category] ?? row.category}
        </span>
      ),
    },
    {
      key: "price",
      title: TEXT.colPrice,
      width: 120,
      align: "right",
      render: (row) => (
        <span className="font-medium text-foreground">{formatPrice(row.price)}</span>
      ),
    },
    {
      key: "status",
      title: TEXT.colStatus,
      width: 130,
      render: (row) => (
        <Badge variant={STATUS_VARIANT[row.status]}>
          {PRODUCT_STATUS_LABEL[row.status]}
        </Badge>
      ),
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
                  onClick={() =>
                    navigate(ROUTE_PATH.MENU_DETAIL.replace(":id", row.id), {
                      state: { mode: "view" },
                    })
                  }
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
                  onClick={() =>
                    navigate(ROUTE_PATH.MENU_DETAIL.replace(":id", row.id), {
                      state: { mode: "edit" },
                    })
                  }
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
                  className="size-8 text-muted-foreground hover:text-foreground"
                  onClick={() => setStatusDialog({ open: true, item: row })}
                >
                  <RefreshCw className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">{TEXT.changeStatus}</TooltipContent>
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
          <Button size="sm">
            <Plus className="size-4" />
            {TEXT.addItem}
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Category tabs */}
        <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => { setCategory(tab.value); setPage(1); }}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                category === tab.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={TEXT.searchPlaceholder}
            className="h-8 w-56 rounded-md border border-input bg-background pl-8 pr-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        dataSource={paginated}
        rowKey="id"
        total={filtered.length}
        pageIndex={page}
        pageSize={pageSize}
        onChange={(p, ps) => { setPage(p); setPageSize(ps); }}
        heightOffset={220}
      />

      {/* Status confirm dialog */}
      <ConfirmDialog
        open={statusDialog.open}
        onOpenChange={(open) => setStatusDialog((s) => ({ ...s, open }))}
        title={TEXT.confirmStatusTitle}
        description={
          statusDialog.item
            ? TEXT.confirmStatusDesc(
                statusDialog.item.name,
                STATUS_CHANGE_LABEL[statusDialog.item.status]
              )
            : ""
        }
        confirmText={TEXT.confirmYes}
        cancelText={TEXT.confirmNo}
        onConfirm={handleStatusChange}
      />
    </div>
  );
}
