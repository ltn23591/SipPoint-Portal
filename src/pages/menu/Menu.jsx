import { Plus, UtensilsCrossed } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";

export default function Menu() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Menu"
        description="Quản lý món, danh mục và combo."
        actions={
          <Button>
            <Plus className="size-4" />
            Thêm món
          </Button>
        }
      />
      <EmptyState
        icon={UtensilsCrossed}
        title="Tính năng đang phát triển"
        description="Quản lý menu sẽ sớm có mặt tại đây."
      />
    </div>
  );
}
