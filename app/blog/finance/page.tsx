"use client";

import React from "react";
import { TrendingUp, RefreshCw, ExternalLink, Globe, Calendar, Eye, LayoutTemplate, Newspaper } from "lucide-react";

export default function FinanceBlogPage() {
  const WP_ADMIN_URL = "https://tinbao.online/wp-admin"; // Example WP Admin URL from the source

  // Fake Data for WordPress Posts
  const wpPosts = [
    {
      id: 1042,
      title: "Lãi suất vay mua nhà giảm sâu: Thời điểm vàng để xuống tiền?",
      category: "Thị trường chung",
      views: "12,450",
      status: "published",
      date: "17/05/2026",
      thumbnail: "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&w=300&q=80"
    },
    {
      id: 1038,
      title: "Cập nhật chính sách thuế BĐS mới nhất áp dụng từ tháng 6/2026",
      category: "Chính sách pháp lý",
      views: "8,320",
      status: "published",
      date: "15/05/2026",
      thumbnail: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=300&q=80"
    },
    {
      id: 1035,
      title: "Báo cáo: Tỷ suất sinh lời căn hộ nghỉ dưỡng ven biển Đà Nẵng",
      category: "Phân tích đầu tư",
      views: "15,890",
      status: "published",
      date: "12/05/2026",
      thumbnail: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=300&q=80"
    },
    {
      id: 1045,
      title: "[DRAFT] Kịch bản thị trường BĐS quý 3/2026",
      category: "Nhận định chuyên gia",
      views: "-",
      status: "draft",
      date: "-",
      thumbnail: ""
    }
  ];

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/10 shrink-0 bg-black/20">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-gold to-white bg-clip-text text-transparent flex items-center gap-3">
          <TrendingUp size={28} className="text-gold" />
          Tin Tức Tài Chính (WordPress Hub)
        </h1>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white/5 border border-white/10 text-white px-4 py-2 rounded-lg text-sm hover:bg-white/10 transition-all">
            <RefreshCw size={16} /> Đồng Bộ WP
          </button>
          <a href={WP_ADMIN_URL} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-[#0073AA] text-white px-4 py-2 rounded-lg font-bold text-sm tracking-widest hover:bg-[#005177] transition-all shadow-lg shadow-[#0073AA]/20">
            <Globe size={18} />
            Đăng Bài Trên WP
          </a>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {/* Info Banner */}
        <div className="bg-gradient-to-r from-[#0073AA]/20 to-transparent border border-[#0073AA]/30 rounded-2xl p-6 mb-8 flex items-start gap-4">
          <div className="bg-[#0073AA]/20 p-3 rounded-xl shrink-0">
            <Newspaper size={24} className="text-[#0073AA]" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg mb-1">Kiến trúc Headless CMS với WordPress</h3>
            <p className="text-white/60 text-sm leading-relaxed max-w-3xl">
              Phân hệ này đóng vai trò hiển thị và đồng bộ dữ liệu Tin tức Tài chính từ nguồn WordPress thông qua REST API. Việc quản trị nội dung (Tạo bài, sửa bài, thêm hình ảnh) vẫn được thực hiện trực tiếp trên nền tảng WordPress Admin để tận dụng tối đa sức mạnh của Editor và Yoast SEO.
            </p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl flex flex-col">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <LayoutTemplate size={20} className="text-gold" /> Danh Sách Bài Viết (Synced)
            </h3>
          </div>
          
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-white/40 text-[10px] uppercase tracking-widest">
                  <th className="px-6 py-4 font-semibold">Bài Viết</th>
                  <th className="px-6 py-4 font-semibold">Chuyên Mục</th>
                  <th className="px-6 py-4 font-semibold">Lượt Xem</th>
                  <th className="px-6 py-4 font-semibold">Trạng Thái</th>
                  <th className="px-6 py-4 font-semibold text-right">Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {wpPosts.map((post, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-12 bg-white/10 rounded overflow-hidden shrink-0">
                          {post.thumbnail ? (
                            <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Newspaper size={16} className="text-white/20" /></div>
                          )}
                        </div>
                        <div>
                          <p className="text-white text-sm font-semibold line-clamp-1 max-w-sm group-hover:text-[#0073AA] transition-colors">{post.title}</p>
                          <p className="text-white/30 text-[10px] mt-1 flex items-center gap-1"><Calendar size={10} /> Ngày cập nhật: {post.date}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded text-xs text-white/60">{post.category}</span>
                    </td>
                    <td className="px-6 py-4 text-white/70 text-sm flex items-center gap-1 mt-3">
                      <Eye size={14} className="text-white/30" /> {post.views}
                    </td>
                    <td className="px-6 py-4">
                      {post.status === "published" ? (
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-green-500/20 text-green-400 border border-green-500/30">
                          Đã Xuất Bản
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                          Bản Nháp
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a href={`${WP_ADMIN_URL}/post.php?post=${post.id}&action=edit`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#0073AA] hover:text-white text-xs underline decoration-[#0073AA]/50 underline-offset-4 transition-colors">
                        Edit in WP <ExternalLink size={12} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
