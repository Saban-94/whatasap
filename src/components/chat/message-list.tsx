"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductCard } from "./product-card";
import { AnimatedOrb } from "./animated-orb";

export function MessageList({ messages = [], isStreaming }: any) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isStreaming]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 space-y-8 pb-10 no-scrollbar scroll-smooth">
      <AnimatePresence initial={false}>
        {messages.map((m: any) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`max-w-[88%] flex flex-col space-y-4 ${m.role === "user" ? "items-end" : "items-start"}`}>
              {/* בועה עבה */}
              <div 
                className={`p-5 rounded-[28px] text-[15px] font-bold shadow-xl leading-relaxed border ${
                  m.role === "user" 
                    ? "bg-[#0B2C63] text-white rounded-tr-none border-blue-400/20" 
                    : "bg-white text-slate-800 border-slate-50 rounded-tl-none shadow-slate-200/50"
                }`}
                dangerouslySetInnerHTML={{ __html: m.content }}
              />

              {/* הזרקת כרטיס מוצר */}
              {m.uiBlueprint?.type === "product_card" && (
                <div className="animate-in zoom-in-95 duration-500">
                  <ProductCard product={m.uiBlueprint.data} />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {isStreaming && (
        <div className="flex justify-start items-center gap-4 py-2">
          <AnimatedOrb size={24} />
          <span className="text-[10px] font-black text-[#0B2C63] uppercase tracking-[3px] opacity-40">Processing...</span>
        </div>
      )}
    </div>
  );
}
