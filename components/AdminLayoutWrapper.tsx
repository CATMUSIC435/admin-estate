"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";

export default function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden bg-black w-full relative">
      {/* Mobile Topbar / Hamburger Menu */}
      <div className="md:hidden absolute top-0 left-0 w-full p-4 flex items-center justify-between z-20 pointer-events-none">
         <button 
           onClick={() => setIsSidebarOpen(true)}
           className="w-10 h-10 bg-[#111] border border-white/10 rounded-lg flex items-center justify-center text-white pointer-events-auto hover:bg-[#222]"
         >
           <Menu size={20} />
         </button>
      </div>

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className="flex-1 overflow-hidden bg-[#0A0A0A] relative md:pt-0 pt-16 h-full flex flex-col">
        {children}
      </main>
    </div>
  );
}
