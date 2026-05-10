"use client";
import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, Building, Home, FileText, ShoppingBag, 
  Users2, MapPin, Package, CalendarCheck, TrendingUp, AlertTriangle, ArrowRight 
} from "lucide-react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_NEST_API_URL || "http://localhost:3001";
const GQL_URL = process.env.NEXT_PUBLIC_NEST_GRAPHQL_URL || "http://localhost:3001/graphql";
const MEDUSA_API_URL = "/api/medusa"; // Proxy qua Next.js Backend
const MEDUSA_ADMIN_URL = process.env.NEXT_PUBLIC_MEDUSA_ADMIN_URL || "http://localhost:9000/app";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    properties: 0,
    projects: 0,
    locations: 0,
    blogs: 0,
  });
  const [commerceStats, setCommerceStats] = useState({
    products: 0,
    orders: 0,
    bookings: 0,
  });
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      const newErrors: string[] = [];
      
      // 1. Fetch CMS (NestJS) Stats
      try {
        const query = `query {
          locations { id }
          properties { id }
          blogs { id }
          projects { id }
        }`;
        const response = await fetch(GQL_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });
        if (response.ok) {
          const json = await response.json();
          if (!json.errors) {
            setStats({
              properties: json.data.properties?.length || 0,
              projects: json.data.projects?.length || 0,
              locations: json.data.locations?.length || 0,
              blogs: json.data.blogs?.length || 0,
            });
          }
        } else {
          newErrors.push("NestJS API Offline");
        }
      } catch (e) {
        newErrors.push("Lỗi kết nối NestJS Backend");
      }

      // 2. Fetch Medusa Stats
      try {
        // Try getting token first using proxy
        const loginRes = await fetch(`${MEDUSA_API_URL}/auth/user/emailpass`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "admin@alize-danang.com",
            password: "AlizeDaNang2026!",
          }),
        });
        
        if (loginRes.ok) {
          const loginData = await loginRes.json();
          const token = loginData.token;
          const headers = { Authorization: `Bearer ${token}` };

          const [prodRes, ordersRes, bookingsRes] = await Promise.all([
            fetch(`${MEDUSA_API_URL}/admin/products?limit=1`, { headers }).catch(() => null),
            fetch(`${MEDUSA_API_URL}/admin/orders?limit=1`, { headers }).catch(() => null),
            fetch(`${MEDUSA_API_URL}/admin/bookings?limit=1`, { headers }).catch(() => null),
          ]);

          setCommerceStats({
            products: prodRes?.ok ? (await prodRes.json()).count || 0 : 0,
            orders: ordersRes?.ok ? (await ordersRes.json()).count || 0 : 0,
            bookings: bookingsRes?.ok ? (await bookingsRes.json()).count || 0 : 0,
          });
        } else {
          newErrors.push("Medusa API Offline hoặc Lỗi Đăng nhập");
        }
      } catch (e) {
        newErrors.push("Lỗi kết nối Medusa Backend");
      }

      setErrors(newErrors);
      setLoading(false);
    };

    fetchAllData();
  }, []);

  return (
    <div className="h-full flex flex-col p-4 md:p-8 overflow-y-auto bg-[#0A0A0A]">
      <div className="flex items-center gap-3 mb-8">
        <LayoutDashboard className="text-[#D4AF37]" size={32} />
        <div>
          <h1 className="text-3xl font-bold text-white leading-tight">Tổng Quan Hệ Thống</h1>
          <p className="text-white/50 text-sm">Dashboard Quản Trị Hợp Nhất Alize Da Nang</p>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 p-3 md:p-4 rounded-xl mb-8 flex flex-col sm:flex-row items-start gap-3">
          <AlertTriangle className="text-red-400 mt-1 shrink-0" size={20} />
          <div>
            <h3 className="text-red-400 font-semibold mb-1">Cảnh báo Hệ thống</h3>
            <ul className="text-white/60 text-sm list-disc pl-4 space-y-1">
              {errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </div>
        </div>
      )}

      {/* TỔNG QUAN BẤT ĐỘNG SẢN */}
      <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-widest flex items-center gap-2">
        <Building className="text-[#D4AF37]" size={20} /> Bất Động Sản (CMS)
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Dự Án" value={stats.projects} icon={Building} link="/cms" loading={loading} />
        <StatCard title="Sản Phẩm BĐS" value={stats.properties} icon={Home} link="/cms" loading={loading} />
        <StatCard title="Khu Vực" value={stats.locations} icon={MapPin} link="/cms" loading={loading} />
        <StatCard title="Bài Viết (Blog)" value={stats.blogs} icon={FileText} link="/blog" loading={loading} />
      </div>

      {/* TỔNG QUAN THƯƠNG MẠI */}
      <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-widest flex items-center gap-2 mt-4">
        <ShoppingBag className="text-[#D4AF37]" size={20} /> Thương Mại (Medusa)
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Đơn Hàng" value={commerceStats.orders} icon={ShoppingBag} link={MEDUSA_ADMIN_URL + "/orders"} external loading={loading} />
        <StatCard title="Đặt Lịch DV" value={commerceStats.bookings} icon={CalendarCheck} link="/commerce" loading={loading} />
        <StatCard title="Sản Phẩm" value={commerceStats.products} icon={Package} link="/commerce" loading={loading} />
        <StatCard title="Doanh Thu" value={"---"} icon={TrendingUp} link={MEDUSA_ADMIN_URL} external loading={loading} />
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <div className="bg-[#111] border border-white/5 rounded-xl sm:rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Lối Tắt CMS</h3>
          <div className="space-y-3">
            <QuickLink href="/cms" icon={Building} title="Quản lý Kho BĐS" desc="Thêm/sửa dự án, căn hộ" />
            <QuickLink href="/crm" icon={Users2} title="Quản lý Ký gửi" desc="Khách hàng gửi bán BĐS" />
            <QuickLink href="/blog" icon={FileText} title="Viết Blog Mới" desc="Tạo bài viết chuẩn SEO" />
          </div>
        </div>

        <div className="bg-[#111] border border-white/5 rounded-xl sm:rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Lối Tắt Thương Mại</h3>
          <div className="space-y-3">
            <QuickLink href="/commerce/bookings" icon={CalendarCheck} title="Xử lý Lịch hẹn" desc="Phê duyệt, hủy lịch khách hàng" />
            <QuickLink href={MEDUSA_ADMIN_URL + "/products"} icon={Package} title="Quản lý Sản phẩm" desc="Nội thất, gói dịch vụ" external />
            <QuickLink href={MEDUSA_ADMIN_URL + "/orders"} icon={ShoppingBag} title="Quản lý Đơn hàng" desc="Đơn mua hàng nội thất" external />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, link, external, loading }: any) {
  const content = (
    <div className="bg-[#111] border border-white/5 rounded-xl sm:rounded-2xl p-5 relative overflow-hidden transition-all hover:border-[#D4AF37]/50 hover:bg-white/5 group h-full flex flex-col justify-between">
      <Icon className="text-[#D4AF37]/20 absolute -right-3 -bottom-3 transition-transform group-hover:scale-110" size={64} />
      <h4 className="text-white/50 mb-2 font-medium text-sm">{title}</h4>
      <p className="text-3xl font-bold text-white">
        {loading ? <span className="animate-pulse opacity-50">...</span> : value}
      </p>
    </div>
  );

  return external ? (
    <a href={link} target="_blank" rel="noopener noreferrer">{content}</a>
  ) : (
    <Link href={link}>{content}</Link>
  );
}

function QuickLink({ href, icon: Icon, title, desc, external }: any) {
  const inner = (
    <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group">
      <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-black transition-colors">
        <Icon size={20} />
      </div>
      <div className="flex-1">
        <h4 className="text-white text-sm font-medium">{title}</h4>
        <p className="text-white/40 text-xs">{desc}</p>
      </div>
      <ArrowRight size={16} className="text-white/20 group-hover:text-[#D4AF37] transition-colors" />
    </div>
  );
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="block">{inner}</a>
  ) : (
    <Link href={href} className="block">{inner}</Link>
  );
}
