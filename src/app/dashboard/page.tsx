'use client';
import React, { useState, useEffect } from 'react';
import { 
  Truck, Trash2, Bell, MessageCircle, Info, 
  X, CheckCircle, Smartphone, Download, ArrowRight,
  Sun, Moon, Coffee, ShieldCheck
} from 'lucide-react';

export default function SabanContractorDashboard() {
  const [showPopup, setShowPopup] = useState(true);
  const [greeting, setGreeting] = useState({ text: '', sub: '', icon: <Coffee /> });
  const [activeTab, setActiveTab] = useState('home');
  const [isAlert, setIsAlert] = useState(true); // הדמיה למכולה שחרגה מזמן

  // נתונים שהופקו מה-JSON של שחר ובר
  const userData = {
    name: "שחר שאול",
    project: "גלגל המזלות 73",
    lastItem: "פלסטומר 603"
  };

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting({ text: `בוקר טוב ${userData.name}`, sub: 'יאללה בוא נשלח לסידור של ח. סבן!', icon: <Sun className="text-yellow-500" /> });
    else if (hour < 18) setGreeting({ text: `צהריים טובים ${userData.name}`, sub: 'יום עבודה פורה! צריכים משהו לאתר?', icon: <Coffee className="text-orange-400" /> });
    else setGreeting({ text: `ערב טוב ${userData.name} 🌙`, sub: 'חושב על מחר? נשריין לך הובלה על הבוקר', icon: <Moon className="text-blue-400" /> });
  }, []);

  return (
    <div dir="rtl" className="min-h-screen bg-[#FDFBF7] pb-28 font-sans">
      
      {/* --- POPUP הדרכה וכניסה ראשונית --- */}
      {showPopup && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[40px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-500">
            <div className="bg-[#E3F2FD] p-8 text-center relative">
              <button onClick={() => setShowPopup(false)} className="absolute top-4 left-4 text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
              <div className="w-20 h-20 bg-white rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-sm">
                <img src="/logo.png" alt="Saban" className="w-16" />
              </div>
              <h2 className="text-2xl font-black text-gray-800">ברוך הבא, {userData.name}!</h2>
              <p className="text-blue-600 font-bold mt-1">הזמנת חומרים ומכולות בלחיצה אחת</p>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-50 p-3 rounded-2xl text-blue-600"><Smartphone size={24} /></div>
                <div>
                  <h4 className="font-black text-gray-800">התקן כאן ליד הווצאפ</h4>
                  <p className="text-sm text-gray-500">באייפון: לחץ 'שתף' ו-'הוסף למסך הבית'. באנדרואיד: לחץ על 3 הנקודות והתקן.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-green-50 p-3 rounded-2xl text-green-600"><CheckCircle size={24} /></div>
                <div>
                  <h4 className="font-black text-gray-800">מעקב חצי-אוטומטי</h4>
                  <p className="text-sm text-gray-500">כל סטטוס יקפיץ לך הודעה ועדכון חי על המפה.</p>
                </div>
              </div>

              <button 
                onClick={() => setShowPopup(false)}
                className="w-full bg-[#1976D2] text-white py-5 rounded-2xl font-black text-xl shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
              >
                מאשר, בוא נתחיל <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <header className="p-6 bg-white rounded-b-[45px] shadow-sm border-b border-gray-100 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
            {greeting.text} {greeting.icon}
          </h1>
          <p className="text-sm text-gray-500 font-medium">{greeting.sub}</p>
        </div>
        <div className="relative">
          <div className="bg-blue-50 p-3 rounded-2xl text-blue-600"><Bell size={24} /></div>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full"></span>
        </div>
      </header>

      <main className="p-6 space-y-6 text-right">
        
        {/* --- כרטיס מכולה חריגה (אדום מהבהב) --- */}
        <section className={`bg-white rounded-[35px] p-6 shadow-sm border-2 transition-all ${isAlert ? 'border-red-400 shadow-red-50 animate-pulse' : 'border-gray-100'}`}>
          <div className="flex justify-between items-start mb-4">
            <div className="bg-red-50 p-3 rounded-2xl text-red-500"><Trash2 size={24} /></div>
            <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">חריגה ⚠️</span>
          </div>
          <h3 className="text-xl font-black text-gray-800">מכולה ב{userData.project}</h3>
          <p className="text-sm text-gray-400 font-medium mb-5 text-right">מסיימת היום תקופת שכירות (10/10 ימים)</p>
          <div className="grid grid-cols-2 gap-3">
            <button className="bg-[#1976D2] text-white py-4 rounded-2xl font-black text-sm">החלפה מהירה</button>
            <button className="bg-gray-100 text-gray-600 py-4 rounded-2xl font-black text-sm text-right pr-4">פינוי מכולה</button>
          </div>
        </section>

        {/* --- כפתורי ענק (Contractor Style) --- */}
        <div className="grid grid-cols-2 gap-4">
          <button className="bg-white p-8 rounded-[35px] shadow-sm border border-gray-100 flex flex-col items-center gap-4 active:scale-95 transition-all">
            <div className="bg-blue-50 p-5 rounded-3xl text-blue-600"><Truck size={32} /></div>
            <span className="font-black text-gray-800">חומרי בניין</span>
          </button>
          <button className="bg-white p-8 rounded-[35px] shadow-sm border border-gray-100 flex flex-col items-center gap-4 active:scale-95 transition-all">
            <div className="bg-green-50 p-5 rounded-3xl text-green-600"><MessageCircle size={32} /></div>
            <span className="font-black text-gray-800">צ'אט צוות</span>
          </button>
        </div>

        {/* --- כרטיס הזמנה חיה (כחול מהבהב) --- */}
        <section className="bg-white rounded-[35px] p-6 shadow-sm border-l-[12px] border-blue-400">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-xs font-black text-blue-500 tracking-widest uppercase">הזמנה בדרך 🚛</h4>
            <span className="text-[10px] text-gray-400 font-bold">צפי: 20 דק'</span>
          </div>
          <p className="text-lg font-black text-gray-800 text-right">הנהג חכמת בדרך ל{userData.project}</p>
          <div className="mt-4 w-full bg-gray-100 h-3 rounded-full overflow-hidden">
            <div className="bg-blue-400 h-full w-[75%] animate-pulse"></div>
          </div>
        </section>

        {/* --- המוח החכם: המלצה מבוססת היסטוריה 🧠 --- */}
        <div className="bg-[#FFF9E6] p-5 rounded-[30px] border border-yellow-100 flex items-center gap-4">
          <div className="bg-white p-3 rounded-2xl shadow-sm text-yellow-600"><ShieldCheck size={24} /></div>
          <div className="text-right">
            <p className="text-xs font-black text-yellow-700">המלצת מוח ח. סבן</p>
            <p className="text-sm text-gray-700">שחר, ראינו שקנית {userData.lastItem}. חסר לך פריימר?</p>
          </div>
        </div>

      </main>

      {/* --- תפריט ניווט תחתון (Floating Nav) --- */}
      <nav className="fixed bottom-8 left-6 right-6 bg-white/80 backdrop-blur-xl border border-gray-100 rounded-[30px] shadow-2xl p-3 flex justify-around items-center z-50">
        <NavItem icon={<HomeIcon />} label="ראשי" active />
        <NavItem icon={<Truck size={22} />} label="חומרים" />
        <NavItem icon={<Trash2 size={22} />} label="מכולה" />
        <NavItem icon={<History size={22} />} label="עבר" />
      </nav>
    </div>
  );
}

function NavItem({ icon, label, active = false }: any) {
  return (
    <div className={`flex flex-col items-center gap-1 p-2 px-4 rounded-2xl transition-all ${active ? 'bg-[#1976D2] text-white shadow-lg shadow-blue-100' : 'text-gray-400'}`}>
      {icon}
      <span className="text-[10px] font-black">{label}</span>
    </div>
  );
}

function HomeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}
