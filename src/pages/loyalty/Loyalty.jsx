import { Gift } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";

export default function Loyalty() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Loyalty & Events"
        description="Chương trình tích điểm và sự kiện khuyến mãi."
      />
      <EmptyState
        icon={Gift}
        title="Tính năng đang phát triển"
        description="Chương trình loyalty sẽ sớm có mặt tại đây."
      />
    </div>
  );
}
