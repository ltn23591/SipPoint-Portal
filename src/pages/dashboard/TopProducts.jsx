import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ReportApi } from "@/apis";

export function TopProducts() {
  const { data: topProducts = [], isLoading } = useQuery({
    queryKey: ["report-top-products"],
    queryFn: async () => {
      const res = await ReportApi.topProducts({ limit: 5 });
      return res?.data?.data || res?.data || [];
    },
  });

  const max = Math.max(...topProducts.map((p) => p.qty || 1), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Top 5 món bán chạy</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Đang tải...</p>
        ) : topProducts.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Chưa có món bán ra.</p>
        ) : (
          <ul className="space-y-4">
            {topProducts.map((p) => {
              const sold = p.qty || 0;
              const pct = Math.round((sold / max) * 100);
              return (
                <li key={p._id || p.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{p.name}</span>
                    <span className="text-muted-foreground">{sold} phần</span>
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
        )}
      </CardContent>
    </Card>
  );
}
