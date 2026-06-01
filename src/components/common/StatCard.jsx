import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";

export function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  trendDirection = "up",
  iconClassName,
  className,
}) {
  const TrendIcon = trendDirection === "down" ? TrendingDown : TrendingUp;
  return (
    <Card className={cn("py-5", className)}>
      <CardContent className="px-5">
        <div className="flex items-start justify-between">
          <div
            className={cn(
              "flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary",
              iconClassName
            )}
          >
            {Icon ? <Icon className="size-5" /> : null}
          </div>
          {trend ? (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold",
                trendDirection === "down"
                  ? "bg-destructive/10 text-destructive"
                  : "bg-success/10 text-success"
              )}
            >
              <TrendIcon className="size-3" />
              {trend}
            </span>
          ) : null}
        </div>
        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-3xl font-bold text-primary">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
