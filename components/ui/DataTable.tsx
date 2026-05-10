"use client";
import React, { useState, useMemo } from "react";
import { Database, Search, ChevronLeft, ChevronRight } from "lucide-react";

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
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  itemsPerPage?: number;
}

export function DataTable<T>({ 
  data, 
  columns, 
  keyExtractor, 
  emptyIcon: EmptyIcon = Database,
  emptyText = "Chưa có dữ liệu.",
  searchable = true,
  searchPlaceholder = "Tìm kiếm...",
  searchKeys = [],
  itemsPerPage = 10
}: DataTableProps<T>) {
  
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // 1. Filter Logic (Search)
  const filteredData = useMemo(() => {
    if (!searchQuery || !searchable) return data;
    const lowerQuery = searchQuery.toLowerCase();
    
    return data.filter((item: any) => {
      // If searchKeys are provided, only search in those keys
      if (searchKeys.length > 0) {
        return searchKeys.some(key => {
          const val = item[key];
          return val && String(val).toLowerCase().includes(lowerQuery);
        });
      }
      
      // Default: search in all string values
      return Object.values(item).some(val => 
        val && typeof val === 'string' && val.toLowerCase().includes(lowerQuery)
      );
    });
  }, [data, searchQuery, searchable, searchKeys]);

  // Reset to page 1 when search query changes
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // 2. Pagination Logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  return (
    <div className="flex flex-col gap-4 flex-1 h-full">
      {/* Search Bar */}
      {searchable && data.length > 0 && (
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-white/40" />
          </div>
          <input
            type="text"
            className="w-full bg-[#111] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {/* Table Container */}
      <div className="bg-[#111] border border-white/5 rounded-2xl flex-1 overflow-hidden flex flex-col">
        {filteredData.length === 0 ? (
          <div className="text-center py-16 text-white/30 flex-1 flex flex-col items-center justify-center">
            <EmptyIcon size={48} className="mx-auto mb-4 opacity-30" />
            <p>{searchQuery ? "Không tìm thấy kết quả phù hợp." : emptyText}</p>
          </div>
        ) : (
          <div className="overflow-x-auto flex-1">
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
                {paginatedData.map((item) => (
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
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 bg-[#1A1A1A]">
            <div className="text-xs text-white/40">
              Hiển thị <span className="text-white">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="text-white">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> trên tổng <span className="text-white">{filteredData.length}</span>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-white/10 text-white/60 hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              
              <div className="flex items-center gap-1 px-2">
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  // Simple pagination: show current, first, last, and +-1 from current
                  if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-7 h-7 rounded-md text-xs flex items-center justify-center transition-colors ${currentPage === page ? 'bg-[#D4AF37] text-black font-bold' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}
                      >
                        {page}
                      </button>
                    );
                  }
                  if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="text-white/30 text-xs px-1">...</span>;
                  }
                  return null;
                })}
              </div>

              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-white/10 text-white/60 hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
