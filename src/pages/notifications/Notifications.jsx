import { useState } from "react";
import { useNavigate } from "react-router";
import { Eye, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DataTable } from "@/components/common/DataTable";
import { PageHeader } from "@/components/common/PageHeader";
import { formatDate, formatNumber } from "@/helpers/format";
import { DATE_TIME_FORMAT } from "@/constants/application";
import { ROUTE_PATH } from "@/constants/routePaths";
import { MOCK_NOTIFICATIONS } from "./mockData";
import {
  CHANNEL_LABEL,
  NOTI_STATUS_LABEL,
  NOTI_STATUS_VARIANT,
  TIER_OPTIONS,
  TEXT,
} from "./constants";

const tierLabel = (tier) => TIER_OPTIONS.find((t) => t.value === tier)?.label ?? tier;

export default function Notifications() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = MOCK_NOTIFICATIONS.filter((n) =>
    search ? n.title.toLowerCase().includes(search.toLowerCase()) : true
  );
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const columns = [
    {
      key: "title",
      title: TEXT.colTitle,
      minWidth: 220,
      render: (n) => <span className="font-medium text-foreground">{n.title}</span>,
    },
    {
      key: "channel",
      title: TEXT.colChannel,
      width: 90,
      render: (n) => <Badge variant="outline">{CHANNEL_LABEL[n.channel]}</Badge>,
    },
    {
      key: "tier",
      title: TEXT.colSegment,
      width: 140,
      render: (n) => <span className="text-sm text-muted-foreground">{tierLabel(n.tier)}</span>,
    },
    {
      key: "targeted",
      title: TEXT.colTargeted,
      width: 100,
      align: "right",
      render: (n) => formatNumber(n.targeted),
    },
    {
      key: "status",
      title: TEXT.colStatus,
      width: 120,
      render: (n) => (
        <Badge variant={NOTI_STATUS_VARIANT[n.status]}>{NOTI_STATUS_LABEL[n.status]}</Badge>
      ),
    },
    {
      key: "createdAt",
      title: TEXT.colDate,
      width: 150,
      render: (n) => (
        <span className="text-sm text-muted-foreground">{formatDate(n.createdAt, DATE_TIME_FORMAT)}</span>
      ),
    },
    {
      key: "actions",
      title: TEXT.colActions,
      width: 90,
      align: "center",
      render: (row) => (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="size-8 text-muted-foreground hover:text-foreground"
                onClick={() =>
                  navigate(ROUTE_PATH.NOTIFICATIONS_DETAIL.replace(":id", row._id), {
                    state: { mode: "view" },
                  })
                }
              >
                <Eye className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">{TEXT.viewDetail}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
  ];

  return (
    <div className="flex h-full flex-col gap-4">
      <PageHeader
        title={TEXT.pageTitle}
        description={TEXT.pageDesc}
        actions={
          <Button size="sm" onClick={() => navigate(ROUTE_PATH.NOTIFICATIONS_DETAIL.replace(":id", "new"), { state: { mode: "create" } })}>
            <Plus className="size-4" />
            {TEXT.addItem}
          </Button>
        }
      />

      <div className="flex justify-end">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={TEXT.searchPlaceholder}
            className="h-8 w-64 rounded-md border border-input bg-background pl-8 pr-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        dataSource={paginated}
        rowKey="_id"
        total={filtered.length}
        pageIndex={page}
        pageSize={pageSize}
        onChange={(p, ps) => { setPage(p); setPageSize(ps); }}
        heightOffset={220}
      />
    </div>
  );
}
