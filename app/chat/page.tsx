"use client";

import React, { useState, useEffect, useRef } from "react";
import { client, APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID, storage } from "../../lib/appwrite";
import { Send, User, MessageCircle, Clock, ShieldAlert, Paperclip } from "lucide-react";
import { ID } from "appwrite";

export default function AdminChatDashboard() {
  const [threads, setThreads] = useState<Record<string, any[]>>({});
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  
  // File Attachment
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Xóa số người đọc khi click vào thread
  useEffect(() => {
    if (selectedThread && unreadCounts[selectedThread]) {
      setUnreadCounts(prev => ({ ...prev, [selectedThread]: 0 }));
    }
  }, [selectedThread]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [threads, selectedThread]);

  // Fetch initial history via Secure Server Route
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('/api/chat/history');
        const data = await res.json();
        
        if (data.error) {
          throw new Error(data.error);
        }

        const grouped: Record<string, any[]> = {};
        if (data.messages && Array.isArray(data.messages)) {
          data.messages.forEach((msg: any) => {
            const threadId = msg.senderId;
            if (!grouped[threadId]) grouped[threadId] = [];
            grouped[threadId].push(msg);
          });
        }
        setThreads(grouped);
        
        // Auto-select first thread
        if (Object.keys(grouped).length > 0) {
          setSelectedThread(Object.keys(grouped)[0]);
        }
        setIsLoading(false);
      } catch (err: any) {
        console.error("Init Error:", err);
        setError("Lỗi kết nối tới Server. Hãy đảm bảo Database đã được Setup.");
        setIsLoading(false);
      }
    };

    fetchHistory();

    // Listen to WebSockets real-time pushes
    const unsubscribe = client.subscribe(
      `databases.${APPWRITE_DATABASE_ID}.collections.${APPWRITE_COLLECTION_ID}.documents`,
      (response: any) => {
        if (response.events && Array.isArray(response.events) && response.events.some((e: string) => e.includes('.create'))) {
          const newMsg = response.payload as any;
          const threadId = newMsg.senderId;
          setThreads(prev => {
            const currentThreadMsgs = prev[threadId] || [];
            if (currentThreadMsgs.some(m => m.$id === newMsg.$id)) return prev;
            
            // Tăng biến đếm unread nếu đang không chọn thread này và tin nhắn từ user
            if (selectedThread !== threadId && newMsg.senderType === 'user') {
              setUnreadCounts(c => ({...c, [threadId]: (c[threadId] || 0) + 1}));
            }
            
            return {
              ...prev,
              [threadId]: [...currentThreadMsgs, newMsg]
            };
          });
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e as unknown as React.FormEvent);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAttachment(e.target.files[0]);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !attachment) || !selectedThread) return;

    setIsUploading(true);

    let finalAttachmentUrl = "";
    if (attachment) {
      try {
        const uploaded = await storage.createFile('chat_media', ID.unique(), attachment);
        finalAttachmentUrl = String(storage.getFileView('chat_media', uploaded.$id));
      } catch(err) {
         console.error("Lỗi Upload File:", err);
         alert("Lỗi tải file lên máy chủ!");
         setIsUploading(false);
         return;
      }
    }

    const payload = {
      content: inputText,
      targetUserId: selectedThread,
      attachmentUrl: finalAttachmentUrl || undefined
    };
    
    setInputText("");
    setAttachment(null);

    try {
      const res = await fetch('/api/chat/admin-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
    } catch (err: any) {
      alert("Lỗi khi gửi tin nhắn Admin: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const threadIds = Object.keys(threads);

  return (
    <div className="flex h-full w-full bg-[#000] text-[#eee] font-sans rounded-tl-2xl overflow-hidden p-6 gap-6">
      
      {/* Cột trái: Danh sách Chat Sessions */}
      <div className="w-[350px] bg-[#111] border border-white/10 rounded-xl flex flex-col overflow-hidden shadow-2xl shrink-0">
        <div className="p-6 bg-[#151515] border-b border-white/5 flex items-center gap-3">
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

      {/* Cột phải: Giao diện Chat (Workspace) */}
      <div className="flex-1 bg-[#222]/20 border border-white/10 rounded-xl flex flex-col overflow-hidden shadow-2xl relative">
        {error && (
          <div className="absolute top-0 w-full bg-red-500 text-white text-center text-sm py-2 z-50">
            {error}
          </div>
        )}
        
        {selectedThread ? (
          <>
            <div className="p-6 bg-[#1A1A1A] border-b border-white/5 flex items-center justify-between shadow-md z-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#000] border border-[#D4AF37]/30 flex items-center justify-center">
                  <User className="text-[#D4AF37]" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-white">
                    {threads[selectedThread]?.[0]?.guestName 
                      ? `${threads[selectedThread][0].guestName} - ${threads[selectedThread][0].guestPhone}`
                      : `Phiên ẩn danh: Guest_${selectedThread.substring(0, 6)}`}
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[10px] text-[#ddd]/60 uppercase tracking-widest">Đang kết nối Realtime</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 p-8 overflow-y-auto flex flex-col gap-4 bg-[#111]">
              {threads[selectedThread].map((msg, idx) => {
                const isAdmin = msg.senderType === 'agent';
                return (
                  <div key={msg.$id || idx} className={`flex w-full ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[60%] p-4 rounded-2xl shadow-lg relative ${isAdmin ? 'bg-[#D4AF37] text-[#000] rounded-br-none' : 'bg-[#000] text-white rounded-bl-none border border-white/10'}`}>
                       {msg.attachmentUrl && (
                          <div className="mb-2">
                            <img src={msg.attachmentUrl} alt="Đính kèm" className="rounded-lg w-full object-cover max-h-48 shadow-md border border-[#D4AF37]/20" />
                          </div>
                       )}
                       <p className="text-sm leading-relaxed">{msg.content}</p>
                       <span className={`text-[9px] mt-2 block w-full text-right ${isAdmin ? 'text-[#000]/60' : 'text-[#ddd]/40'}`}>
                         {new Date(msg.$createdAt || Date.now()).toLocaleTimeString()}
                       </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 bg-[#151515] border-t border-white/10 flex gap-4 items-center">
              <input
                type="file"
                id="admin-file-upload"
                className="hidden"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                disabled={isUploading}
              />
              <label 
                htmlFor="admin-file-upload" 
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors shrink-0 ${attachment ? 'bg-green-500/20 text-green-500' : 'bg-[#000] text-white/50 hover:bg-[#D4AF37]/20 cursor-pointer border border-white/10'} ${isUploading && 'opacity-50 pointer-events-none'}`}
              >
                {attachment ? <img src={URL.createObjectURL(attachment)} alt="preview" className="w-8 h-8 object-cover rounded" /> : <Paperclip size={20} />}
              </label>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isUploading ? "Đang gửi..." : "Gõ tin nhắn phản hồi tới Guest..."}
                disabled={isUploading}
                className="flex-1 bg-[#000] text-white px-6 py-4 rounded-full outline-none border border-white/10 focus:border-[#D4AF37]/50 transition-all text-sm placeholder:text-white/30"
              />
              <button 
                type="submit"
                disabled={(!inputText.trim() && !attachment) || isUploading}
                className="w-14 h-14 bg-[#D4AF37] rounded-full flex items-center justify-center text-[#000] hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 flex-shrink-0"
              >
                {isUploading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : <Send size={20} className="ml-1" />}
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-30">
            <MessageCircle size={80} className="mb-4" />
            <p className="text-lg font-light tracking-wider">Chọn một kênh chat để phản hồi khách hàng</p>
          </div>
        )}
      </div>
      
    </div>
  );
}
