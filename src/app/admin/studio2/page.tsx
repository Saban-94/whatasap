'use client';

import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Users, 
  TrendingUp, 
  Database, 
  Save, 
  Plus, 
  Trash2, 
  Edit3, 
  X, 
  Check,
  Phone,
  MapPin,
  ShoppingBag
} from 'lucide-react';
import customerHistoryData from '@/data/customer_history.json';
import { Badge } from "@/components/ui/badge";

export default function SabanAIStudio() {
  const [customers, setCustomers] = useState(customerHistoryData);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    client_name: '',
    phone: '',
    frequent_sites: [''],
    favorite_products: [''],
    order_habits: '',
    last_order_date: new Date().toISOString().split('T')[0]
  });

  // פונקציה להוספת לקוח חדש
  const handleAddCustomer = () => {
    setCustomers([...customers, newCustomer]);
    setShowAddModal(false);
    setNewCustomer({
      client_name: '',
      phone: '',
      frequent_sites: [''],
      favorite_products: [''],
      order_habits: '',
      last_order_date: new Date().toISOString().split('T')[0]
    });
  };

  // פונקציה למחיקת לקוח
  const handleDelete = (index: number) => {
    if (confirm('האם אתה בטוח שברצונך למחוק את הלקוח מהזיכרון של ה-AI?')) {
      const updated = customers.filter((_, i) => i !== index);
      setCustomers(updated);
    }
  };

  // שמירת עריכה
  const saveEdit = () => {
    setIsEditing(null);
    // כאן תבוא קריאת ה-API לשמירת הקובץ בשרת/DB
    console.log("נתונים נשמרו:", customers);
  };

  return (
    <div className="p-8 bg-[#0b141a] min-h-screen text-white font-sans" dir="rtl">
      {/* Header */}
      <header className="flex justify-between items-center mb-10 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-[#00a884] flex items-center gap-3">
            <Brain size={32} /> SABAN AI STUDIO
          </h1>
          <p className="text-gray-400 mt-2">ניהול זיכרון לקוחות ואימון מודל NLP</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-full font-bold flex items-center gap-2 transition-all"
          >
            <Plus size={20} /> הוסף לקוח לזיכרון
          </button>
          <button className="bg-[#00a884] hover:bg-[#06cf9c] px-6 py-2 rounded-full font-bold flex items-center gap-2 transition-all shadow-lg shadow-[#00a884]/20">
            <Save size={20} /> שמור שינויים בשרת
          </button>
        </div>
      </header>

      {/* מדדים עליונים */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#111b21] p-6 rounded-2xl border border-gray-800 shadow-xl">
          <Users className="text-blue-500 mb-2" />
          <p className="text-3xl font-black">{customers.length}</p>
          <p className="text-sm text-gray-400">פרופילי לקוחות מאומנים</p>
        </div>
        <div className="bg-[#111b21] p-6 rounded-2xl border border-gray-800 shadow-xl">
          <TrendingUp className="text-green-500 mb-2" />
          <p className="text-3xl font-black">98%</p>
          <p className="text-sm text-gray-400">דיוק בזיהוי סלנג טכני</p>
        </div>
        <div className="bg-[#111b21] p-6 rounded-2xl border border-gray-800 shadow-xl">
          <Database className="text-orange-500 mb-2" />
          <p className="text-3xl font-black">SYNC</p>
          <p className="text-sm text-gray-400">סנכרון מול CSV פעיל</p>
        </div>
      </div>

      {/* טבלת ניהול לקוחות */}
      <div className="bg-[#111b21] rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-[#202c33] text-gray-400 text-xs uppercase tracking-widest">
              <th className="p-5">שם לקוח / חברה</th>
              <th className="p-5">טלפון</th>
              <th className="p-5">אתרי עבודה מרכזיים</th>
              <th className="p-5">הרגלי הזמנה</th>
              <th className="p-5 text-center">פעולות</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {customers.map((client, index) => (
              <tr key={index} className="hover:bg-[#1a252b] transition-colors group">
                <td className="p-5 font-bold">
                  {isEditing === index ? (
                    <input 
                      className="bg-[#2a3942] border border-[#00a884] rounded p-1 w-full outline-none"
                      value={client.client_name}
                      onChange={(e) => {
                        const updated = [...customers];
                        updated[index].client_name = e.target.value;
                        setCustomers(updated);
                      }}
                    />
                  ) : client.client_name}
                </td>
                <td className="p-5 text-gray-400 font-mono text-sm">
                   {isEditing === index ? (
                    <input 
                      className="bg-[#2a3942] border border-[#00a884] rounded p-1 w-full outline-none text-left"
                      value={client.phone}
                      onChange={(e) => {
                        const updated = [...customers];
                        updated[index].phone = e.target.value;
                        setCustomers(updated);
                      }}
                    />
                  ) : client.phone}
                </td>
                <td className="p-5">
                   {isEditing === index ? (
                    <input 
                      className="bg-[#2a3942] border border-[#00a884] rounded p-1 w-full outline-none text-xs"
                      value={client.frequent_sites.join(', ')}
                      onChange={(e) => {
                        const updated = [...customers];
                        updated[index].frequent_sites = e.target.value.split(',');
                        setCustomers(updated);
                      }}
                    />
                  ) : (
                    <div className="flex gap-1 flex-wrap">
                      {client.frequent_sites.map((site, si) => (
                        <Badge key={si} variant="outline" className="text-[10px] border-gray-700">{site}</Badge>
                      ))}
                    </div>
                  )}
                </td>
                <td className="p-5 text-xs text-gray-400 italic">
                   {isEditing === index ? (
                    <textarea 
                      className="bg-[#2a3942] border border-[#00a884] rounded p-1 w-full outline-none resize-none"
                      value={client.order_habits}
                      onChange={(e) => {
                        const updated = [...customers];
                        updated[index].order_habits = e.target.value;
                        setCustomers(updated);
                      }}
                    />
                  ) : client.order_habits}
                </td>
                <td className="p-5 text-center">
                  <div className="flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isEditing === index ? (
                      <button onClick={saveEdit} className="text-green-500 hover:text-green-400"><Check size={20}/></button>
                    ) : (
                      <button onClick={() => setIsEditing(index)} className="text-gray-400 hover:text-white"><Edit3 size={18}/></button>
                    )}
                    <button onClick={() => handleDelete(index)} className="text-gray-500 hover:text-red-500"><Trash2 size={18}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal להוספת לקוח חדש */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111b21] border border-gray-700 w-full max-w-lg rounded-3xl shadow-2xl p-8 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#00a884] flex items-center gap-2"><Plus /> הוספת פרופיל לזיכרון</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-white"><X /></button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-xs text-gray-500 block mb-2 font-bold uppercase tracking-wider">שם לקוח מלא</label>
                <div className="flex items-center gap-3 bg-[#202c33] p-3 rounded-xl">
                  <Users size={18} className="text-gray-500" />
                  <input 
                    className="bg-transparent outline-none w-full" 
                    placeholder="לדוגמה: לירן ייזום"
                    value={newCustomer.client_name}
                    onChange={(e) => setNewCustomer({...newCustomer, client_name: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-2 font-bold uppercase tracking-wider">טלפון ווצאפ</label>
                <div className="flex items-center gap-3 bg-[#202c33] p-3 rounded-xl">
                  <Phone size={18} className="text-gray-500" />
                  <input 
                    className="bg-transparent outline-none w-full text-left font-mono" 
                    placeholder="+972..."
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-2 font-bold uppercase tracking-wider">אתר עבודה מרכזי</label>
                <div className="flex items-center gap-3 bg-[#202c33] p-3 rounded-xl">
                  <MapPin size={18} className="text-gray-500" />
                  <input 
                    className="bg-transparent outline-none w-full" 
                    placeholder="כתובת מלאה..."
                    onChange={(e) => setNewCustomer({...newCustomer, frequent_sites: [e.target.value]})}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-2 font-bold uppercase tracking-wider">מוצרים מועדפים (מופרדים בפסיק)</label>
                <div className="flex items-center gap-3 bg-[#202c33] p-3 rounded-xl">
                  <ShoppingBag size={18} className="text-gray-500" />
                  <input 
                    className="bg-transparent outline-none w-full" 
                    placeholder="מלט, חול, סיקה..."
                    onChange={(e) => setNewCustomer({...newCustomer, favorite_products: e.target.value.split(',')})}
                  />
                </div>
              </div>

              <button 
                onClick={handleAddCustomer}
                className="w-full bg-[#00a884] py-4 rounded-2xl font-black text-lg hover:bg-[#06cf9c] transition-all shadow-xl shadow-[#00a884]/20"
              >
                הזרק לזיכרון ה-AI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
