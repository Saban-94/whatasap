'use client';
import React, { useState, useEffect } from 'react';
import { MapPin, Truck, FileText, PhoneCall, ShieldCheck, Search, Loader2 } from 'lucide-react';

export default function SabanLuxuryApp() {
  const [address, setAddress] = useState('הרצליה, ישראל');
  const [city, setCity] = useState('הרצליה');
  const [mapUrl, setMapUrl] = useState('');

  // עדכון המפה והעירייה בזמן אמת לפי חיפוש הלקוח
  useEffect(() => {
    const encodedAddress = encodeURIComponent(address);
    setMapUrl(`https://maps.google.com/maps?q=${encodedAddress}&hl=he&z=16&output=embed`);
    
    // לוגיקת זיהוי עירייה אוטומטית
    if (address.includes('רעננה')) setCity('רעננה');
    else if (address.includes('הוד השרון')) setCity('הוד השרון');
    else setCity('הרצליה');
  }, [address]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-right" dir="rtl">
      {/* Header צף עם לוגו - אפקט עומק */}
      <nav className="sticky top-0 z-[100] bg-white/80 backdrop-blur-lg border-b border-gray-100 shadow-sm p-4 flex justify-center">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <img src="/logo.png" alt="ח. סבן" className="relative h-12 w-auto drop-shadow-md" />
        </div>
      </nav>

      <main className="p-6 max-w-md mx-auto space-y-8">
        
        {/* כרטיס המפה האינטראקטיבי */}
        <section className="relative group">
          <div className="bg-white rounded-[40px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-50 p-2">
            
            {/* שורת חיפוש כתובת ללקוח */}
            <div className="absolute top-6 left-6 right-6 z-10">
              <div className="relative flex items-center">
                <Search className="absolute right-4 text-gray-400" size={18} />
                <input 
                  type="text"
                  placeholder="הזן כתובת להצבת המכולה..."
                  className="w-full py-4 pr-12 pl-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border-none font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 transition-all"
                  onBlur={(e) => setAddress(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && setAddress((e.target as any).value)}
                />
              </div>
            </div>

            <div className="w-full h-72 rounded-[35px] bg-gray-50 overflow-hidden">
              <iframe width="100%" height="100%" frameBorder="0" src={mapUrl} allowFullScreen></iframe>
            </div>
            
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-600">
                <MapPin size={18} className="animate-bounce" />
                <span className="font-black italic text-sm">{address}</span>
              </div>
              <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">Live Track</span>
            </div>
          </div>
        </section>

        {/* גריד כפתורים פעילי - אפקט לחיצה תלת מימדי */}
        <div className="grid grid-cols-2 gap-6">
          <ActionButton 
            icon={<Truck size={32} />} 
            label="הזמנת החלפה" 
            sub="מלאה בריקה"
            color="bg-[#1976D2]" 
          />
          
          {/* כפתור היתר משתנה לפי עירייה */}
          <ActionButton 
            icon={<FileText size={32} />} 
            label={`היתר ${city}`} 
            sub="מגן קנסות פעיל"
            color="bg-orange-500" 
            onClick={() => window.open(`https://www.google.com/search?q=היתר+מכולה+${city}`, '_blank')}
          />
          
          <ActionButton 
            icon={<PhoneCall size={32} />} 
            label="מוקד סבן" 
            sub="זמין עכשיו"
            color="bg-gray-900" 
          />
          
          <ActionButton 
            icon={<ShieldCheck size={32} />} 
            label="אישורי פינוי" 
            sub="מוכן לטופס 4"
            color="bg-teal-600" 
          />
        </div>

        {/* כרטיס סטטוס ימים בעיצוב נקי */}
        <div className="bg-white p-6 rounded-[35px] shadow-sm border border-gray-50 space-y-4">
          <div className="flex justify-between items-end">
             <p className="text-gray-400 font-black text-xs uppercase italic">סטטוס השכרה</p>
             <h3 className="text-4xl font-black text-gray-800 italic">03<span className="text-lg text-gray-300">/10 ימים</span></h3>
          </div>
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 w-1/3 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)]"></div>
          </div>
        </div>
      </main>
    </div>
  );
}

// רכיב כפתור עם אפקט לחיצה (Active State)
function ActionButton({ icon, label, sub, color, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`${color} group relative text-white aspect-square rounded-[40px] flex flex-col items-center justify-center gap-2 
                 shadow-[0_15px_30px_rgba(0,0,0,0.1)] transition-all duration-200 
                 active:scale-90 active:shadow-inner hover:brightness-110`}
    >
      <div className="bg-white/10 p-4 rounded-[20px] mb-1 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <div className="text-center">
        <p className="font-black text-sm tracking-tight">{label}</p>
        <p className="text-[10px] font-medium opacity-60 uppercase tracking-tighter">{sub}</p>
      </div>
    </button>
  );
}
