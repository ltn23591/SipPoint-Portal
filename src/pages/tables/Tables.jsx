import { Plus, QrCode } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";

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
      <EmptyState
        icon={QrCode}
        title="Tính năng đang phát triển"
        description="Quản lý bàn và QR sẽ sớm có mặt tại đây."
      />
    </div>
  );
}
