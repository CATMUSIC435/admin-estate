"use client";
import React from "react";
import { Database } from "lucide-react";

interface Column<T> {
  header: string;
  accessor?: keyof T;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string | number;
  emptyIcon?: any;
  emptyText?: string;
}

export function DataTable<T>({ 
  data, 
  columns, 
  keyExtractor, 
  emptyIcon: EmptyIcon = Database,
  emptyText = "Chưa có dữ liệu."
}: DataTableProps<T>) {
  
  if (data.length === 0) {
    return (
      <div className="text-center py-16 text-white/30 bg-[#111] border border-white/5 rounded-2xl">
        <EmptyIcon size={48} className="mx-auto mb-4 opacity-30" />
        <p>{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="bg-[#111] border border-white/5 rounded-2xl flex-1 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-[#1A1A1A] text-white/50 border-b border-white/5 uppercase text-[10px] tracking-wider">
            <tr>
              {columns.map((col, i) => (
                <th key={i} className={`px-6 py-4 font-semibold ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.map((item) => (
              <tr key={keyExtractor(item)} className="hover:bg-white/5 transition-colors group">
                {columns.map((col, i) => (
                  <td key={i} className={`px-6 py-4 ${col.className || ''}`}>
                    {col.render ? col.render(item) : (col.accessor ? String(item[col.accessor] || '') : null)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
