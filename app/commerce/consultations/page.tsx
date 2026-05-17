"use client";

import React, { useState } from "react";
import { PhoneCall, Search, Filter, Mail, Phone, Calendar, MoreHorizontal, User, Edit3 } from "lucide-react";

export default function ConsultationsPage() {
  const [filter, setFilter] = useState("all");

  // Fake Data for Leads / Consultations
  const consultations = [
    {
      id: "REQ-001",
      customer: { name: "Nguyễn Văn A", phone: "0901234567", email: "nva@gmail.com" },
      product: "Căn Hộ Mẫu 1PN View Biển (ALZ-A1-05)",
      notes: "Cần tư vấn thêm về phương thức thanh toán và vay ngân hàng.",
      status: "new",
      createdAt: "17-05-2026 10:30"
    },
    {
      id: "REQ-002",
      customer: { name: "Trần Thị B", phone: "0987654321", email: "tranthib@yahoo.com" },
      product: "Penthouse Tháp Nam (ALZ-B2-12)",
      notes: "Muốn đặt lịch xem nhà mẫu cuối tuần này.",
      status: "contacted",
      createdAt: "16-05-2026 15:45"
    },
    {
      id: "REQ-003",
      customer: { name: "Lê Minh C", phone: "0934567890", email: "" },
      product: "Shophouse Mặt Tiền (ALZ-C3-08)",
      notes: "Giá thuê hiện tại đang là bao nhiêu?",
      status: "negotiating",
      createdAt: "15-05-2026 09:15"
    },
    {
      id: "REQ-004",
      customer: { name: "Phạm Văn D", phone: "0912345678", email: "phamvand@gmail.com" },
      product: "Căn Hộ Studio (ALZ-A1-02)",
      notes: "Gửi thêm hình ảnh thực tế qua Zalo.",
      status: "closed",
      createdAt: "12-05-2026 14:00"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "contacted": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "negotiating": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "closed": return "bg-green-500/20 text-green-400 border-green-500/30";
      default: return "bg-white/10 text-white border-white/20";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "new": return "Mới";
      case "contacted": return "Đã liên hệ";
      case "negotiating": return "Thương lượng";
      case "closed": return "Thành công";
      default: return status;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/10 shrink-0 bg-black/20">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-gold to-white bg-clip-text text-transparent flex items-center gap-3">
          <PhoneCall size={28} className="text-gold" />
          Yêu Cầu Tư Vấn
        </h1>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white/5 border border-white/10 text-white px-4 py-2 rounded-lg text-sm hover:bg-white/10 transition-all">
            <Filter size={16} /> Lọc
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="bg-white/5 border border-white/10 rounded-2xl flex flex-col min-h-full">
          
          <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {['all', 'new', 'contacted', 'negotiating', 'closed'].map(f => (
                <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-widest transition-all ${filter === f ? 'bg-gold text-jet-black' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
                >
                  {f === 'all' ? 'Tất cả' : getStatusLabel(f)}
                </button>
              ))}
            </div>
            
            <div className="flex items-center bg-black/40 border border-white/10 rounded-lg px-3 py-2 w-full sm:w-72">
              <Search size={16} className="text-white/40 mr-2" />
              <input type="text" placeholder="Tìm tên, SĐT, Email..." className="bg-transparent text-sm text-white outline-none w-full" />
            </div>
          </div>
          
          <div className="p-0 overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-white/40 text-[10px] uppercase tracking-widest">
                  <th className="px-6 py-4 font-semibold">Mã YC</th>
                  <th className="px-6 py-4 font-semibold">Khách Hàng</th>
                  <th className="px-6 py-4 font-semibold">Sản Phẩm Quan Tâm</th>
                  <th className="px-6 py-4 font-semibold">Nội Dung</th>
                  <th className="px-6 py-4 font-semibold">Trạng Thái</th>
                  <th className="px-6 py-4 font-semibold text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {consultations.map((c, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 font-mono text-white/50 text-xs">{c.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                          <User size={18} className="text-gold" />
                        </div>
                        <div>
                          <p className="text-white text-sm font-semibold">{c.customer.name}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-white/40">
                            <span className="flex items-center gap-1 hover:text-gold cursor-pointer"><Phone size={10} /> {c.customer.phone}</span>
                            {c.customer.email && <span className="flex items-center gap-1 hover:text-gold cursor-pointer"><Mail size={10} /> {c.customer.email}</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gold text-sm font-medium">
                      {c.product}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white/60 text-xs line-clamp-2 max-w-xs">{c.notes || "Không có ghi chú"}</p>
                      <p className="text-white/30 text-[10px] mt-1 flex items-center gap-1"><Calendar size={10} /> {c.createdAt}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(c.status)}`}>
                        {getStatusLabel(c.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 bg-white/5 hover:bg-white/10 rounded text-white/70 hover:text-white transition-colors" title="Cập nhật trạng thái">
                          <Edit3 size={16} />
                        </button>
                        <button className="p-2 bg-white/5 hover:bg-white/10 rounded text-white/70 hover:text-white transition-colors">
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
            <span>Hiển thị 1 - 4 của 4 yêu cầu</span>
            <div className="flex gap-1">
              <button className="px-3 py-1.5 bg-white/5 rounded hover:bg-white/10 hover:text-white transition-colors">Trước</button>
              <button className="px-3 py-1.5 bg-gold/20 text-gold rounded font-bold">1</button>
              <button className="px-3 py-1.5 bg-white/5 rounded hover:bg-white/10 hover:text-white transition-colors">Sau</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
