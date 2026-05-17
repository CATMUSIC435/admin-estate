"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { 
  MessageSquare, Users2, Database, LayoutDashboard, X, 
  ShoppingBag, CalendarCheck, Package, ExternalLink, 
  Building, FileText, ChevronDown, MapPin, Home, Settings,
  Coins, PhoneCall, TrendingUp
} from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}
const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_URL || "http://localhost:9000";
const MEDUSA_ADMIN_URL = process.env.NEXT_PUBLIC_MEDUSA_ADMIN_URL || `${MEDUSA_URL}/app`;

export default function Sidebar({ isOpen = true, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    "BẤT ĐỘNG SẢN (NESTJS)": true,
  });

  const toggleGroup = (label: string) => {
    setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const menuGroups = [
    {
      label: "OVERVIEW",
      items: [
        { name: "Dashboard Tổng", path: "/", icon: LayoutDashboard },
      ],
    },
    {
      label: "BẤT ĐỘNG SẢN (NESTJS)",
      collapsible: true,
      items: [
        { name: "Sản Phẩm BĐS", path: "/cms/properties", icon: Home },
        { name: "Dự Án", path: "/cms/projects", icon: Building },
        { name: "Khu Vực", path: "/cms/locations", icon: MapPin },
        { name: "CRM Khách Hàng", path: "/crm", icon: Users2 },
      ],
    },
    {
      label: "THƯƠNG MẠI (MEDUSA)",
      items: [
        { name: "Commerce Board", path: "/commerce", icon: LayoutDashboard },
        { name: "Sản Phẩm (Medusa)", path: "/commerce/products", icon: Package },
        { name: "Yêu Cầu Tư Vấn", path: "/commerce/consultations", icon: PhoneCall },
        { name: "Đơn Đặt Chỗ", path: "/commerce/bookings", icon: CalendarCheck },
      ],
    },
    {
      label: "NỘI DUNG & HỖ TRỢ",
      items: [
        { name: "Tin Tức BĐS", path: "/blog", icon: FileText },
        { name: "Tin Tức Tài Chính (WP)", path: "/blog/finance", icon: TrendingUp },
        { name: "Live Chat", path: "/chat", icon: MessageSquare },
      ],
    },
    {
      label: "WEB3 & BLOCKCHAIN",
      items: [
        { name: "Tài Sản Token Hóa", path: "/web3", icon: Coins },
      ],
    },
    {
      label: "HỆ THỐNG",
      items: [
        { name: "Quản Trị & Cache", path: "/system", icon: Settings },
      ],
    },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && setIsOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <div className={`fixed inset-y-0 left-0 z-50 md:relative w-64 bg-black/40 backdrop-blur-xl border-r border-white/10 h-screen flex flex-col pt-8 transform transition-transform duration-300 md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="px-6 mb-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="text-[#D4AF37]" size={28} />
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-[#D4AF37] to-white bg-clip-text text-transparent leading-tight">
                Alize Admin
              </h1>
              <p className="text-[10px] text-white/30">Đà Nẵng Platform</p>
            </div>
          </div>
          {setIsOpen && (
            <button onClick={() => setIsOpen(false)} className="md:hidden text-white/50 hover:text-white p-1">
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="flex-1 flex flex-col gap-1 px-4 overflow-y-auto custom-scrollbar">
          {menuGroups.map((group) => {
            const isGroupOpen = group.collapsible ? openGroups[group.label] !== false : true;
            
            return (
              <div key={group.label} className="mb-4">
                {group.collapsible ? (
                  <button 
                    onClick={() => toggleGroup(group.label)}
                    className="w-full flex items-center justify-between text-[10px] font-semibold text-white/40 hover:text-white/70 uppercase tracking-widest px-4 mb-2 transition-colors"
                  >
                    {group.label}
                    <ChevronDown size={14} className={`transition-transform duration-200 ${isGroupOpen ? "" : "-rotate-90"}`} />
                  </button>
                ) : (
                  <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest px-4 mb-2">
                    {group.label}
                  </p>
                )}
                
                <div className={`overflow-hidden transition-all duration-300 ${isGroupOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                  {group.items.map((item) => {
                    const isActive = item.path === "/" 
                      ? pathname === "/" 
                      : pathname === item.path || pathname.startsWith(item.path + '/');
                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        onClick={() => setIsOpen && setIsOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all mb-0.5 ${isActive
                          ? "bg-[#D4AF37]/10 text-[#D4AF37] font-semibold border-l-4 border-[#D4AF37]"
                          : "text-white/60 hover:text-white hover:bg-white/5 border-l-4 border-transparent"
                          }`}
                      >
                        <item.icon size={18} />
                        <span className="text-sm">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Medusa Admin External Link */}
          <div className="mt-2 px-4 shrink-0">
            <a
              href={MEDUSA_ADMIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/40 hover:text-white/70 hover:bg-white/5 transition-all border border-white/5 hover:border-white/10 text-sm group"
            >
              <ExternalLink size={16} className="group-hover:text-[#D4AF37] transition-colors" />
              <span>Medusa Admin Panel</span>
            </a>
          </div>
        </nav>

        <div className="p-6 border-t border-white/5 text-xs text-white/20 text-center shrink-0">
          NestJS + Medusa v2 + Neon DB
        </div>
      </div>
    </>
  );
}
