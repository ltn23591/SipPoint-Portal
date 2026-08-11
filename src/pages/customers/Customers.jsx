import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, Eye } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
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
import { formatNumber, formatVND } from "@/helpers/format";
import { ROUTE_PATH } from "@/constants/routePaths";
import { CustomersApi, MembershipTierApi } from "@/apis";
import { CustomerFormDialog } from "./CustomerFormDialog";

const ALL_TIERS = "__all__";

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

export default function Customers() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 400);
  const [tier, setTier] = useState(ALL_TIERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data: tiers = [] } = useQuery({
    queryKey: ["membership-tiers-current"],
    queryFn: async () => {
      const res = await MembershipTierApi.getAllCurrent();
      return res?.data?.success ? res.data.data || [] : [];
    },
    staleTime: 5 * 60_000,
  });

  const params = useMemo(
    () => ({
      page,
      limit: pageSize,
      ...(search ? { search } : {}),
      ...(tier !== ALL_TIERS ? { tierId: tier } : {}),
    }),
    [page, pageSize, search, tier]
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: ["customers", params],
    queryFn: async ({ signal }) => {
      const res = await CustomersApi.getAll(params, signal);
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Không tải được danh sách khách hàng.");
      }
      return parseList(res.data);
    },
    placeholderData: keepPreviousData,
  });

  const customers = data?.list ?? [];
  const total = data?.total ?? 0;

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      const res = editing?._id
        ? await CustomersApi.update(editing._id, payload)
        : await CustomersApi.create(payload);
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Lưu khách hàng thất bại.");
      }
      return res.data;
    },
    onSuccess: (res) => {
      toast.success(res?.message || (editing?._id ? "Đã cập nhật khách hàng." : "Đã thêm khách hàng."));
      qc.invalidateQueries({ queryKey: ["customers"] });
      setFormOpen(false);
      setEditing(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const columns = [
    {
      key: "id_display",
      title: "Mã KH",
      width: 110,
      render: (c) =>
        c._id ? (
          <span className="font-mono text-xs text-muted-foreground">{c._id.slice(-8).toUpperCase()}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "fullName",
      title: "Khách hàng",
      minWidth: 170,
      render: (c) => (
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-foreground">{c.fullName}</span>
          {c.isActive === false && <Badge variant="secondary">Ngưng</Badge>}
        </div>
      ),
    },
    { key: "phone", title: "Điện thoại", width: 120 },
    {
      key: "email",
      title: "Email",
      minWidth: 180,
      render: (c) => c.email || <span className="text-muted-foreground">—</span>,
    },
    {
      key: "tier",
      title: "Hạng",
      width: 110,
      render: (c) =>
        c.tierId?.name ? (
          <Badge variant="secondary">{c.tierId.name}</Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "currentPoints",
      title: "Điểm",
      width: 90,
      align: "right",
      render: (c) => formatNumber(c.currentPoints ?? 0),
    },
    {
      key: "totalSpent",
      title: "Tổng chi tiêu",
      width: 130,
      align: "right",
      render: (c) => formatVND(c.totalSpent ?? 0),
    },
    {
      key: "actions",
      title: "",
      width: 90,
      align: "right",
      render: (c) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            title="Xem chi tiết"
            onClick={() => navigate(ROUTE_PATH.CUSTOMER_DETAIL.replace(":id", c._id))}
          >
            <Eye className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" title="Sửa" onClick={() => { setEditing(c); setFormOpen(true); }}>
            <Pencil className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-full flex-col gap-4">
      <PageHeader
        title="Khách hàng"
        description="Hồ sơ khách hàng, điểm tích luỹ và hạng thành viên."
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Thêm khách hàng
          </Button>
        }
      />

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Select
          value={tier}
          onValueChange={(v) => {
            setTier(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-8 w-44">
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

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm theo tên / SĐT / email..."
            className="h-8 w-64 rounded-md border border-input bg-background pl-8 pr-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        dataSource={customers}
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
        empty={isError ? "Không tải được dữ liệu." : "Không có khách hàng nào."}
      />

      <CustomerFormDialog
        open={formOpen}
        onOpenChange={(v) => {
          setFormOpen(v);
          if (!v) setEditing(null);
        }}
        customer={editing}
        loading={saveMutation.isPending}
        onSubmit={(payload) => saveMutation.mutate(payload)}
      />
    </div>
  );
}
