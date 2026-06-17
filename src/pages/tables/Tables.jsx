import { Plus, QrCode, Users } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TABLE_STATUS_LABEL } from "@/constants/application";
import { MOCK_TABLES, TABLE_STATUS_VARIANT } from "./mockData";

export default function Tables() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Bàn & QR"
        description="Quản lý bàn, sinh mã QR cho đặt món."
        actions={
          <Button>
            <Plus className="size-4" />
            Thêm bàn
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {MOCK_TABLES.map((t) => (
          <div
            key={t._id}
            className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-foreground">{t.name}</span>
              <Badge variant={TABLE_STATUS_VARIANT[t.status]}>
                {TABLE_STATUS_LABEL[t.status]}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{t.area}</p>
            <div className="flex items-center justify-between pt-1">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="size-3.5" />
                {t.capacity} chỗ
              </span>
              <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-primary">
                <QrCode className="size-3.5" />
                Mã QR
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
