"use client";

import React, { useState } from "react";
import { 
  Play, Info, Droplets, Maximize2, CheckCircle2, 
  MessageCircle, Share2, Heart, ChevronLeft, 
  ChevronRight, Star, ShoppingCart, Clock, Wrench
} from "lucide-react";

interface ProductProps {
  product: {
    sku: string;
    product_name: string;
    description: string;
    price: number;
    image_url: string;
    youtube_url?: string;
    drying_time?: string;
    coverage?: string;
    application_method?: string;
    features?: string[];
    metadata?: Record<string, string>;
  };
  onAddToCart: (p: any) => void;
  onConsultAI: (p: any) => void;
}

export default function SabanPremiumCard({ product, onAddToCart, onConsultAI }: ProductProps) {
  const [activeTab, setActiveTab] = useState<"info" | "specs">("info");
  const [showVideo, setShowVideo] = useState(false);

  // עיצוב מחיר חכם
  const displayPrice = product.price > 0 ? `₪${product.price}` : "הצעת מחיר";

  return (
    <div className="max-w-md mx-auto bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden flex flex-col group animate-in fade-in zoom-in-95 duration-500" dir="rtl">
      
      {/* --- Media Area (Mobile Optimized) --- */}
      <div className="relative h-80 bg-[#F1F5F9] overflow-hidden">
        {showVideo && product.youtube_url ? (
          <iframe 
            className="w-full h-full" 
            src={product.youtube_url.replace("watch?v=", "embed/")} 
            title="Sika Tutorial" 
            frameBorder="0" 
            allowFullScreen 
          />
        ) : (
          <div className="relative h-full flex items-center justify-center p-8">
            <img 
              src={product.image_url} 
              alt={product.product_name} 
              className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-1000" 
            />
          </div>
        )}

        {/* Floating Badges */}
        <div className="absolute top-6 right-6 flex flex-col gap-3 z-10">
          <div className="bg-[#0B2C63] text-white text-[10px] font-black px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2">
            <Star size={12} fill="white" />
            PREMIUM GRADE
          </div>
          {product.youtube_url && (
            <button 
              onClick={() => setShowVideo(!showVideo)}
              className="bg-white/90 backdrop-blur p-3 rounded-2xl shadow-lg hover:bg-red-50 text-red-600 transition-all active:scale-95"
            >
              <Play size={20} fill="currentColor" />
            </button>
          )}
        </div>

        <div className="absolute top-6 left-6 flex flex-col gap-3 z-10">
          <button className="bg-white/90 backdrop-blur p-3 rounded-2xl shadow-lg text-slate-400 hover:text-rose-500 transition-all">
            <Heart size={20} />
          </button>
        </div>
      </div>

      {/* --- Content Area --- */}
      <div className="p-8 flex flex-col flex-1 bg-white">
        
        {/* Header & Price */}
        <div className="mb-6">
          <div className="flex justify-between items-start gap-4 mb-2">
            <h1 className="text-2xl font-black text-[#0B2C63] leading-tight tracking-tight">
              {product.product_name}
            </h1>
            <div className="text-2xl font-black text-[#0B2C63] whitespace-nowrap">
              {displayPrice}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SKU: {product.sku}</span>
            <div className="h-1 w-1 rounded-full bg-slate-300" />
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">במלאי (ח. סבן)</span>
          </div>
        </div>

        {/* Tabs Control (Burger/SaaS style) */}
        <div className="flex bg-slate-50 p-1.5 rounded-[22px] mb-8">
          <button 
            onClick={() => setActiveTab("info")}
            className={`flex-1 py-3 rounded-[18px] text-xs font-black transition-all ${activeTab === 'info' ? 'bg-white text-[#0B2C63] shadow-sm' : 'text-slate-400'}`}
          >
            תיאור מוצר
          </button>
          <button 
            onClick={() => setActiveTab("specs")}
            className={`flex-1 py-3 rounded-[18px] text-xs font-black transition-all ${activeTab === 'specs' ? 'bg-white text-[#0B2C63] shadow-sm' : 'text-slate-400'}`}
          >
            מפרט טכני
          </button>
        </div>

        {/* Tabs Content */}
        <div className="flex-1 mb-8 min-h-[120px]">
          {activeTab === "info" ? (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <p className="text-slate-500 text-sm font-bold leading-relaxed">
                {product.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {product.features?.map((f, i) => (
                  <span key={i} className="bg-blue-50 text-[#0B2C63] text-[10px] font-black px-3 py-1.5 rounded-xl border border-blue-100 italic">
                    #{f}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="bg-[#F8FAFC] p-4 rounded-3xl border border-slate-100">
                <div className="flex items-center gap-2 text-blue-500 mb-2">
                  <Clock size={16} />
                  <span className="text-[9px] font-black uppercase">זמן ייבוש</span>
                </div>
                <div className="text-[11px] font-bold text-[#0B2C63]">{product.drying_time || "---"}</div>
              </div>
              <div className="bg-[#F8FAFC] p-4 rounded-3xl border border-slate-100">
                <div className="flex items-center gap-2 text-emerald-500 mb-2">
                  <Maximize2 size={16} />
                  <span className="text-[9px] font-black uppercase">כושר כיסוי</span>
                </div>
                <div className="text-[11px] font-bold text-[#0B2C63]">{product.coverage || "---"}</div>
              </div>
              <div className="col-span-2 bg-[#F8FAFC] p-4 rounded-3xl border border-slate-100 flex items-center gap-4">
                <div className="bg-white p-2.5 rounded-2xl shadow-sm text-amber-500">
                  <Wrench size={20} />
                </div>
                <div>
                  <div className="text-[9px] font-black text-slate-400 uppercase">שיטת יישום מומלצת</div>
                  <div className="text-[11px] font-bold text-[#0B2C63]">{product.application_method || "פנה לייעוץ"}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions Section */}
        <div className="space-y-4">
          <button 
            onClick={() => onConsultAI(product)}
            className="w-full bg-white border-2 border-[#0B2C63]/10 hover:border-[#0B2C63]/30 text-[#0B2C63] py-5 rounded-[24px] font-black text-xs flex items-center justify-center gap-3 transition-all hover:bg-slate-50 group"
          >
            <div className="bg-[#0B2C63] p-1.5 rounded-lg text-white group-hover:scale-110 transition-transform">
              <MessageCircle size={16} />
            </div>
            התייעץ עם סבן AI (חישוב כמויות ויישום)
          </button>
          
          <button 
            onClick={() => onAddToCart(product)}
            className="w-full bg-[#0B2C63] hover:bg-[#08214a] text-white py-6 rounded-[24px] font-black text-sm flex items-center justify-center gap-3 shadow-2xl shadow-blue-900/20 active:scale-[0.98] transition-all"
          >
            <ShoppingCart size={20} />
            הוסף להצעת מחיר למשלוח
          </button>
        </div>
      </div>
    </div>
  );
}
