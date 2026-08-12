import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatNumber } from "@/helpers/format";
import { CustomerSegmentApi } from "@/apis";

// value = mảng id đã chọn; onConfirm(ids) khi bấm Lưu.
export function SegmentPickerDialog({ open, onOpenChange, value = [], onConfirm }) {
  const [selected, setSelected] = useState(value);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) setSelected(value);
  }, [open, value]);

  const { data: segments = [] } = useQuery({
    queryKey: ["segment-picker-options"],
    enabled: open,
    queryFn: async () => {
      const res = await CustomerSegmentApi.getAll({ page: 1, limit: 100 });
      return res?.data?.success ? res.data.data || [] : [];
    },
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return segments;
    const q = search.trim().toLowerCase();
    return segments.filter((s) => (s.name || "").toLowerCase().includes(q));
  }, [segments, search]);

  const toggle = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chọn nhóm khách hàng</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm nhóm khách hàng"
            className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <div className="max-h-[50vh] overflow-auto rounded-md border border-border">
          <Table>
            <TableHeader className="sticky top-0 bg-muted/90">
              <TableRow>
                <TableHead className="w-10" />
                <TableHead>Tên nhóm khách hàng</TableHead>
                <TableHead>Số lượng KH</TableHead>
                <TableHead>Ngày tạo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    Không có nhóm khách hàng.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((s) => (
                  <TableRow
                    key={s._id}
                    className="cursor-pointer"
                    onClick={() => toggle(s._id)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selected.includes(s._id)}
                        onCheckedChange={() => toggle(s._id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{formatNumber(s.memberCount ?? 0)} KH</TableCell>
                    <TableCell>{s.createdAt ? formatDate(s.createdAt) : "—"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <DialogFooter className="items-center sm:justify-between">
          <span className="text-sm text-muted-foreground">Đã chọn: {selected.length}</span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Huỷ
            </Button>
            <Button
              onClick={() => {
                onConfirm(selected);
                onOpenChange(false);
              }}
            >
              Lưu
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
