import { Store, Percent, Clock } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPercent } from "@/helpers/format";
import { SETTINGS } from "./mockData";

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2.5 last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

export default function Settings() {
  const { store, tax, currency, timezone, operatingHours } = SETTINGS;
  return (
    <div className="space-y-5">
      <PageHeader
        title="Cài đặt"
        description="Thiết lập cửa hàng, thuế và giờ hoạt động."
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Store className="size-4 text-primary" />
            Thông tin cửa hàng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Row label="Tên cửa hàng" value={store.name} />
          <Row label="Địa chỉ" value={store.address} />
          <Row label="Mã số thuế" value={store.taxCode} />
          <Row label="Điện thoại" value={store.phone} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Percent className="size-4 text-primary" />
            Thuế & tiền tệ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Row label="Thuế VAT" value={formatPercent(tax.vatRate * 100, 0)} />
          <Row
            label="Giá đã gồm VAT"
            value={
              <Badge variant={tax.priceIncludesVat ? "success" : "secondary"}>
                {tax.priceIncludesVat ? "Có" : "Không"}
              </Badge>
            }
          />
          <Row label="Tiền tệ" value={currency} />
          <Row label="Múi giờ" value={timezone} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="size-4 text-primary" />
            Giờ hoạt động
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Row label="Thứ 2 - Thứ 6" value={`${operatingHours["mon-fri"].open} - ${operatingHours["mon-fri"].close}`} />
          <Row label="Thứ 7 - Chủ nhật" value={`${operatingHours["sat-sun"].open} - ${operatingHours["sat-sun"].close}`} />
        </CardContent>
      </Card>
    </div>
  );
}
