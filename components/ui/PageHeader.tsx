"use client";
import React from "react";
import { RefreshCw, Plus } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description: string;
  onRefresh?: () => void;
  isLoading?: boolean;
  onCreate?: () => void;
  createLabel?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ 
  title, 
  description, 
  onRefresh, 
  isLoading = false,
  onCreate,
  createLabel = "Thêm Mới",
  actions
}: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
        <p className="text-white/50 text-sm">{description}</p>
      </div>
      <div className="flex items-center gap-3">
        {onRefresh && (
          <button 
            onClick={onRefresh} 
            className="bg-white/5 text-white/70 hover:text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 border border-white/10 hover:border-white/20 transition-colors"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} /> Tải Lại
          </button>
        )}
        {onCreate && (
          <button 
            onClick={onCreate} 
            className="bg-[#D4AF37] text-black font-semibold px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:scale-105 transition-transform"
          >
            <Plus size={16} /> {createLabel}
          </button>
        )}
        {actions}
      </div>
    </div>
  );
}
