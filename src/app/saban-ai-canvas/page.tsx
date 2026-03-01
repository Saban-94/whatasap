"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Send, Sparkles, ShoppingBag, MessageCircle, 
  Plus, Minus, Trash2, Database, ShieldCheck, 
  Loader2, Paperclip, Star, Play, Droplets, Maximize2, 
  CheckCircle2, ShoppingCart, Clock, Wrench, X, Package // <--- הוספנו את Package כאן
} from "lucide-react";

// --- Types ---
interface Product {
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
}

interface CartItem { product: Product; quantity: number; }
interface Message { id: string; role: 'user' | 'assistant'; text: string; products?: Product[]; model?: string; }

export default function SabanUnifiedCanvas() {
  // --- States ---
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', text: 'שלום ראמי! אני המומחה הטכני של סבן. איזה פרויקט בונים היום?' }
  ]);
  const [input, setInput] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeModel, setActiveModel] = useState<string>("Gemini 3.1 Flash");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  // --- Cart Logic ---
  const addToCart = (p: Product) => {
    setCart(prev => {
      const exists = prev.find(item => item.product.sku === p.sku);
      if (exists) return prev.map(item => item.product.sku === p.sku ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { product: p, quantity: 1 }];
    });
  };

  const updateQty = (sku: string, delta: number) => {
    setCart(prev => prev.map(item => 
      item.product.sku === sku ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ).filter(item => item.quantity > 0));
  };

  const totalCart = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  // --- Intelligent Consultation Logic ---
  const onConsultAI = (product: Product) => {
    const consultPrompt = `אני רוצה להתייעץ איתך על ${product.product_name} (מק"ט: ${product.sku}). 
    הבנתי שכושר הכיסוי שלו הוא ${product.coverage || 'לא צוין'} וזמן הייבוש הוא ${product.drying_time || 'לא צוין'}. 
    תוכל לעזור לי לחשב כמה שקים אני צריך לשטח שלי ולתת לי טיפ זהב ליישום נכון?`;
    
    // שליחה אוטומטית
    handleSend(consultPrompt);
  };

  // --- API Communication ---
  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    if (!overrideText) setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg] })
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, { 
        id: (Date.now()+1).toString(), 
        role: 'assistant', 
        text: data.text, 
        products: data.products,
        model: data.activeModel
      }]);
      if (data.activeModel) setActiveModel(data.activeModel);
    } catch (e) {
      setMessages(prev => [...prev, { id: 'err', role: 'assistant', text: 'אחי, יש תקלה בסנכרון. בדוק חיבור אינטרנט או מפתחות.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row h-screen overflow-hidden font-sans" dir="rtl">
      
      {/* --- LEFT SIDE: PREMIUM MISHLOACH CART --- */}
      <aside className="hidden lg:flex w-[420px] flex-col bg-white border-l border-slate-100 p-8 shadow-2xl z-20">
        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-50">
          <div className="bg-[#0B2C63] p-4 rounded-[22px] shadow-blue-900/20 shadow-xl text-white">
            <ShoppingBag size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#0B2C63] tracking-tight">Mishloach Cart</h2>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[2px]">סל הזמנה אישי</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-60 italic">
              <Package size={48} className="mb-4 opacity-20" />
              <p className="font-bold">העגלה מחכה למוצרים שלך...</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.sku} className="bg-slate-50 p-5 rounded-[32px] border border-slate-100 group transition-all hover:bg-white hover:shadow-xl">
                <div className="flex justify-between items-start mb-3">
                  <div className="font-black text-[#0B2C63] text-sm leading-tight">{item.product.name}</div>
                  <button onClick={() => updateQty(item.product.sku, -item.quantity)} className="text-slate-300 hover:text-red-500"><X size={16}/></button>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2 bg-white rounded-2xl p-1.5 border border-slate-100 shadow-sm">
                    <button onClick={() => updateQty(item.product.sku, -1)} className="p-1.5 hover:text-blue-600 transition-colors"><Minus size={14}/></button>
                    <span className="w-8 text-center font-black text-sm text-[#0B2C63]">{item.quantity}</span>
                    <button onClick={() => updateQty(item.product.sku, 1)} className="p-1.5 hover:text-blue-600 transition-colors"><Plus size={14}/></button>
                  </div>
                  <div className="font-black text-[#0B2C63] text-lg">₪{item.product.price * item.quantity}</div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-8 border-t border-slate-50 mt-6 space-y-5">
          <div className="flex justify-between items-center px-2">
            <span className="font-bold text-slate-400 text-xs uppercase tracking-widest">סה"כ לתשלום</span>
            <span className="text-3xl font-black text-[#0B2C63]">₪{totalCart}</span>
          </div>
          <button 
            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`שלום סבן, אשמח להזמין:\n${cart.map(i => `${i.product.name} x${i.quantity}`).join('\n')}`)}`)}
            disabled={cart.length === 0}
            className="w-full bg-[#25D366] text-white py-6 rounded-[28px] font-black text-sm flex items-center justify-center gap-3 shadow-2xl shadow-green-200 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
          >
            <MessageCircle size={22} />
            שלח הזמנה לוואטסאפ
          </button>
        </div>
      </aside>

      {/* --- RIGHT SIDE: AI CONVERSATION CANVAS --- */}
      <main className="flex-1 flex flex-col relative bg-white lg:bg-[#F8FAFC]">
        
        {/* Unified Header */}
        <header className="p-6 lg:p-10 flex justify-between items-center z-10 bg-white/80 backdrop-blur-md lg:bg-transparent sticky top-0">
          <div className="flex items-center gap-5">
            <div className="bg-[#0B2C63] p-4 rounded-[24px] shadow-2xl shadow-blue-900/30 text-white">
              <Sparkles size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#0B2C63] tracking-tight">Saban AI Canvas</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1.5 text-[10px] bg-green-50 text-green-600 px-3 py-1 rounded-full font-black border border-green-100 uppercase tracking-tighter">
                  <ShieldCheck size={12}/> {activeModel}
                </span>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[3px]">Expert Mode</span>
              </div>
            </div>
          </div>
        </header>

        {/* Chat Content */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 lg:p-12 space-y-10 scroll-smooth pb-40">
          {messages.map((m) => (
            <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500`}>
              {/* Message Bubble */}
              <div className={`max-w-[90%] lg:max-w-[75%] p-6 rounded-[35px] font-bold shadow-sm text-md leading-relaxed ${
                m.role === 'user' ? 'bg-[#0B2C63] text-white rounded-tr-none shadow-blue-900/10' : 'bg-white text-slate-800 border border-slate-50 rounded-tl-none shadow-lovable'
              }`}>
                {m.text}
              </div>

              {/* Intelligent Product Cards Grid */}
              {m.products && m.products.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-[850px]">
                  {m.products.map((p) => (
                    <ProductCardUI key={p.sku} product={p} onAddToCart={addToCart} onConsult={onConsultAI} />
                  ))}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-3 text-blue-600 font-black text-[10px] uppercase tracking-[4px] animate-pulse">
              <Loader2 className="animate-spin" size={14} />
              Saban AI is processing...
            </div>
          )}
        </div>

        {/* Sticky Input Bar */}
        <footer className="absolute bottom-0 w-full p-6 lg:p-10 bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC] to-transparent lg:from-transparent">
          <div className="max-w-4xl mx-auto flex items-center bg-white border border-slate-100 shadow-[0_30px_100px_rgba(0,0,0,0.1)] rounded-[35px] p-2 pr-8 transition-all focus-within:border-blue-200">
            <button className="p-4 text-slate-300 hover:text-[#0B2C63] transition-colors"><Paperclip size={22}/></button>
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-transparent outline-none font-bold text-slate-700 py-5 px-3 text-lg placeholder:text-slate-300"
              placeholder="חפש מוצר או שאל שאלה טכנית..."
            />
            <button 
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="bg-[#0B2C63] h-16 w-16 rounded-[28px] flex items-center justify-center hover:bg-blue-900 transition-all shadow-xl shadow-blue-900/30 active:scale-90 disabled:opacity-20"
            >
              <Send className="text-white transform -rotate-45 -translate-y-0.5 translate-x-0.5" size={24} />
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}

// --- SUB-COMPONENT: PREMIUM PRODUCT CARD ---
function ProductCardUI({ product, onAddToCart, onConsult }: { product: Product, onAddToCart: any, onConsult: any }) {
  const [tab, setTab] = useState<"info" | "specs">("info");
  const [showVideo, setShowVideo] = useState(false);

  return (
    <div className="bg-white rounded-[45px] shadow-lovable border border-slate-50 overflow-hidden flex flex-col group transition-all hover:shadow-2xl">
      {/* Media View */}
      <div className="relative h-72 bg-[#F1F5F9] overflow-hidden">
        {showVideo && product.youtube_url ? (
          <iframe className="w-full h-full" src={product.youtube_url.replace("watch?v=", "embed/")} frameBorder="0" allowFullScreen />
        ) : (
          <img src={product.image_url} alt={product.product_name} className="w-full h-full object-contain p-10 group-hover:scale-110 transition-transform duration-1000" />
        )}
        
        <div className="absolute top-6 right-6 flex flex-col gap-3">
          <div className="bg-[#0B2C63] text-white text-[9px] font-black px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 uppercase tracking-tighter"><Star size={10} fill="white"/> Premium</div>
          {product.youtube_url && (
            <button onClick={() => setShowVideo(!showVideo)} className="bg-white p-3 rounded-2xl shadow-lg text-red-600 hover:bg-red-50 transition-all"><Play size={18} fill="currentColor"/></button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-8 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-xl font-black text-[#0B2C63] leading-tight max-w-[180px]">{product.product_name}</h3>
          <div className="text-xl font-black text-[#0B2C63] bg-slate-50 px-4 py-2 rounded-2xl">₪{product.price || "---"}</div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-50 p-1 rounded-2xl mb-6">
          <button onClick={() => setTab("info")} className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all ${tab === 'info' ? 'bg-white text-[#0B2C63] shadow-sm' : 'text-slate-400'}`}>מידע</button>
          <button onClick={() => setTab("specs")} className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all ${tab === 'specs' ? 'bg-white text-[#0B2C63] shadow-sm' : 'text-slate-400'}`}>מפרט טכני</button>
        </div>

        <div className="flex-1 min-h-[80px]">
          {tab === 'info' ? (
             <p className="text-slate-500 text-[11px] font-bold leading-relaxed line-clamp-3">{product.description}</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100/50 flex flex-col">
                <span className="text-[8px] text-slate-400 font-black uppercase mb-1">זמן ייבוש</span>
                <span className="text-[10px] font-bold text-[#0B2C63]">{product.drying_time || "---"}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100/50 flex flex-col">
                <span className="text-[8px] text-slate-400 font-black uppercase mb-1">כושר כיסוי</span>
                <span className="text-[10px] font-bold text-[#0B2C63]">{product.coverage || "---"}</span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-8 space-y-3">
          <button 
            onClick={() => onConsult(product)}
            className="w-full bg-white border-2 border-slate-100 text-[#0B2C63] py-4 rounded-[22px] font-black text-[11px] flex items-center justify-center gap-2 hover:bg-slate-50 transition-all active:scale-95"
          >
            <MessageCircle size={16} /> התייעץ על יישום וחישוב
          </button>
          <button 
            onClick={() => onAddToCart(product)}
            className="w-full bg-[#0B2C63] text-white py-5 rounded-[22px] font-black text-xs flex items-center justify-center gap-2 shadow-xl shadow-blue-900/20 hover:bg-blue-900 transition-all active:scale-95"
          >
            <ShoppingCart size={18} /> הוסף להצעת מחיר
          </button>
        </div>
      </div>
    </div>
  );
}
