'use client';
import React, { useState } from 'react';
import { Plus, UserPlus, MapPin, Phone, Building2, Send, X } from 'lucide-react';
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function RamiAdminDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // נתוני המחסנים מהמוח (saban_container_logic.json)
  const WAREHOUSES = [
    { id: 30, name: "שארק (מחסן 30)" },
    { id: 32, name: "כראדי (מחסן 32)" },
    { id: 40, name: "שי שרון (מחסן 40)" }
  ];

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    city: 'הרצליה',
    warehouseId: 40, // ברירת מחדל שי שרון
    address: ''
  });
  // פונקציה להפעלת החוזה ע"י ראמי
const activateContract = async (taskId: string, address: string) => {
  setLoading(true);
  try {
    // 1. הפיכת כתובת לקואורדינטות (Geocoding) - בסימולציה נשתמש במיקום גנרי או סטטי
    const docRef = doc(db, "container_contracts", taskId);
    
    await updateDoc(docRef, {
      status: "IN_FIELD",
      current_day: 1,
      start_date: new Date().toLocaleDateString('he-IL'),
      last_activated_at: serverTimestamp(),
      // במידה וראמי מזין כתובת, המערכת "נועצת" את המפה עליה
      lat: 32.1624, // דוגמה לקואורדינטה של הרצליה
      lng: 34.8447,
    });

    alert("המכולה הופעלה! אבי כהן עכשיו ביום 1 והמפה שלו חיה.");
  } catch (err) {
    console.error("שגיאה בהפעלת החוזה", err);
  } finally {
    setLoading(false);
  }
};

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. יצירת הלקוח והחוזה ב-Firebase
      const docRef = await addDoc(collection(db, "container_contracts"), {
        customer_name: formData.customerName,
        phone: formData.phone,
        city: formData.city,
        sticky_warehouse_id: formData.warehouseId,
        address: formData.address,
        current_day: 1,
        status: "SCHEDULED_PLACEMENT",
        last_seen: false,
        created_at: serverTimestamp()
      });

      // 2. יצירת הלינק (Magic Link)
      const magicLink = `https://whatasap.vercel.app/container/${docRef.id}`;
      
      alert(`הלקוח נוצר! הלינק לשליחה: ${magicLink}`);
      setIsModalOpen(false);
    } catch (err) {
      alert("שגיאה ביצירת הלקוח");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#FDFBF7] p-8 font-sans">
      
      {/* Header עם כפתור יצירה חדש */}
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-800">ניהול צי מכולות 🚛</h1>
          <p className="text-blue-600 font-bold">ח. סבן לוגיסטיקה</p>
        </div>
        
        {/* הכפתור שחיפשת - יצירת לקוח מזדמן */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#1976D2] text-white px-6 py-4 rounded-[25px] font-black shadow-lg hover:scale-105 transition-all"
        >
          <UserPlus size={20} /> יצירת לקוח ולינק קסם
        </button>
      </header>

      {/* חלון קופץ (Modal) ליצירת לקוח */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[45px] shadow-2xl p-8 relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => setIsModalOpen(false)} className="absolute left-6 top-6 text-gray-300 hover:text-gray-600"><X /></button>
            
            <h2 className="text-2xl font-black text-gray-800 mb-6 italic">רישום לקוח מזדמן חדש</h2>
            
            <form onSubmit={handleCreateCustomer} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 mr-2">שם הלקוח / חברה</label>
                <input required className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold" placeholder="למשל: אבי כהן שיפוצים" 
                       onChange={e => setFormData({...formData, customerName: e.target.value})} />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 mr-2">טלפון (לשליחת הלינק)</label>
                <input required type="tel" className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold text-left" placeholder="050-0000000"
                       onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 mr-2">עירייה (היתרים)</label>
                  <select className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold" 
                          onChange={e => setFormData({...formData, city: e.target.value})}>
                    <option>הרצליה</option>
                    <option>רעננה</option>
                    <option>הוד השרון</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 mr-2">קבלן מבצע (Sticky)</label>
                  <select className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold text-blue-600"
                          onChange={e => setFormData({...formData, warehouseId: parseInt(e.target.value)})}>
                    {WAREHOUSES.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 mr-2">כתובת להצבה (לינק לנהג)</label>
                <input required className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold" placeholder="רחוב, מספר, עיר"
                       onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#1976D2] text-white py-5 rounded-[25px] font-black text-xl shadow-xl flex items-center justify-center gap-3 mt-6"
              >
                {loading ? "מייצר חוזה..." : <><Send size={20} /> הנפק לינק קסם ושלח לנהג</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* כאן יופיע ה-Traffic Light Dashboard שכתבנו קודם */}
      <div className="mt-10 opacity-50 italic text-center">
         רשימת המכולות הפעילות תופיע כאן...
      </div>
    </div>
  );
}
