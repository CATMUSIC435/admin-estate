"use client";

import React, { useState } from "react";
import { Coins, ShieldCheck, Box, Activity, PlusCircle, CheckCircle, Search, ExternalLink } from "lucide-react";

export default function Web3ManagementPage() {
  const [activeTab, setActiveTab] = useState("overview");

  // Fake Data for UI presentation
  const metrics = [
    { label: "Tổng số Cổ phần (Shares)", value: "50,000", icon: Coins, color: "text-gold" },
    { label: "Dự án Token Hóa", value: "3", icon: Box, color: "text-blue-400" },
    { label: "Ví KYC Hợp lệ", value: "1,245", icon: ShieldCheck, color: "text-green-400" },
    { label: "Giao dịch 24h", value: "320", icon: Activity, color: "text-purple-400" }
  ];

  const contracts = [
    { address: "0x1234...7890", name: "Alize Property Fraction", network: "Polygon Amoy", status: "Active" },
    { address: "0xabcd...ef12", name: "Alize KYC Registry", network: "Polygon Amoy", status: "Active" }
  ];

  const properties = [
    { id: "ALZ-A1-05", name: "Căn Hộ Mẫu 1PN View Biển", shares: "10,000", price: "0.5 MATIC", sold: "8,500", status: "Selling" },
    { id: "ALZ-B2-12", name: "Penthouse Tháp Nam", shares: "25,000", price: "1.2 MATIC", sold: "25,000", status: "Sold Out" },
    { id: "ALZ-C3-08", name: "Shophouse Mặt Tiền", shares: "15,000", price: "2.0 MATIC", sold: "1,200", status: "Selling" }
  ];

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/10 shrink-0 bg-black/20">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-gold to-white bg-clip-text text-transparent flex items-center gap-3">
          <Coins size={28} className="text-gold" />
          Quản Lý Tài Sản Web3
        </h1>
        <button className="flex items-center gap-2 bg-gold text-jet-black px-4 py-2 rounded-lg font-bold text-sm tracking-widest uppercase hover:bg-gold/90 transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)]">
          <PlusCircle size={18} />
          Smart Contract Mới
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {metrics.map((m, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-4 hover:border-white/20 transition-all">
              <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                <m.icon size={28} className={m.color} />
              </div>
              <div>
                <p className="text-white/40 text-sm font-medium uppercase tracking-widest mb-1">{m.label}</p>
                <p className="text-white text-3xl font-bold">{m.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Contracts List */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-bold text-lg mb-6 flex items-center justify-between">
                Smart Contracts
                <span className="text-xs bg-gold/10 text-gold px-2 py-1 rounded">Mạng Polygon</span>
              </h3>
              <div className="space-y-4">
                {contracts.map((c, i) => (
                  <div key={i} className="p-4 bg-black/40 border border-white/5 rounded-xl hover:border-gold/30 transition-all group">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white text-sm font-semibold">{c.name}</p>
                      <CheckCircle size={16} className="text-green-400" />
                    </div>
                    <div className="flex items-center justify-between text-xs text-white/50">
                      <span className="font-mono">{c.address}</span>
                      <a href="#" className="hover:text-gold flex items-center gap-1 group-hover:underline">
                        BscScan <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gold/10 border border-gold/20 rounded-2xl p-6">
              <h3 className="text-gold font-bold mb-3 uppercase tracking-widest text-sm">Hướng dẫn KYC</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-4">
                Chỉ những ví Web3 nằm trong danh sách Whitelist mới có thể giao dịch hoặc nhận cổ tức từ Smart Contract Bất động sản.
              </p>
              <button className="w-full bg-transparent border border-gold text-gold py-2 rounded-lg text-sm font-bold uppercase tracking-widest hover:bg-gold hover:text-jet-black transition-all">
                Quản lý KYC Registry
              </button>
            </div>
          </div>

          {/* Properties List */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 border border-white/10 rounded-2xl flex flex-col h-full">
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-white font-bold text-lg">Danh Sách Tài Sản Đã Phân Mảnh</h3>
                <div className="flex items-center bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 w-64">
                  <Search size={16} className="text-white/40 mr-2" />
                  <input type="text" placeholder="Tìm mã căn..." className="bg-transparent text-sm text-white outline-none w-full" />
                </div>
              </div>
              
              <div className="p-0 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 text-white/40 text-[10px] uppercase tracking-widest">
                      <th className="px-6 py-4 font-semibold">Mã Căn (ID)</th>
                      <th className="px-6 py-4 font-semibold">Tên Tài Sản</th>
                      <th className="px-6 py-4 font-semibold">Cổ Phần (Total)</th>
                      <th className="px-6 py-4 font-semibold">Giá Share</th>
                      <th className="px-6 py-4 font-semibold">Trạng Thái</th>
                      <th className="px-6 py-4 font-semibold text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map((p, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 font-mono text-gold text-sm">{p.id}</td>
                        <td className="px-6 py-4 text-white text-sm font-medium">{p.name}</td>
                        <td className="px-6 py-4 text-white/70 text-sm">
                          {p.sold} / {p.shares}
                          <div className="w-full bg-white/10 h-1.5 rounded-full mt-1.5 overflow-hidden">
                            <div className="bg-gold h-full" style={{ width: `${(parseInt(p.sold.replace(',','')) / parseInt(p.shares.replace(',',''))) * 100}%` }}></div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-white/70 text-sm">{p.price}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded text-xs font-bold ${p.status === 'Selling' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-white/40 hover:text-white text-sm underline decoration-white/20 underline-offset-4">Chi tiết</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
