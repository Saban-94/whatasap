'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MessageSquare, Brain, Package, Settings, Bell, Search, LayoutDashboard } from 'lucide-react';

// טעינה דינמית למניעת שגיאת "reduce of undefined" ב-Build
const WhatsAppGroupView = dynamic(() => import('@/components/WhatsAppChat'), { 
  ssr: false,
  loading: () => <div className="h-full flex items-center justify-center text-gray-500 italic">טוען צ'אט...</div>
});

const SabanAIStudio = dynamic(() => import('@/app/admin/studio/page'), { 
  ssr: false,
  loading: () => <div className="h-full flex items-center justify-center text-gray-500 italic">טוען סטודיו...</div>
});

const SabanOrdersDashboard = dynamic(() => import('@/app/admin/orders/page'), { 
  ssr: false 
});

export default function SabanMasterDashboard() {
  const [activeTab, setActiveTab] = useState('chat');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="bg-[#0b141a] h-screen" />;

  return (
    <div className="flex h-screen bg-[#0b141a] text-white overflow-hidden font-sans" dir="rtl">
      
      {/* Sidebar - ללא שינוי באלמנטים הקודמים */}
      <aside className="w-20 lg:w-64 bg-[#111b21] border-l border-gray-800 flex flex-col p-4 gap-6">
        <div className="flex items-center gap-3 px-2 mb-4">
          <div className="w-10 h-10 bg-[#00a884] rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-[#00a884]/20">ס</div>
          <span className="hidden lg:block font-black text-xl tracking-tighter text-[#00a884]">SABAN MASTER</span>
        </div>

        <nav className="flex flex-col w-full gap-2">
          {[
            { id: 'chat', icon: <MessageSquare size={22} />, label: 'קבוצת הזמנות' },
            { id: 'orders', icon: <Package size={22} />, label: 'ניהול הזמנות' },
            { id: 'studio', icon: <Brain size={22} />, label: 'AI Studio' },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 ${
                activeTab === tab.id ? 'bg-[#00a884] text-white' : 'hover:bg-[#202c33] text-gray-400'
              }`}
            >
              {tab.icon}
              <span className="hidden lg:block font-bold text-sm">{tab.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-gray-800 flex items-center justify-between px-8 bg-[#111b21]/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-4 bg-[#202c33] px-4 py-1.5 rounded-full w-64 lg:w-96">
            <Search size={16} className="text-gray-500" />
            <input placeholder="חיפוש מהיר..." className="bg-transparent outline-none text-xs w-full" />
          </div>
          
          <div className="flex items-center gap-4">
            <Bell size={20} className="text-gray-400 cursor-pointer hover:text-white" />
            <div className="flex items-center gap-3 border-r border-gray-800 pr-4">
              <span className="text-xs font-bold text-gray-300">ראמי מסארוה</span>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00a884] to-emerald-400"></div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-[#0b141a]">
          {activeTab === 'chat' && <WhatsAppGroupView />}
          {activeTab === 'orders' && <SabanOrdersDashboard />}
          {activeTab === 'studio' && <SabanAIStudio />}
        </div>
      </main>
    </div>
  );
}
