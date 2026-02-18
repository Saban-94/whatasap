"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import clsx from "clsx";

export type ToastType = "success" | "info" | "warning" | "error";
export type ToastItem = { id: string; message: string; type: ToastType; };

let addToastExternal: ((toast: ToastItem) => void) | null = null;

export function pushToast(message: string, type: ToastType = "info") {
  addToastExternal?.({ id: String(Date.now() + Math.random()), message, type });
}

export default function ToastManager() {
  const [mounted, setMounted] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    setMounted(true);
    addToastExternal = (toast) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 3000);
    };
    return () => { addToastExternal = null; };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-[9999]" dir="rtl">
      {toasts.map((toast) => (
        <div key={toast.id} className={clsx(
          "px-4 py-3 rounded-xl shadow-2xl text-white font-bold animate-in slide-in-from-bottom-2 duration-300 flex items-center gap-3 border border-white/10",
          toast.type === "success" && "bg-[#00a884]",
          toast.type === "info" && "bg-[#3b82f6]",
          toast.type === "warning" && "bg-yellow-600",
          toast.type === "error" && "bg-red-600"
        )}>
          {toast.type === "success" ? "✅" : "ℹ️"} {toast.message}
        </div>
      ))}
    </div>,
    document.body
  );
}
