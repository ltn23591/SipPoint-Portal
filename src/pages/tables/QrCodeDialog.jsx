import { Loader2, QrCode, Download } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const isImageSrc = (v) =>
  typeof v === "string" && (v.startsWith("data:image") || /^https?:\/\//.test(v));

export function QrCodeDialog({ open, onOpenChange, table, onGenerate, loading }) {
  const qrCode = table?.qrCode;
  const hasQr = !!qrCode;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mã QR — {table?.name}</DialogTitle>
          <DialogDescription>
            Mã QR để khách quét và đặt món tại bàn.
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-48 flex-col items-center justify-center gap-3 py-2">
          {hasQr ? (
            isImageSrc(qrCode) ? (
              <img
                src={qrCode}
                alt={`Mã QR ${table?.name}`}
                className="size-48 rounded-lg border border-border bg-white object-contain p-2"
              />
            ) : (
              <p className="break-all rounded-lg border border-border bg-muted px-3 py-2 text-center font-mono text-xs text-muted-foreground">
                {qrCode}
              </p>
            )
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <QrCode className="size-12" />
              <p className="text-sm">Bàn này chưa có mã QR.</p>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-between">
          {hasQr && isImageSrc(qrCode) ? (
            <Button variant="outline" asChild>
              <a href={qrCode} download={`qr-${table?.name || "table"}.png`}>
                <Download className="size-4" />
                Tải xuống
              </a>
            </Button>
          ) : (
            <span />
          )}
          <Button onClick={onGenerate} disabled={loading}>
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <QrCode className="size-4" />
            )}
            {hasQr ? "Tạo lại mã QR" : "Sinh mã QR"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
