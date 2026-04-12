import { useState, useEffect, useRef } from "react";
import { client, APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID } from "../lib/appwrite";
import { ChatMessage } from "../types";

export function useChatSessions(selectedThread: string | null) {
  const [threads, setThreads] = useState<Record<string, ChatMessage[]>>({});
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Clear unreads when thread selected
  useEffect(() => {
    if (selectedThread && unreadCounts[selectedThread]) {
      setUnreadCounts((prev) => ({ ...prev, [selectedThread]: 0 }));
    }
  }, [selectedThread, unreadCounts]);

  const selectedThreadRef = useRef(selectedThread);
  useEffect(() => {
    selectedThreadRef.current = selectedThread;
  }, [selectedThread]);

  // Init history and socket
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('/api/chat/history');
        const data = await res.json();
        
        if (data.error) {
          throw new Error(data.error);
        }

        const grouped: Record<string, ChatMessage[]> = {};
        if (data.messages && Array.isArray(data.messages)) {
          data.messages.forEach((msg: ChatMessage) => {
            const threadId = msg.senderId;
            if (!grouped[threadId]) grouped[threadId] = [];
            grouped[threadId].push(msg);
          });
        }
        setThreads(grouped);
        setIsLoading(false);
      } catch (err: any) {
        console.error("Init Error:", err);
        setError("Lỗi kết nối tới Server. Hãy đảm bảo Database đã được Setup.");
        setIsLoading(false);
      }
    };

    fetchHistory();

    const unsubscribe = client.subscribe(
      `databases.${APPWRITE_DATABASE_ID}.collections.${APPWRITE_COLLECTION_ID}.documents`,
      (response: any) => {
        if (response.events && Array.isArray(response.events) && response.events.some((e: string) => e.includes('.create'))) {
          const newMsg = response.payload as ChatMessage;
          const threadId = newMsg.senderId;
          
          setThreads(prev => {
            const currentThreadMsgs = prev[threadId] || [];
            if (currentThreadMsgs.some(m => m.$id === newMsg.$id)) return prev;
            
            return {
              ...prev,
              [threadId]: [...currentThreadMsgs, newMsg]
            };
          });

          if (selectedThreadRef.current !== threadId && newMsg.senderType === 'user') {
            setUnreadCounts(c => ({...c, [threadId]: (c[threadId] || 0) + 1}));
          }
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    threads,
    unreadCounts,
    isLoading,
    error,
  };
}
