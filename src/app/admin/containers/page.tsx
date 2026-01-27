'use client';
import React, { useState, useEffect } from 'react';
import { 
  Plus, UserPlus, MapPin, Phone, Building2, 
  Send, X, Play, Eye, RefreshCw, Trash2, Clock, ChevronDown 
} from 'lucide-react';
import { db } from "@/lib/firebase";
import { 
  collection, addDoc, serverTimestamp, 
  updateDoc, doc, onSnapshot, query, orderBy 
} from "firebase/firestore";

// הגדרת הקבלנים המבצעים - המחסנים של ח. סבן
const CONTRACTORS = [
  { id: 'shark_30', name: "שארק (מחסן 30)", color: "text-blue-600" },
  { id: 'karadi_32', name: "כראדי (מחסן 32)", color: "text-orange-600" },
  { id: 'shay_sharon_40', name: "שי שרון (מחסן 40)", color: "text-teal-600" }
];

export default function RamiAdminDashboard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    city: 'הרצליה',
    contractorId: 'shay_sharon_40', // ברירת מחדל
    address: ''
  });

  useEffect(() => {
    const q = query(collection(db, "container_contracts"), orderBy("created_at", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const activateContract = async (taskId: string, address: string) => {
    setLoading(true);
    try {
      const docRef = doc(db, "container_contracts", taskId);
      await updateDoc(docRef, {
        status: "IN_FIELD",
        current_day: 1,
        start_date: new Date().toLocaleDateString('he-IL'),
        last_activated_at: serverTimestamp(),
        lat: 32.1624, 
        lng: 34.8447,
      });
      alert(`המכולה ב${address} הופעלה!`);
    } catch (err: any) {
      alert(`שגיאה: ${err.message}`);
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
        contractor_id: formData.contractorId, // השיוך נשמר כאן
        address: formData.address,
        current_day: 0,
        status: "SCHEDULED_PLACEMENT",
        created_at: serverTimestamp()
      });
      setIsModalOpen(false);
      setFormData({...formData, customerName: '', phone: '', address: ''}); // איפוס
      alert("החוזה נוצר ושויך לקבלן המבצע.");
    } catch (err) {
      alert("שגיאה ביצירת החוזה.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#FDFBF7] p-6 md:p-12 font-sans text-right">
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
        <div>
          <h1 className="text-4xl font-black text-gray-800 italic italic tracking-tight uppercase">ניהול צי מכולות 🚛</h1>
          <p className="text-[#1976D2] font-black uppercase tracking-[0.2em] text-xs">מערכת שליטה מרכזית - ח. סבן</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#1976D2] text-white px-10 py-5 rounded-[30px] font-black shadow-2xl hover:scale-105 transition-all flex items-center gap-3 text-lg"
        >
          <UserPlus size={24} /> חוזה חדש
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tasks.map((task) => {
          const contractor = CONTRACTORS.find(c => c.id === task.contractor_id);
          return (
            <div key={task.id} className="bg-white rounded-[50px] p-8 shadow-sm border border-gray-100 relative overflow-hidden flex flex-col">
              <div className={`absolute left-0 top-0 bottom-0 w-3 ${task.status === 'IN_FIELD' ? 'bg-green-500' : 'bg-orange-400'}`}></div>
              
              <div className="mb-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-2xl font-black text-gray-800 leading-tight">{task.customer_name}</h3>
                  <div className={`p-2 rounded-xl bg-gray-50 ${task.last_seen ? 'text-blue-500' : 'text-gray-300'}`}>
                    <Eye size={20} />
                  </div>
                </div>
                <p className="text-sm font-bold text-gray-400 mt-1 flex items-center gap-1">
                  <MapPin size={14} /> {task.address}
                </p>
              </div>

              <div className="bg-gray-50 rounded-[35px] p-6 mb-8 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-gray-400 uppercase">קבלן מבצע:</span>
                  <span className={`font-black text-xs ${contractor?.color || 'text-gray-800'}`}>
                    {contractor?.name || "ללא שיוך"}
                  </span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black text-gray-400 uppercase">זמן שכירות:</span>
                  <span className="text-3xl font-black text-gray-800 italic">{task.current_day || 0}/10 ימים</span>
                </div>
              </div>

              {task.status === "SCHEDULED_PLACEMENT" ? (
                <button 
                  onClick={() => activateContract(task.id, task.address)}
                  className="w-full bg-green-500 text-white py-5 rounded-[25px] font-black shadow-lg flex items-center justify-center gap-2 hover:bg-green-600 transition-all"
                >
                  <Play size={18} fill="currentColor" /> הפעל מכולה (START)
                </button>
              ) : (
                <div className="flex gap-2">
                  <button className="flex-1 bg-blue-50 text-blue-700 py-4 rounded-2xl font-black text-[10px] flex items-center justify-center gap-1">
                    <RefreshCw size={14} /> החלפה
                  </button>
                  <button className="flex-1 bg-red-50 text-red-600 py-4 rounded-2xl font-black text-[10px] flex items-center justify-center gap-1">
                    <Trash2 size={14} /> פינוי
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal - כאן הוספתי את בחירת הקבלן */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[55px] shadow-2xl p-12 relative animate-in fade-in zoom-in duration-300">
            <button onClick={() => setIsModalOpen(false)} className="absolute left-10 top-10 text-gray-300 hover:text-gray-600">
              <X size={28} />
            </button>
            <h2 className="text-3xl font-black text-gray-800 mb-10 italic tracking-tighter">הנפקת חוזה חדש</h2>
            
            <form onSubmit={handleCreateCustomer} className="space-y-6 text-right">
              <div>
                <label className="block text-[10px] font-black text-gray-400 mb-2 mr-4">פרטי הלקוח</label>
                <input required className="w-full p-5 bg-gray-50 rounded-[25px] border-none font-bold text-lg focus:ring-2 focus:ring-[#1976D2] outline-none" 
                       placeholder="שם לקוח / חברה" 
                       onChange={e => setFormData({...formData, customerName: e.target.value})} />
              </div>
              
              <input required type="tel" className="w-full p-5 bg-gray-50 rounded-[25px] border-none font-bold text-lg text-left" placeholder="טלפון ליצירת קשר"
                     onChange={e => setFormData({...formData, phone: e.target.value})} />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 mb-2 mr-4">עירייה להיתר</label>
                  <select className="w-full p-5 bg-gray-50 rounded-[25px] border-none font-bold outline-none" 
                          onChange={e => setFormData({...formData, city: e.target.value})}>
                    <option>הרצליה</option>
                    <option>רעננה</option>
                    <option>הוד השרון</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#1976D2] mb-2 mr-4 uppercase">קבלן מבצע (מחסן)</label>
                  <select className="w-full p-5 bg-blue-50 text-[#1976D2] rounded-[25px] border-none font-black outline-none appearance-none"
                          onChange={e => setFormData({...formData, contractorId: e.target.value})}>
                    {CONTRACTORS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 mb-2 mr-4">כתובת בשטח</label>
                <input required className="w-full p-5 bg-gray-50 rounded-[25px] border-none font-bold text-lg focus:ring-2 focus:ring-[#1976D2] outline-none" 
                       placeholder="כתובת הצבה מדויקת"
                       onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#1976D2] text-white py-6 rounded-[30px] font-black text-xl shadow-xl flex items-center justify-center gap-3 mt-6 hover:brightness-110 active:scale-95 transition-all"
              >
                {loading ? <Clock className="animate-spin" /> : <><Send size={24} /> צור חוזה ושלח לינק</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
