"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Users, Phone, Mail, MessageSquare, ChevronDown,
  Search, AlertTriangle, TrendingUp, Clock, CheckCircle,
  XCircle, Star,
} from "lucide-react";
import { PageHeader } from "../../../../components/ui/PageHeader";
import { useToast } from "../../../../components/ui/Toast";

const API_URL = process.env.NEXT_PUBLIC_NEST_API_URL || "http://localhost:3001";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  new:          { label: "Mới",        color: "bg-blue-500/20 text-blue-400 border-blue-500/30",    icon: Star },
  contacted:    { label: "Đã Liên Hệ",color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: Phone },
  qualified:    { label: "Tiềm Năng", color: "bg-purple-500/20 text-purple-400 border-purple-500/30", icon: TrendingUp },
  closed_won:   { label: "Đã Chốt",   color: "bg-green-500/20 text-green-400 border-green-500/30",  icon: CheckCircle },
  closed_lost:  { label: "Không Chốt",color: "bg-red-500/20 text-red-400 border-red-500/30",       icon: XCircle },
  follow_up:    { label: "Cần Theo Dõi",color:"bg-orange-500/20 text-orange-400 border-orange-500/30",icon: Clock },
};

const STATUS_ORDER = ["new", "contacted", "qualified", "follow_up", "closed_won", "closed_lost"];

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterProject, setFilterProject] = useState("all");
  const [projects, setProjects] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_URL}/api/projects/leads/all`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setLeads(Array.isArray(data) ? data : []);
    } catch (e: any) { setError(e.message || "Lỗi tải leads"); }
    finally { setLoading(false); }
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/projects`);
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch {}
  }, []);

  useEffect(() => { fetchLeads(); fetchProjects(); }, [fetchLeads, fetchProjects]);

  const updateStatus = async (id: number, status: string, notes?: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`${API_URL}/api/projects/leads/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes }),
      });
      if (!res.ok) throw new Error("Lỗi cập nhật");
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status, notes_internal: notes || l.notes_internal } : l));
      toast(`Đã cập nhật: ${STATUS_CONFIG[status]?.label || status}`, "success");
    } catch (e: any) { toast("Lỗi: " + e.message, "error"); }
    finally { setUpdatingId(null); }
  };

  // Stats
  const totalNew = leads.filter(l => l.status === "new").length;
  const totalQualified = leads.filter(l => l.status === "qualified").length;
  const totalWon = leads.filter(l => l.status === "closed_won").length;
  const convRate = leads.length > 0 ? Math.round((totalWon / leads.length) * 100) : 0;

  // Filter
  const filtered = leads.filter(l => {
    const matchSearch = !search || l.full_name?.toLowerCase().includes(search.toLowerCase()) || l.phone?.includes(search);
    const matchStatus = filterStatus === "all" || l.status === filterStatus;
    const matchProject = filterProject === "all" || l.project_id === filterProject;
    return matchSearch && matchStatus && matchProject;
  });

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

  return (
    <div className="h-full flex flex-col p-4 md:p-8 overflow-y-auto">
      <PageHeader
        title="CRM Leads"
        description={`${leads.length} tổng leads · ${totalNew} mới`}
        onRefresh={fetchLeads}
        isLoading={loading}
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Tổng Leads", value: leads.length, icon: Users, color: "text-white" },
          { label: "Leads Mới", value: totalNew, icon: Star, color: "text-blue-400" },
          { label: "Tiềm Năng", value: totalQualified, icon: TrendingUp, color: "text-purple-400" },
          { label: "Tỷ Lệ Chốt", value: `${convRate}%`, icon: CheckCircle, color: "text-green-400" },
        ].map((s, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <s.icon size={18} className={s.color} />
              <span className="text-[10px] uppercase tracking-widest text-white/30">{s.label}</span>
            </div>
            <div className={`text-3xl font-light ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Search */}
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 flex-1 min-w-[200px]">
          <Search size={14} className="text-white/30" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm tên, SĐT..."
            className="bg-transparent text-white text-sm focus:outline-none placeholder:text-white/20 flex-1"
          />
        </div>

        {/* Status filter */}
        <div className="relative">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-white/5 border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 pr-8 focus:outline-none focus:border-[#D4AF37]/50 appearance-none cursor-pointer"
          >
            <option value="all">Tất Cả Trạng Thái</option>
            {STATUS_ORDER.map(s => <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
        </div>

        {/* Project filter */}
        {projects.length > 0 && (
          <div className="relative">
            <select
              value={filterProject}
              onChange={e => setFilterProject(e.target.value)}
              className="bg-white/5 border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 pr-8 focus:outline-none focus:border-[#D4AF37]/50 appearance-none cursor-pointer"
            >
              <option value="all">Tất Cả Dự Án</option>
              {projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl flex items-center gap-3 mb-4">
          <AlertTriangle size={18} />
          <span className="text-sm">{error} — Kiểm tra NestJS backend port 3001</span>
        </div>
      )}

      {/* Table / Lead Cards */}
      <div className="space-y-3 flex-1">
        {loading ? (
          <div className="text-center py-20 text-white/30 text-sm">Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-white/30 text-sm">
            {leads.length === 0 ? "Chưa có lead nào. Khách hàng liên hệ qua form sẽ xuất hiện ở đây." : "Không tìm thấy kết quả phù hợp."}
          </div>
        ) : (
          filtered.map(lead => {
            const sc = STATUS_CONFIG[lead.status] || STATUS_CONFIG.new;
            const isExpanded = expandedId === lead.id;
            const isUpdating = updatingId === lead.id;
            const Icon = sc.icon;

            return (
              <div key={lead.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-colors">
                {/* Lead row */}
                <div
                  className="flex flex-wrap items-center gap-4 p-5 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : lead.id)}
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full flex items-center justify-center text-[#D4AF37] font-bold text-sm shrink-0">
                    {lead.full_name?.[0]?.toUpperCase() || "?"}
                  </div>

                  {/* Name + project */}
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium text-sm truncate">{lead.full_name}</div>
                    <div className="text-white/40 text-xs">{lead.project_name || lead.project_id || "—"}</div>
                  </div>

                  {/* Phone */}
                  <a
                    href={`tel:${lead.phone}`}
                    className="flex items-center gap-1.5 text-[#D4AF37] text-sm hover:text-[#D4AF37]/80"
                    onClick={e => e.stopPropagation()}
                  >
                    <Phone size={13} />
                    {lead.phone}
                  </a>

                  {/* Status badge */}
                  <span className={`text-[9px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${sc.color}`}>
                    <Icon size={10} />
                    {sc.label}
                  </span>

                  {/* Date */}
                  <span className="text-white/30 text-xs hidden lg:block">{formatDate(lead.created_at)}</span>

                  {/* Status changer */}
                  <div className="relative" onClick={e => e.stopPropagation()}>
                    <select
                      value={lead.status}
                      onChange={e => updateStatus(lead.id, e.target.value)}
                      disabled={isUpdating}
                      className="bg-white/5 border border-white/10 text-white/60 text-xs rounded-lg px-3 py-2 focus:outline-none disabled:opacity-50 cursor-pointer"
                    >
                      {STATUS_ORDER.map(s => <option key={s} value={s}>{STATUS_CONFIG[s]?.label}</option>)}
                    </select>
                  </div>

                  {/* Expand indicator */}
                  <ChevronDown size={14} className={`text-white/30 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-white/10 p-5 bg-white/3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: "Nguồn Lead", value: lead.lead_source || "—" },
                      { label: "Email", value: lead.email || "—" },
                      { label: "Nhu Cầu", value: lead.interest_type || "—" },
                      { label: "Ngân Sách", value: lead.budget_range || "—" },
                      { label: "Timeline", value: lead.timeline || "—" },
                      { label: "Giờ Gọi", value: lead.preferred_call_time || "—" },
                      { label: "UTM Source", value: lead.utm_source || "—" },
                      { label: "Assigned To", value: lead.assigned_to || "—" },
                    ].map((f, i) => (
                      <div key={i}>
                        <div className="text-[9px] uppercase tracking-widest text-white/30 mb-1">{f.label}</div>
                        <div className="text-white/70 text-sm">{f.value}</div>
                      </div>
                    ))}
                    {/* Notes */}
                    {lead.notes && (
                      <div className="sm:col-span-2">
                        <div className="text-[9px] uppercase tracking-widest text-white/30 mb-1">Ghi Chú Khách</div>
                        <div className="text-white/60 text-sm italic">{lead.notes}</div>
                      </div>
                    )}
                    {/* Internal notes */}
                    <div className="sm:col-span-2">
                      <div className="text-[9px] uppercase tracking-widest text-white/30 mb-1">Ghi Chú Nội Bộ</div>
                      <textarea
                        defaultValue={lead.notes_internal || ""}
                        onBlur={e => {
                          if (e.target.value !== (lead.notes_internal || "")) {
                            updateStatus(lead.id, lead.status, e.target.value);
                          }
                        }}
                        rows={2}
                        placeholder="Nhập ghi chú nội bộ..."
                        className="w-full bg-black/30 border border-white/10 text-white/80 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#D4AF37]/40 resize-none"
                      />
                    </div>
                    {/* Quick actions */}
                    <div className="sm:col-span-4 flex gap-3 pt-2">
                      <a href={`tel:${lead.phone}`} className="flex items-center gap-2 text-xs bg-white/5 border border-white/10 text-white/60 px-4 py-2 rounded-lg hover:border-green-500/30 hover:text-green-400 transition-colors">
                        <Phone size={12} /> Gọi Ngay
                      </a>
                      <a href={`https://zalo.me/${lead.phone}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs bg-white/5 border border-white/10 text-white/60 px-4 py-2 rounded-lg hover:border-blue-500/30 hover:text-blue-400 transition-colors">
                        <MessageSquare size={12} /> Zalo
                      </a>
                      {lead.email && (
                        <a href={`mailto:${lead.email}`} className="flex items-center gap-2 text-xs bg-white/5 border border-white/10 text-white/60 px-4 py-2 rounded-lg hover:border-purple-500/30 hover:text-purple-400 transition-colors">
                          <Mail size={12} /> Email
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
