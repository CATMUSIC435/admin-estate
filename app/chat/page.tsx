"use client";

import React, { useState } from "react";
import { useChatSessions } from "../../hooks/useChatSessions";
import { ChatSidebar } from "../../components/chat/ChatSidebar";
import { ChatWorkspace } from "../../components/chat/ChatWorkspace";

export default function AdminChatDashboard() {
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  
  // Custom hook manages all WebSocket event listeners and fetching history
  const { threads, unreadCounts, isLoading, error } = useChatSessions(selectedThread);

  const handleSelectThread = (threadId: string) => {
    setSelectedThread(threadId);
  };

  // If selecting a thread, pass its messages to Workspace, or pass empty if none
  const currentThreadMsgs = selectedThread ? (threads[selectedThread] || []) : [];

  return (
    <div className="flex h-full w-full bg-[#000] text-[#eee] font-sans rounded-tl-2xl overflow-hidden p-4 md:p-6 gap-6 relative">
      <ChatSidebar 
        threads={threads}
        selectedThread={selectedThread}
        setSelectedThread={handleSelectThread}
        unreadCounts={unreadCounts}
        isLoading={isLoading}
      />

      <ChatWorkspace 
        selectedThread={selectedThread}
        currentThreadMsgs={currentThreadMsgs}
        error={error}
        onBack={() => setSelectedThread(null)}
      />
    </div>
  );
}
