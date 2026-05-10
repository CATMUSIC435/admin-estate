"use client";

import React, { useState } from "react";
import { ServerCrash, CheckCircle2, AlertTriangle, RefreshCcw, Database, HardDrive, ShieldAlert } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { useToast } from "../../components/ui/Toast";

export default function SystemPage() {
  const [clearing, setClearing] = useState(false);
  const [lastResults, setLastResults] = useState<{ redis?: boolean; nextjs?: boolean; errors?: string[] } | null>(null);
  const { toast } = useToast();

  const handleClearCache = async () => {
    if (!confirm("Hành động này sẽ xóa toàn bộ bộ nhớ đệm (Cache) của Hệ thống (NestJS & NextJS).\nBạn có chắc chắn muốn thực hiện?")) {
      return;
    }

    setClearing(true);
    setLastResults(null);

    try {
      const res = await fetch("/api/system/cache", {
        method: "POST",
      });
      
      const data = await res.json();
      setLastResults(data.results);

      if (data.success) {
        toast("Đã dọn dẹp Cache hệ thống", "success");
      } else {
        toast("Có lỗi xảy ra khi xóa Cache", "error");
      }
    } catch (err: any) {
      toast("Lỗi kết nối API: " + err.message, "error");
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-4 md:p-8 overflow-y-auto">
      <PageHeader 
        title="Quản Trị Hệ Thống" 
        description="Quản lý bộ nhớ đệm (Cache), cấu hình và tình trạng hệ thống máy chủ" 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        {/* CACHE MANAGEMENT PANEL */}
        <div className="bg-[#111] border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center">
              <Database size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Xóa Bộ Nhớ Đệm (Clear Cache)</h3>
              <p className="text-white/50 text-sm">Xóa Redis (Backend) và Next.js Cache (Frontend)</p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3 bg-black/40 border border-white/5 p-4 rounded-xl">
              <HardDrive className="text-blue-400 shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-white text-sm font-medium">Upstash Redis (Backend)</p>
                <p className="text-white/40 text-xs mt-1">Dữ liệu BĐS, Project, Queue Crawler được lưu tạm thời. Cần xóa khi cập nhật dữ liệu hàng loạt.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-black/40 border border-white/5 p-4 rounded-xl">
              <ServerCrash className="text-purple-400 shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-white text-sm font-medium">Next.js App Router (Frontend)</p>
                <p className="text-white/40 text-xs mt-1">Giao diện người dùng web chính. Xóa để người dùng tải ngay phiên bản web mới nhất.</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex gap-3 mb-6">
            <ShieldAlert className="text-yellow-500 shrink-0 mt-0.5" size={20} />
            <p className="text-yellow-500/80 text-sm">
              Lưu ý: Tác vụ này sẽ bắt buộc máy chủ phải truy vấn dữ liệu từ Database ở các lượt truy cập tiếp theo, gây tải tạm thời cho DB.
            </p>
          </div>

          <button 
            onClick={handleClearCache}
            disabled={clearing}
            className="w-full py-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold tracking-widest uppercase transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {clearing ? (
              <><RefreshCcw className="animate-spin" size={20} /> Đang xóa toàn bộ Cache...</>
            ) : (
              <><Database size={20} /> Thực thi Xóa Cache Toàn Cầu</>
            )}
          </button>
        </div>

        {/* EXECUTION RESULTS */}
        <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider text-white/50">Kết quả thực thi (Logs)</h3>
          
          {!lastResults ? (
            <div className="h-64 flex items-center justify-center border border-dashed border-white/10 rounded-xl text-white/30 text-sm">
              Chưa có tác vụ nào được chạy.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-black/40 rounded-xl border border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-white font-medium text-sm">Trạng thái Redis Backend</p>
                  <p className="text-white/40 text-xs">NestJS Upstash Flush</p>
                </div>
                {lastResults.redis ? (
                  <span className="flex items-center gap-2 text-green-400 bg-green-400/10 px-3 py-1.5 rounded-lg text-xs font-bold">
                    <CheckCircle2 size={14} /> THÀNH CÔNG
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-red-400 bg-red-400/10 px-3 py-1.5 rounded-lg text-xs font-bold">
                    <AlertTriangle size={14} /> THẤT BẠI
                  </span>
                )}
              </div>

              <div className="p-4 bg-black/40 rounded-xl border border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-white font-medium text-sm">Trạng thái Next.js Frontend</p>
                  <p className="text-white/40 text-xs">Revalidate Route Cache</p>
                </div>
                {lastResults.nextjs ? (
                  <span className="flex items-center gap-2 text-green-400 bg-green-400/10 px-3 py-1.5 rounded-lg text-xs font-bold">
                    <CheckCircle2 size={14} /> THÀNH CÔNG
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-red-400 bg-red-400/10 px-3 py-1.5 rounded-lg text-xs font-bold">
                    <AlertTriangle size={14} /> THẤT BẠI
                  </span>
                )}
              </div>

              {lastResults.errors && lastResults.errors.length > 0 && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl mt-4">
                  <p className="text-red-400 font-bold text-sm mb-2">Chi tiết Lỗi:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {lastResults.errors.map((err, i) => (
                      <li key={i} className="text-red-300 text-xs">{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
