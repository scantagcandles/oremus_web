import React from "react";
import {
  tableBase,
  tableCellBase,
  tableHeaderBase,
  tableRowBase,
  type Column,
  type SortConfig,
  type PaginationConfig,
} from "./utils";
import { twMerge } from "tailwind-merge";
import { VariantProps } from "class-variance-authority";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { Button } from "../forms";

export interface TableProps<T> extends VariantProps<typeof tableBase> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  sortConfig?: SortConfig;
  onSort?: (sortConfig: SortConfig) => void;
  pagination?: PaginationConfig;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  selectedRows?: string[];
  onRowSelect?: (id: string) => void;
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  className?: string;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  variant = "default",
  density = "comfortable",
  bordered = true,
  striped = false,
  sortConfig,
  onSort,
  pagination,
  onPageChange,
  onPageSizeChange,
  selectedRows,
  onRowSelect,
  onRowClick,
  isLoading,
  className,
}: TableProps<T>) {
  const handleSort = (key: string) => {
    if (!onSort) return;

    const newDirection =
      sortConfig?.key === key && sortConfig.direction === "asc"
        ? "desc"
        : "asc";
    onSort({ key, direction: newDirection });
  };

  const getSortIcon = (key: string) => {
    if (sortConfig?.key !== key)
      return <ChevronsUpDown className="w-4 h-4 opacity-50" />;
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };
  return (
    <div className="w-full overflow-x-auto">
      <table
        className={twMerge(
          tableBase({ variant, density, bordered, striped }),
          className
        )}
      >
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={twMerge(
                  tableCellBase({ variant, density, bordered }),
                  tableHeaderBase({
                    variant,
                    align: column.align,
                    sortable: column.sortable && !!onSort,
                  }),
                  column.width && `w-[${column.width}]`
                )}
                onClick={() =>
                  column.sortable && onSort && handleSort(column.key)
                }
              >
                <div className="flex items-center justify-between gap-2">
                  <span>{column.header}</span>
                  {column.sortable && onSort && getSortIcon(column.key)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td
                colSpan={columns.length}
                className={twMerge(
                  tableCellBase({ variant, density, bordered }),
                  "text-center"
                )}
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Loading...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className={twMerge(
                  tableCellBase({ variant, density, bordered }),
                  "text-center text-white/50"
                )}
              >
                No data available
              </td>
            </tr>
          ) : (
            data.map((item) => {
              const key = keyExtractor(item);
              const isSelected = selectedRows?.includes(String(key));

              return (
                <tr
                  key={key}
                  className={tableRowBase({
                    variant,
                    selected: isSelected,
                  })}
                  onClick={() => {
                    onRowClick?.(item);
                    onRowSelect?.(String(key));
                  }}
                >
                  {columns.map((column) => {
                    const value = item[column.key as keyof T];
                    const displayValue =
                      column.render?.(value, item) ??
                      (typeof value === "object"
                        ? JSON.stringify(value)
                        : String(value));

                    return (
                      <td
                        key={`${key}-${column.key}`}
                        className={twMerge(
                          tableCellBase({ variant, density, bordered }),
                          column.align === "center" && "text-center",
                          column.align === "right" && "text-right"
                        )}
                      >
                        {displayValue}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {pagination && (
        <div className="mt-4 flex items-center justify-between px-4">
          <div className="flex items-center gap-2 text-sm text-white/70">
            <label htmlFor="rowsPerPage" className="sr-only">
              Rows per page
            </label>
            <span id="rowsPerPageLabel">Rows per page:</span>
            <select
              id="rowsPerPage"
              className="bg-transparent border border-white/20 rounded"
              value={pagination.pageSize}
              onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
              aria-labelledby="rowsPerPageLabel"
            >
              {pagination.pageSizeOptions?.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span>
              {pagination.page * pagination.pageSize + 1}-
              {Math.min(
                (pagination.page + 1) * pagination.pageSize,
                pagination.total
              )}{" "}
              of {pagination.total}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="glass"
              size="sm"
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page === 0}
            >
              Previous
            </Button>
            <Button
              variant="glass"
              size="sm"
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={
                (pagination.page + 1) * pagination.pageSize >= pagination.total
              }
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
