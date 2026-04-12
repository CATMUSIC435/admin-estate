import { Database, ExternalLink } from "lucide-react";

export default function CMSPage() {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-[#111] p-12 text-center">
      <Database size={80} className="text-[#D4AF37] mb-6 opacity-80" />
      <h1 className="text-3xl font-bold text-white mb-4">Quản Lý Rổ Hàng Bất Động Sản</h1>
      <p className="text-white/50 max-w-lg mb-8 leading-relaxed">
         Hệ thống Bất động sản và Tin tức của G-Estate được bảo vệ chống xâm nhập và quản lý tập trung trên lõi <b>Sanity Studio CMS</b>. 
         <br/><br/>
         Quản trị viên vui lòng truy cập cổng CMS riêng biệt để bắt đầu Thêm/Sửa/Xóa.
      </p>
      
      <a 
         href="http://localhost:3000/studio"
         target="_blank"
         rel="noreferrer"
         className="bg-[#D4AF37] text-black font-semibold px-8 py-4 rounded-xl flex items-center gap-3 hover:scale-105 transition-transform"
      >
         <ExternalLink size={20} />
         Mở Giao Diện Sanity Studio
      </a>
    </div>
  );
}
