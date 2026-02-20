'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Send, ShoppingCart, Plus, Moon, Sun, CreditCard, 
  History, MapPin, Trash2, Edit3, Share2, MessageSquare, Loader2 
} from 'lucide-react';
import OrderSidebar from './components/OrderSidebar';

// תמונות פרופיל
const SHAHAR_PROFILE_PIC = "https://media-mrs2-1.cdn.whatsapp.net/v/t61.24694-24/524989315_1073256511118475_7315275522833323073_n.jpg?stp=dst-jpg_s96x96_tt6&ccb=11-4&oh=01_Q5Aa3wEdYEkQedjfHMyKEvUOGoJo1PSvWHB36kS9JNJ-FcMWOg&oe=69A5059E&_nc_sid=5e03e0&_nc_cat=111";
const SABAN_AI_PROFILE_PIC = "https://i.postimg.cc/t4hFSdPm/ai.png";

export default function ShaharUnifiedApp() {
  const router = useRouter();
  
  // --- States הוספת ה-States שהיו חסרים ---
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [cart, setCart] = useState<any[]>([]);
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [projects, setProjects] = useState([
    { id: 1, name: 'אבן יהודה', address: 'האתרוג 44, אבן יהודה' },
    { id: 2, name: 'כפר מונש', address: 'הרימון 5, כפר מונש' }
  ]);
  const [selectedProject, setSelectedProject] = useState(projects[0]);
  const [context, setContext] = useState({ step: 'idle', tempProjectName: '' });
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    addBotMessage(`אהלן שחר אחי, גימני כאן. מוכן להעמיס היום? האתר ב${selectedProject.name} מחכה לסחורה.`);
  }, []);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const addBotMessage = (text: string, products: any[] = []) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        text, 
        sender: 'ai', 
        products, 
        time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) 
      }]);
      setIsTyping(false);
    }, 1000);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now(), text: input, sender: 'user', time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');

    try {
      const res = await fetch('/shahar/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput, context: { ...context, selectedProject } }),
      });
      const data = await res.json();
      if (data.action === 'CREATE_PROJECT') {
        const newP = { id: Date.now(), name: data.projectName, address: data.projectAddress };
        setProjects(prev => [...prev, newP]);
        setSelectedProject(newP);
      }
      if (data.action === 'show_summary') setShowSummary(true);
      addBotMessage(data.reply, data.detectedProducts);
    } catch (e) {
      addBotMessage("אחי, יש לי תקלה קטנה בחיבור למחסן. נסה שוב?");
    }
  };

  const sendToWhatsApp = () => {
    const phone = "972508860896";
    let text = `*מאפליקציית שחר שאול*\nID: 621100\n*פרויקט:* ${selectedProject.name}\n*כתובת:* ${selectedProject.address}\n\n`;
    cart.forEach((item, i) => {
      text += `${i+1}. ${item.qty} יח' - ${item.name} (מק"ט: ${item.sku || '9999'})\n`;
    });
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
    setShowSummary(false);
    setCart([]);
  };

  return (
    <div className={`${isDarkMode ? 'bg-[#0b141a] text-white' : 'bg-[#f0f2f5] text-black'} flex h-screen w-full transition-colors`} dir="rtl">
      
      {/* Sidebar */}
      <div className={`w-80 border-l ${isDarkMode ? 'border-[#202c33] bg-[#111b21]' : 'border-gray-200 bg-white'} hidden lg:flex flex-col`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
             <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full hover:bg-gray-500/10">
                {isDarkMode ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} />}
             </button>
             <img src={SHAHAR_PROFILE_PIC} className="w-10 h-10 rounded-full border-2 border-[#C9A227] bg-[#202c33]" />
          </div>

          <div className="bg-gradient-to-br from-[#C9A227] to-[#8e721b] p-5 rounded-3xl shadow-xl text-black mb-8 relative overflow-hidden group">
            <CreditCard className="absolute -top-4 -left-4 opacity-10 w-32 h-32" />
            <p className="text-[10px] font-black opacity-60">SABAN LOGISTICS VIP</p>
            <p className="text-xl font-black">שחר שאול</p>
            <div className="mt-4 flex justify-between items-end">
               <span className="text-[10px] font-bold">ID: 621100</span>
               <span className="text-xs font-bold">{selectedProject.name}</span>
            </div>
          </div>

          <h3 className="text-xs font-bold text-gray-500 mb-4 px-2 uppercase tracking-widest">פרויקטים פעילים</h3>
          <div className="space-y-2 mb-6">
            {projects.map(p => (
              <div key={p.id} onClick={() => setSelectedProject(p)} className={`p-3 rounded-2xl cursor-pointer border ${selectedProject.id === p.id ? 'bg-[#202c33] border-[#00a884]' : 'border-transparent hover:bg-white/5'}`}>
                <p className="text-sm font-bold">{p.name}</p>
                <p className="text-[10px] text-gray-500 truncate">{p.address}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-6 border-t border-gray-800">
             <button onClick={() => router.push('/shahar/history')} className="w-full p-3 rounded-2xl bg-white/5 flex items-center gap-3 text-sm hover:bg-[#C9A227]/10 transition-all">
                <History size={18} /> היסטוריית הזמנות
             </button>
             <button onClick={() => router.push('/shahar/track')} className="w-full p-3 rounded-2xl bg-white/5 flex items-center gap-3 text-sm hover:bg-[#C9A227]/10 transition-all">
                <MapPin size={18} /> מעקב משלוח
             </button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        <header className={`${isDarkMode ? 'bg-[#202c33]' : 'bg-white shadow-sm'} h-16 px-4 flex items-center justify-between z-10`}>
          <div className="flex items-center gap-3">
             <div className="relative">
                <img src={SABAN_AI_PROFILE_PIC} className="w-10 h-10 rounded-full border border-[#00a884] object-cover" />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a884] border-2 border-[#202c33] rounded-full" />
             </div>
             <div>
               <p className="text-sm font-bold">גימני - יועץ ח.סבן</p>
               <p className="text-[10px] text-[#00a884]">שחר שאול (אבן יהודה)</p>
             </div>
          </div>
          <button onClick={() => setIsOrderOpen(true)} className="relative p-2">
             <ShoppingCart size={22} className={isDarkMode ? 'text-[#aebac1]' : 'text-gray-600'} />
             {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-[#C9A227] text-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black">{cart.length}</span>}
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-black/5">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'ai' ? 'justify-start' : 'justify-end'} items-end gap-2`}>
              {msg.sender === 'ai' && <img src={SABAN_AI_PROFILE_PIC} className="w-6 h-6 rounded-full border border-[#C9A227]/30 mb-1" />}
              <div className={`max-w-[85%] p-4 rounded-2xl shadow-lg ${msg.sender === 'ai' ? (isDarkMode ? 'bg-[#202c33] rounded-tr-none' : 'bg-white') : 'bg-[#005c4b] rounded-tl-none text-white'}`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                {msg.products?.map((p: any) => (
                  <div key={p.sku + Math.random()} className="mt-4 bg-black/30 rounded-2xl border border-[#C9A227]/30 p-3">
                    <div className="flex justify-between items-start mb-2 text-[9px]">
                       <span className={p.sku === '9999' ? 'text-red-400' : 'text-[#C9A227]'}>מק"ט: {p.sku}</span>
                    </div>
                    <p className="text-xs font-bold">{p.name}</p>
                    <button onClick={() => {setCart([...cart, {...p, qty: p.tempQty || 1}]); setIsOrderOpen(true);}} className="w-full mt-3 bg-[#00a884] text-white text-[10px] font-black py-2 rounded-xl">הוסף</button>
                  </div>
                ))}
              </div>
              {msg.sender === 'user' && <img src={SHAHAR_PROFILE_PIC} className="w-6 h-6 rounded-full border border-[#00a884]/30 mb-1" />}
            </div>
          ))}
          {isTyping && <div className="text-[10px] text-gray-500 animate-pulse italic pr-8">גימני מקליד...</div>}
          <div ref={scrollRef} />
        </div>

        <footer className={`p-4 ${isDarkMode ? 'bg-[#202c33]' : 'bg-white border-t'}`}>
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <input value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={(e)=>e.key==='Enter' && handleSend()} placeholder="כתוב הודעה..." className={`flex-1 p-3.5 rounded-2xl text-sm ${isDarkMode ? 'bg-[#2a3942]' : 'bg-gray-100 text-black outline-none'}`} />
            <button onClick={handleSend} className="bg-[#00a884] p-4 rounded-full text-white"><Send size={20} /></button>
          </div>
        </footer>
      </div>

      {showSummary && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4">
           <div className="bg-[#202c33] w-full max-w-sm rounded-[2.5rem] border-2 border-[#C9A227] p-8 text-right">
              <h2 className="text-xl font-black mb-6 text-white text-center">אישור הזמנה</h2>
              <button onClick={sendToWhatsApp} className="w-full py-4 rounded-2xl bg-[#00a884] text-white font-black flex items-center justify-center gap-2">
                 <MessageSquare size={18} /> שלח לקבוצת הוואטסאפ
              </button>
              <button onClick={() => setShowSummary(false)} className="w-full mt-2 py-2 text-xs text-gray-500">ביטול</button>
           </div>
        </div>
      )}

      <OrderSidebar isOpen={isOrderOpen} setIsOpen={setIsOrderOpen} cart={cart} setCart={setCart} />
    </div>
  );
}
