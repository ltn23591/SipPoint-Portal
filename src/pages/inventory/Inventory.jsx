import { useState } from "react";
import { useNavigate } from "react-router";
import { Eye, Pencil, Trash2, Plus, Search } from "lucide-react";

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
import { formatNumber } from "@/helpers/format";
import { ROUTE_PATH } from "@/constants/routePaths";
import { MOCK_INGREDIENTS } from "./mockData";
import { TEXT } from "./constants";

export default function Inventory() {
  const navigate = useNavigate();
  const [items, setItems] = useState(MOCK_INGREDIENTS);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });

  const filtered = items.filter((i) =>
    search ? i.name.toLowerCase().includes(search.toLowerCase()) : true
  );
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const goDetail = (row, mode) =>
    navigate(ROUTE_PATH.INVENTORY_DETAIL.replace(":id", row._id), {
      state: { mode },
    });

  const handleDelete = () => {
    setItems((prev) => prev.filter((i) => i._id !== deleteDialog.item._id));
    setDeleteDialog({ open: false, item: null });
  };

  const columns = [
    { key: "name", title: TEXT.colName, minWidth: 180, render: (r) => (
      <span className="font-medium text-foreground">{r.name}</span>
    ) },
    { key: "unit", title: TEXT.colUnit, width: 90, render: (r) => (
      <span className="text-sm text-muted-foreground">{r.unit}</span>
    ) },
    {
      key: "stock",
      title: TEXT.colStock,
      width: 110,
      align: "right",
      render: (r) => formatNumber(r.stock),
    },
    {
      key: "minStock",
      title: TEXT.colMinStock,
      width: 120,
      align: "right",
      render: (r) => formatNumber(r.minStock),
    },
    {
      key: "costPerUnit",
      title: TEXT.colCost,
      width: 140,
      align: "right",
      render: (r) => `${formatNumber(r.costPerUnit, { maximumFractionDigits: 2 })} đ/${r.unit}`,
    },
    {
      key: "status",
      title: TEXT.colStatus,
      width: 120,
      render: (r) =>
        r.stock < r.minStock ? (
          <Badge variant="destructive">{TEXT.lowStock}</Badge>
        ) : (
          <Badge variant="success">{TEXT.inStock}</Badge>
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
                <Button variant="ghost" size="icon-sm" className="size-8 text-muted-foreground hover:text-foreground" onClick={() => goDetail(row, "view")}>
                  <Eye className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">{TEXT.viewDetail}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="size-8 text-muted-foreground hover:text-foreground" onClick={() => goDetail(row, "edit")}>
                  <Pencil className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">{TEXT.edit}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="size-8 text-destructive hover:bg-destructive/10" onClick={() => setDeleteDialog({ open: true, item: row })}>
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
          <Button size="sm" onClick={() => navigate(ROUTE_PATH.INVENTORY_DETAIL.replace(":id", "new"), { state: { mode: "create" } })}>
            <Plus className="size-4" />
            {TEXT.addItem}
          </Button>
        }
      />

      <div className="flex justify-end">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={TEXT.searchPlaceholder}
            className="h-8 w-64 rounded-md border border-input bg-background pl-8 pr-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        dataSource={paginated}
        rowKey="_id"
        total={filtered.length}
        pageIndex={page}
        pageSize={pageSize}
        onChange={(p, ps) => { setPage(p); setPageSize(ps); }}
        heightOffset={220}
      />

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog((s) => ({ ...s, open }))}
        title={TEXT.confirmDeleteTitle}
        description={deleteDialog.item ? TEXT.confirmDeleteDesc(deleteDialog.item.name) : ""}
        confirmText={TEXT.confirmYes}
        cancelText={TEXT.confirmNo}
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
