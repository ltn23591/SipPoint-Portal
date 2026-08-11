import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Check } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/common/DataTable";
import { useDebounce } from "@/hooks/useDebounce";
import { PAGE_SIZE_DEFAULT, TABLE_STATUS_LABEL } from "@/constants/application";
import { ZoneApi, TablesApi } from "@/apis";

const ALL_ZONES = "__all__";
// Danh sách chọn nhanh trong modal nên gọn hơn trang danh sách đầy đủ.
const PAGE_SIZE_OPTIONS = [5, 10, 20];

const TABLE_STATUS_BADGE = {
  available: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  occupied: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  reserved: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  cleaning: "bg-muted text-muted-foreground",
};

// value = tableId đang chọn (rỗng = Mang đi); onSelect(table | null) khi chọn.
export function TablePickerDialog({ open, onOpenChange, value, onSelect }) {
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 300);
  const [zoneId, setZoneId] = useState(ALL_ZONES);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_DEFAULT);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [open, search, zoneId]);

  const { data: zones = [] } = useQuery({
    queryKey: ["zones-options"],
    enabled: open,
    queryFn: async () => {
      const res = await ZoneApi.getAll();
      return res?.data?.success ? res.data.data || [] : [];
    },
  });

  const { data: tables = [], isLoading } = useQuery({
    queryKey: ["tables-picker", zoneId],
    enabled: open,
    queryFn: async () => {
      const res = await TablesApi.getAll(zoneId !== ALL_ZONES ? { zoneId } : undefined);
      return res?.data?.success ? res.data.data || [] : [];
    },
  });

  // Backend chưa hỗ trợ tìm theo tên/phân trang cho /tables -> lọc & phân trang client-side.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tables;
    return tables.filter((t) => (t.name || "").toLowerCase().includes(q));
  }, [tables, search]);

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const choose = (table) => {
    onSelect(table);
    onOpenChange(false);
  };

  const columns = [
    {
      key: "name",
      title: "Tên bàn",
      minWidth: 120,
      render: (t) => (
        <div>
          <span className="font-medium">{t.name}</span>
          <p className="text-xs text-muted-foreground sm:hidden">{t.zoneId?.name || "—"}</p>
        </div>
      ),
    },
    {
      key: "zone",
      title: "Khu vực",
      minWidth: 110,
      headClassName: "hidden sm:table-cell",
      cellClassName: "hidden sm:table-cell",
      render: (t) => t.zoneId?.name || "—",
    },
    {
      key: "status",
      title: "Trạng thái",
      width: 120,
      render: (t) => (
        <Badge className={TABLE_STATUS_BADGE[t.status]}>
          {TABLE_STATUS_LABEL[t.status] || t.status}
        </Badge>
      ),
    },
    {
      key: "actions",
      title: "",
      width: 90,
      align: "right",
      render: (t) => (
        <Button size="sm" variant={value === t._id ? "default" : "outline"} onClick={() => choose(t)}>
          {value === t._id ? <Check className="size-3.5" /> : null}
          Chọn
        </Button>
      ),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-1rem)] sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Chọn bàn</DialogTitle>
          <DialogDescription>
            Chọn bàn cho đơn tại chỗ, hoặc bỏ chọn để tạo đơn mang đi.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm theo tên bàn..."
              className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <Select value={zoneId} onValueChange={setZoneId}>
            <SelectTrigger className="h-9 w-full sm:w-44">
              <SelectValue placeholder="Khu vực" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_ZONES}>Tất cả khu vực</SelectItem>
              {zones.map((z) => (
                <SelectItem key={z._id} value={z._id}>
                  {z.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-0 overflow-x-auto">
          <DataTable
            columns={columns}
            dataSource={paged}
            rowKey="_id"
            loading={isLoading}
            total={filtered.length}
            pageIndex={page}
            pageSize={pageSize}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            onChange={(p, ps) => {
              setPage(p);
              setPageSize(ps);
            }}
            heightOffset={9999}
            empty="Không tìm thấy bàn phù hợp."
          />
        </div>

        <DialogFooter className="items-center sm:justify-between">
          <Button variant="ghost" onClick={() => choose(null)}>
            Không chọn bàn (Mang đi)
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
