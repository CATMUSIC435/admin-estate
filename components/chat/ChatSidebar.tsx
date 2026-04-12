import React from "react";
import { User, Clock, ShieldAlert } from "lucide-react";
import { ChatMessage } from "../../types";

interface ChatSidebarProps {
  threads: Record<string, ChatMessage[]>;
  selectedThread: string | null;
  setSelectedThread: (id: string) => void;
  unreadCounts: Record<string, number>;
  isLoading: boolean;
}

export function ChatSidebar({ threads, selectedThread, setSelectedThread, unreadCounts, isLoading }: ChatSidebarProps) {
  const threadIds = Object.keys(threads);

  return (
    <div className={`bg-[#111] border border-white/10 rounded-xl flex flex-col overflow-hidden shadow-2xl shrink-0 ${selectedThread ? 'hidden md:flex' : 'flex'} w-full md:w-[350px]`}>
      <div className="p-4 md:p-6 bg-[#151515] border-b border-white/5 flex items-center gap-3">
        <ShieldAlert className="text-[#D4AF37]" />
        <h2 className="text-lg font-semibold uppercase tracking-widest text-[#D4AF37]">Admin Kênh Trực Tuyến</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-8 text-center text-[#ddd]/50 animate-pulse">Đang tải dữ liệu...</div>
        ) : threadIds.length === 0 ? (
          <div className="p-8 text-center text-[#ddd]/40 text-sm">Chưa có ai nhắn tin.</div>
        ) : (
          threadIds.map((tid) => {
            const msgs = threads[tid];
            const lastMsg = msgs[msgs.length - 1];
            const isSelected = tid === selectedThread;
            const unread = unreadCounts[tid] || 0;
            const displayInfo = lastMsg.guestName 
              ? `${lastMsg.guestName} - ${lastMsg.guestPhone}` 
              : `Guest_${tid.substring(0, 5)}`;
            
            return (
              <button
                key={tid}
                onClick={() => setSelectedThread(tid)}
                className={`w-full text-left p-5 border-b border-white/5 transition-colors relative ${isSelected ? 'bg-[#D4AF37]/10 border-l-4 border-l-[#D4AF37]' : 'hover:bg-white/5 border-l-4 border-l-transparent'}`}
              >
                {unread > 0 && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full shadow-lg animate-bounce">
                    {unread}
                  </div>
                )}
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-sm flex items-center gap-2 truncate pr-4">
                    <User size={14} className="text-[#D4AF37] shrink-0" />
                    {displayInfo}
                  </span>
                  <span className="text-[10px] text-[#ddd]/50 flex items-center gap-1 shrink-0">
                    <Clock size={10} />
                    {new Date(lastMsg.$createdAt || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                <p className="text-xs text-[#ddd]/70 truncate w-[250px]">
                  {lastMsg.senderType === 'agent' ? "Admin: " : ""}{lastMsg.content}
                </p>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
