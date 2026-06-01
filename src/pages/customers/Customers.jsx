import { Plus, Users } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";

export default function Customers() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Khách hàng"
        description="Hồ sơ khách hàng, điểm tích luỹ và lịch sử mua."
        actions={
          <Button>
            <Plus className="size-4" />
            Thêm khách hàng
          </Button>
        }
      />
      <EmptyState
        icon={Users}
        title="Tính năng đang phát triển"
        description="Danh sách khách hàng sẽ sớm có mặt tại đây."
      />
    </div>
  );
}
