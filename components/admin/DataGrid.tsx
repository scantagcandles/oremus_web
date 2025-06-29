"use client";

import { FC } from "react";
import { motion } from "framer-motion";
import { MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataGridProps {
  data: any[];
  columns: {
    field: string;
    headerName: string;
  }[];
}

export const DataGrid: FC<DataGridProps> = ({ data, columns }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-glass-white">
            {columns.map((column) => (
              <th
                key={column.field}
                className="px-4 py-3 text-left text-sm font-medium text-white/70"
              >
                {column.headerName}
              </th>
            ))}
            <th className="w-12"></th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={row.id || i}
              className={cn(
                "border-b border-glass-white last:border-0",
                "hover:bg-glass-white/5 transition-colors"
              )}
            >
              {columns.map((column) => (
                <td
                  key={column.field}
                  className="px-4 py-3 text-sm text-white/90"
                >
                  {renderCellContent(row[column.field])}
                </td>
              ))}
              <td className="px-4 py-3">
                <button className="p-1 rounded hover:bg-glass-white transition-colors">
                  <MoreVertical className="w-4 h-4 text-white/50" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

function renderCellContent(value: any) {
  // Add custom cell renderers here based on value type
  if (typeof value === "boolean") {
    return value ? "Tak" : "Nie";
  }
  return value;
}
