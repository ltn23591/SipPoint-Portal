import { Plus, UserCog } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";

export default function Staff() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Nhân viên"
        description="Quản lý nhân viên, ca làm và phân quyền."
        actions={
          <Button>
            <Plus className="size-4" />
            Thêm nhân viên
          </Button>
        }
      />
      <EmptyState
        icon={UserCog}
        title="Tính năng đang phát triển"
        description="Quản lý nhân viên sẽ sớm có mặt tại đây."
      />
    </div>
  );
}
