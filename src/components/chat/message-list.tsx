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
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 space-y-8 pb-10 no-scrollbar scroll-smooth">
      <AnimatePresence initial={false}>
        {messages.map((m: any) => (
          <motion.div 
            key={m.id} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`max-w-[85%] flex flex-col space-y-3 ${m.role === "user" ? "items-end" : "items-start"}`}>
              {/* בועת טקסט מודגשת */}
              <div 
                className={`p-5 rounded-[26px] text-[15px] font-bold shadow-sm ${
                  m.role === "user" 
                    ? "bg-[#0B2C63] text-white rounded-tr-none" 
                    : "bg-white text-slate-800 border border-slate-50 rounded-tl-none shadow-slate-200/50"
                }`}
                dangerouslySetInnerHTML={{ __html: m.content }}
              />

              {/* הצגת כרטיס מוצר אם ה-API שלח בלופרינט */}
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
        <div className="flex items-center gap-3">
          <AnimatedOrb size={20} />
          <span className="text-[10px] font-black text-blue-600/40 uppercase tracking-widest">Saban AI חושב...</span>
        </div>
      )}
    </div>
  );
}
