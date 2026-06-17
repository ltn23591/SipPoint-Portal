import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Star } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatDate } from "@/helpers/format";
import { DATE_TIME_FORMAT } from "@/constants/application";
import { ROUTE_PATH } from "@/constants/routePaths";
import { MOCK_REVIEWS } from "./mockData";
import {
  REVIEW_STATUS_LABEL,
  REVIEW_STATUS_OPTIONS,
  REVIEW_STATUS_VARIANT,
  TEXT,
} from "./constants";

export default function ReviewDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const review = MOCK_REVIEWS.find((r) => r._id === id);

  const [response, setResponse] = useState(review?.response ?? "");
  const [status, setStatus] = useState(review?.status ?? "OPEN");

  if (!review) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p>Không tìm thấy đánh giá này.</p>
        <Button variant="link" onClick={() => navigate(ROUTE_PATH.REVIEWS)}>
          {TEXT.back}
        </Button>
      </div>
    );
  }

  const handleSave = () => {
    // Thực tế: PATCH /reviews/:id/respond { response, status }
    toast.success("Đã lưu phản hồi");
    navigate(ROUTE_PATH.REVIEWS);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={() => navigate(ROUTE_PATH.REVIEWS)}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-secondary">{TEXT.detailTitle}</h1>
          <p className="text-sm text-muted-foreground">{review.customer.fullName}</p>
        </div>
      </div>

      {/* Nội dung đánh giá */}
      <div className="space-y-3 rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={cn(
                  "size-4",
                  i <= review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
                )}
              />
            ))}
          </div>
          <Badge variant={REVIEW_STATUS_VARIANT[review.status]}>
            {REVIEW_STATUS_LABEL[review.status]}
          </Badge>
        </div>
        <p className="text-sm text-foreground">{review.comment}</p>
        <p className="text-xs text-muted-foreground">
          {formatDate(review.createdAt, DATE_TIME_FORMAT)}
        </p>
      </div>

      {/* Phản hồi */}
      <div className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted-foreground">{TEXT.respondLabel}</label>
          <Textarea
            rows={4}
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder={TEXT.respondPlaceholder}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted-foreground">{TEXT.statusLabel}</label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REVIEW_STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate(ROUTE_PATH.REVIEWS)}>
          {TEXT.cancel}
        </Button>
        <Button onClick={handleSave} disabled={!response.trim()}>
          {TEXT.save}
        </Button>
      </div>
    </div>
  );
}
