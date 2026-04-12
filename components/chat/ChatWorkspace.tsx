import React, { useState, useRef, useEffect } from "react";
import { User, MessageCircle, Send, Paperclip } from "lucide-react";
import { ChatMessage } from "../../types";
import { storage } from "../../lib/appwrite";
import { ID } from "appwrite";

interface ChatWorkspaceProps {
  selectedThread: string | null;
  currentThreadMsgs: ChatMessage[];
  error: string | null;
}

export function ChatWorkspace({ selectedThread, currentThreadMsgs, error }: ChatWorkspaceProps) {
  const [inputText, setInputText] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentThreadMsgs]);

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

  return (
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
                  {currentThreadMsgs?.[0]?.guestName 
                    ? `${currentThreadMsgs[0].guestName} - ${currentThreadMsgs[0].guestPhone}`
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
            {currentThreadMsgs.map((msg, idx) => {
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
  );
}
