'use client';
import React, { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '@/lib/firebase'; // וודא שהקונפיגורציה ב-lib מעודכנת לאסיה
import { Truck, Clock, MapPin, AlertCircle } from 'lucide-react';

export default function IturanAnalysisPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // חיבור לנתיב המדויק שראינו ב-Firebase
    const ituranRef = ref(database, 'ituran_events');
    
    return onValue(ituranRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // הפיכת האובייקט למערך ומיון לפי זמן
        const formatted = Object.values(data).sort((a: any, b: any) => 
          new Date(b.server_time).getTime() - new Date(a.server_time).getTime()
        );
        setEvents(formatted);
      }
      setLoading(false);
    });
  }, []);

  return (
    <div dir="rtl" className="min-h-screen bg-[#FDFBF7] p-6 font-sans text-right">
      <header className="mb-8">
        <h1 className="text-2xl font-black text-gray-800 italic">ניתוח פעילות מנופים - ח. סבן</h1>
        <p className="text-sm text-blue-600 font-bold">סנכרון חי משרת איתוראן (Asia-SE)</p>
      </header>

      {loading ? (
        <div className="flex justify-center p-20 animate-pulse text-gray-400 font-bold text-xl italic">
          טוען נתונים מהמוח...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event, idx) => (
            <div key={idx} className="bg-white rounded-[35px] p-6 shadow-sm border border-gray-50 hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
                  <Truck size={24} />
                </div>
                <span className={`text-[10px] font-black px-3 py-1 rounded-full ${
                  event.status.includes('פתיחה') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                }`}>
                  {event.status}
                </span>
              </div>
              
              <h3 className="text-lg font-black text-gray-800 mb-2">רכב: {event.vehicle}</h3>
              
              <div className="space-y-3 text-sm font-bold text-gray-500">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-gray-300" />
                  <span>{new Date(event.server_time).toLocaleString('he-IL')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-gray-300" />
                  <span className="truncate">{event.address}</span>
                </div>
              </div>

              {event.status.includes('פתיחה') && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-2xl border border-yellow-100 flex items-center gap-2">
                  <AlertCircle size={18} className="text-yellow-600" />
                  <p className="text-[10px] text-yellow-800 font-black">שים לב: מנוף פעיל כעת באתר!</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
