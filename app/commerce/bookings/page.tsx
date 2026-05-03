"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  CalendarCheck, Search, RefreshCw, Clock, CheckCircle2,
  XCircle, Phone, MapPin, FileText, UserCheck, ChevronDown, X, Save
} from "lucide-react";

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_URL || "http://localhost:9000";
const MEDUSA_API_URL = "/api/medusa";

type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

interface Booking {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  service_type: string;
  property_id: string | null;
  property_name: string | null;
  scheduled_date: string | null;
  scheduled_time: string | null;
  notes: string | null;
  address: string | null;
  budget: number | null;
  status: BookingStatus;
  admin_notes: string | null;
  assigned_to: string | null;
  created_at: string;
}

const SERVICE_LABELS: Record<string, { label: string; emoji: string }> = {
  viewing: { label: "Xem nhà", emoji: "👁️" },
  consulting: { label: "Tư vấn", emoji: "💼" },
  repair: { label: "Sửa chữa", emoji: "🔧" },
  deco: { label: "Deco nhà", emoji: "🎨" },
  rental: { label: "Hợp đồng cho thuê", emoji: "📋" },
  furniture: { label: "Nội thất", emoji: "🛋️" },
};

const STATUS_OPTIONS: { value: BookingStatus; label: string; color: string }[] = [
  { value: "pending", label: "Chờ xác nhận", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30" },
  { value: "confirmed", label: "Đã xác nhận", color: "text-blue-400 bg-blue-400/10 border-blue-400/30" },
  { value: "completed", label: "Hoàn thành", color: "text-green-400 bg-green-400/10 border-green-400/30" },
  { value: "cancelled", label: "Đã hủy", color: "text-red-400 bg-red-400/10 border-red-400/30" },
];

function StatusBadge({ status }: { status: BookingStatus }) {
  const cfg = STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
  return (
    <span className={`text-[11px] px-2.5 py-1 rounded-full border font-semibold ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [editAssigned, setEditAssigned] = useState("");
  const [editStatus, setEditStatus] = useState<BookingStatus>("pending");
  const [saving, setSaving] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);

  const getToken = async () => {
    if (authToken) return authToken;
    try {
      const res = await fetch(`${MEDUSA_API_URL}/auth/user/emailpass`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "admin@alize-danang.com", password: "AlizeDaNang2026!" }),
      });
      const data = await res.json();
      setAuthToken(data.token);
      return data.token;
    } catch (e) {
      return null;
    }
  };

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = await getToken();
      const params = new URLSearchParams({ limit: "100" });
      if (filterStatus !== "all") params.set("status", filterStatus);
      if (filterType !== "all") params.set("service_type", filterType);

      const res = await fetch(`${MEDUSA_API_URL}/admin/bookings?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Lỗi kết nối Medusa. Hãy chạy: npx medusa develop");
      const { bookings: data } = await res.json();
      setBookings(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterType]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleOpenDetail = (booking: Booking) => {
    setSelectedBooking(booking);
    setEditNotes(booking.admin_notes || "");
    setEditAssigned(booking.assigned_to || "");
    setEditStatus(booking.status);
  };

  const handleSave = async () => {
    if (!selectedBooking) return;
    setSaving(true);
    try {
      const token = await getToken();
      const res = await fetch(`${MEDUSA_API_URL}/admin/bookings/${selectedBooking.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          status: editStatus,
          admin_notes: editNotes,
          assigned_to: editAssigned,
        }),
      });
      if (!res.ok) throw new Error("Lỗi cập nhật");
      setSelectedBooking(null);
      fetchBookings();
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleQuickStatus = async (id: string, status: BookingStatus) => {
    try {
      const token = await getToken();
      await fetch(`${MEDUSA_API_URL}/admin/bookings/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      fetchBookings();
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    }
  };

  const filtered = bookings.filter(b => {
    const q = search.toLowerCase();
    return !q || b.customer_name?.toLowerCase().includes(q) || b.customer_phone?.includes(q);
  });

  return (
    <div className="h-full flex flex-col p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Quản Lý Đặt Lịch Dịch Vụ</h1>
          <p className="text-white/50 text-sm">Xem nhà · Tư vấn · Sửa chữa · Deco · Cho thuê · Nội thất</p>
        </div>
        <button onClick={fetchBookings} className="bg-white/5 text-white/70 hover:text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 border border-white/10">
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="bg-[#111] border border-white/10 rounded-lg px-3 py-2 flex items-center gap-2 flex-1 min-w-[200px]">
          <Search size={16} className="text-white/40" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm tên / số điện thoại..."
            className="bg-transparent outline-none text-sm text-white flex-1"
          />
        </div>

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="bg-[#111] border border-white/10 text-white/70 rounded-lg px-3 py-2 text-sm outline-none"
        >
          <option value="all">Tất cả trạng thái</option>
          {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>

        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="bg-[#111] border border-white/10 text-white/70 rounded-lg px-3 py-2 text-sm outline-none"
        >
          <option value="all">Tất cả dịch vụ</option>
          {Object.entries(SERVICE_LABELS).map(([k, v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
        </select>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-5 rounded-2xl mb-6 flex items-center gap-3">
          <XCircle size={24} />
          <div>
            <p className="font-semibold">Lỗi kết nối Medusa</p>
            <p className="text-sm opacity-80">{error}</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 bg-[#111] border border-white/5 rounded-2xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#1A1A1A] text-white/40 border-b border-white/5 text-[10px] uppercase tracking-widest">
              <tr>
                <th className="px-5 py-4">Khách Hàng</th>
                <th className="px-5 py-4">Dịch Vụ</th>
                <th className="px-5 py-4">BĐS Liên Quan</th>
                <th className="px-5 py-4">Lịch Hẹn</th>
                <th className="px-5 py-4">Phụ Trách</th>
                <th className="px-5 py-4">Trạng Thái</th>
                <th className="px-5 py-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={7} className="px-5 py-16 text-center text-white/40 animate-pulse">Đang tải từ Medusa...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-16 text-center text-white/30">
                  <CalendarCheck size={40} className="mx-auto mb-3 opacity-20" />
                  <p>Chưa có đặt lịch nào</p>
                </td></tr>
              ) : filtered.map(booking => {
                const svc = SERVICE_LABELS[booking.service_type];
                return (
                  <tr key={booking.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#D4AF37]/15 flex items-center justify-center text-[#D4AF37] font-bold text-sm">
                          {booking.customer_name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-medium">{booking.customer_name}</p>
                          <p className="text-white/40 text-xs flex items-center gap-1"><Phone size={10} />{booking.customer_phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-white/70">{svc ? `${svc.emoji} ${svc.label}` : booking.service_type}</span>
                    </td>
                    <td className="px-5 py-4 text-white/50 text-xs">
                      {booking.property_name ? (
                        <span className="flex items-center gap-1"><MapPin size={10} />{booking.property_name}</span>
                      ) : "—"}
                    </td>
                    <td className="px-5 py-4 text-white/60 text-xs">
                      {booking.scheduled_date ? (
                        <>
                          <p>{new Date(booking.scheduled_date).toLocaleDateString("vi-VN")}</p>
                          {booking.scheduled_time && <p className="text-white/40">{booking.scheduled_time}</p>}
                        </>
                      ) : "Chưa xác định"}
                    </td>
                    <td className="px-5 py-4 text-white/60 text-xs">
                      {booking.assigned_to ? (
                        <span className="flex items-center gap-1"><UserCheck size={12} />{booking.assigned_to}</span>
                      ) : <span className="text-white/25">Chưa phân công</span>}
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={booking.status}
                        onChange={e => handleQuickStatus(booking.id, e.target.value as BookingStatus)}
                        className="bg-transparent border-0 outline-none text-xs cursor-pointer"
                      >
                        {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value} className="bg-[#111]">{s.label}</option>)}
                      </select>
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleOpenDetail(booking)}
                        className="text-[#D4AF37] hover:underline text-xs flex items-center gap-1 ml-auto"
                      >
                        <FileText size={14} /> Chi tiết
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Drawer */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">Chi Tiết Đặt Lịch</h2>
              <button onClick={() => setSelectedBooking(null)} className="text-white/50 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              {/* Info */}
              <div className="bg-black/30 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-white/50">Khách hàng</span><span className="text-white font-medium">{selectedBooking.customer_name}</span></div>
                <div className="flex justify-between"><span className="text-white/50">SĐT</span><span className="text-white">{selectedBooking.customer_phone}</span></div>
                <div className="flex justify-between"><span className="text-white/50">Email</span><span className="text-white/70">{selectedBooking.customer_email || "—"}</span></div>
                <div className="flex justify-between"><span className="text-white/50">Dịch vụ</span><span className="text-white">{SERVICE_LABELS[selectedBooking.service_type]?.emoji} {SERVICE_LABELS[selectedBooking.service_type]?.label}</span></div>
                <div className="flex justify-between"><span className="text-white/50">BĐS</span><span className="text-white/70">{selectedBooking.property_name || "—"}</span></div>
                {selectedBooking.scheduled_date && <div className="flex justify-between"><span className="text-white/50">Lịch hẹn</span><span className="text-white">{new Date(selectedBooking.scheduled_date).toLocaleDateString("vi-VN")} {selectedBooking.scheduled_time}</span></div>}
                {selectedBooking.address && <div className="flex justify-between"><span className="text-white/50">Địa chỉ</span><span className="text-white text-right max-w-[60%]">{selectedBooking.address}</span></div>}
                {selectedBooking.budget && <div className="flex justify-between"><span className="text-white/50">Ngân sách</span><span className="text-[#D4AF37]">{selectedBooking.budget.toLocaleString("vi-VN")} VND</span></div>}
                {selectedBooking.notes && <div><span className="text-white/50 block mb-1">Ghi chú KH:</span><p className="text-white/70 text-xs bg-white/5 rounded p-2">{selectedBooking.notes}</p></div>}
              </div>

              {/* Admin edit */}
              <div className="space-y-3">
                <div>
                  <label className="text-white/50 text-xs uppercase tracking-wider block mb-1.5">Trạng thái</label>
                  <select value={editStatus} onChange={e => setEditStatus(e.target.value as BookingStatus)}
                    className="w-full bg-black/50 border border-white/10 text-white rounded-lg px-3 py-2 text-sm outline-none">
                    {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value} className="bg-[#111]">{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-white/50 text-xs uppercase tracking-wider block mb-1.5">Nhân viên phụ trách</label>
                  <input type="text" value={editAssigned} onChange={e => setEditAssigned(e.target.value)}
                    placeholder="Tên nhân viên..."
                    className="w-full bg-black/50 border border-white/10 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-[#D4AF37]" />
                </div>
                <div>
                  <label className="text-white/50 text-xs uppercase tracking-wider block mb-1.5">Ghi chú Admin</label>
                  <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} rows={3}
                    placeholder="Ghi chú nội bộ..."
                    className="w-full bg-black/50 border border-white/10 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-[#D4AF37] resize-none" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setSelectedBooking(null)} className="flex-1 bg-white/5 text-white/70 py-2.5 rounded-lg text-sm">Hủy</button>
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 bg-[#D4AF37] text-black font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                  <Save size={16} /> {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
