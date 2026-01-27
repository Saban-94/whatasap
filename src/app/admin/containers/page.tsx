'use client';
import React, { useState } from 'react';
import { Plus, UserPlus, MapPin, Phone, Building2, Send, X, Play } from 'lucide-react';
import { db } from "@/lib/firebase";
// ייבוא מתוקן ומלא:
import { collection, addDoc, serverTimestamp, updateDoc, doc } from "firebase/firestore";

export default function RamiAdminDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const WAREHOUSES = [
    { id: 30, name: "שארק (מחסן 30)" },
    { id: 32, name: "כראדי (מחסן 32)" },
    { id: 40, name: "שי שרון (מחסן 40)" }
  ];

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    city: 'הרצליה',
    warehouseId: 40,
    address: ''
  });

  // פונקציית ההפעלה הידנית שראמי חיכה לה
  const activateContract = async (taskId: string, address: string) => {
    setLoading(true);
    try {
      // כאן doc כבר מזוהה בזכות הייבוא למעלה
      const docRef = doc(db, "container_contracts", taskId);
      
      await updateDoc(docRef, {
        status: "IN_FIELD",
        current_day: 1,
        start_date: new Date().toLocaleDateString('he-IL'),
        last_activated_at: serverTimestamp(),
        lat: 32.1624, // מיקום ברירת מחדל הרצליה עד לתיקון GPS
        lng: 34.8447,
      });

      alert("המכולה הופעלה בהצלחה! הלקוח עכשיו במצב LIVE.");
    } catch (err) {
      console.error("שגיאה בהפעלת החוזה:", err);
      alert("שגיאה בהפעלה - וודא חיבור לאינטרנט");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, "container_contracts"), {
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

      const magicLink = `https://whatasap.vercel.app/container/${docRef.id}`;
      alert(`חוזה נוצר! שלח ללקוח: ${magicLink}`);
      setIsModalOpen(false);
    } catch (err) {
      alert("שגיאה ביצירת חוזה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#FDFBF7] p-8 font-sans">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-800 italic">ניהול מכולות ח. סבן 🚛</h1>
          <p className="text-blue-600 font-bold uppercase tracking-widest text-xs">מרכז בקרה ראמי</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#1976D2] text-white px-8 py-4 rounded-[25px] font-black shadow-xl hover:scale-105 transition-all flex items-center gap-2"
        >
          <UserPlus size={20} /> חוזה מזדמן חדש
        </button>
      </header>

      {/* כאן יבוא הדשבורד עם כפתורי ה-Play להפעלה */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* כרטיסייה לדוגמה עם כפתור הפעלה */}
          <div className="bg-white p-6 rounded-[40px] shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-black text-gray-800">אבי כהן - עינב 4</h3>
                  <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-[10px] font-black">ממתין להצבה</span>
              </div>
              <button 
                onClick={() => activateContract("TASK_ID_HERE", "עינב 4, הרצליה")}
                className="w-full bg-green-500 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
              >
                <Play size={20} fill="currentColor" /> הפעל מכולה וטיימר
              </button>
          </div>
      </div>

      {/* Modal יצירת לקוח (נשאר ללא שימוש ב-doc) */}
      {/* ... הקוד של המודאל שהיה לנו ... */}
    </div>
  );
}
