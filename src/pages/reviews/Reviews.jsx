import { useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Clock,
  Download,
  Loader2,
  MessageSquarePlus,
  Search,
  ShoppingBag,
  Star,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { OrderDetailDialog } from "@/pages/orders/components/OrderDetailDialog";
import { FeedbackApi } from "@/apis";
import { ACTIVE_STATUS, DATE_TIME_FORMAT } from "@/constants/application";
import { formatDate, formatNumber } from "@/helpers/format";
import { cn } from "@/lib/utils";

function StarBadge({ rating = 5 }) {
  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((idx) => (
        <Star
          key={idx}
          className={cn(
            "size-3.5",
            idx <= rating
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted-foreground/30"
          )}
        />
      ))}
    </div>
  );
}

export default function Reviews() {
  const qc = useQueryClient();
  const [keyword, setKeyword] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [replyFilter, setReplyFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);

  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [replyTarget, setReplyTarget] = useState(null);
  const [replyText, setReplyText] = useState("");

  const queryPayload = {
    page,
    limit: 15,
    keyword: keyword.trim() || undefined,
    rating: ratingFilter !== "all" ? Number(ratingFilter) : undefined,
    hasReply: replyFilter !== "all" ? replyFilter : undefined,
  };

  const { data, isLoading } = useQuery({
    queryKey: ["feedbacks", queryPayload],
    queryFn: async () => {
      const res = await FeedbackApi.search(queryPayload);
      return {
        items: res?.data?.data || [],
        pagination: res?.data?.pagination || { total: 0, page: 1, limit: 15, totalPages: 1 },
        summary: res?.data?.summary || {
          totalReviews: 0,
          avgRating: 0,
          repliedCount: 0,
          unrepliedCount: 0,
        },
      };
    },
    placeholderData: keepPreviousData,
  });

  const items = data?.items || [];
  const summary = data?.summary || {};
  const pagination = data?.pagination || { total: 0, page: 1, totalPages: 1 };

  const updateMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await FeedbackApi.update(payload);
      if (res?.data && res.data.success === false) {
        throw new Error(res.data.message || "Cập nhật đánh giá thất bại.");
      }
      return res?.data?.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feedbacks"] });
      toast.success("Đã cập nhật đánh giá thành công.");
      setReplyTarget(null);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || err.message || "Cập nhật thất bại.");
    },
  });

  const handleOpenReply = (item) => {
    setReplyTarget(item);
    setReplyText(item.adminReply || "");
  };

  const handleSaveReply = (e) => {
    e.preventDefault();
    if (!replyTarget) return;
    updateMutation.mutate({
      id: replyTarget._id,
      adminReply: replyText,
    });
  };

  const handleToggleActive = (item) => {
    const nextStatus =
      item.isActive === ACTIVE_STATUS.ACTIVE ? ACTIVE_STATUS.INACTIVE : ACTIVE_STATUS.ACTIVE;
    updateMutation.mutate({
      id: item._id,
      isActive: nextStatus,
    });
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await FeedbackApi.export(queryPayload);
      if (!res?.data || res.data.size === 0) {
        throw new Error("Không có dữ liệu để xuất.");
      }
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "danh-gia-khach-hang.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Đã xuất danh sách đánh giá khách hàng.");
    } catch (err) {
      toast.error(err.message || "Xuất Excel thất bại.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Đánh giá & Phản hồi"
        description="Theo dõi mức độ hài lòng của khách hàng sau đơn hàng và gửi phản hồi trực tiếp."
        actions={
          <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
            {exporting ? (
              <Loader2 className="mr-1.5 size-4 animate-spin" />
            ) : (
              <Download className="mr-1.5 size-4" />
            )}
            Xuất Excel
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Star}
          label="Điểm trung bình"
          value={`${summary.avgRating || 0} / 5.0 ⭐`}
          iconClassName="bg-amber-500/10 text-amber-500"
        />
        <StatCard
          icon={MessageSquarePlus}
          label="Tổng lượt đánh giá"
          value={formatNumber(summary.totalReviews || 0)}
        />
        <StatCard
          icon={CheckCircle2}
          label="Đã phản hồi"
          value={formatNumber(summary.repliedCount || 0)}
          iconClassName="bg-emerald-500/10 text-emerald-600"
        />
        <StatCard
          icon={Clock}
          label="Chờ phản hồi"
          value={formatNumber(summary.unrepliedCount || 0)}
          iconClassName="bg-amber-500/10 text-amber-600"
        />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[240px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setPage(1);
                }}
                placeholder="Tìm theo mã đơn, tên khách hàng, SĐT hoặc nội dung nhận xét..."
                className="pl-9"
              />
            </div>

            <Select
              value={ratingFilter}
              onValueChange={(v) => {
                setRatingFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Số sao" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả số sao</SelectItem>
                <SelectItem value="5">5 sao (Tuyệt vời)</SelectItem>
                <SelectItem value="4">4 sao (Hài lòng)</SelectItem>
                <SelectItem value="3">3 sao (Bình thường)</SelectItem>
                <SelectItem value="2">2 sao (Cần cải thiện)</SelectItem>
                <SelectItem value="1">1 sao (Không hài lòng)</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={replyFilter}
              onValueChange={(v) => {
                setReplyFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Trạng thái phản hồi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả phản hồi</SelectItem>
                <SelectItem value="unreplied">Chưa phản hồi</SelectItem>
                <SelectItem value="replied">Đã phản hồi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              <Loader2 className="mr-2 size-4 animate-spin" />
              Đang tải danh sách đánh giá...
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Chưa có đánh giá nào phù hợp với bộ lọc.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Thời gian</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Đơn hàng</TableHead>
                  <TableHead>Mức đánh giá</TableHead>
                  <TableHead className="min-w-[260px]">Nhận xét & Phản hồi</TableHead>
                  <TableHead>Hiển thị</TableHead>
                  <TableHead className="pr-6 text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const orderCode = item.orderId?.code || "—";
                  const orderId = item.orderId?._id || item.orderId;
                  return (
                    <TableRow key={item._id}>
                      <TableCell className="pl-6 text-xs text-muted-foreground">
                        {item.createdAt ? formatDate(item.createdAt, DATE_TIME_FORMAT) : "—"}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-foreground">
                          {item.customerName || item.customerId?.fullName || "Khách lẻ"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.customerPhone || item.customerId?.phone || "—"}
                        </p>
                      </TableCell>
                      <TableCell>
                        {orderId ? (
                          <button
                            type="button"
                            onClick={() => setSelectedOrderId(orderId)}
                            className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-primary hover:underline"
                          >
                            <ShoppingBag className="size-3" />#{orderCode}
                          </button>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <StarBadge rating={item.rating} />
                          <div>
                            <Badge variant={item.rating >= 4 ? "default" : item.rating === 3 ? "secondary" : "destructive"}>
                              {item.rating}/5 sao
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md space-y-1.5 py-3">
                        <p className="text-sm text-foreground">
                          {item.comment || (
                            <span className="italic text-muted-foreground">
                              (Không để lại lời nhắn)
                            </span>
                          )}
                        </p>
                        {item.adminReply && (
                          <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs">
                            <span className="font-semibold text-primary">Phản hồi của quán: </span>
                            <span className="text-foreground">{item.adminReply}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={item.isActive === ACTIVE_STATUS.ACTIVE}
                          onCheckedChange={() => handleToggleActive(item)}
                        />
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => handleOpenReply(item)}
                        >
                          <MessageSquarePlus className="mr-1.5 size-3.5" />
                          {item.adminReply ? "Sửa phản hồi" : "Phản hồi"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-6 py-3 text-xs text-muted-foreground">
              <span>
                Trang {pagination.page} / {pagination.totalPages} (Tổng {pagination.total} đánh giá)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog phản hồi đánh giá */}
      <Dialog open={!!replyTarget} onOpenChange={(open) => !open && setReplyTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Phản hồi đánh giá đơn #{replyTarget?.orderId?.code || "—"}
            </DialogTitle>
          </DialogHeader>
          {replyTarget && (
            <form onSubmit={handleSaveReply} className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">
                    {replyTarget.customerName || "Khách hàng"}
                  </span>
                  <StarBadge rating={replyTarget.rating} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {replyTarget.comment || "(Không có lời bình)"}
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="admin-reply">Nội dung phản hồi từ SipPoint</Label>
                <Textarea
                  id="admin-reply"
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Cảm ơn quý khách đã ủng hộ SipPoint! Rất mong được đón tiếp bạn lần sau..."
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setReplyTarget(null)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending && <Loader2 className="mr-1.5 size-4 animate-spin" />}
                  Lưu phản hồi
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <OrderDetailDialog
        orderId={selectedOrderId}
        open={!!selectedOrderId}
        onOpenChange={(v) => !v && setSelectedOrderId(null)}
      />
    </div>
  );
}
