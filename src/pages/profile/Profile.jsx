import { useState } from "react";
import {
  Pencil,
  Mail,
  User,
  Shield,
  Bell,
  BadgeCheck,
  CalendarDays,
  Clock,
  IdCard,
  CircleDot,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { formatDate } from "@/helpers/format";
import {
  DATE_TIME_FORMAT,
  ACCOUNT_STATUS_LABEL,
  ACCOUNT_STATUS_VARIANT,
  ACCOUNT_TYPE_LABEL,
  PERMISSION_LABEL,
  ROLE_LABEL,
} from "@/constants/application";

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border py-3 last:border-b-0 sm:flex-row sm:items-start">
      <div className="flex w-56 shrink-0 items-center gap-2 text-sm font-semibold text-secondary">
        {Icon ? <Icon className="size-4 text-muted-foreground" /> : null}
        {label} :
      </div>
      <div className="text-sm font-semibold text-foreground">
        {value || value === 0 ? (
          value
        ) : (
          <span className="font-normal text-muted-foreground">—</span>
        )}
      </div>
    </div>
  );
}

export default function Profile() {
  const { user } = useAuth();
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(false);

  const name = user?.name || "—";
  const role = user?.roleId || {};
  const roleLabel = role.name || ROLE_LABEL[user?.role] || user?.role || "—";
  const permissions = Array.isArray(role.permissions) ? role.permissions : [];

  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const statusBadge = user?.status ? (
    <Badge variant={ACCOUNT_STATUS_VARIANT[user.status] || "secondary"}>
      {ACCOUNT_STATUS_LABEL[user.status] || user.status}
    </Badge>
  ) : null;

  return (
    <div className="space-y-5">
      <PageHeader title="Hồ sơ" description="Thông tin tài khoản của bạn." />

      <Card>
        <CardContent className="flex flex-col gap-8 p-6 lg:flex-row">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3 lg:w-72 lg:shrink-0">
            <Avatar className="size-48 border-4 border-muted shadow-sm">
              {user?.avatar ? <AvatarImage src={user.avatar} alt={name} /> : null}
              <AvatarFallback className="bg-primary/15 text-4xl font-bold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p className="text-lg font-bold text-secondary">{name}</p>
              {statusBadge}
            </div>
          </div>

          {/* Tabs + content */}
          <div className="min-w-0 flex-1">
            <Tabs defaultValue="profile">
              <TabsList>
                <TabsTrigger value="profile">Thông tin hồ sơ</TabsTrigger>
                <TabsTrigger value="notifications">Nhận thông báo</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="mt-5">
                <div>
                  <InfoRow icon={User} label="Họ tên" value={name} />
                  <InfoRow icon={Mail} label="Địa chỉ email" value={user?.email} />
                  <InfoRow icon={Shield} label="Vai trò" value={roleLabel} />
                  <InfoRow icon={IdCard} label="Mã vai trò" value={role.code} />
                  {role.description ? (
                    <InfoRow icon={BadgeCheck} label="Mô tả vai trò" value={role.description} />
                  ) : null}
                  <InfoRow
                    icon={CircleDot}
                    label="Trạng thái"
                    value={statusBadge}
                  />
                  <InfoRow
                    icon={User}
                    label="Loại tài khoản"
                    value={ACCOUNT_TYPE_LABEL[user?.type] || user?.type}
                  />
                  <InfoRow
                    icon={CalendarDays}
                    label="Ngày tạo"
                    value={user?.createdAt ? formatDate(user.createdAt, DATE_TIME_FORMAT) : null}
                  />
                  <InfoRow
                    icon={Clock}
                    label="Cập nhật gần nhất"
                    value={user?.updatedAt ? formatDate(user.updatedAt, DATE_TIME_FORMAT) : null}
                  />

                  <div className="flex flex-col gap-2 py-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-secondary">
                      <BadgeCheck className="size-4 text-muted-foreground" />
                      Quyền hạn :
                    </div>
                    {permissions.length ? (
                      <div className="flex flex-wrap gap-2">
                        {permissions.map((perm) => (
                          <Badge key={perm} variant="secondary">
                            {PERMISSION_LABEL[perm] || perm}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Không có quyền nào.</span>
                    )}
                  </div>
                </div>

                <Button
                  className="mt-5"
                  onClick={() =>
                    toast.info("Tính năng chỉnh sửa hồ sơ đang được phát triển.")
                  }
                >
                  <Pencil className="size-4" />
                  Chỉnh sửa thông tin
                </Button>
              </TabsContent>

              <TabsContent value="notifications" className="mt-5">
                <div className="space-y-1">
                  <label className="flex items-center justify-between gap-4 border-b border-border py-3.5">
                    <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Mail className="size-4 text-muted-foreground" />
                      Nhận thông báo qua email
                    </span>
                    <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
                  </label>
                  <label className="flex items-center justify-between gap-4 py-3.5">
                    <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Bell className="size-4 text-muted-foreground" />
                      Nhận thông báo đẩy
                    </span>
                    <Switch checked={pushNotif} onCheckedChange={setPushNotif} />
                  </label>
                </div>

                <Button
                  className="mt-5"
                  onClick={() => toast.success("Đã lưu tùy chọn thông báo.")}
                >
                  Lưu thay đổi
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
