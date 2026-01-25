src/app/admin/vip-group/page.tsx'use client';

import React, { useState, useEffect } from 'react';
import { db } from "@/lib/firebase"; 
import { collection, addDoc, query, onSnapshot, orderBy, serverTimestamp } from "firebase/firestore";
import { MessageSquare, Users, Settings, Plus, Link as LinkIcon, UserPlus, X, Phone, Mail, Building, Image as ImageIcon } from 'lucide-react';

export default function SabanVipGroup() {
  const [activeTab, setActiveTab] = useState('chats');
  const [staff, setStaff] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [newMember, setNewMember] = useState({ name: '', dept: '', role: '', phone: '', ext: '', email: '', avatar: '' });

  useEffect(() => {
    const unsubStaff = onSnapshot(collection(db, "employees"), (s) => setStaff(s.docs.map(d => ({id: d.id, ...d.data()}))));
    const unsubGroups = onSnapshot(query(collection(db, "saban_groups"), orderBy("timestamp", "desc")), (s) => setGroups(s.docs.map(d => ({id: d.id, ...d.data()}))));
    return () => { unsubStaff(); unsubGroups(); };
  }, []);

  const saveStaff = async () => {
    await addDoc(collection(db, "employees"), { ...newMember, timestamp: serverTimestamp() });
    setShowAddStaff(false);
    setNewMember({ name: '', dept: '', role: '', phone: '', ext: '', email: '', avatar: '' });
  };

  return (
    <div dir="rtl" className="flex h-screen bg-[#f0f2f5] font-sans overflow-hidden">
      {/* Sidebar Tabs */}
      <div className="w-[70px] bg-[#202c33] flex flex-col items-center py-6 gap-8 text-[#aebac1]">
        <button onClick={() => setActiveTab('chats')} className={activeTab === 'chats' ? 'text-white' : ''}><MessageSquare size={28} /></button>
        <button onClick={() => setActiveTab('staff')} className={activeTab === 'staff' ? 'text-white' : ''}><Users size={28} /></button>
        <button onClick={() => setActiveTab('settings')} className={activeTab === 'settings' ? 'text-white' : ''}><Settings size={28} /></button>
        <div className="mt-auto"><div className="w-10 h-10 bg-[#00a884] rounded-full flex items-center justify-center font-bold text-white">ח.ס</div></div>
      </div>

      {/* List Area */}
      <div className="w-[400px] bg-white border-l border-gray-200 flex flex-col">
        <header className="p-6 bg-[#f0f2f5] flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#111b21]">{activeTab === 'chats' ? 'קבוצות VIP' : 'אנשי צוות'}</h2>
          <button onClick={() => activeTab === 'staff' ? setShowAddStaff(true) : null} className="bg-[#00a884] text-white p-2 rounded-full hover:bg-[#008069]"><Plus size={20}/></button>
        </header>
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'staff' ? staff.map(s => (
            <div key={s.id} onClick={() => setSelectedStaff(s)} className="p-4 flex items-center gap-4 border-b hover:bg-gray-50 cursor-pointer">
              <img src={s.avatar || '/logo.png'} className="w-12 h-12 rounded-full border border-gray-200" />
              <div><p className="font-bold">{s.name}</p><p className="text-xs text-gray-500">{s.role} | {s.dept}</p></div>
            </div>
          )) : groups.map(g => (
            <div key={g.id} className="p-4 flex justify-between items-center border-b">
              <div><p className="font-bold">{g.name}</p><p className="text-xs text-gray-400">לינק הצטרפות פעיל</p></div>
              <button onClick={() => { navigator.clipboard.writeText(`https://whatasap.vercel.app/join/${g.id}`); alert("לינק הועתק!"); }} className="text-[#00a884]"><LinkIcon size={18}/></button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Display / Forms */}
      <div className="flex-1 flex items-center justify-center relative bg-[#e5ddd5]">
        {showAddStaff && (
          <div className="absolute inset-0 bg-white z-50 p-10 flex flex-col gap-4 animate-in slide-in-from-bottom">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-[#075E54]">הקמת איש צוות חדש (ניהול ראמי)</h3>
              <button onClick={() => setShowAddStaff(false)}><X /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="שם מלא" className="p-4 border rounded-xl" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} />
              <input placeholder="מחלקה" className="p-4 border rounded-xl" value={newMember.dept} onChange={e => setNewMember({...newMember, dept: e.target.value})} />
              <input placeholder="תפקיד" className="p-4 border rounded-xl" value={newMember.role} onChange={e => setNewMember({...newMember, role: e.target.value})} />
              <input placeholder="נייד" className="p-4 border rounded-xl" value={newMember.phone} onChange={e => setNewMember({...newMember, phone: e.target.value})} />
              <input placeholder="שלוחה" className="p-4 border rounded-xl" value={newMember.ext} onChange={e => setNewMember({...newMember, ext: e.target.value})} />
              <input placeholder="אימייל" className="p-4 border rounded-xl" value={newMember.email} onChange={e => setNewMember({...newMember, email: e.target.value})} />
              <input placeholder="לינק לתמונת פרופיל" className="p-4 border rounded-xl col-span-2" value={newMember.avatar} onChange={e => setNewMember({...newMember, avatar: e.target.value})} />
            </div>
            <button onClick={saveStaff} className="mt-6 bg-[#00a884] text-white p-4 rounded-2xl font-bold text-lg hover:bg-[#008069]">שמור וצרף לצוות</button>
          </div>
        )}
        
        {selectedStaff ? (
          <div className="bg-white p-10 rounded-[40px] shadow-2xl w-[400px] text-center">
            <img src={selectedStaff.avatar || '/logo.png'} className="w-32 h-32 rounded-full mx-auto border-4 border-[#25D366] mb-4" />
            <h2 className="text-3xl font-bold">{selectedStaff.name}</h2>
            <p className="text-gray-500 mb-8">{selectedStaff.role}</p>
            <div className="space-y-4 text-right">
              <div className="flex items-center gap-4"><Building className="text-gray-400"/> {selectedStaff.dept}</div>
              <div className="flex items-center gap-4"><Phone className="text-gray-400"/> {selectedStaff.phone}</div>
              <div className="flex items-center gap-4"><Mail className="text-gray-400"/> {selectedStaff.email}</div>
            </div>
          </div>
        ) : (
          <div className="text-center opacity-40"><MessageSquare size={100} className="mx-auto mb-4" /><p className="text-xl font-bold">מערכת ח. סבן - צ'אט צוות ו-VIP</p></div>
        )}
      </div>
    </div>
  );
}
