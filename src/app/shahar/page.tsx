'use client';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, ShoppingCart, Moon, Sun, History, MapPin, 
  Loader2, Sparkles, BrainCircuit, CheckCircle2, FileText 
} from 'lucide-react';
import OrderSidebar from './components/OrderSidebar';

const SHAHAR_PROFILE_PIC = "https://api.dicebear.com/7.x/pixel-art/svg?seed=ShaharShaul";
const SABAN_AI_PROFILE_PIC = "https://media-mrs2-1.cdn.whatsapp.net/v/t61.24694-24/524989315_1073256511118475_7315275522833323073_n.jpg?ccb=11-4&oh=01_Q5Aa3wFxRPXggH-pzRFes-D1aIk6klzJrTv9Ks5RbOrhtvKfvQ&oe=69A5059E&_nc_sid=5e03e0&_nc_cat=111";

export default function ShaharHyperApp() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [cart, setCart] = useState<any[]>([]);
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  
  const [projects] = useState([
    { id: 1, name: 'אבן יהודה', address: 'האתרוג 44, אבן יהודה' },
    { id: 2, name: 'כפר מונש', address: 'הרימון 5, כפר מונש' }
  ]);
  const [selectedProject] = useState(projects[0]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedChat = localStorage.getItem('shahar_chat_v3');
    if (savedChat) {
      setMessages(JSON.parse(savedChat));
    } else {
      setTimeout(() => {
        addBotMessage(`אהלן שחר אחי, גימני כאן. מוכן להעמיס היום? האתר ב${selectedProject.name} מחכה לסחורה. 🏗️`);
      }, 1000);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('shahar_chat_v3', JSON.stringify(messages));
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addBotMessage = (text: string, products: any[] = []) => {
    setIsThinking(false);
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: Date.now(), text, sender: 'ai', products, 
        time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) 
      }]);
      setIsTyping(false);
    }, 1500);
  };

  // --- פונקציית שליחת הזמנה לוואטסאפ וסיכום ---
  const handleFinalOrder = () => {
    if (cart.length === 0) return alert("שחר אחי, הסל ריק. מה נשלח?");

    const now = new Date();
    const dateStr = now.toLocaleDateString('he-IL');
    const timeStr = now.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
    const totalItems = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
    
    // זיהוי דרישת הובלה מהשיחה
    const needsCrane = messages.some(m => m.text.includes('מנוף'));

    let msg = `*הזמנה חדשה - ח.סבן לוגיסטיקה*\n`;
    msg += `━━━━━━━━━━━━━━━━━━\n`;
    msg += `👤 *לקוח:* שחר שאול (ID: 621100)\n`;
    msg += `🏗️ *פרויקט:* ${selectedProject.name}\n`;
    msg += `📍 *כתובת:* ${selectedProject.address}\n`;
    msg += `🚛 *סוג פריקה:* ${needsCrane ? 'הובלת מנוף 🏗️' : 'פריקה ידנית 🚚'}\n`;
    msg += `⏰ *מועד יצירה:* ${dateStr} | ${timeStr}\n`;
    msg += `━━━━━━━━━━━━━━━━━━\n\n`;
    msg += `*רשימת מוצרים מהמלאי:*\n`;

    cart.forEach((item, i) => {
      msg += `${i + 1}. *${item.name}*\n   📦 מק"ט: ${item.sku} | כמות: ${item.qty || 1}\n`;
    });

    msg += `\n━━━━━━━━━━━━━━━━━━\n`;
    msg += `📊 *סה"כ מוצרים:* ${totalItems}\n`;
    msg += `✅ *סטטוס:* נשלח לחמ"ל הזמנות\n`;
    msg += `🤖 *עובד ע"י גימני AI*\n`;

    // שליחה לקבוצת הווטסאפ
    const whatsappLink = `https://wa.me/972508860896?text=${encodeURIComponent(msg)}`;
    window.open(whatsappLink, '_blank');

    // שמירה ל-Firebase (סימולציה)
    console.log("Saving to Firebase...", { customer: "621100", cart, needsCrane });
    
    addBotMessage("אש עליך שחר! ההזמנה נשלחה לקבוצה ונרשמה במערכת. הנהג יקבל התראה בנייד שלו עוד רגע. רוצה להדפיס PDF?");
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now(), text: input, sender: 'user', time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setIsThinking(true);

    try {
      const res = await fetch('/shahar/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput, context: { selectedProject } }),
      });
      const data = await res.json();
      addBotMessage(data.reply, data.detectedProducts);
      if (data.detectedProducts) {
          setCart(prev => [...prev, ...data.detectedProducts.map((p:any) => ({...p, qty: 1}))]);
      }
    } catch (e) {
      setIsThinking(false);
      addBotMessage("שחר אחי, יש תקלה בחיבור לשרת. תנסה שוב?");
    }
  };

  return (
    <div className={`${isDarkMode ? 'bg-[#0b141a] text-white' : 'bg-[#f0f2f5] text-black'} flex h-screen w-full font-sans overflow-hidden`} dir="rtl">
      
      {/* Sidebar */}
      <div className={`w-80 border-l ${isDarkMode ? 'border-[#202c33] bg-[#111b21]' : 'border-gray-200 bg-white'} hidden lg:flex flex-col`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
             <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full hover:bg-white/5 transition-all">
                {isDarkMode ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} />}
             </button>
             <img src={SHAHAR_PROFILE_PIC} className="w-10 h-10 rounded-full border-2 border-[#C9A227]" />
          </div>

          <div className="bg-gradient-to-br from-[#C9A227] to-[#8e721b] p-6 rounded-[2rem] text-black mb-8 relative">
            <BrainCircuit className="absolute -top-2 -left-2 opacity-10 w-20 h-20" />
            <h2 className="text-2xl font-black">שחר שאול</h2>
            <p className="text-[10px] font-bold opacity-70">לקוח VIP #621100</p>
          </div>

          <div className="space-y-2">
            <button className="w-full p-4 rounded-2xl bg-white/5 flex items-center gap-3 text-sm hover:bg-[#C9A227]/10 transition-all">
                <History size={18} /> הזמנות קודמות
            </button>
            <button className="w-full p-4 rounded-2xl bg-[#00a884] text-white flex items-center justify-center gap-3 text-sm font-bold shadow-lg" onClick={handleFinalOrder}>
                <CheckCircle2 size={18} /> שלח הזמנה לחמ"ל
            </button>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col relative">
        <header className={`${isDarkMode ? 'bg-[#202c33]/90' : 'bg-white/90'} backdrop-blur-md h-16 px-6 flex items-center justify-between z-20`}>
          <div className="flex items-center gap-4">
             <img src={SABAN_AI_PROFILE_PIC} className="w-10 h-10 rounded-full border-2 border-[#00a884]" />
             <div className="text-right">
               <p className="text-sm font-black text-right">גימני - יועץ ח.סבן</p>
               <span className="text-[10px] text-[#00a884] font-bold">מחובר למלאי בזמן אמת</span>
             </div>
          </div>
          <button onClick={() => setIsOrderOpen(true)} className="relative p-2 bg-white/5 rounded-full">
             <ShoppingCart size={22} />
             {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-[#C9A227] text-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">{cart.length}</span>}
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'ai' ? 'justify-start' : 'justify-end'} items-end gap-3`}>
              <div className={`max-w-[85%] p-4 rounded-[1.5rem] shadow-sm ${msg.sender === 'ai' ? (isDarkMode ? 'bg-[#202c33] rounded-tr-none' : 'bg-white') : 'bg-[#005c4b] rounded-tl-none text-white'}`}>
                <p className="text-sm text-right leading-relaxed">{msg.text}</p>
                {msg.products?.map((p: any) => (
                  <div key={p.sku} className="mt-3 bg-black/20 p-3 rounded-xl border border-[#C9A227]/20 flex justify-between items-center">
                    <span className="text-[10px] font-bold">מק"ט: {p.sku}</span>
                    <span className="text-xs font-black">{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {isThinking && <div className="flex justify-start"><div className="bg-[#202c33] px-4 py-2 rounded-xl text-xs flex items-center gap-2"><Loader2 className="animate-spin" size={14} /> גימני חושב...</div></div>}
          {isTyping && <div className="flex justify-start"><div className="bg-[#202c33] p-3 rounded-xl flex gap-1"><div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" /><div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-100" /></div></div>}
          <div ref={scrollRef} />
        </div>

        <footer className={`p-4 ${isDarkMode ? 'bg-[#202c33]' : 'bg-white border-t'}`}>
          <div className="max-w-4xl mx-auto flex gap-3">
            <input 
              value={input} onChange={(e)=>setInput(e.target.value)} 
              onKeyDown={(e)=>e.key==='Enter' && handleSend()}
              placeholder="כתוב לגימני כאן..." 
              className={`flex-1 p-4 rounded-2xl text-sm ${isDarkMode ? 'bg-[#2a3942]' : 'bg-gray-100'}`} 
            />
            <button onClick={handleSend} className="bg-[#00a884] p-4 rounded-full text-white hover:scale-105 transition-all">
                <Send size={20} />
            </button>
          </div>
        </footer>
      </div>

      <OrderSidebar isOpen={isOrderOpen} setIsOpen={setIsOrderOpen} cart={cart} setCart={setCart} />
    </div>
  );
}
