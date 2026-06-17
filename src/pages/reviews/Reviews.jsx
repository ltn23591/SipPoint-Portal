import { useState } from "react";
import { useNavigate } from "react-router";
import { Eye, Search, Star } from "lucide-react";

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
import { cn } from "@/lib/utils";
import { formatDate } from "@/helpers/format";
import { DATE_TIME_FORMAT } from "@/constants/application";
import { ROUTE_PATH } from "@/constants/routePaths";
import { MOCK_REVIEWS } from "./mockData";
import { REVIEW_STATUS_LABEL, REVIEW_STATUS_VARIANT, TEXT } from "./constants";

function Stars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            "size-3.5",
            i <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
          )}
        />
      ))}
    </div>
  );
}

export default function Reviews() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = MOCK_REVIEWS.filter((r) =>
    search ? r.comment.toLowerCase().includes(search.toLowerCase()) : true
  );
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const columns = [
    {
      key: "customer",
      title: TEXT.colCustomer,
      width: 160,
      render: (r) => <span className="font-medium text-foreground">{r.customer.fullName}</span>,
    },
    { key: "rating", title: TEXT.colRating, width: 120, render: (r) => <Stars rating={r.rating} /> },
    {
      key: "comment",
      title: TEXT.colComment,
      minWidth: 240,
      render: (r) => <span className="line-clamp-1 text-sm text-muted-foreground">{r.comment}</span>,
    },
    {
      key: "status",
      title: TEXT.colStatus,
      width: 130,
      render: (r) => (
        <Badge variant={REVIEW_STATUS_VARIANT[r.status]}>{REVIEW_STATUS_LABEL[r.status]}</Badge>
      ),
    },
    {
      key: "createdAt",
      title: TEXT.colDate,
      width: 150,
      render: (r) => (
        <span className="text-sm text-muted-foreground">{formatDate(r.createdAt, DATE_TIME_FORMAT)}</span>
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
                  navigate(ROUTE_PATH.REVIEWS_DETAIL.replace(":id", row._id), {
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
      <PageHeader title={TEXT.pageTitle} description={TEXT.pageDesc} />

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
