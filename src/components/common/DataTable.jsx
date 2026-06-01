import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { EmptyState } from "./EmptyState";
import { cn } from "@/lib/utils";

export function DataTable({
  columns = [],
  rows = [],
  rowKey = "id",
  loading = false,
  empty,
  className,
}) {
  if (!loading && rows.length === 0) {
    return empty ?? <EmptyState title="Không có dữ liệu" />;
  }

  return (
    <Card className={cn("p-0", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead
                key={col.key}
                style={{ width: col.width }}
                className={col.headClassName}
              >
                {col.title}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="py-8 text-center text-sm text-muted-foreground"
              >
                Đang tải...
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, idx) => (
              <TableRow key={row[rowKey] ?? idx}>
                {columns.map((col) => (
                  <TableCell key={col.key} className={col.cellClassName}>
                    {col.render
                      ? col.render(row, idx)
                      : row[col.dataIndex ?? col.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
