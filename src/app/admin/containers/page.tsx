'use client';
import React, { useState, useEffect } from 'react';
import { 
  Plus, UserPlus, MapPin, Phone, Building2, 
  Send, X, Play, Eye, RefreshCw, Trash2, Clock 
} from 'lucide-react';
import { db } from "@/lib/firebase";
import { 
  collection, addDoc, serverTimestamp, 
  updateDoc, doc, onSnapshot, query, orderBy 
} from "firebase/firestore";

// נתוני המחסנים מהמוח של ח. סבן
const WAREHOUSES = [
  { id: 30, name: "שארק (מחסן 30)" },
  { id: 32, name: "כראדי (מחסן 32)" },
  { id: 40, name: "שי שרון (מחסן 40)" }
];

export default function RamiAdminDashboard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    city: 'הרצליה',
    warehouseId: 40,
    address: ''
  });

  // האזנה לכל החוזים הקיימים בזמן אמת
  useEffect(() => {
    const q = query(collection(db, "container_contracts"), orderBy("created_at", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // פונקציית הפעלה: ראמי מאשר שהמכולה בשטח
  const activateContract = async (taskId: string, address: string) => {
    setLoading(true);
    try {
      const docRef = doc(db, "container_contracts", taskId);
      await updateDoc(docRef, {
        status: "IN_FIELD",
        current_day: 1,
        start_date: new Date().toLocaleDateString('he-IL'),
        last_activated_at: serverTimestamp(),
        // סיכה ראשונית על המפה לפי עיר (אפשר לשכלל ל-Geocoding בהמשך)
        lat: 32.1624, 
        lng: 34.8447,
      });
      alert(`המכולה של ${address} הופעלה! הטיימר של הלקוח התחיל.`);
    } catch (err: any) {
      console.error("Firebase Error:", err);
      alert(`שגיאה בהפעלה: ${err.message}. וודא שחוקי Firestore פתוחים.`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "container_contracts"), {
        customer_name: formData.customerName,
        phone: formData.phone,
        city: formData.city,
        sticky_warehouse_id: formData.warehouseId,
        address: formData.address,
        current_day: 0,
        status: "SCHEDULED_PLACEMENT",
        last_seen: false,
        created_at: serverTimestamp()
      });
      setIsModalOpen(false);
      alert("חוזה נוצר בהצלחה במצב המתנה.");
    } catch (err) {
      alert("שגיאה ביצירת החוזה.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#FDFBF7] p-6 md:p-12 font-sans">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
        <div>
          <h1 className="text-4xl font-black text-gray-800 italic tracking-tight">ניהול צי מכולות 🚛</h1>
          <p className="text-blue-600 font-bold uppercase tracking-[0.2em] text-sm">ח. סבן – קוקפיט לוגיסטי</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#1976D2] text-white px-8 py-5 rounded-[25px] font-black shadow-2xl hover:scale-105 transition-all flex items-center gap-3 text-lg"
        >
          <UserPlus size={24} /> חוזה מזדמן חדש
        </button>
      </header>

      {/* Grid המכולות - ה"רמזור" של ראמי */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white rounded-[45px] p-8 shadow-sm border border-gray-100 relative overflow-hidden flex flex-col justify-between">
            {/* סמן סטטוס ויזואלי */}
            <div className={`absolute left-0 top-0 bottom-0 w-3 ${task.status === 'IN_FIELD' ? 'bg-green-500' : 'bg-yellow-400'}`}></div>
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-black text-gray-800 leading-none mb-2">{task.customer_name}</h3>
                <p className="text-xs text-gray-400 font-bold flex items-center gap-1">
                  <MapPin size={12} /> {task.address}
                </p>
              </div>
              <div className={`p-3 rounded-2xl ${task.last_seen ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-300'}`}>
                <Eye size={24} />
              </div>
            </div>

            <div className="bg-[#FDFBF7] p-5 rounded-[30px] mb-8">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black text-gray-400 uppercase">קבלן אחראי:</span>
                <span className="font-black text-blue-700 text-sm italic">
                  {WAREHOUSES.find(w => w.id === task.sticky_warehouse_id)?.name || "לא נבחר"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-gray-400 uppercase">יום שכירות:</span>
                <span className="text-3xl font-black text-gray-800 italic">{task.current_day || 0}/10</span>
              </div>
            </div>

            {/* כפתורי פעולה דינמיים */}
            {task.status === "SCHEDULED_PLACEMENT" ? (
              <button 
                onClick={() => activateContract(task.id, task.address)}
                className="w-full bg-green-500 text-white py-5 rounded-[25px] font-black text-lg shadow-lg flex items-center justify-center gap-2 hover:bg-green-600 transition-all"
              >
                <Play size={20} fill="currentColor" /> הפעל מכולה וטיימר
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button className="bg-blue-50 text-blue-700 py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2">
                  <RefreshCw size={16} /> החלפה
                </button>
                <button className="bg-red-50 text-red-600 py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2">
                  <Trash2 size={16} /> פינוי
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal יצירת לקוח */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[50px] shadow-2xl p-10 relative animate-in zoom-in duration-200">
            <button onClick={() => setIsModalOpen(false)} className="absolute left-8 top-8 text-gray-300 hover:text-gray-600"><X /></button>
            <h2 className="text-3xl font-black text-gray-800 mb-8 italic italic tracking-tighter">פתיחת חוזה חדש</h2>
            
            <form onSubmit={handleCreateCustomer} className="space-y-6">
              <input required className="w-full p-5 bg-gray-50 rounded-[25px] border-none font-bold text-lg" placeholder="שם לקוח / חברה" 
                     onChange={e => setFormData({...formData, customerName: e.target.value})} />
              
              <input required type="tel" className="w-full p-5 bg-gray-50 rounded-[25px] border-none font-bold text-lg text-left" placeholder="טלפון לשליחת הלינק"
                     onChange={e => setFormData({...formData, phone: e.target.value})} />

              <div className="grid grid-cols-2 gap-4">
                <select className="p-5 bg-gray-50 rounded-[25px] border-none font-bold" 
                        onChange={e => setFormData({...formData, city: e.target.value})}>
                  <option>הרצליה</option>
                  <option>רעננה</option>
                  <option>הוד השרון</option>
                </select>
                <select className="p-5 bg-gray-50 rounded-[25px] border-none font-bold text-blue-600"
                        onChange={e => setFormData({...formData, warehouseId: parseInt(e.target.value)})}>
                  {WAREHOUSES.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>

              <input required className="w-full p-5 bg-gray-50 rounded-[25px] border-none font-bold text-lg" placeholder="כתובת הצבה מדויקת"
                     onChange={e => setFormData({...formData, address: e.target.value})} />

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#1976D2] text-white py-6 rounded-[25px] font-black text-xl shadow-xl flex items-center justify-center gap-3 mt-4"
              >
                {loading ? <Clock className="animate-spin" /> : <><Send size={24} /> הנפק לינק והפץ</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
