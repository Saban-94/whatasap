'use client';
import React, { useState, useEffect } from 'react';
import { db } from "@/lib/firebase";
import { 
  Truck, Trash2, Bell, MessageCircle, Info, 
  X, CheckCircle, Smartphone, ArrowRight,
  Sun, Moon, Coffee, ShieldCheck, Send, History, Home
} from 'lucide-react';
import Link from 'next/link';

// ממשק לטיפוסים של הניווט
interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  href?: string;
}

export default function SabanVIPDashboard() {
  const [showPopup, setShowPopup] = useState(true);
  const [greeting, setGreeting] = useState({ text: '', sub: '', icon: <Coffee /> });
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [isThinking, setIsThinking] = useState(false);

  // נתונים שהופקו מהמוח (JSON) עבור שחר שאול
  const userData = {
    name: "שחר שאול",
    lastProject: "גלגל המזלות 73",
    lastItem: "שליכט בגר",
    activeContainer: "עזר ויצמן 6"
  };

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting({ text: `בוקר טוב ${userData.name}`, sub: 'יאללה בוא נשלח לסידור של ח. סבן!', icon: <Sun className="text-yellow-500" /> });
    else if (hour < 18) setGreeting({ text: `צהריים טובים ${userData.name}`, sub: 'יום עבודה פורה! צריכים משהו לאתר?', icon: <Coffee className="text-orange-400" /> });
    else setGreeting({ text: `ערב טוב ${userData.name} 🌙`, sub: 'מצוין שאתה חושב על מחר. נשריין הובלה?', icon: <Moon className="text-blue-400" /> });
  }, []);

  // פונקציית צ'אט-בוט עם אפקט חשיבה 🧠
  const handleBotQuery = (query: string, answer: string) => {
    setMessages([...messages, { role: 'user', text: query }]);
    setIsThinking(true);
    
    setTimeout(() => {
      setIsThinking(false);
      setMessages(prev => [...prev, { role: 'bot', text: answer }]);
    }, 1500);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#FDFBF7] pb-28 font-sans text-right">
      
      {/* --- POPUP הדרכה (לבן-קרם) --- */}
      {showPopup && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl animate-in slide-in-from-bottom duration-500 overflow-hidden">
            <div className="bg-[#E3F2FD] p-10 text-center relative">
              <div className="w-20 h-20 bg-white rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-sm">
                <img src="/logo.png" alt="Saban" className="w-16" />
              </div>
              <h2 className="text-2xl font-black text-gray-800 tracking-tight">ברוך הבא, {userData.name}!</h2>
              <p className="text-blue-600 font-bold mt-1 uppercase text-[10px] tracking-widest">Saban VIP Experience</p>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="saban-card bg-blue-50/50 flex items-start gap-4 p-4 border-none">
                <Smartphone className="text-blue-600 mt-1" />
                <p className="text-sm text-gray-600 font-medium">
                  <b>התקן כאן ליד הווצאפ:</b><br/>
                  לחץ על 'שתף' ובחר 'הוסף למסך הבית' כדי להזמין בסיבוב אחד.
                </p>
              </div>
              <button onClick={() => setShowPopup(false)} className="btn-huge bg-[#1976D2] text-white">
                בוא נתחיל <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <header className="p-6 bg-white rounded-b-[45px] shadow-sm flex justify-between items-center border-b border-gray-100">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
            {greeting.text} {greeting.icon}
          </h1>
          <p className="text-sm text-gray-500 font-medium">{greeting.sub}</p>
        </div>
        <div className="bg-blue-50 p-3 rounded-2xl text-blue-600 shadow-inner"><Bell size={24} /></div>
      </header>

      <main className="p-6 space-y-6">
        
        {/* כרטיס מכולה דינמי - מבוסס מוח */}
        <section className="saban-card alert-mode relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4">
              <div className="bg-red-50 p-3 rounded-2xl text-red-500"><Trash2 size={24} /></div>
              <span className="text-[10px] font-black bg-red-500 text-white px-3 py-1 rounded-full animate-pulse">חריגת זמן ⚠️</span>
            </div>
            <h3 className="text-xl font-black text-gray-800">מכולה ב{userData.activeContainer}</h3>
            <p className="text-sm text-gray-400 mb-5">מסיימת היום שכירות (10/10 ימים). מה עושים?</p>
            <div className="flex gap-2">
              <button className="flex-1 bg-[#1976D2] text-white py-4 rounded-2xl font-black text-sm">החלפה</button>
              <button className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-2xl font-black text-sm">פינוי</button>
            </div>
          </div>
          <Trash2 size={100} className="absolute -left-10 -bottom-10 opacity-5 rotate-12" />
        </section>

        {/* שלב הזמנה חיה (כחול מהבהב) */}
        <div className="saban-card border-l-[10px] border-blue-400 bg-white">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-black text-blue-500 uppercase">הזמנה בדרך 🚛</span>
            <span className="text-[10px] text-gray-400">צפי: 18 דק'</span>
          </div>
          <p className="font-black text-gray-800 text-lg leading-tight">הנהג חכמת בדרך ל{userData.lastProject}</p>
          <div className="mt-4 w-full bg-gray-100 h-3 rounded-full overflow-hidden">
            <div className="bg-blue-400 h-full w-[75%] animate-pulse"></div>
          </div>
        </div>

        {/* צ'אט-בוט עוזר אישי (גשר לוגיסטי) */}
        <section className="saban-card bg-white">
          <h3 className="font-black text-gray-800 mb-4 flex items-center gap-2">
            <MessageCircle className="text-[#25D366]" size={20} /> עוזר לוגיסטי אישי
          </h3>
          <div className="space-y-4 max-h-48 overflow-y-auto mb-4 p-2">
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'chat-bubble-user text-left' : 'chat-bubble-saban'}>
                {m.text}
              </div>
            ))}
            {isThinking && <div className="chat-bubble-saban animate-pulse text-xs tracking-widest">...בודק במחסן</div>}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
             <button 
               onClick={() => handleBotQuery("מתי קניתי גבס ירוק?", "בפעם האחרונה הזמנת 50 לוחות לגלגל המזלות ב-15/01. תרצה לשכפל?")}
               className="whitespace-nowrap bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-xs font-bold border border-blue-100"
             >מתי קניתי גבס? 📅</button>
             <button 
               onClick={() => handleBotQuery("יש רובה 102?", "יש במלאי רובה 102 של נירלט/טמבור. בודק רשות גישה להזמנה... 🛡️")}
               className="whitespace-nowrap bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-xs font-bold border border-blue-100"
             >יש רובה 102? 🥡</button>
          </div>
        </section>

        {/* מוח: חוק החיבוק המושלם 🫂 */}
        <div className="bg-[#FFF9E6] p-5 rounded-[30px] border border-yellow-100 flex items-center gap-4">
          <div className="bg-white p-3 rounded-2xl shadow-sm text-yellow-600"><ShieldCheck size={24} /></div>
          <div>
            <p className="text-[10px] font-black text-yellow-700 uppercase">המלצת המוח</p>
            <p className="text-sm text-gray-700">שחר, ראינו שהזמנת {userData.lastItem}. <b>חסר לך פריימר</b> לחיבוק מושלם לקיר? 🫂</p>
          </div>
        </div>

      </main>

      {/* תפריט ניווט תחתון (Floating PWA Nav) */}
      <nav className="fixed bottom-8 left-6 right-6 bg-white/80 backdrop-blur-2xl border border-gray-100 rounded-[35px] shadow-2xl p-3 flex justify-around items-center z-50">
        <NavItem icon={<Home size={22} />} label="ראשי" active href="/dashboard" />
        <NavItem icon={<Truck size={22} />} label="חומרים" href="/order" />
        <NavItem icon={<Trash2 size={22} />} label="מכולה" href="/container" />
        <NavItem icon={<History size={22} />} label="עבר" href="/track" />
      </nav>
    </div>
  );
}

function NavItem({ icon, label, active = false, href = "#" }: NavItemProps) {
  return (
    <Link href={href} className={`flex flex-col items-center gap-1 p-2 px-4 rounded-2xl transition-all ${active ? 'bg-[#1976D2] text-white shadow-lg' : 'text-gray-400'}`}>
      {icon}
      <span className="text-[10px] font-black">{label}</span>
    </Link>
  );
}
