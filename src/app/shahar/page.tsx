'use client';
import React, { useState, useEffect } from 'react';
import { Send, Plus, Trash2, Edit3, Share2, History, PackageCheck } from 'lucide-react';

export default function ShaharAppV2() {
  const [projects, setProjects] = useState([
    { id: 1, name: 'אבן יהודה', address: 'האתרוג 44, אבן יהודה' },
    { id: 2, name: 'כפר מונש', address: 'הרימון 5' }
  ]);
  const [messages, setMessages] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [step, setStep] = useState('idle');
  const [tempProjectName, setTempProjectName] = useState('');
  const [selectedProject, setSelectedProject] = useState(projects[0]);

  // פונקציית שליחה לוואטסאפ
  const sendToWhatsApp = () => {
    const clientID = "621100";
    const phone = "972508860896";
    
    let messageText = `*מאפליקציית שחר שאול*\n`;
    messageText += `מספר לקוח ID: ${clientID}\n`;
    messageText += `*פרויקט:* ${selectedProject.name}\n`;
    messageText += `*כתובת:* ${selectedProject.address}\n`;
    messageText += `--------------------------\n`;
    
    cart.forEach((item, index) => {
      messageText += `${index + 1}. ${item.qty} - ${item.name} - מק"ט: ${item.sku || '9999'}\n`;
    });

    // תיעוד ב-Firebase (סימולציה)
    saveOrderToFirebase({ clientID, project: selectedProject.name, items: cart });

    const encoded = encodeURIComponent(messageText);
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
  };

  const saveOrderToFirebase = async (orderData: any) => {
     // כאן תבוא הפקודה ל-Firebase: addDoc(collection(db, "orders"), orderData)
     console.log("Order saved to database:", orderData);
  };

  const handleCreateProject = (name: string, address: string) => {
    const newP = { id: Date.now(), name, address };
    setProjects([...projects, newP]);
    setSelectedProject(newP);
  };

  return (
    <div className="flex h-screen bg-[#0b141a] text-white overflow-hidden text-right" dir="rtl">
      
      {/* Sidebar - ניהול פרויקטים */}
      <div className="w-80 bg-[#111b21] border-l border-[#202c33] p-4 flex flex-col">
        <h2 className="text-[#C9A227] font-black text-xl mb-6 flex items-center gap-2">
          <PackageCheck size={24} /> האתרים שלי
        </h2>
        
        <div className="flex-1 space-y-3 overflow-y-auto">
          {projects.map(p => (
            <div key={p.id} className={`p-4 rounded-2xl border transition-all ${selectedProject.id === p.id ? 'border-[#00a884] bg-[#202c33]' : 'border-transparent bg-[#111b21] hover:bg-[#202c33]'}`}>
              <div className="flex justify-between items-start mb-1">
                <p className="font-bold text-sm">{p.name}</p>
                <div className="flex gap-2">
                  <Edit3 size={14} className="text-gray-500 cursor-pointer hover:text-white" />
                  <Trash2 size={14} className="text-red-900 cursor-pointer hover:text-red-500" onClick={() => setProjects(projects.filter(x => x.id !== p.id))} />
                </div>
              </div>
              <p className="text-[10px] text-gray-500 italic">{p.address}</p>
              <button onClick={() => setSelectedProject(p)} className="mt-2 text-[10px] text-[#00a884] font-bold">בחר אתר זה</button>
            </div>
          ))}
          <button onClick={() => setStep('waiting_for_name')} className="w-full py-3 rounded-xl border-2 border-dashed border-[#C9A227]/30 text-[#C9A227] flex items-center justify-center gap-2 mt-4 hover:bg-[#C9A227]/5">
            <Plus size={18} /> הוסף פרויקט חדש
          </button>
        </div>

        {/* קישורים לדפים פנימיים */}
        <div className="pt-4 border-t border-[#202c33] space-y-2">
           <button className="w-full p-3 rounded-xl bg-[#202c33] flex items-center gap-3 text-xs hover:bg-[#2a3942]">
              <History size={16} className="text-[#C9A227]" /> היסטוריית הזמנות
           </button>
        </div>
      </div>

      {/* אזור הצ'אט וההזמנה */}
      <div className="flex-1 flex flex-col">
         {/* ... (הצ'אט שכתבנו קודם) ... */}
         
         {/* כפתור סגירת הזמנה */}
         {cart.length > 0 && (
           <div className="absolute bottom-20 left-6">
              <button 
                onClick={sendToWhatsApp}
                className="bg-[#00a884] text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 animate-bounce font-black"
              >
                <Share2 size={20} /> שלח הזמנה לוואטסאפ
              </button>
           </div>
         )}
      </div>
    </div>
  );
}
