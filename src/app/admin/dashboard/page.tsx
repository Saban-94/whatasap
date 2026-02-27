'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MessageSquare, Brain, Package, Settings, Bell } from 'lucide-react';

// טעינה בטוחה של רכיבי הצ'אט והסטודיו
const WhatsAppGroupView = dynamic(() => import('@/components/WhatsAppChat'), { 
  ssr: false,
  loading: () => <div className="p-10 text-gray-500">טוען ממשק...</div>
});

const SabanAIStudio = dynamic(() => import('@/app/admin/studio/page'), { ssr: false });

export default function SabanMasterDashboard() {
  const [activeTab, setActiveTab] = useState('chat');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex h-screen bg-[#0b141a] text-white overflow-hidden font-sans" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 bg-[#111b21] border-l border-gray-800 flex flex-col p-4">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-[#00a884] rounded-lg flex items-center justify-center font-black">ס</div>
          <span className="font-black text-[#00a884] tracking-tight">SABAN LOGISTICS</span>
        </div>

        <nav className="flex-1 space-y-2 text-right">
          <button 
            onClick={() => setActiveTab('chat')}
            className={`w-full flex items-center gap-4 p-3 rounded-xl ${activeTab === 'chat' ? 'bg-[#00a884]' : 'hover:bg-[#202c33] text-gray-400'}`}
          >
            <MessageSquare size={20} /> <span className="font-bold text-sm">קבוצת הזמנות</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('studio')}
            className={`w-full flex items-center gap-4 p-3 rounded-xl ${activeTab === 'studio' ? 'bg-[#00a884]' : 'hover:bg-[#202c33] text-gray-400'}`}
          >
            <Brain size={20} /> <span className="font-bold text-sm">AI Studio</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 border-b border-gray-800 flex items-center justify-between px-8 bg-[#111b21]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] text-gray-500 font-bold uppercase">System Online</span>
          </div>
          <div className="flex items-center gap-4">
            <Bell size={18} className="text-gray-500" />
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00a884] to-blue-500"></div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden p-4">
          {activeTab === 'chat' ? <WhatsAppGroupView /> : <SabanAIStudio />}
        </div>
      </main>
    </div>
  );
}
