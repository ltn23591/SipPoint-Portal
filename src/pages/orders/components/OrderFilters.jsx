import { Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ORDER_STATUS_OPTIONS } from "@/constants/application";
import { DATE_FILTER_OPTIONS, TABLE_FILTER_OPTIONS, TEXT } from "../constants";

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: TEXT.allStatuses },
  ...ORDER_STATUS_OPTIONS,
];

export function OrderFilters({ filters, onFiltersChange, onNewOrder }) {
  const set = (key) => (val) => onFiltersChange({ ...filters, [key]: val });

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground">{TEXT.filterByDate}</p>
          <Select value={filters.date} onValueChange={set("date")}>
            <SelectTrigger className="h-8 w-36 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATE_FILTER_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value} className="text-xs">
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground">{TEXT.filterByTable}</p>
          <Select value={filters.table} onValueChange={set("table")}>
            <SelectTrigger className="h-8 w-36 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TABLE_FILTER_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value} className="text-xs">
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground">{TEXT.filterByStatus}</p>
          <Select value={filters.status} onValueChange={set("status")}>
            <SelectTrigger className="h-8 w-44 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTER_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value} className="text-xs">
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
          <Download className="size-3.5" />
          {TEXT.exportReport}
        </Button>
        <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={onNewOrder}>
          <Plus className="size-3.5" />
          {TEXT.newOrder}
        </Button>
      </div>
    </div>
  );
}
