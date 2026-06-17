import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ORDER_STATUS,
  ORDER_STATUS_LABEL,
} from "@/constants/application";

const STATUS_STYLE = {
  [ORDER_STATUS.PENDING]:
    "bg-warning/15 text-warning border border-warning/30",
  [ORDER_STATUS.CONFIRMED]:
    "bg-info/15 text-info border border-info/30",
  [ORDER_STATUS.PREPARING]:
    "bg-info/15 text-info border border-info/30",
  [ORDER_STATUS.READY]:
    "bg-success/15 text-success border border-success/30",
  [ORDER_STATUS.COMPLETED]:
    "bg-success/15 text-success border border-success/30",
  [ORDER_STATUS.CANCELLED]:
    "bg-destructive/15 text-destructive border border-destructive/30",
};

export function StatusBadge({ status, className }) {
  const label = ORDER_STATUS_LABEL[status] ?? status;
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 rounded-full px-2.5 py-0.5 font-medium",
        STATUS_STYLE[status],
        className
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </Badge>
  );
}
