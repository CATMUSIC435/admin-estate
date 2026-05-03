"use client";
import React, { useState, useEffect } from "react";
import {
  ShoppingBag, CalendarCheck, Package, TrendingUp,
  Clock, CheckCircle2, XCircle, AlertCircle,
  RefreshCw, ExternalLink, ArrowRight, Users
} from "lucide-react";
import Link from "next/link";

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_URL || "http://localhost:9000";
const MEDUSA_ADMIN_URL = process.env.NEXT_PUBLIC_MEDUSA_ADMIN_URL || `${MEDUSA_URL}/app`;

type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

interface BookingSummary {
  id: string;
  customer_name: string;
  customer_phone: string;
  service_type: string;
  status: BookingStatus;
  scheduled_date: string | null;
  created_at: string;
}

const SERVICE_TYPE_LABELS: Record<string, string> = {
  viewing: "👁️ Xem nhà",
  consulting: "💼 Tư vấn",
  repair: "🔧 Sửa chữa",
  deco: "🎨 Deco nhà",
  rental: "📋 Cho thuê",
  furniture: "🛋️ Nội thất",
};

const STATUS_CONFIG: Record<BookingStatus, { label: string; color: string; icon: any }> = {
  pending: { label: "Chờ xác nhận", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20", icon: Clock },
  confirmed: { label: "Đã xác nhận", color: "text-blue-400 bg-blue-400/10 border-blue-400/20", icon: CheckCircle2 },
  completed: { label: "Hoàn thành", color: "text-green-400 bg-green-400/10 border-green-400/20", icon: CheckCircle2 },
  cancelled: { label: "Đã hủy", color: "text-red-400 bg-red-400/10 border-red-400/20", icon: XCircle },
};

export default function CommerceDashboard() {
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [medusaOnline, setMedusaOnline] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Đăng nhập Medusa và fetch data
  const fetchMedusaData = async () => {
    setLoading(true);
    try {
      // Kiểm tra health
      const health = await fetch(`${MEDUSA_URL}/health`);
      if (!health.ok) throw new Error("Medusa offline");
      setMedusaOnline(true);

      // Login để lấy token
      const loginRes = await fetch(`${MEDUSA_URL}/auth/user/emailpass`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "admin@alize-danang.com",
          password: "AlizeDaNang2026!",
        }),
        credentials: "include",
      });
      const loginData = await loginRes.json();
      const authToken = loginData.token;
      setToken(authToken);

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      };

      // Fetch bookings
      const bookingsRes = await fetch(`${MEDUSA_URL}/admin/bookings?limit=10`, { headers });
      if (bookingsRes.ok) {
        const { bookings: b } = await bookingsRes.json();
        setBookings(b || []);
      }

      // Fetch orders
      const ordersRes = await fetch(`${MEDUSA_URL}/admin/orders?limit=5`, { headers });
      if (ordersRes.ok) {
        const { orders: o } = await ordersRes.json();
        setOrders(o || []);
      }

      // Fetch products count
      const productsRes = await fetch(`${MEDUSA_URL}/admin/products?limit=100`, { headers });
      if (productsRes.ok) {
        const { products: p } = await productsRes.json();
        setProducts(p || []);
      }
    } catch {
      setMedusaOnline(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMedusaData(); }, []);

  const pendingCount = bookings.filter(b => b.status === "pending").length;
  const confirmedCount = bookings.filter(b => b.status === "confirmed").length;
  const completedCount = bookings.filter(b => b.status === "completed").length;

  if (!medusaOnline && !loading) {
    return (
      <div className="h-full flex flex-col p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Commerce Dashboard</h1>
            <p className="text-white/50 text-sm">Quản lý Thương Mại & Dịch Vụ BĐS</p>
          </div>
        </div>

        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 flex items-center gap-6">
          <AlertCircle size={48} className="text-red-400 flex-shrink-0" />
          <div>
            <h3 className="text-xl font-bold text-red-400 mb-2">Medusa Server Chưa Chạy</h3>
            <p className="text-white/60 mb-4">Cần khởi động Medusa backend để sử dụng tính năng Commerce.</p>
            <div className="bg-black/40 rounded-lg p-4 font-mono text-sm text-green-400">
              <p className="text-white/40 text-xs mb-1"># Nếu chạy ở môi trường Local (Máy tính cá nhân):</p>
              <p>cd medusa\apps\backend && npx medusa develop</p>
              <br />
              <p className="text-white/40 text-xs mb-1"># Backend URL hiện tại đang trỏ tới:</p>
              <p>{MEDUSA_URL}</p>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <p className="text-white/40 text-xs">Vui lòng kiểm tra lại cấu hình biến môi trường NEXT_PUBLIC_MEDUSA_URL.</p>
              <a href={MEDUSA_ADMIN_URL} target="_blank" rel="noopener noreferrer" className="bg-[#D4AF37]/20 text-[#D4AF37] px-3 py-1.5 rounded text-xs font-semibold hover:bg-[#D4AF37]/40">
                Truy cập Medusa Admin
              </a>
            </div>
          </div>
        </div>

        {/* Hướng dẫn */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { step: "1", title: "Khởi động Medusa", desc: "Chạy lệnh npx medusa develop trong thư mục medusa/apps/backend" },
            { step: "2", title: "Đăng nhập Admin", desc: `Email: admin@alize-danang.com | Pass: AlizeDaNang2026!` },
            { step: "3", title: "Seed sản phẩm mẫu", desc: "Chạy seed-alize.ts để tạo categories và sản phẩm" },
          ].map(item => (
            <div key={item.step} className="bg-[#111] border border-white/5 rounded-2xl p-5">
              <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-bold flex items-center justify-center text-sm mb-3">
                {item.step}
              </div>
              <h4 className="text-white font-semibold mb-1">{item.title}</h4>
              <p className="text-white/40 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4 md:p-8 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Commerce Dashboard</h1>
          <p className="text-white/50 text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block animate-pulse" />
            Medusa v2 đang chạy tại {MEDUSA_URL}
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchMedusaData} className="bg-white/5 text-white/70 hover:text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 border border-white/10">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <a
            href={MEDUSA_ADMIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#D4AF37] text-black font-semibold px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:scale-105 transition-transform"
          >
            <ExternalLink size={16} /> Medusa Admin
          </a>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Đặt lịch mới", value: pendingCount, icon: Clock, color: "text-yellow-400", bg: "bg-yellow-400/10" },
          { label: "Đã xác nhận", value: confirmedCount, icon: CheckCircle2, color: "text-blue-400", bg: "bg-blue-400/10" },
          { label: "Hoàn thành", value: completedCount, icon: TrendingUp, color: "text-green-400", bg: "bg-green-400/10" },
          { label: "Sản phẩm", value: products.length, icon: Package, color: "text-purple-400", bg: "bg-purple-400/10" },
        ].map((stat, i) => (
          <div key={i} className="bg-[#111] border border-white/5 rounded-2xl p-5 relative overflow-hidden">
            <div className={`absolute -right-3 -bottom-3 w-16 h-16 rounded-full ${stat.bg} flex items-center justify-center`}>
              <stat.icon className={stat.color} size={28} />
            </div>
            <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-white">{loading ? "—" : stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CalendarCheck className="text-[#D4AF37]" size={20} />
              Đặt Lịch Gần Đây
            </h3>
            <Link href="/commerce/bookings" className="text-[#D4AF37] text-sm flex items-center gap-1 hover:gap-2 transition-all">
              Xem tất cả <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-14 bg-white/5 rounded-lg animate-pulse" />)}
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12 text-white/30">
              <CalendarCheck size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Chưa có đặt lịch nào</p>
            </div>
          ) : (
            <div className="space-y-2">
              {bookings.slice(0, 6).map(booking => {
                const statusCfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
                return (
                  <div key={booking.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] font-bold text-sm flex-shrink-0">
                      {booking.customer_name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{booking.customer_name}</p>
                      <p className="text-white/40 text-xs">{SERVICE_TYPE_LABELS[booking.service_type] || booking.service_type}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold flex-shrink-0 ${statusCfg.color}`}>
                      {statusCfg.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Links & Products */}
        <div className="space-y-6">
          {/* Quick Links */}
          <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <ShoppingBag className="text-[#D4AF37]" size={20} />
              Truy Cập Nhanh
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Đặt Lịch Mới", href: "/commerce/bookings", icon: CalendarCheck, badge: pendingCount > 0 ? `${pendingCount} mới` : null },
                { label: "Sản Phẩm", href: "/commerce/products", icon: Package, badge: `${products.length}` },
                { label: "Đơn Hàng", href: `${MEDUSA_ADMIN_URL}/orders`, icon: ShoppingBag, external: true },
                { label: "Khách Hàng", href: `${MEDUSA_ADMIN_URL}/customers`, icon: Users, external: true },
              ].map((link, i) => (
                link.external ? (
                  <a key={i} href={link.href} target="_blank" rel="noopener noreferrer"
                    className="bg-white/5 hover:bg-white/8 border border-white/5 hover:border-white/10 rounded-xl p-4 flex flex-col gap-2 transition-all group">
                    <link.icon size={20} className="text-white/50 group-hover:text-[#D4AF37] transition-colors" />
                    <span className="text-white/70 text-sm font-medium">{link.label}</span>
                    <ExternalLink size={12} className="text-white/30" />
                  </a>
                ) : (
                  <Link key={i} href={link.href}
                    className="bg-white/5 hover:bg-white/8 border border-white/5 hover:border-white/10 rounded-xl p-4 flex flex-col gap-2 transition-all group">
                    <link.icon size={20} className="text-white/50 group-hover:text-[#D4AF37] transition-colors" />
                    <span className="text-white/70 text-sm font-medium">{link.label}</span>
                    {link.badge && <span className="text-[10px] text-[#D4AF37] font-semibold">{link.badge}</span>}
                  </Link>
                )
              ))}
            </div>
          </div>

          {/* Service Types Summary */}
          <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-4">Phân Loại Dịch Vụ</h3>
            <div className="space-y-2">
              {Object.entries(SERVICE_TYPE_LABELS).map(([key, label]) => {
                const count = bookings.filter(b => b.service_type === key).length;
                const pct = bookings.length > 0 ? (count / bookings.length) * 100 : 0;
                return (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-sm text-white/60 w-32 truncate">{label}</span>
                    <div className="flex-1 bg-white/5 rounded-full h-1.5 overflow-hidden">
                      <div className="h-full bg-[#D4AF37] rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-white/40 w-6 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
