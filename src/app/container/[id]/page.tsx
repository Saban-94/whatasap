'use client';
import React from 'react';
import { MapPin, Truck, FileText, PhoneCall, Home, Info } from 'lucide-react';

export default function ArtisticContainerPortal({ taskData }: { taskData: any }) {
  // דוגמה למיקום סיכה במפה
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${taskData.lat},${taskData.lng}&language=he`;

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-3">
      {/* מסגרת דף יוקרתית */}
      <div className="min-h-[95vh] border-[10px] border-[#1976D2] rounded-[50px] bg-white relative overflow-hidden flex flex-col">
        
        {/* לוגו צף במרכז */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-[#1976D2] p-4 rounded-b-3xl shadow-lg border-x-4 border-b-4 border-white">
            <h2 className="text-white font-black text-xl tracking-tighter">ח. סבן</h2>
          </div>
        </div>

        <main className="flex-1 p-6 pt-20 space-y-6 overflow-y-auto">
          {/* כותרת הפרויקט */}
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-black text-gray-800 italic">ניהול מכולה: {taskData.customer_name}</h1>
            <p className="text-sm font-bold text-blue-600 flex items-center justify-center gap-1">
              <MapPin size={14} /> {taskData.address}
            </p>
          </div>

          {/* המפה - סיכה חיה בעברית */}
          <div className="w-full h-56 rounded-[35px] overflow-hidden border-4 border-gray-50 shadow-inner relative">
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0 }}
              src={mapUrl}
              allowFullScreen
            ></iframe>
            {/* Overlay יוקרתי על המפה */}
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-blue-100">
               <p className="text-[10px] font-black text-blue-800">מיקום מדויק בשטח 📍</p>
            </div>
          </div>

          {/* כפתורי שער גדולים ומרובעים - "Grid of Power" */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <MenuButton 
                icon={<Truck size={32} />} 
                label="הזמנת החלפה" 
                sub="מלאה בריקה"
                color="bg-blue-600" 
            />
            <MenuButton 
                icon={<FileText size={32} />} 
                label="היתר עירוני" 
                sub="מגן קנסות"
                color="bg-orange-500" 
            />
            <MenuButton 
                icon={<PhoneCall size={32} />} 
                label="צור קשר" 
                sub="מוקד לוגיסטי"
                color="bg-gray-800" 
            />
            <MenuButton 
                icon={<Info size={32} />} 
                label="אישורי פינוי" 
                sub="לטופס 4"
                color="bg-teal-600" 
            />
          </div>
        </main>

        {/* Footer מעוצב */}
        <footer className="p-6 text-center">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Saban Systems © 2026</p>
        </footer>
      </div>
    </div>
  );
}

// רכיב כפתור שער מרובע
function MenuButton({ icon, label, sub, color }: any) {
  return (
    <button className={`${color} text-white aspect-square rounded-[35px] flex flex-col items-center justify-center gap-2 shadow-xl active:scale-95 transition-all p-4 text-center`}>
      <div className="bg-white/20 p-3 rounded-2xl mb-1">{icon}</div>
      <div className="space-y-0.5">
        <p className="font-black text-sm leading-none">{label}</p>
        <p className="text-[9px] font-medium opacity-70 uppercase tracking-tighter">{sub}</p>
      </div>
    </button>
  );
}
