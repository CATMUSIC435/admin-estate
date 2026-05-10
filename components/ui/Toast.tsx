"use client";
import React, { useState, useEffect, createContext, useContext } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  onClose: (id: string) => void;
}

function Toast({ id, type, message, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 3000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  const icons = {
    success: <CheckCircle2 className="text-green-400" size={20} />,
    error: <XCircle className="text-red-400" size={20} />,
    info: <Info className="text-blue-400" size={20} />
  };

  const borders = {
    success: "border-green-400/20 bg-green-400/10",
    error: "border-red-400/20 bg-red-400/10",
    info: "border-blue-400/20 bg-blue-400/10"
  };

  return (
    <div className={`flex items-center gap-3 p-4 mb-3 rounded-xl border backdrop-blur-md shadow-lg animate-in slide-in-from-right fade-in duration-300 w-80 ${borders[type]}`}>
      {icons[type]}
      <p className="text-white text-sm font-medium flex-1">{message}</p>
      <button onClick={() => onClose(id)} className="text-white/50 hover:text-white transition-colors">
        <X size={16} />
      </button>
    </div>
  );
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Omit<ToastProps, "onClose">[]>([]);

  const addToast = (message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[200] flex flex-col items-end pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <Toast {...t} onClose={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
