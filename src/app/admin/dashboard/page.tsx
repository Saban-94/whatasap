'use client';

import React, { useState } from 'react';
import WhatsAppGroupView from '@/components/WhatsAppChat';
import SabanOrdersDashboard from '@/app/admin/orders/page';
import SabanAIStudio from '@/app/admin/studio/page';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Brain, 
  Package, 
  Settings,
  Bell,
  Search
} from 'lucide-react';

export default function SabanMasterDashboard() {
  const [activeTab, setActiveTab] = useState('chat');

  // פונקציה לבחירת התצוגה הפעילה
  const renderContent = () => {
    switch (activeTab) {
      case 'chat': return <WhatsAppGroupView />;
      case 'orders': return <SabanOrdersDashboard />;
      case 'studio': return <SabanAIStudio />;
      default: return <WhatsAppGroupView />;
    }
  };

  return (
    <div className="flex h-screen bg-[#0b141a] text-white overflow-hidden" dir="rtl">
      
      {/* סרגל ניווט צדדי (Sidebar) ייחודי ל-Master Control */}
      <aside className="w-20 lg:w-64 bg-[#111b21] border-l border-gray-800 flex flex-col items-center lg:items-start p-4 gap-8">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-[#00a884] rounded-xl flex items-center justify-center font-black text-xl">ס</div>
          <span className="hidden lg:block font-black text-xl tracking-tighter text-[#00a884]">SABAN LOGISTICS</span>
        </div>

        <nav className="flex flex-col w-full gap-2">
          <button 
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-4 p-3 rounded-xl transition-all ${activeTab === 'chat' ? 'bg-[#00a884] text-white shadow-lg' : 'hover:bg-[#202c33] text-gray-400'}`}
          >
            <MessageSquare size={24} />
            <span className="hidden lg:block font-bold">קבוצת הזמנות</span>
          </button>

          <button 
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-4 p-3 rounded-xl transition-all ${activeTab === 'orders' ? 'bg-[#00a884] text-white shadow-lg' : 'hover:bg-[#202c33] text-gray-400'}`}
          >
            <Package size={24} />
            <span className="hidden lg:block font-bold">ניהול הזמנות</span>
          </button>

          <button 
            onClick={() => setActiveTab('studio')}
            className={`flex items-center gap-4 p-3 rounded-xl transition-all ${activeTab === 'studio' ? 'bg-[#00a884] text-white shadow-lg' : 'hover:bg-[#202c33] text-gray-400'}`}
          >
            <Brain size={24} />
            <span className="hidden lg:block font-bold">AI Studio</span>
          </button>
        </nav>

        <div className="mt-auto w-full border-t border-gray-800 pt-4 flex flex-col gap-2">
           <button className="flex items-center gap-4 p-3 text-gray-500 hover:text-white transition-all">
            <Settings size={24} />
            <span className="hidden lg:block text-sm font-bold">הגדרות מערכת</span>
          </button>
        </div>
      </aside>

      {/* אזור התוכן המרכזי */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* Top bar מהיר */}
        <header className="h-16 border-b border-gray-800 flex items-center justify-between px-8 bg-[#111b21]/50 backdrop-blur-md">
          <div className="flex items-center gap-4 bg-[#202c33] px-4 py-1.5 rounded-full w-96">
            <Search size={18} className="text-gray-500" />
            <input placeholder="חפש לקוח, מוצר או אתר..." className="bg-transparent outline-none text-sm w-full" />
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative cursor-pointer">
              <Bell size={22} className="text-gray-400 hover:text-white transition-colors" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold">3</span>
            </div>
            <div className="flex items-center gap-3 border-r border-gray-800 pr-6">
              <span className="text-sm font-bold text-gray-300">ראמי מסארוה</span>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00a884] to-blue-500 border-2 border-[#111b21]"></div>
            </div>
          </div>
        </header>

        {/* Dynamic Content - כאן הכל קורה */}
        <div className="flex-1 overflow-y-auto p-2 lg:p-6 bg-[#0b141a]">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
