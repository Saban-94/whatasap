'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Send, HardHat, Camera, FileUp, ShoppingCart, Play, CheckCircle2, Info } from 'lucide-react';

// קומפוננטת כרטיס מוצר הנדסי
const ProductCard = ({ product, onOrder }: { product: any, onOrder: (name: string) => void }) => (
  <div className="mt-4 bg-[#162127] rounded-2xl overflow-hidden border border-gray-700 shadow-2xl animate-in zoom-in-95 duration-500 max-w-sm ml-auto">
    <div className="relative h-48 group">
      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
      <div className="absolute top-3 left-3 bg-[#C9A227] text-black text-[10px] font-black px-2 py-1 rounded-md shadow-lg uppercase">
        {product.category}
      </div>
    </div>
    
    <div className="p-5 space-y-4">
      <div>
        <h4 className="text-[#C9A227] font-black text-xl tracking-tighter leading-none">{product.name}</h4>
        <p className="text-gray-400 text-xs mt-2 leading-relaxed">{product.description}</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[#202c33] p-2.5 rounded-xl border border-gray-800">
          <span className="text-[9px] text-gray-500 block font-bold uppercase mb-1">שיטת יישום</span>
          <span className="text-xs font-bold text-gray-200">{product.application_method}</span>
        </div>
        <div className="bg-[#202c33] p-2.5 rounded-xl border border-gray-800">
          <span className="text-[9px] text-gray-500 block font-bold uppercase mb-1">אריזה</span>
          <span className="text-xs font-bold text-gray-200">{product.unit}</span>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button 
          onClick={() => onOrder(product.name)}
          className="flex-1 bg-[#C9A227] text-black font-black py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#e0b52d] active:scale-95 transition-all text-sm shadow-lg"
        >
          <ShoppingCart size={18} /> בצע הזמנה
        </button>
        {product.video_url !== "N/A" && (
          <a href={product.video_url} target="_blank" className="w-12 flex items-center justify-center bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors">
            <Play size={20} fill="currentColor" />
          </a>
        )}
      </div>
    </div>
  </div>
);

export default function CustomerAiPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'שלום רמי אחי! המערכת עודכנה ב-53 מוצרי סיקה. צלם לי את הסדק או העלה מפרט, ואני אגיד לך בדיוק מה להזמין.', product: null }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleOrder = (productName: string) => {
    setMessages(prev => [...prev, { role: 'assistant', content: `אחלה, רשמתי הזמנה עבור **${productName}**. מועבר לטיפול מחסן ח. סבן. ✅`, product: null }]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMessages(prev => [...prev, { role: 'user', content: `העליתי קובץ/צילום: ${file.name} - תנתח לי איזה מוצר מתאים לטיפול.`, product: null }]);
      // כאן תבוא לוגיקת ה-Vision של ג'ימיני לזיהוי התמונה
      setIsThinking(true);
      setTimeout(() => {
        setIsThinking(false);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'מניתוח הצילום ששלחת, אני מזהה שמדובר בסדק מבני בבטון. המוצר המומלץ לטיפול הוא **Sikadur 52** להזרקה או **Sika Monotop 412** לשיקום.',
          product: { id: 29, name: "Sikadur 52", category: "אפוקסי", description: "שרף אפוקסי נוזלי להזרקה לאיטום סדקים.", application_method: "הזרקה בלחץ", unit: "ערכת 3 ק\"ג", image_url: "https://saban.co.il/placeholder.jpg", video_url: "N/A" }
        }]);
      }, 2000);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;
    setMessages(prev => [...prev, { role: 'user', content: input, product: null }]);
    setInput('');
    setIsThinking(true);
    // סימולציה של תשובה
    setTimeout(() => { setIsThinking(false); }, 1500);
  };

  return (
    <div className="flex flex-col h-screen bg-[#0b141a] text-right" dir="rtl">
      {/* Header */}
      <div className="bg-[#202c33] p-4 flex items-center justify-between border-b border-gray-700 shadow-2xl z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#C9A227] rounded-full flex items-center justify-center text-black font-black text-xl border-2 border-yellow-600 shadow-inner">ח</div>
          <div>
            <h1 className="font-bold text-white text-base">ח. סבן - Intelligence</h1>
            <p className="text-[9px] text-green-500 font-black tracking-widest uppercase">VIP Engineering Support</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcd2de8.png')] bg-repeat opacity-95 scroll-smooth">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-start' : 'items-end'} animate-in fade-in slide-in-from-bottom-2`}>
            <div className={`p-4 rounded-2xl shadow-xl max-w-[85%] ${m.role === 'user' ? 'bg-[#005c4b] text-white rounded-tl-none border-r-4 border-[#C9A227]' : 'bg-[#202c33] text-white rounded-tr-none border border-gray-700'}`}>
              <div className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">{m.content}</div>
            </div>
            {m.product && <ProductCard product={m.product} onOrder={handleOrder} />}
          </div>
        ))}
        {isThinking && <div className="flex justify-end p-2 animate-pulse text-[10px] text-gray-500 font-bold italic">ג'ימיני מנתח מפרטים טכניים...</div>}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[#202c33] border-t border-gray-700 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/*,.pdf" />
          
          <button onClick={() => fileInputRef.current?.click()} className="p-3 text-gray-400 hover:text-[#C9A227] transition-colors"><FileUp size={24} /></button>
          <button onClick={() => fileInputRef.current?.click()} className="p-3 text-gray-400 hover:text-[#C9A227] transition-colors md:hidden"><Camera size={24} /></button>

          <input 
            value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="תאר את הבעיה או שלח צילום..." 
            className="flex-1 p-4 rounded-2xl bg-[#2a3942] text-white outline-none border border-transparent focus:border-[#C9A227] transition-all" 
          />
          <button onClick={handleSend} className="bg-[#C9A227] p-4 rounded-2xl text-black hover:bg-[#e0b52d] shadow-lg transition-all"><Send size={24} /></button>
        </div>
      </div>
    </div>
  );
}
