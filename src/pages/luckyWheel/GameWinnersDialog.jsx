import { Fragment, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, Search } from "lucide-react";

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
import { GAME_REWARD_TYPE, GAME_REWARD_TYPE_LABEL } from "@/constants/application";

export function GameWinnersDialog({ open, onOpenChange, game }) {
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 400);
  const [expanded, setExpanded] = useState(null); // customerId đang mở

  const params = useMemo(
    () => ({ page: 1, limit: 100, ...(search ? { search } : {}) }),
    [search]
  );

  const { data, isLoading } = useQuery({
    queryKey: ["game-winners", game?._id, params],
    enabled: open && !!game?._id,
    queryFn: async ({ signal }) => {
      const res = await GameApi.getWinners(game._id, params, signal);
      return res?.data?.success
        ? { list: res.data.data || [], total: res.data.pagination?.total ?? 0 }
        : { list: [], total: 0 };
    },
  });

  const list = data?.list ?? [];
  const toggle = (id) => setExpanded((cur) => (cur === id ? null : id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            Danh sách trúng thưởng
            {data ? <span className="text-primary"> - {data.total} người</span> : null}
          </DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm kiếm..."
            className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <div className="max-h-[55vh] overflow-auto rounded-md border border-border">
          <Table>
            <TableHeader className="sticky top-0 bg-muted/90">
              <TableRow>
                <TableHead className="w-8" />
                <TableHead className="w-14">STT</TableHead>
                <TableHead>Tên khách hàng</TableHead>
                <TableHead>Số điện thoại</TableHead>
                <TableHead className="text-right">Số lượt quay</TableHead>
                <TableHead className="text-right">Số quà trúng</TableHead>
                <TableHead>Phần thưởng gần nhất</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : list.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    Chưa có người trúng thưởng.
                  </TableCell>
                </TableRow>
              ) : (
                list.map((w, i) => {
                  const isOpen = expanded === w.customerId;
                  return (
                    <Fragment key={w.customerId || i}>
                      <TableRow className="cursor-pointer" onClick={() => toggle(w.customerId)}>
                        <TableCell>
                          {isOpen ? (
                            <ChevronDown className="size-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="size-4 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell>{w.fullName || "-"}</TableCell>
                        <TableCell>{w.phone || "-"}</TableCell>
                        <TableCell className="text-right">{w.spinCount ?? 0}</TableCell>
                        <TableCell className="text-right">{w.prizeCount ?? 0}</TableCell>
                        <TableCell>
                          {w.lastPrizeType === GAME_REWARD_TYPE.MESSAGE
                            ? "Không trúng"
                            : w.lastPrizeName || "-"}
                        </TableCell>
                      </TableRow>
                      {isOpen && (
                        <TableRow className="bg-muted/20">
                          <TableCell colSpan={7} className="p-0">
                            <WinnerRewardDetail gameId={game?._id} customerId={w.customerId} />
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function rewardText(r) {
  if (r.type === GAME_REWARD_TYPE.POINTS) return `${r.displayName} (+${r.rewardValue ?? 0} xu)`;
  if (r.type === GAME_REWARD_TYPE.VOUCHER) return r.voucher ? `${r.displayName} (${r.voucher.code})` : r.displayName;
  return r.displayName;
}

function WinnerRewardDetail({ gameId, customerId }) {
  const { data = [], isLoading } = useQuery({
    queryKey: ["winner-rewards", gameId, customerId],
    enabled: !!gameId && !!customerId,
    queryFn: async () => {
      const res = await GameApi.getWinnerRewards(gameId, customerId);
      return res?.data?.success ? res.data.data || [] : [];
    },
  });

  if (isLoading) {
    return <div className="px-6 py-3 text-sm text-muted-foreground">Đang tải chi tiết...</div>;
  }
  if (data.length === 0) {
    return <div className="px-6 py-3 text-sm text-muted-foreground">Chưa có lượt trúng nào.</div>;
  }

  return (
    <div className="px-6 py-3">
      <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Chi tiết các lượt</p>
      <ul className="space-y-1.5">
        {data.map((r) => (
          <li key={r.id} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2">
              <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                {GAME_REWARD_TYPE_LABEL[r.type] || r.type}
              </span>
              <span>{rewardText(r)}</span>
            </span>
            <span className="text-xs text-muted-foreground">{r.wonAt ? formatDate(r.wonAt) : ""}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
