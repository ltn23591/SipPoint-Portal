import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TOP_PRODUCTS } from "./mockData";

export function TopProducts() {
  const max = Math.max(...TOP_PRODUCTS.map((p) => p.sold));
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Top 5 món bán chạy</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {TOP_PRODUCTS.map((p) => {
            const pct = Math.round((p.sold / max) * 100);
            return (
              <li key={p.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{p.name}</span>
                  <span className="text-muted-foreground">{p.sold}</span>
                </div>
                <Progress
                  value={pct}
                  className="h-2"
                  indicatorClassName="bg-gradient-to-r from-primary-light to-primary"
                />
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
