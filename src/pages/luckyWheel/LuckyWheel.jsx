import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, Trash2, Copy, Eye, Dices } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/useDebounce";
import { formatDate } from "@/helpers/format";
import { ROUTE_PATH } from "@/constants/routePaths";
import { GAME_STATUS, GAME_STATUS_LABEL } from "@/constants/application";
import { GameApi } from "@/apis";
import { GameWinnersDialog } from "./GameWinnersDialog";

const ALL_STATUS = "__all__";

// Chuyển detail -> payload tạo mới (dùng cho Nhân bản)
const toCreatePayload = (g) => {
  const rewards = (g.rewards || [])
    .slice()
    .sort((a, b) => a.index - b.index)
    .map((r) => ({
      displayName: r.displayName,
      type: r.type,
      voucherId: typeof r.voucherId === "object" ? r.voucherId?._id : r.voucherId,
      rewardValue: r.rewardValue,
      message: r.message,
      totalReward: r.totalReward,
      quantity: r.quantity,
      isDefault: r.isDefault,
      allowManyTimes: r.allowManyTimes,
    }));
  const idToIndex = {};
  (g.rewards || []).slice().sort((a, b) => a.index - b.index).forEach((r, i) => {
    if (r._id) idToIndex[String(r._id)] = i;
  });
  const distributions = (g.distributions || []).map((d) => ({
    gameRewardIndex: idToIndex[String(typeof d.gameRewardId === "object" ? d.gameRewardId?._id : d.gameRewardId)] ?? 0,
    segmentId: typeof d.segmentId === "object" ? d.segmentId?._id : d.segmentId,
    rate: d.rate,
    maxQuantity: d.maxQuantity,
    dateFrom: d.dateFrom,
    dateTo: d.dateTo,
    allowManyTimes: d.allowManyTimes,
  }));
  return {
    name: `${g.name} (sao chép)`,
    description: g.description,
    backgroundUrl: g.backgroundUrl,
    gameUrl: g.gameUrl,
    content: g.content,
    startDate: g.startDate,
    endDate: g.endDate,
    timeFrom: g.timeFrom,
    timeTo: g.timeTo,
    defaultTurnCount: g.defaultTurnCount,
    appliedSegmentIds: (g.appliedSegmentIds || []).map((s) => (typeof s === "object" ? s._id : s)),
    rewards,
    distributions,
    activityConfigs: (g.activityConfigs || []).map((c) => ({
      activityType: c.activityType,
      turnQuantity: c.turnQuantity,
      dailyLimit: c.dailyLimit,
      isActive: c.isActive,
    })),
  };
};

export default function LuckyWheel() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 400);
  const [status, setStatus] = useState(ALL_STATUS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [winnersGame, setWinnersGame] = useState(null);
  const [confirming, setConfirming] = useState(null);

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
    queryKey: ["games", params],
    queryFn: async ({ signal }) => {
      const res = await GameApi.getAll(params, signal);
      if (!res?.data?.success) throw new Error(res?.data?.message || "Không tải được danh sách trò chơi.");
      return { list: res.data.data || [], total: res.data.pagination?.total ?? 0 };
    },
    placeholderData: keepPreviousData,
  });

  const toggleMutation = useMutation({
    mutationFn: async (g) => {
      let res;
      if (g.status === GAME_STATUS.DRAFT) res = await GameApi.publish(g._id);
      else if (g.status === GAME_STATUS.PUBLISHED) res = await GameApi.pause(g._id);
      else if (g.status === GAME_STATUS.PAUSED) res = await GameApi.resume(g._id);
      else throw new Error("Trò chơi đã kết thúc, không thể đổi trạng thái.");
      if (!res?.data?.success) throw new Error(res?.data?.message || "Đổi trạng thái thất bại.");
      return res.data;
    },
    onSuccess: (res) => {
      toast.success(res?.message || "Đã cập nhật trạng thái.");
      qc.invalidateQueries({ queryKey: ["games"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const cloneMutation = useMutation({
    mutationFn: async (g) => {
      const detailRes = await GameApi.getById(g._id);
      if (!detailRes?.data?.success) throw new Error("Không tải được cấu hình để nhân bản.");
      const res = await GameApi.create(toCreatePayload(detailRes.data.data));
      if (!res?.data?.success) throw new Error(res?.data?.message || "Nhân bản thất bại.");
      return res.data;
    },
    onSuccess: () => {
      toast.success("Đã nhân bản trò chơi (bản nháp).");
      qc.invalidateQueries({ queryKey: ["games"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (g) => {
      const res = await GameApi.delete(g._id);
      if (!res?.data?.success) throw new Error(res?.data?.message || "Xóa thất bại.");
      return res.data;
    },
    onSuccess: (res) => {
      toast.success(res?.message || "Đã xóa trò chơi.");
      qc.invalidateQueries({ queryKey: ["games"] });
      setConfirming(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const columns = [
    {
      key: "image",
      title: "Hình ảnh",
      width: 70,
      render: (g) =>
        g.backgroundUrl ? (
          <img src={g.backgroundUrl} alt="" className="size-10 rounded object-cover" />
        ) : (
          <div className="flex size-10 items-center justify-center rounded bg-muted text-muted-foreground">
            <Dices className="size-4" />
          </div>
        ),
    },
    {
      key: "name",
      title: "Tên trò chơi",
      minWidth: 200,
      render: (g) => (
        <div>
          <p className="font-semibold text-foreground">{g.name}</p>
          <p className="text-xs text-muted-foreground">
            {GAME_STATUS_LABEL[g.status] || g.status}
          </p>
        </div>
      ),
    },
    {
      key: "display",
      title: "Ngày hiển thị",
      minWidth: 170,
      render: (g) => (
        <div className="text-sm">
          <p>{(g.timeFrom || "00:00")} - {(g.timeTo || "23:59")}</p>
          <p className="text-muted-foreground">
            {g.startDate ? formatDate(g.startDate) : "—"} - {g.endDate ? formatDate(g.endDate) : "—"}
          </p>
        </div>
      ),
    },
    {
      key: "spins",
      title: "Số lượt tham gia",
      width: 130,
      align: "center",
      render: (g) => g.spinCount ?? 0,
    },
    {
      key: "winners",
      title: "Danh sách trúng thưởng",
      width: 150,
      align: "center",
      render: (g) => (
        <button className="text-primary hover:underline" onClick={() => setWinnersGame(g)}>
          Xem
        </button>
      ),
    },
    {
      key: "active",
      title: "Hoạt động",
      width: 100,
      align: "center",
      render: (g) => (
        <Switch
          checked={g.status === GAME_STATUS.PUBLISHED}
          disabled={
            toggleMutation.isPending ||
            g.status === GAME_STATUS.EXPIRED ||
            g.status === GAME_STATUS.CANCELLED
          }
          onCheckedChange={() => toggleMutation.mutate(g)}
        />
      ),
    },
    {
      key: "actions",
      title: "Thao tác",
      width: 140,
      render: (g) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon-sm" title="Xem / Sửa" onClick={() => navigate(`/lucky-wheel/${g._id}/edit`)}>
            <Eye className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            title="Sửa (chỉ khi nháp)"
            disabled={g.status !== GAME_STATUS.DRAFT}
            onClick={() => navigate(`/lucky-wheel/${g._id}/edit`)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" title="Nhân bản" onClick={() => cloneMutation.mutate(g)}>
            <Copy className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            title="Xóa (chỉ khi nháp)"
            disabled={g.status !== GAME_STATUS.DRAFT}
            onClick={() => setConfirming(g)}
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      ),
    },
    {
      key: "createdAt",
      title: "Ngày tạo",
      width: 110,
      render: (g) => (g.createdAt ? formatDate(g.createdAt) : "—"),
    },
    {
      key: "updatedAt",
      title: "Ngày chỉnh sửa",
      width: 120,
      render: (g) => (g.updatedAt ? formatDate(g.updatedAt) : "—"),
    },
  ];

  return (
    <div className="flex h-full flex-col gap-4">
      <PageHeader
        title="Danh sách trò chơi"
        description="Quản lý các trò chơi vòng quay may mắn trong chiến dịch."
        actions={
          <Button onClick={() => navigate(ROUTE_PATH.LUCKY_WHEEL_CREATE)}>
            <Plus className="size-4" /> Tạo mới
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
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_STATUS}>Tất cả trạng thái</SelectItem>
            {Object.entries(GAME_STATUS_LABEL).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
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
            placeholder="Tìm kiếm tên trò chơi..."
            className="h-8 w-64 rounded-md border border-input bg-background pl-8 pr-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
        empty={isError ? "Không tải được dữ liệu." : "Chưa có trò chơi nào."}
      />

      <GameWinnersDialog
        open={!!winnersGame}
        onOpenChange={(v) => !v && setWinnersGame(null)}
        game={winnersGame}
      />

      <ConfirmDialog
        open={!!confirming}
        onOpenChange={(v) => !v && setConfirming(null)}
        title="Xóa trò chơi"
        description={`Xóa trò chơi nháp "${confirming?.name}"?`}
        confirmText="Xóa"
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(confirming)}
      />
    </div>
  );
}
