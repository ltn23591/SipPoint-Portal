import { useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
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
import { PAGE_SIZE_DEFAULT } from "@/constants/application";
import { CustomersApi, MembershipTierApi } from "@/apis";

const ALL_TIERS = "__all__";
// Danh sách chọn nhanh trong modal nên gọn hơn trang danh sách đầy đủ.
const PAGE_SIZE_OPTIONS = [5, 10, 20];

// value = customerId đang chọn (rỗng = Khách lẻ); onSelect(customer | null) khi chọn.
export function CustomerPickerDialog({ open, onOpenChange, value, onSelect }) {
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 300);
  const [tierId, setTierId] = useState(ALL_TIERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_DEFAULT);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [open, search, tierId]);

  const { data: tiers = [] } = useQuery({
    queryKey: ["membership-tiers-current"],
    enabled: open,
    queryFn: async () => {
      const res = await MembershipTierApi.getAllCurrent();
      return res?.data?.data || res?.data || [];
    },
    staleTime: 5 * 60_000,
  });

  const params = {
    page,
    limit: pageSize,
    ...(search ? { search } : {}),
    ...(tierId !== ALL_TIERS ? { tierId } : {}),
  };

  const { data, isLoading } = useQuery({
    queryKey: ["customers-picker", params],
    enabled: open,
    queryFn: async ({ signal }) => {
      const res = await CustomersApi.getAll(params, signal);
      if (!res?.data?.success) return { list: [], total: 0 };
      return { list: res.data.data || [], total: res.data.pagination?.total ?? 0 };
    },
    placeholderData: keepPreviousData,
  });

  const customers = data?.list ?? [];
  const total = data?.total ?? 0;

  const choose = (customer) => {
    onSelect(customer);
    onOpenChange(false);
  };

  const columns = [
    {
      key: "fullName",
      title: "Khách hàng",
      minWidth: 130,
      render: (c) => (
        <div>
          <span className="font-medium">{c.fullName}</span>
          <p className="text-xs text-muted-foreground sm:hidden">{c.phone || "—"}</p>
        </div>
      ),
    },
    { key: "phone", title: "Điện thoại", width: 110, headClassName: "hidden sm:table-cell", cellClassName: "hidden sm:table-cell", render: (c) => c.phone || "—" },
    {
      key: "email",
      title: "Email",
      minWidth: 140,
      headClassName: "hidden md:table-cell",
      cellClassName: "hidden md:table-cell",
      render: (c) => <span className="block max-w-[180px] truncate text-muted-foreground">{c.email || "—"}</span>,
    },
    {
      key: "tier",
      title: "Hạng",
      width: 90,
      render: (c) =>
        c.tierId?.name ? (
          <Badge variant="secondary">{c.tierId.name}</Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "actions",
      title: "",
      width: 90,
      align: "right",
      render: (c) => (
        <Button size="sm" variant={value === c._id ? "default" : "outline"} onClick={() => choose(c)}>
          {value === c._id ? <Check className="size-3.5" /> : null}
          Chọn
        </Button>
      ),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-1rem)] sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Chọn khách hàng</DialogTitle>
          <DialogDescription>
            Gắn khách hàng thành viên vào đơn để tích điểm, hoặc bỏ chọn cho khách lẻ.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm theo tên / SĐT / email..."
              className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <Select value={tierId} onValueChange={setTierId}>
            <SelectTrigger className="h-9 w-full sm:w-44">
              <SelectValue placeholder="Hạng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_TIERS}>Tất cả hạng</SelectItem>
              {tiers.map((t) => (
                <SelectItem key={t._id} value={t._id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-0 overflow-x-auto">
          <DataTable
            columns={columns}
            dataSource={customers}
            rowKey="_id"
            loading={isLoading}
            total={total}
            pageIndex={page}
            pageSize={pageSize}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            onChange={(p, ps) => {
              setPage(p);
              setPageSize(ps);
            }}
            heightOffset={9999}
            empty="Không tìm thấy khách hàng phù hợp."
          />
        </div>

        <DialogFooter className="items-center sm:justify-between">
          <Button variant="ghost" onClick={() => choose(null)}>
            Khách lẻ (bỏ chọn)
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
