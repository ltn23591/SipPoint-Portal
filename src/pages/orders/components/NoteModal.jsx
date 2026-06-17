import { useState, useEffect } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

/**
 * Modal nhập ghi chú cho một món trong đơn.
 * - itemName: tên món hiển thị ở tiêu đề phụ.
 * - initialValue: ghi chú hiện tại (nếu có).
 * - onConfirm(note): trả về nội dung ghi chú đã nhập.
 */
export function NoteModal({ open, onOpenChange, itemName, initialValue = "", onConfirm }) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (open) setValue(initialValue);
  }, [open, initialValue]);

  const handleConfirm = () => {
    onConfirm?.(value.trim());
    onOpenChange?.(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ghi chú món</DialogTitle>
          {itemName ? <DialogDescription>{itemName}</DialogDescription> : null}
        </DialogHeader>

        <Textarea
          rows={4}
          autoFocus
          placeholder="Nhập nội dung ghi chú (vd: ít đường, nhiều đá, không kem...)"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange?.(false)}>
            Hủy
          </Button>
          <Button onClick={handleConfirm}>Xác nhận</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
