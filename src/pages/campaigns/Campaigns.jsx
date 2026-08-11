import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, Eye, Trash2, Play, Ban } from "lucide-react";
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
import { formatNumber, formatDate } from "@/helpers/format";
import { ROUTE_PATH } from "@/constants/routePaths";
import { CAMPAIGN_STATUS, CAMPAIGN_STATUS_LABEL } from "@/constants/application";
import { CampaignApi } from "@/apis";

const ALL_STATUS = "__all__";

const STATUS_BADGE_CLASS = {
  [CAMPAIGN_STATUS.DRAFT]: "bg-muted text-muted-foreground",
  [CAMPAIGN_STATUS.ACTIVE]: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  [CAMPAIGN_STATUS.FINISHED]: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  [CAMPAIGN_STATUS.CANCELLED]: "bg-destructive/10 text-destructive",
};

export default function Campaigns() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 400);
  const [status, setStatus] = useState(ALL_STATUS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [confirming, setConfirming] = useState(null); // { type: 'activate'|'deactivate'|'delete', campaign }

  const goDetail = (id) => navigate(ROUTE_PATH.CAMPAIGN_EDIT.replace(":id", id));

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
    queryKey: ["campaigns", params],
    queryFn: async ({ signal }) => {
      const res = await CampaignApi.getAll(params, signal);
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Không tải được danh sách chiến dịch.");
      }
      return { list: res.data.data || [], total: res.data.pagination?.total ?? 0 };
    },
    placeholderData: keepPreviousData,
  });

  const actionMutation = useMutation({
    mutationFn: async ({ type, campaign }) => {
      const api =
        type === "activate"
          ? CampaignApi.activate
          : type === "deactivate"
            ? CampaignApi.deactivate
            : CampaignApi.delete;
      const res = await api(campaign._id);
      if (!res?.data?.success) throw new Error(res?.data?.message || "Thao tác thất bại.");
      return res.data;
    },
    onSuccess: (res) => {
      toast.success(res?.message || "Thao tác thành công.");
      qc.invalidateQueries({ queryKey: ["campaigns"] });
      setConfirming(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const CONFIRM_TEXT = {
    activate: {
      title: "Kích hoạt chiến dịch",
      description: `Phát voucher vào ví toàn bộ thành viên các nhóm mục tiêu của "${confirming?.campaign?.name}"? Hành động này không thể hoàn tác.`,
      confirmText: "Kích hoạt",
      variant: "default",
    },
    deactivate: {
      title: "Huỷ chiến dịch đang chạy",
      description: `Huỷ "${confirming?.campaign?.name}"? Các voucher đã phát nhưng chưa sử dụng sẽ bị thu hồi (hết hạn ngay).`,
      confirmText: "Huỷ chiến dịch",
      variant: "destructive",
    },
    delete: {
      title: "Xóa chiến dịch",
      description: `Xóa chiến dịch nháp "${confirming?.campaign?.name}"?`,
      confirmText: "Xóa",
      variant: "destructive",
    },
  };

  const columns = [
    {
      key: "name",
      title: "Chiến dịch",
      minWidth: 180,
      render: (c) => (
        <div>
          <p className="font-medium text-foreground">{c.name}</p>
          {c.description ? (
            <p className="text-xs text-muted-foreground">{c.description}</p>
          ) : null}
        </div>
      ),
    },
    {
      key: "segments",
      title: "Nhóm mục tiêu",
      minWidth: 160,
      render: (c) => (
        <div className="flex flex-wrap gap-1">
          {(c.segmentIds || []).map((s) => (
            <Badge key={s._id || s} variant="secondary">
              {s.name || "—"}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: "voucher",
      title: "Voucher",
      width: 140,
      render: (c) =>
        c.voucherId?.code ? (
          <span className="font-mono text-xs">{c.voucherId.code}</span>
        ) : (
          "—"
        ),
    },
    {
      key: "issuedCount",
      title: "Đã phát",
      width: 90,
      align: "right",
      render: (c) => formatNumber(c.issuedCount ?? 0),
    },
    {
      key: "endDate",
      title: "Kết thúc",
      width: 110,
      render: (c) => (c.endDate ? formatDate(c.endDate) : "—"),
    },
    {
      key: "status",
      title: "Trạng thái",
      width: 110,
      render: (c) => (
        <Badge className={STATUS_BADGE_CLASS[c.status]}>
          {CAMPAIGN_STATUS_LABEL[c.status] || c.status}
        </Badge>
      ),
    },
    {
      key: "actions",
      title: "",
      width: 130,
      align: "right",
      render: (c) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            title={c.status === CAMPAIGN_STATUS.DRAFT ? "Sửa" : "Xem chi tiết"}
            onClick={() => goDetail(c._id)}
          >
            {c.status === CAMPAIGN_STATUS.DRAFT ? <Pencil className="size-4" /> : <Eye className="size-4" />}
          </Button>
          {c.status === CAMPAIGN_STATUS.DRAFT && (
            <>
              <Button
                variant="ghost"
                size="icon-sm"
                title="Kích hoạt (phát voucher)"
                onClick={() => setConfirming({ type: "activate", campaign: c })}
              >
                <Play className="size-4 text-emerald-600" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                title="Xóa"
                onClick={() => setConfirming({ type: "delete", campaign: c })}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </>
          )}
          {c.status === CAMPAIGN_STATUS.ACTIVE && (
            <Button
              variant="ghost"
              size="icon-sm"
              title="Huỷ chiến dịch (thu hồi voucher chưa dùng)"
              onClick={() => setConfirming({ type: "deactivate", campaign: c })}
            >
              <Ban className="size-4 text-destructive" />
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
        title="Chiến dịch khuyến mãi"
        description="Công thức: Mã khuyến mãi = Nhóm khách hàng + Điều kiện bổ sung. Kích hoạt để phát voucher vào ví khách."
        actions={
          <Button onClick={() => navigate(ROUTE_PATH.CAMPAIGN_CREATE)}>
            <Plus className="size-4" />
            Tạo chiến dịch
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
            {Object.entries(CAMPAIGN_STATUS_LABEL).map(([value, label]) => (
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
            placeholder="Tìm theo tên chiến dịch..."
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
        heightOffset={16}
        empty={isError ? "Không tải được dữ liệu." : "Chưa có chiến dịch nào."}
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
