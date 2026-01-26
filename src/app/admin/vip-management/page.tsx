'use client';
import React, { useState, useEffect } from 'react';
import { db } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { UserPlus, Copy, ExternalLink, Users, Smartphone } from 'lucide-react';

export default function VipManagement() {
  const [clients, setClients] = useState<any[]>([]);
  const [form, setForm] = useState({ 
    custNo: '', name: '', project: '', contact: '', phone: '' 
  });

  useEffect(() => {
    const q = query(collection(db, "vip_clients"), orderBy("name"));
    return onSnapshot(q, (snap) => {
      setClients(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  const createMagicLink = (client: any) => {
    const baseUrl = window.location.origin;
    const magicLink = `${baseUrl}/dashboard?id=${client.id}`;
    const message = `שלום ${client.name}, ברוך הבא לאפליקציית ה-VIP של ח. סבן! 🚛\nניהול הזמנות חכם לפרויקט ${client.project} מחכה לך כאן:\n${magicLink}`;
    
    navigator.clipboard.writeText(message);
    alert("לינק הקסם הועתק! עכשיו שלח אותו לשחר או בר בוואטסאפ 🎉");
  };

  const saveClient = async () => {
    await addDoc(collection(db, "vip_clients"), form);
    setForm({ custNo: '', name: '', project: '', contact: '', phone: '' });
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 p-6 font-sans">
      <h1 className="text-2xl font-black text-[#075E54] mb-6 flex items-center gap-2">
        <Users /> ניהול 30 לקוחות VIP - ח. סבן
      </h1>

      <div className="bg-white p-6 rounded-3xl shadow-sm mb-8 border border-gray-100">
        <h3 className="font-bold mb-4">יצירת פרופיל חדש (תואם קומקס/365)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input placeholder="מספר לקוח קומקס" className="p-3 bg-gray-50 rounded-xl" value={form.custNo} onChange={e => setForm({...form, custNo: e.target.value})} />
          <input placeholder="שם הלקוח" className="p-3 bg-gray-50 rounded-xl" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <input placeholder="שם הפרויקט" className="p-3 bg-gray-50 rounded-xl" value={form.project} onChange={e => setForm({...form, project: e.target.value})} />
          <input placeholder="איש קשר" className="p-3 bg-gray-50 rounded-xl" value={form.contact} onChange={e => setForm({...form, contact: e.target.value})} />
          <input placeholder="נייד" className="p-3 bg-gray-50 rounded-xl" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
          <button onClick={saveClient} className="bg-[#075E54] text-white rounded-xl font-bold flex items-center justify-center gap-2">
            <UserPlus size={18} /> הוסף לקוח VIP
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {clients.map(client => (
          <div key={client.id} className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm border-r-4 border-[#25D366]">
            <div>
              <p className="font-black text-lg">{client.name}</p>
              <p className="text-xs text-gray-500">{client.project} | {client.phone}</p>
            </div>
            <button onClick={() => createMagicLink(client)} className="bg-green-50 text-green-600 p-3 rounded-xl flex items-center gap-2 hover:bg-green-100 transition-all">
              <Copy size={18} /> העתק לינק קסם
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
