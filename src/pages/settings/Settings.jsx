import { Settings as SettingsIcon } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";

export default function Settings() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Cài đặt"
        description="Thiết lập cửa hàng, in ấn, thanh toán, tích hợp."
      />
      <EmptyState
        icon={SettingsIcon}
        title="Tính năng đang phát triển"
        description="Cài đặt hệ thống sẽ sớm có mặt tại đây."
      />
    </div>
  );
}
