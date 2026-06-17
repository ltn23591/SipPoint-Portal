import { useRef, useState, useLayoutEffect } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronRight as ExpandIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { PAGE_SIZE_DEFAULT, PAGE_SIZE_OPTIONS } from "@/constants/application";

const PAGINATION_HEIGHT = 52;

export function DataTable({
  columns = [],
  dataSource = [],
  rowKey = "id",
  total = 0,
  pageIndex = 1,
  pageSize = PAGE_SIZE_DEFAULT,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  onChange,
  loading = false,
  bordered = false,
  rowSelection = null,
  rowExpandable = false,
  expandedRowRender,
  rowClassName,
  showTotal,
  showSizeChanger = true,
  heightOffset = 0,
  empty,
  className,
}) {
  const wrapperRef = useRef(null);
  const [scrollY, setScrollY] = useState("60vh");
  const [expandedKeys, setExpandedKeys] = useState(new Set());

  useLayoutEffect(() => {
    const calculate = () => {
      const el = wrapperRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      const thead = el.querySelector("thead");
      const theadH = thead?.offsetHeight ?? 40;
      const hasPagination = total > 0;
      const paginationH = hasPagination ? PAGINATION_HEIGHT : 0;
      const y = window.innerHeight - top - theadH - paginationH - heightOffset - 24;
      setScrollY(`${Math.max(150, Math.floor(y))}px`);
    };

    const timer = setTimeout(calculate, 50);
    window.addEventListener("resize", calculate);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", calculate);
    };
  }, [heightOffset, total]);

  // ── Pagination ──────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    onChange?.(page, pageSize);
  };

  const handlePageSizeChange = (val) => {
    onChange?.(1, Number(val));
  };

  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (pageIndex <= 4) return [1, 2, 3, 4, 5, "…", totalPages];
    if (pageIndex >= totalPages - 3)
      return [1, "…", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "…", pageIndex - 1, pageIndex, pageIndex + 1, "…", totalPages];
  };

  // ── Row selection ────────────────────────────────────────────────────────────
  const selectedKeys = rowSelection?.selectedKeys ?? [];
  const allKeys = dataSource.map((r) => r[rowKey]);
  const allSelected = allKeys.length > 0 && allKeys.every((k) => selectedKeys.includes(k));
  const someSelected = allKeys.some((k) => selectedKeys.includes(k)) && !allSelected;

  const toggleSelectAll = () => {
    rowSelection?.onChange(allSelected ? [] : allKeys);
  };

  const toggleSelectRow = (key) => {
    if (selectedKeys.includes(key)) {
      rowSelection?.onChange(selectedKeys.filter((k) => k !== key));
    } else {
      rowSelection?.onChange([...selectedKeys, key]);
    }
  };

  // ── Expandable ───────────────────────────────────────────────────────────────
  const toggleExpand = (key) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const canExpand = (row) => {
    if (!rowExpandable) return false;
    if (typeof rowExpandable === "function") return rowExpandable(row);
    return !!expandedRowRender;
  };

  // ── Effective columns ────────────────────────────────────────────────────────
  const effectiveCols = [
    ...(rowExpandable
      ? [
          {
            key: "__expand__",
            width: 40,
            title: null,
            render: (row) => {
              const key = row[rowKey];
              const expanded = expandedKeys.has(key);
              if (!canExpand(row)) return null;
              return (
                <button
                  type="button"
                  onClick={() => toggleExpand(key)}
                  className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  {expanded ? (
                    <ChevronDown className="size-4" />
                  ) : (
                    <ExpandIcon className="size-4" />
                  )}
                </button>
              );
            },
          },
        ]
      : []),
    ...(rowSelection
      ? [
          {
            key: "__select__",
            width: 40,
            title: (
              <Checkbox
                checked={someSelected ? "indeterminate" : allSelected}
                onCheckedChange={toggleSelectAll}
              />
            ),
            render: (row) => (
              <Checkbox
                checked={selectedKeys.includes(row[rowKey])}
                onCheckedChange={() => toggleSelectRow(row[rowKey])}
                onClick={(e) => e.stopPropagation()}
              />
            ),
          },
        ]
      : []),
    ...columns,
  ];

  const isEmpty = !loading && dataSource.length === 0;

  return (
    <div ref={wrapperRef} className={cn("flex flex-col gap-3", className)}>
      {/* ── Table ── */}
      <div
        style={{ maxHeight: scrollY }}
        className={cn(
          "overflow-auto rounded-lg border border-border",
          bordered && "[&_th]:border-r [&_td]:border-r [&_th:last-child]:border-r-0 [&_td:last-child]:border-r-0"
        )}
      >
        <table className="w-full caption-bottom text-sm">
          <thead className="sticky top-0 z-10 bg-muted/90 backdrop-blur-sm">
            <tr className="border-b border-border">
              {effectiveCols.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width, minWidth: col.minWidth }}
                  className={cn(
                    "h-10 px-3 text-left align-middle text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap",
                    col.align === "center" && "text-center",
                    col.align === "right" && "text-right",
                    col.headClassName
                  )}
                >
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: Math.min(pageSize, 8) }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  {effectiveCols.map((col) => (
                    <td key={col.key} className="p-3">
                      <div className="h-4 animate-pulse rounded bg-muted" />
                    </td>
                  ))}
                </tr>
              ))
            ) : isEmpty ? (
              <tr>
                <td
                  colSpan={effectiveCols.length}
                  className="py-14 text-center text-sm text-muted-foreground"
                >
                  {empty ?? "Không có dữ liệu"}
                </td>
              </tr>
            ) : (
              dataSource.flatMap((row, idx) => {
                const key = row[rowKey] ?? idx;
                const isExpanded = expandedKeys.has(key);
                const isSelected = rowSelection ? selectedKeys.includes(key) : false;
                const extraClass =
                  typeof rowClassName === "function"
                    ? rowClassName(row, idx)
                    : rowClassName && row.isActive === false
                    ? "opacity-50"
                    : "";

                const rows = [
                  <tr
                    key={key}
                    className={cn(
                      "border-b border-border transition-colors hover:bg-muted/40 last:border-b-0",
                      isSelected && "bg-primary/5",
                      extraClass
                    )}
                  >
                    {effectiveCols.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          "p-3 align-middle text-sm",
                          col.align === "center" && "text-center",
                          col.align === "right" && "text-right",
                          col.cellClassName
                        )}
                      >
                        {col.render
                          ? col.render(row, idx)
                          : row[col.dataIndex ?? col.key]}
                      </td>
                    ))}
                  </tr>,
                ];

                if (isExpanded && expandedRowRender) {
                  rows.push(
                    <tr key={`${key}-exp`} className="bg-muted/20 border-b border-border">
                      <td colSpan={effectiveCols.length} className="px-6 py-4">
                        {expandedRowRender(row)}
                      </td>
                    </tr>
                  );
                }

                return rows;
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            {showTotal ? showTotal(total) : `Tổng ${total.toLocaleString("vi-VN")} bản ghi`}
          </p>

          <div className="flex items-center gap-3">
            {showSizeChanger && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span>Hiển thị</span>
                <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
                  <SelectTrigger className="h-7 w-16 px-2 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pageSizeOptions.map((s) => (
                      <SelectItem key={s} value={String(s)} className="text-xs">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span>dòng</span>
              </div>
            )}

            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => handlePageChange(1)}
                disabled={pageIndex <= 1}
                title="Trang đầu"
              >
                <ChevronsLeft className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => handlePageChange(pageIndex - 1)}
                disabled={pageIndex <= 1}
                title="Trang trước"
              >
                <ChevronLeft className="size-4" />
              </Button>

              {getPageNumbers().map((p, i) =>
                p === "…" ? (
                  <span key={`ell-${i}`} className="px-1 text-xs text-muted-foreground select-none">
                    …
                  </span>
                ) : (
                  <Button
                    key={p}
                    variant={p === pageIndex ? "default" : "ghost"}
                    size="icon-sm"
                    onClick={() => handlePageChange(p)}
                    className="size-7 text-xs"
                  >
                    {p}
                  </Button>
                )
              )}

              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => handlePageChange(pageIndex + 1)}
                disabled={pageIndex >= totalPages}
                title="Trang sau"
              >
                <ChevronRight className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => handlePageChange(totalPages)}
                disabled={pageIndex >= totalPages}
                title="Trang cuối"
              >
                <ChevronsRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
