'use client'
import React from 'react';
import Link from 'next/link';
import { 
  Brain, 
  MessageCircle, 
  Database, 
  Users, 
  LayoutDashboard, 
  Activity 
} from 'lucide-react';

export default function AdminIndex() {
  const menuItems = [
    {
      title: 'הפעלת זיכרון (Setup)',
      desc: 'הגדרת שחר שאול ב-Database',
      link: '/seed',
      icon: <Database className="text-green-600" />,
      color: 'bg-green-50'
    },
    {
      title: 'צ\'אט וואטסאפ (AI)',
      desc: 'כניסה לממשק השיחה של שחר',
      link: '/chat',
      icon: <MessageCircle className="text-blue-600" />,
      color: 'bg-blue-50'
    },
    {
      title: 'חיזוק המוח',
      desc: 'הזנת חוקים ותובנות חדשות',
      link: '/admin/rules',
      icon: <Brain className="text-purple-600" />,
      color: 'bg-purple-50'
    },
    {
      title: 'תיקיית לקוח חכמה',
      desc: 'צפייה במה שהמוח יודע על שחר',
      link: '/client/שחר_שאול',
      icon: <Users className="text-orange-600" />,
      color: 'bg-orange-50'
    },
    {
      title: 'לוח בקרה (Dashboard)',
      desc: 'ניהול הזמנות וסטטוסים',
      link: '/admin/dashboard',
      icon: <LayoutDashboard className="text-slate-600" />,
      color: 'bg-slate-50'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F3F2F1] p-6 font-sans" dir="rtl">
      <div className="max-w-md mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-[#323130] mb-2">ח. סבן - ניהול מוח</h1>
          <p className="text-sm text-[#605E5C]">מרכז שליטה ובקרה לוגיסטי</p>
        </header>

        <div className="grid gap-4">
          {menuItems.map((item, index) => (
            <Link href={item.link} key={index}>
              <div className={`flex items-center p-4 rounded-xl border border-[#EDEBE9] shadow-sm hover:shadow-md transition-all active:scale-95 ${item.color}`}>
                <div className="p-3 bg-white rounded-lg shadow-sm mr-4">
                  {item.icon}
                </div>
                <div className="flex-1 mr-4">
                  <h3 className="font-bold text-[#323130]">{item.title}</h3>
                  <p className="text-xs text-[#605E5C]">{item.desc}</p>
                </div>
                <div className="text-[#C8C6C4]">❮</div>
              </div>
            </Link>
          ))}
        </div>

        <footer className="mt-12 text-center text-[10px] text-[#A19F9D] uppercase tracking-widest">
          Saban Logistics AI • Systems Operational
        </footer>
      </div>
    </div>
  );
}
