"use client";

import React, { useState, useEffect } from "react";
import { databases, APPWRITE_DATABASE_ID } from "../../lib/appwrite";
import { Query } from "appwrite";
import { PhoneCall, Search, MoreVertical, Edit3, Trash2 } from "lucide-react";
import { CRMLead } from "../../types";

export default function CRMLeads() {
  const [leads, setLeads] = useState<CRMLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        'crm_leads',
        [Query.orderDesc("$createdAt")]
      );
      setLeads(res.documents as unknown as CRMLead[]);
      setIsLoading(false);
    } catch(err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  const deleteLead = async (id: string) => {
    if (!confirm("Xóa khách hàng này?")) return;
    try {
      await databases.deleteDocument(APPWRITE_DATABASE_ID, 'crm_leads', id);
      setLeads(leads.filter(l => l.$id !== id));
    } catch(err) {
      alert("Lỗi khi xóa!");
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await databases.updateDocument(APPWRITE_DATABASE_ID, 'crm_leads', id, { status: newStatus });
      setLeads(leads.map(l => l.$id === id ? {...l, status: newStatus} : l));
    } catch(err) {
      alert("Lỗi cập nhật!");
    }
  };

  return (
    <div className="h-full flex flex-col p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Quản Lý Kế Hoạch Chăm Sóc (CRM)</h1>
          <p className="text-white/50 text-sm">Danh sách khách hàng tiếp cận từ Live Chat</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="bg-[#111] border border-white/10 rounded-lg px-4 py-2 flex items-center gap-2">
             <Search size={16} className="text-white/40" />
             <input type="text" placeholder="Tìm tên/số điện thoại..." className="bg-transparent border-none outline-none text-sm text-white" />
           </div>
        </div>
      </div>

      <div className="flex-1 bg-[#111] border border-white/10 rounded-2xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#1A1A1A] text-white/50 border-b border-white/5 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Tên Khách Hàng</th>
                <th className="px-6 py-4 font-semibold">SĐT Liên Hệ</th>
                <th className="px-6 py-4 font-semibold">Thời Gian</th>
                <th className="px-6 py-4 font-semibold">Trạng Thái</th>
                <th className="px-6 py-4 font-semibold text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                   <td colSpan={5} className="px-6 py-12 text-center text-white/40 animate-pulse">Đang tải Data Khách Hàng...</td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                   <td colSpan={5} className="px-6 py-12 text-center text-white/40">Chưa có khách hàng nào để lại thông tin.</td>
                </tr>
              ) : leads.map((lead) => (
                <tr key={lead.$id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold">
                       {lead.name?.charAt(0).toUpperCase()}
                     </div>
                     {lead.name}
                  </td>
                  <td className="px-6 py-4">
                     <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-semibold tracking-wider font-mono flex items-center gap-2 w-max">
                       <PhoneCall size={12} /> {lead.phone}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-white/50 text-xs">
                     {new Date(lead.$createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                     <select 
                        value={lead.status}
                        onChange={(e) => updateStatus(lead.$id, e.target.value)}
                        className={`text-xs px-3 py-1.5 rounded-full font-semibold outline-none appearance-none cursor-pointer border ${
                          lead.status === 'NEW' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                          lead.status === 'CONTACTED' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                          'bg-red-500/10 text-red-500 border-red-500/20'
                        }`}
                     >
                       <option value="NEW" className="bg-[#111] text-white">Mới</option>
                       <option value="CONTACTED" className="bg-[#111] text-white">Đã Liên Hệ</option>
                       <option value="IGNORED" className="bg-[#111] text-white">Từ Chối</option>
                     </select>
                  </td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                     <button onClick={() => deleteLead(lead.$id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                        <Trash2 size={16} />
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
