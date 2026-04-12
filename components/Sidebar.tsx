"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, Users2, Database, LayoutDashboard, X } from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

export default function Sidebar({ isOpen = true, setIsOpen }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { name: "Live Chat", path: "/chat", icon: MessageSquare },
    { name: "CRM Khách Hàng", path: "/crm", icon: Users2 },
    { name: "Database & CMS", path: "/cms", icon: Database },
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
      <div className={`fixed inset-y-0 left-0 z-50 md:relative w-64 bg-[#111] border-r border-white/10 h-screen flex flex-col pt-8 transform transition-transform duration-300 md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="px-6 mb-8 flex items-center justify-between">
           <div className="flex items-center gap-3">
             <LayoutDashboard className="text-[#D4AF37]" size={28} />
             <h1 className="text-xl font-bold bg-gradient-to-r from-[#D4AF37] to-white bg-clip-text text-transparent">
               G-Estate
             </h1>
           </div>
           {setIsOpen && (
             <button onClick={() => setIsOpen(false)} className="md:hidden text-white/50 hover:text-white p-1">
               <X size={20} />
             </button>
           )}
        </div>

        <nav className="flex-1 flex flex-col gap-2 px-4">
          {menuItems.map((item) => {
            const isActive = pathname.startsWith(item.path);
            return (
              <Link 
                key={item.path} 
                href={item.path}
                onClick={() => setIsOpen && setIsOpen(false)}
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
    </>
  );
}
