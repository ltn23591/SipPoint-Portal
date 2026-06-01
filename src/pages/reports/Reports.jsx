import { BarChart3 } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";

export default function Reports() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Báo cáo"
        description="Doanh thu, sản phẩm, khách hàng theo thời gian."
      />
      <EmptyState
        icon={BarChart3}
        title="Tính năng đang phát triển"
        description="Báo cáo chi tiết sẽ sớm có mặt tại đây."
      />
    </div>
  );
}
