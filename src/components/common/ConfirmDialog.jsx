import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// showReason: bật ô nhập lý do (bắt buộc theo mặc định) - dùng cho các hành động BE yêu cầu
// lý do (huỷ đơn, hoàn trả...). onConfirm luôn được gọi với (reason) - undefined nếu showReason=false,
// nên các nơi gọi onConfirm() không truyền tham số vẫn hoạt động bình thường.
export function ConfirmDialog({
  open,
  onOpenChange,
  title = "Xác nhận",
  description,
  confirmText = "Xác nhận",
  cancelText = "Huỷ",
  variant = "default",
  loading = false,
  onConfirm,
  showReason = false,
  reasonLabel = "Lý do",
  reasonPlaceholder = "Nhập lý do...",
  reasonRequired = true,
}) {
  const [reason, setReason] = useState("");

  const handleOpenChange = (v) => {
    if (!v) setReason("");
    onOpenChange?.(v);
  };

  const canConfirm = !loading && (!showReason || !reasonRequired || !!reason.trim());

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        {showReason && (
          <div className="space-y-1.5">
            <Label>{reasonLabel}{reasonRequired && <span className="text-destructive"> *</span>}</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={reasonPlaceholder}
              rows={2}
            />
          </div>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={() => onConfirm?.(showReason ? reason.trim() : undefined)}
            disabled={!canConfirm}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
