"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SafeIcon } from "@/components/SafeIcon";
import { Product } from "@/types";
import { useChatActions } from "@/context/ChatActionsContext";
import { Play, X, ExternalLink, Image as ImageIcon } from "lucide-react";

export function ProductCard({ product }: { product: Product }) {
  const { handleConsult } = useChatActions();
  const [showVideo, setShowVideo] = useState(false);

  // פונקציה להפקת מזהה וידאו מיוטיוב לצורך הטמעה (Embed)
  const getYoutubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  const embedUrl = product.youtube_url ? getYoutubeEmbedUrl(product.youtube_url) : null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[30px] overflow-hidden shadow-md hover:shadow-xl transition-all w-full max-w-sm text-right"
    >
      {/* תמונת מוצר מה-Database */}
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.product_name} 
            className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-300">
            <ImageIcon size={48} />
            <span className="text-[10px] mt-2 font-bold uppercase tracking-widest">No Image Available</span>
          </div>
        )}
        
        {/* תג מחיר צף (אם קיים) */}
        {product.price && (
          <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-black shadow-lg">
            ₪{product.price}
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <span className="text-[9px] font-black bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-500 uppercase">
            SKU: {product.sku}
          </span>
          {product.youtube_url && (
            <button 
              onClick={() => setShowVideo(true)}
              className="flex items-center gap-1 text-[10px] font-bold text-red-600 hover:text-red-700 transition-colors"
            >
              <Play size={14} fill="currentColor" /> וידאו הדרכה
            </button>
          )}
        </div>

        <h3 className="font-black text-slate-900 dark:text-white text-base mb-1 leading-tight">
          {product.product_name}
        </h3>
        
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
          {product.description || "מידע טכני מפורט זמין במחסני סבן."}
        </p>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-xl border border-slate-100 flex flex-col items-center">
             <SafeIcon name="Clock" size={12} className="text-blue-500 mb-1" />
             <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
               {product.drying_time || "לפי ה-TDS"}
             </span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-xl border border-slate-100 flex flex-col items-center">
             <SafeIcon name="Maximize" size={12} className="text-green-500 mb-1" />
             <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
               {product.coverage || "לפי שטח"}
             </span>
          </div>
        </div>

        <button 
          onClick={() => handleConsult(product, "מפרט מלא וזמינות")}
          className="w-full py-3 bg-[#0B2C63] text-white rounded-2xl text-xs font-black shadow-lg hover:brightness-110 transition-all"
        >
          ייעוץ טכני מהיר
        </button>
      </div>

      {/* מודאל וידאו צף (Lightbox) */}
      <AnimatePresence>
        {showVideo && embedUrl && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <div className="relative w-full max-w-3xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl">
              <button 
                onClick={() => setShowVideo(false)}
                className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 p-2 rounded-full text-white transition-colors"
              >
                <X size={24} />
              </button>
              <iframe 
                src={`${embedUrl}?autoplay=1`}
                className="w-full h-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
