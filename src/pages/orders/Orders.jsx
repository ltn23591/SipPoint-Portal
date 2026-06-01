import { Plus, ShoppingBag } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";

export default function Orders() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Đơn hàng"
        description="Quản lý đơn hàng tại bàn, mang đi và giao hàng."
        actions={
          <Button>
            <Plus className="size-4" />
            Tạo đơn mới
          </Button>
        }
      />
      <EmptyState
        icon={ShoppingBag}
        title="Tính năng đang phát triển"
        description="Danh sách đơn hàng sẽ sớm có mặt tại đây."
      />
    </div>
  );
}
