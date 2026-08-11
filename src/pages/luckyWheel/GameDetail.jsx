import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTE_PATH } from "@/constants/routePaths";
import {
  GAME_REWARD_TYPE,
  GAME_REWARD_TYPE_LABEL,
  GAME_STATUS_LABEL,
} from "@/constants/application";
import { GameApi } from "@/apis";
import { RewardWinnersDialog } from "./RewardWinnersDialog";

const toDateInput = (v) => (v ? String(v).slice(0, 10) : "—");
const idOf = (v) => (typeof v === "object" && v ? v._id : v);

function Field({ label, children }) {
  return (
    <div>
      <p className="text-sm font-medium">{label}</p>
      <p className="mt-0.5 text-sm text-muted-foreground">{children}</p>
    </div>
  );
}

function rewardContent(r) {
  if (r.type === GAME_REWARD_TYPE.VOUCHER) return r.voucherId?.title || r.voucherId?.code || "-";
  if (r.type === GAME_REWARD_TYPE.POINTS) return `${r.rewardValue ?? 0} xu`;
  if (r.type === GAME_REWARD_TYPE.MESSAGE) return r.message || "-";
  return "-";
}

export default function GameDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [winnerReward, setWinnerReward] = useState(null);

  const { data: game, isLoading } = useQuery({
    queryKey: ["game-detail", id],
    enabled: !!id,
    queryFn: async () => {
      const res = await GameApi.getById(id);
      if (!res?.data?.success) throw new Error(res?.data?.message || "Không tải được trò chơi.");
      return res.data.data;
    },
  });

  const rewards = (game?.rewards || []).slice().sort((a, b) => a.index - b.index);
  const rewardNameById = new Map(rewards.map((r) => [String(r._id), r.displayName]));
  const distributions = (game?.distributions || []).slice().sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  if (isLoading || !game) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto pb-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Trò chơi may mắn / Chi tiết</p>
          <h1 className="text-2xl font-semibold">Thông tin chi tiết trò chơi</h1>
        </div>
        <Button variant="outline" onClick={() => navigate(ROUTE_PATH.LUCKY_WHEEL)}>
          <ArrowLeft className="size-4" /> Quay lại
        </Button>
      </div>

      {/* Thông tin chung + hình ảnh */}
      <div className="grid gap-6 rounded-xl border border-border bg-card p-6 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Thông tin chung</h2>
          <Field label="Tên trò chơi">{game.name}</Field>
          <Field label="Mô tả">{game.description || "—"}</Field>
          <Field label="Trạng thái">{GAME_STATUS_LABEL[game.status] || game.status}</Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ngày áp dụng">
              {toDateInput(game.startDate)} - {toDateInput(game.endDate)}
            </Field>
            <Field label="Khung giờ áp dụng">
              {(game.timeFrom || "00:00")} - {(game.timeTo || "23:59")}
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Số lượt chơi mặc định">{game.defaultTurnCount ?? 0}</Field>
            <Field label="Tặng lượt miễn phí mỗi ngày">
              {(game.activityConfigs || []).some((c) => c.activityType === "DAILY_CHECKIN" && c.isActive) ? "Có" : "Không"}
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Cho phép dùng điểm mua lượt quay">{game.isExchangeTurnEnabled ? "Có" : "Không"}</Field>
            {game.isExchangeTurnEnabled && (
              <Field label="Số điểm cho 1 lượt">{game.turnRewardAmount ?? 0}</Field>
            )}
          </div>
          <div>
            <p className="text-sm font-medium">Nhóm khách hàng áp dụng</p>
            {(game.appliedSegmentIds || []).length === 0 ? (
              <p className="mt-0.5 text-sm text-muted-foreground">Áp dụng tất cả khách hàng.</p>
            ) : (
              <div className="mt-1.5 flex flex-wrap gap-2">
                {game.appliedSegmentIds.map((s) => (
                  <span key={idOf(s)} className="rounded-full bg-muted px-3 py-1 text-sm">
                    {typeof s === "object" ? s.name : s}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <p className="text-sm font-medium">Hình ảnh</p>
              <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/30">
                {game.backgroundUrl ? (
                  <img src={game.backgroundUrl} alt="Hình ảnh" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs text-muted-foreground">Không có</span>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Hình ảnh vòng xoay may mắn</p>
              <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/30">
                {game.gameUrl ? (
                  <img src={game.gameUrl} alt="Hình ảnh vòng xoay" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs text-muted-foreground">Không có</span>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Thông tin chi tiết (thể lệ)</p>
            <div className="min-h-24 whitespace-pre-wrap rounded-lg border border-border bg-muted/20 p-3 text-sm text-muted-foreground">
              {game.content || "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Phân bổ tỉ lệ */}
      <div className="space-y-3 rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Phân bổ tỉ lệ</h2>
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-2">Tên nhóm</th>
                <th className="p-2">Phần thưởng</th>
                <th className="p-2">Tỉ lệ phân bổ</th>
                <th className="p-2">Số lượng tối đa</th>
                <th className="p-2">Ngày hiệu lực</th>
              </tr>
            </thead>
            <tbody>
              {distributions.length === 0 ? (
                <tr><td colSpan={5} className="p-3 text-center text-muted-foreground">Chưa có dòng phân bổ.</td></tr>
              ) : (
                distributions.map((d) => (
                  <tr key={d._id} className="border-t border-border">
                    <td className="p-2">{typeof d.segmentId === "object" ? d.segmentId?.name : d.segmentId}</td>
                    <td className="p-2">{rewardNameById.get(String(idOf(d.gameRewardId))) || "—"}</td>
                    <td className="p-2">{d.rate}%</td>
                    <td className="p-2">{d.maxQuantity}</td>
                    <td className="p-2">
                      {d.dateFrom || d.dateTo
                        ? `${toDateInput(d.dateFrom)} → ${toDateInput(d.dateTo)}`
                        : "Luôn hiệu lực"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Phần thưởng */}
      <div className="space-y-3 rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Phần thưởng</h2>
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-2">#</th>
                <th className="p-2">Tên hiển thị</th>
                <th className="p-2">Loại</th>
                <th className="p-2">Nội dung / Giá trị</th>
                <th className="p-2 text-right">Tổng kho</th>
                <th className="p-2 text-right">Đã phát hành</th>
                <th className="p-2 text-right">Còn lại</th>
                <th className="p-2 text-right">SL / lượt</th>
              </tr>
            </thead>
            <tbody>
              {rewards.length === 0 ? (
                <tr><td colSpan={8} className="p-3 text-center text-muted-foreground">Chưa có ô thưởng.</td></tr>
              ) : (
                rewards.map((r, i) => {
                  const issued = (r.totalReward ?? 0) - (r.remainingReward ?? 0);
                  return (
                    <tr key={r._id} className="border-t border-border">
                      <td className="p-2">{i + 1}</td>
                      <td className="p-2 font-medium text-foreground">
                        {r.displayName}
                        {r.isDefault ? <span className="ml-1.5 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">Mặc định</span> : null}
                      </td>
                      <td className="p-2">{GAME_REWARD_TYPE_LABEL[r.type] || r.type}</td>
                      <td className="p-2">{rewardContent(r)}</td>
                      <td className="p-2 text-right">{r.totalReward ?? 0}</td>
                      <td className="p-2 text-right">
                        {issued > 0 ? (
                          <button
                            type="button"
                            className="text-primary hover:underline"
                            onClick={() => setWinnerReward({ id: r._id, displayName: r.displayName })}
                          >
                            {issued}
                          </button>
                        ) : (
                          issued
                        )}
                      </td>
                      <td className="p-2 text-right">{r.remainingReward ?? 0}</td>
                      <td className="p-2 text-right">{r.quantity ?? 1}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RewardWinnersDialog
        open={!!winnerReward}
        onOpenChange={(v) => !v && setWinnerReward(null)}
        game={game}
        reward={winnerReward}
      />
    </div>
  );
}
