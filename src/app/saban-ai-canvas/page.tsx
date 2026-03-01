"use client"

import React, { useState, useEffect, useRef } from "react"
import { 
  Send, Sparkles, ShoppingBag, MessageCircle, 
  Plus, Minus, Trash2, Package, Search, Database, 
  ShieldCheck, Loader2, Paperclip 
} from "lucide-react"

// --- Types ---
type Product = { sku: string; name: string; category: string; price: number; image_url?: string };
type CartItem = { product: Product; quantity: number };
type Message = { id: string; role: 'user' | 'assistant'; text: string; products?: Product[]; model?: string };

export default function SabanAICanvas() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', text: 'שלום ראמי! אני יועץ ה-AI של סבן. איך אוכל לעזור במלאי היום?' }
  ]);
  const [input, setInput] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeModel, setActiveModel] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  // --- Logic: Add to Cart ---
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
    ));
  };

  const removeFromCart = (sku: string) => setCart(prev => prev.filter(item => item.product.sku !== sku));

  const totalCart = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  // --- Logic: API Call ---
  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
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
      setMessages(prev => [...prev, { id: 'err', role: 'assistant', text: 'מצטער, יש תקלה בחיבור למערכת.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row h-screen overflow-hidden" dir="rtl">
      
      {/* LEFT: MISHLOACH CART (Desktop) */}
      <aside className="hidden lg:flex w-[400px] flex-col bg-white border-l border-slate-100 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-8 border-b pb-4">
          <div className="bg-[#0B2C63] p-3 rounded-2xl shadow-lg">
            <ShoppingBag className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#0B2C63]">Mishloach Cart</h2>
            <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">סל הזמנה פעיל</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-20 text-slate-300 font-bold italic">העגלה ריקה...</div>
          ) : (
            cart.map((item) => (
              <div key={item.product.sku} className="bg-slate-50 p-4 rounded-3xl border border-slate-100 group">
                <div className="font-bold text-[#0B2C63] text-sm mb-1">{item.product.name}</div>
                <div className="text-[10px] text-slate-400 font-mono mb-3 uppercase">SKU: {item.product.sku}</div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 bg-white rounded-xl p-1 border">
                    <button onClick={() => updateQty(item.product.sku, -1)} className="p-1 hover:text-blue-600"><Minus size={14}/></button>
                    <span className="w-6 text-center font-black text-xs">{item.quantity}</span>
                    <button onClick={() => updateQty(item.product.sku, 1)} className="p-1 hover:text-blue-600"><Plus size={14}/></button>
                  </div>
                  <div className="font-black text-[#0B2C63]">₪{item.product.price * item.quantity}</div>
                  <button onClick={() => removeFromCart(item.product.sku)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-6 border-t mt-4 space-y-4">
          <div className="flex justify-between items-center px-2">
            <span className="font-bold text-slate-400 uppercase text-[11px]">סה"כ משוער</span>
            <span className="text-2xl font-black text-[#0B2C63]">₪{totalCart}</span>
          </div>
          <button 
            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`שלום סבן, אשמח להזמין:\n${cart.map(i => `${i.product.name} x${i.quantity}`).join('\n')}`)}`)}
            disabled={cart.length === 0}
            className="w-full bg-[#25D366] text-white py-5 rounded-[24px] font-black flex items-center justify-center gap-2 shadow-xl shadow-green-100 hover:scale-[1.02] transition-transform disabled:opacity-50"
          >
            <MessageCircle size={20} />
            בצע הזמנה בוואטסאפ
          </button>
        </div>
      </aside>

      {/* RIGHT: AI CANVAS CHAT */}
      <main className="flex-1 flex flex-col relative bg-white lg:bg-transparent">
        
        {/* Header Area */}
        <header className="p-6 flex justify-between items-center bg-white lg:bg-transparent border-b lg:border-none z-10">
          <div className="flex items-center gap-4">
            <div className="bg-[#0B2C63] p-3 rounded-2xl shadow-xl">
              <Sparkles className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black text-[#0B2C63]">Saban AI Canvas</h1>
              <div className="flex items-center gap-2 mt-1">
                {activeModel && <span className="text-[9px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-black border border-green-100 uppercase tracking-tighter flex items-center gap-1"><ShieldCheck size={10}/> {activeModel}</span>}
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[2px]">Consulting Engine</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="hidden md:flex bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm items-center gap-2">
               <Database className="text-slate-300" size={16} />
               <span className="text-[10px] font-black text-slate-500">SUPABASE LIVE</span>
             </div>
          </div>
        </header>

        {/* Chat Stream */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth pb-32">
          {messages.map((m) => (
            <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} space-y-4`}>
              <div className={`max-w-[85%] lg:max-w-[70%] p-5 rounded-[30px] font-bold shadow-sm leading-relaxed ${
                m.role === 'user' ? 'bg-[#0B2C63] text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-50 rounded-tl-none shadow-lovable'
              }`}>
                {m.text}
              </div>

              {/* Display Product Cards if any */}
              {m.products && m.products.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-[600px] animate-in zoom-in-95 duration-300">
                  {m.products.map((p) => (
                    <div key={p.sku} className="bg-white p-5 rounded-[32px] shadow-2xl border border-blue-50 flex flex-col group overflow-hidden relative">
                      {p.image_url && <img src={p.image_url} alt={p.name} className="w-full h-32 object-contain mb-4 rounded-2xl bg-slate-50 p-2" />}
                      <h4 className="font-black text-[#0B2C63] text-md mb-1">{p.name}</h4>
                      <div className="text-[10px] font-black text-slate-400 mb-4 uppercase tracking-widest">SKU: {p.sku}</div>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="text-xl font-black text-[#0B2C63]">
                          {p.price > 0 ? `₪${p.price}` : <span className="text-blue-500 text-xs">הצעת מחיר</span>}
                        </div>
                        <button 
                          onClick={() => addToCart(p)}
                          className="bg-[#0B2C63] text-white p-3 rounded-[20px] shadow-lg shadow-blue-900/10 hover:scale-110 transition-transform"
                        >
                          <Plus size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {loading && <div className="text-[10px] font-black text-blue-600 animate-pulse uppercase tracking-[3px]">Saban AI Thinking...</div>}
        </div>

        {/* Floating Input Area */}
        <footer className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-white via-white to-transparent lg:bg-transparent">
          <div className="max-w-3xl mx-auto flex items-center bg-white border border-slate-100 shadow-2xl rounded-[32px] p-2 pr-6">
            <button className="p-3 text-slate-300 hover:text-blue-600 transition-colors"><Paperclip size={20}/></button>
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-transparent outline-none font-bold text-slate-700 py-4 px-2"
              placeholder="חפש מוצר או התייעץ איתי..."
            />
            <button 
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-[#0B2C63] h-14 w-14 rounded-[26px] flex items-center justify-center hover:bg-blue-900 transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
            >
              <Send className="text-white" size={22} />
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}
