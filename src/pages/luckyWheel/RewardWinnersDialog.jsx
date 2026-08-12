import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebounce } from "@/hooks/useDebounce";
import { formatDate } from "@/helpers/format";
import { GameApi } from "@/apis";
import { GAME_REWARD_TYPE, GAME_REWARD_TYPE_LABEL, DATE_TIME_FORMAT } from "@/constants/application";

// reward = { id, displayName } của ô thưởng đang xem. game = { _id, name }.
export function RewardWinnersDialog({ open, onOpenChange, game, reward }) {
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 400);

  const params = useMemo(
    () => ({ page: 1, limit: 100, ...(search ? { search } : {}) }),
    [search]
  );

  const { data, isLoading } = useQuery({
    queryKey: ["reward-winners", game?._id, reward?.id, params],
    enabled: open && !!game?._id && !!reward?.id,
    queryFn: async ({ signal }) => {
      const res = await GameApi.getRewardWinners(game._id, reward.id, params, signal);
      return res?.data?.success
        ? { list: res.data.data || [], meta: res.data.reward, total: res.data.pagination?.total ?? 0 }
        : { list: [], meta: null, total: 0 };
    },
  });

  const list = data?.list ?? [];
  const meta = data?.meta;

  const rewardContent = (r) => {
    if (r.type === GAME_REWARD_TYPE.POINTS) return `${r.rewardValue ?? 0} xu`;
    if (r.type === GAME_REWARD_TYPE.MESSAGE) return r.message || "-";
    return r.displayName || "-";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            Danh sách trúng thưởng
            {game?.name ? <span className="text-muted-foreground"> ({game.name})</span> : null}
          </DialogTitle>
        </DialogHeader>

        {meta && (
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 rounded-md border border-border bg-muted/30 p-3 text-sm sm:grid-cols-3">
            <p><span className="font-medium">Ô phần thưởng:</span> {meta.displayName}</p>
            <p><span className="font-medium">Loại phần thưởng:</span> {GAME_REWARD_TYPE_LABEL[meta.type] || meta.type}</p>
            <p><span className="font-medium">Số phần thưởng đã phát hành:</span> {meta.issuedCount}</p>
          </div>
        )}

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm theo tên / SĐT khách hàng..."
            className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <div className="max-h-[55vh] overflow-auto rounded-md border border-border">
          <Table>
            <TableHeader className="sticky top-0 bg-muted/90">
              <TableRow>
                <TableHead>ID khách hàng</TableHead>
                <TableHead>Loại phần thưởng</TableHead>
                <TableHead>Tên quà / Nội dung</TableHead>
                <TableHead className="text-right">Số lượng</TableHead>
                <TableHead>Mã phiếu</TableHead>
                <TableHead>Thời gian trúng</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : list.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    Chưa có lượt trúng nào.
                  </TableCell>
                </TableRow>
              ) : (
                list.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell className="font-mono text-xs">{w.customerId}</TableCell>
                    <TableCell>{GAME_REWARD_TYPE_LABEL[w.type] || w.type}</TableCell>
                    <TableCell>{rewardContent(w)}</TableCell>
                    <TableCell className="text-right">{w.quantity ?? 1}</TableCell>
                    <TableCell className="font-mono text-xs break-all">{w.code}</TableCell>
                    <TableCell>{w.wonAt ? formatDate(w.wonAt, DATE_TIME_FORMAT) : "-"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
