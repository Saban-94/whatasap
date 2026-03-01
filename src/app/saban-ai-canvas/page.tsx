"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Send, Sparkles, ShoppingBag, MessageCircle, 
  Plus, Minus, ShieldCheck, Loader2, Paperclip, 
  Star, Play, Droplets, Maximize2, ShoppingCart, 
  Clock, Wrench, X, Package 
} from "lucide-react";

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
}

interface CartItem { product: Product; quantity: number; }
interface Message { id: string; role: 'user' | 'assistant'; text: string; products?: Product[]; model?: string; }

export default function SabanUnifiedCanvas() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', text: 'שלום ראמי! איזה פרויקט בונים היום?' }
  ]);
  const [input, setInput] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeModel, setActiveModel] = useState<string>("Gemini Flash");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const addToCart = (p: Product) => {
    setCart(prev => {
      const exists = prev.find(item => item.product.sku === p.sku);
      if (exists) return prev.map(item => item.product.sku === p.sku ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { product: p, quantity: 1 }];
    });
  };

  const updateQty = (sku: string, delta: number) => {
    setCart(prev => prev.map(item => 
      item.product.sku === sku ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
    ).filter(item => item.quantity > 0));
  };

  const onConsultAI = (product: Product) => {
    const prompt = `אני רוצה להתייעץ על ${product.product_name} (מק"ט: ${product.sku}). הכיסוי שלו הוא ${product.coverage || 'לפי מפרט'} והייבוש הוא ${product.drying_time || 'לפי מפרט'}. עזור לי לחשב כמויות לשטח שלי ותן טיפ ליישום.`;
    handleSend(prompt);
  };

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
      setMessages(prev => [...prev, { id: 'err', role: 'assistant', text: 'שגיאת תקשורת עם המנוע.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row h-screen overflow-hidden" dir="rtl">
      {/* Sidebar - Cart */}
      <aside className="hidden lg:flex w-[400px] flex-col bg-white border-l p-8 shadow-xl">
        <div className="flex items-center gap-4 mb-8">
          <ShoppingBag className="text-[#0B2C63]" size={32} />
          <h2 className="text-xl font-black text-[#0B2C63]">הסל של סבן</h2>
        </div>
        <div className="flex-1 overflow-y-auto space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-20 text-slate-300">
              <Package size={48} className="mx-auto mb-4 opacity-20" />
              <p>העגלה ריקה</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product.sku} className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                <div className="font-bold text-xs text-[#0B2C63] mb-2">{item.product.product_name}</div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 bg-white rounded-xl p-1 shadow-sm">
                    <button onClick={() => updateQty(item.product.sku, -1)}><Minus size={14}/></button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <button onClick={() => updateQty(item.product.sku, 1)}><Plus size={14}/></button>
                  </div>
                  <span className="font-black text-sm">₪{item.product.price * item.quantity}</span>
                </div>
              </div>
            ))
          )}
        </div>
        <button 
          onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(cart.map(i => `${i.product.product_name} x${i.quantity}`).join('\n'))}`)}
          className="w-full bg-[#25D366] text-white py-5 rounded-[22px] font-bold mt-6 shadow-lg"
        >
          שלח הזמנה לוואטסאפ
        </button>
      </aside>

      {/* Main Chat Canvas */}
      <main className="flex-1 flex flex-col relative bg-slate-50">
        <header className="p-6 bg-white border-b flex justify-between items-center">
          <div className="flex items-center gap-3">
             <Sparkles className="text-[#0B2C63]" />
             <h1 className="text-xl font-black text-[#0B2C63]">Saban AI Canvas</h1>
          </div>
          <span className="text-[10px] bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold">
            <ShieldCheck size={12} className="inline ml-1"/> {activeModel}
          </span>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 pb-32">
          {messages.map(m => (
            <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[80%] p-5 rounded-[28px] font-bold shadow-sm ${m.role === 'user' ? 'bg-[#0B2C63] text-white' : 'bg-white text-slate-800'}`}>
                {m.text}
              </div>
              {m.products && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 w-full max-w-4xl">
                  {m.products.map(p => (
                    <ProductCard key={p.sku} product={p} onAdd={addToCart} onConsult={onConsultAI} />
                  ))}
                </div>
              )}
            </div>
          ))}
          {loading && <Loader2 className="animate-spin text-blue-600" />}
        </div>

        <div className="absolute bottom-6 w-full px-6">
          <div className="max-w-4xl mx-auto flex items-center bg-white border shadow-2xl rounded-[30px] p-2">
            <input 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 p-4 outline-none font-bold"
              placeholder="שאל את סבן על מוצרים וחישובים..."
            />
            <button onClick={() => handleSend()} className="bg-[#0B2C63] text-white p-4 rounded-[25px]">
              <Send size={20} className="transform -rotate-45" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function ProductCard({ product, onAdd, onConsult }: { product: Product, onAdd: any, onConsult: any }) {
  const [tab, setTab] = useState('info');
  return (
    <div className="bg-white rounded-[35px] shadow-md border overflow-hidden flex flex-col transition-all hover:shadow-xl">
      <div className="h-48 bg-slate-100 flex items-center justify-center p-4">
        {product.image_url ? <img src={product.image_url} alt="" className="max-h-full object-contain mix-blend-multiply" /> : <Package size={40} className="text-slate-300"/>}
      </div>
      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-black text-[#0B2C63] mb-4 h-12 overflow-hidden">{product.product_name}</h3>
        <div className="flex bg-slate-50 p-1 rounded-xl mb-4 text-[10px] font-bold">
          <button onClick={() => setTab('info')} className={`flex-1 py-1 rounded-lg ${tab === 'info' ? 'bg-white shadow-sm' : ''}`}>מידע</button>
          <button onClick={() => setTab('specs')} className={`flex-1 py-1 rounded-lg ${tab === 'specs' ? 'bg-white shadow-sm' : ''}`}>מפרט</button>
        </div>
        <div className="text-[11px] font-bold text-slate-500 mb-6 flex-1">
          {tab === 'info' ? product.description : (
            <div className="space-y-2">
              <div>📏 כיסוי: {product.coverage || 'לפי פרויקט'}</div>
              <div>⏳ ייבוש: {product.drying_time || '24 שעות'}</div>
            </div>
          )}
        </div>
        <div className="space-y-2 mt-auto">
          <button onClick={() => onConsult(product)} className="w-full bg-slate-50 text-[#0B2C63] py-3 rounded-xl text-[10px] font-black flex items-center justify-center gap-2 border">
            <MessageCircle size={14}/> התייעץ וחשב כמויות
          </button>
          <button onClick={() => onAdd(product)} className="w-full bg-[#0B2C63] text-white py-3 rounded-xl text-[10px] font-black flex items-center justify-center gap-2">
            <ShoppingCart size={14}/> הוסף להזמנה
          </button>
        </div>
      </div>
    </div>
  );
}
