'use client';
export const dynamic = 'force-dynamic';
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useState, useEffect } from 'react';
import { Send, ShoppingCart, Truck, ClipboardList } from 'lucide-react';

export default function SmartOrderPage() {
  const [form, setForm] = useState({ 
    name: '', address: '', phone: '', 
    driverNotes: '', requestedDate: '', 
    deliveryType: 'פריקה עם מנוף' // ברירת מחדל ל"ח. סבן"
  });
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // פונקציה לשליחה לקבוצת הוואטסאפ דרך Green-API
  const sendToWhatsAppGroup = async (orderData: any) => {
    const message = `
📢 *הזמנה חדשה - ח. סבן* 🚛
--------------------------
👤 *לקוח:* ${orderData.name}
📍 *כתובת:* ${orderData.address}
📞 *טלפון:* ${orderData.phone}
🏗️ *סוג הובלה:* ${orderData.deliveryType}
📝 *הערות:* ${orderData.driverNotes}
--------------------------
📦 *פירוט ציוד:*
${cart.map(item => `- ${item.name} (כמות: ${item.qty})`).join('\n')}
--------------------------
⏳ _ההזמנה סונכרנה ל-365 במקביל_
    `;

    await fetch(`https://7103.api.greenapi.com/waInstance7103143490/sendMessage/{{API_TOKEN}}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatId: "120363321556277715@g.us", // ה-ID של קבוצת ההזמנות
        message: message
      })
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. שליחה ל-365 (Power Automate Flow)
      const flowUrl = "https://defaultae1f0547569d471693f95b9524aa2b.31.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/0828f74ee7e44228b96c93eab728f280/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=lgdg1Hw--Z35PWOK6per2K02fql76m_WslheLXJL-eA";
      
      await fetch(flowUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: form.name,
          address: form.address,
          items: cart.map(i => `${i.name} x${i.qty}`).join(', '),
          status: "חדש"
        })
      });

      // 2. שליחה לקבוצת הוואטסאפ
      await sendToWhatsAppGroup(form);

      // 3. שמירה ב-Firebase (אוסף Tasks)
      await addDoc(collection(db, "tasks"), {
        ...form,
        items: cart.map(i => i.name).join(', '),
        status: 'חדש',
        timestamp: serverTimestamp()
      });

      alert("ההזמנה נשלחה בהצלחה לכל המערכות!");
      setCart([]);
    } catch (err) {
      alert("שגיאה בשליחה. נסה שוב.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 p-4 font-sans text-right">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border-t-8 border-[#075E54]">
        <div className="bg-[#075E54] p-6 text-white">
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Truck size={28} /> ח. סבן - יצירת הזמנה
          </h1>
          <p className="opacity-80">מערכת סנכרון אוטומטית ל-365 ולוואטסאפ</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">שם הלקוח</label>
              <input 
                required
                className="w-full p-3 bg-gray-100 rounded-xl border-none focus:ring-2 focus:ring-[#25D366]"
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">טלפון</label>
              <input 
                required
                className="w-full p-3 bg-gray-100 rounded-xl border-none focus:ring-2 focus:ring-[#25D366]"
                value={form.phone}
                onChange={e => setForm({...form, phone: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">כתובת למשלוח</label>
            <input 
              required
              className="w-full p-3 bg-gray-100 rounded-xl border-none focus:ring-2 focus:ring-[#25D366]"
              value={form.address}
              onChange={e => setForm({...form, address: e.target.value})}
            />
          </div>

          <div className="bg-[#f0f2f5] p-4 rounded-2xl border-r-4 border-[#25D366]">
             <h3 className="font-bold mb-2 flex items-center gap-2">
               <ShoppingCart size={18} /> הוספת מוצרים מהמאגר
             </h3>
             {/* כאן תבוא רשימת המוצרים הנשלפת מ-Firebase */}
             <p className="text-xs text-gray-500 italic">המלאי מסונכרן בזמן אמת מול המחסן</p>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#25D366] text-white p-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 hover:bg-[#128C7E] transition-all shadow-lg"
          >
            {loading ? "שולח נתונים..." : <><Send size={24} /> שלח הזמנה לביצוע</>}
          </button>
        </form>
      </div>
    </div>
  );
}
