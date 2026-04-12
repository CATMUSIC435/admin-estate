"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, Users2, Database, LayoutDashboard } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: "Live Chat", path: "/chat", icon: MessageSquare },
    { name: "CRM Khách Hàng", path: "/crm", icon: Users2 },
    { name: "CMS Bất Động Sản", path: "/cms", icon: Database },
  ];

  return (
    <div className="w-64 bg-[#111] border-r border-white/10 h-screen flex flex-col pt-8">
      <div className="px-6 mb-8 flex items-center gap-3">
         <LayoutDashboard className="text-[#D4AF37]" size={28} />
         <h1 className="text-xl font-bold bg-gradient-to-r from-[#D4AF37] to-white bg-clip-text text-transparent">
           G-Estate
         </h1>
      </div>

      <nav className="flex-1 flex flex-col gap-2 px-4">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.path);
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? "bg-[#D4AF37]/10 text-[#D4AF37] font-semibold border-l-4 border-[#D4AF37]" 
                  : "text-white/60 hover:text-white hover:bg-white/5 border-l-4 border-transparent"
              }`}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-white/5 text-xs text-white/30 text-center">
        Powered by Appwrite & Sanity
      </div>
    </div>
  );
}
