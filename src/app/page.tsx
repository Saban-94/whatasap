'use client';
import React from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  PackageSearch, 
  MessageSquare, 
  Truck, 
  Users, 
  BarChart3, 
  Container, 
  PenTool 
} from 'lucide-react';

const apps = [
  { name: 'Saban Studio', desc: 'ניהול קטלוג ומלאי', icon: PackageSearch, href: '/admin/studio', color: 'bg-emerald-500' },
  { name: 'AI Saban', desc: 'צ׳אט לוגיסטי חכם', icon: MessageSquare, href: '/ai-saban', color: 'bg-blue-500' },
  { name: 'דאשבורד', desc: 'מבט על לוגיסטי', icon: LayoutDashboard, href: '/dashboard', color: 'bg-purple-500' },
  { name: 'ניהול VIP', desc: 'קשר לקוחות מועדפים', icon: Users, href: '/admin/vip-management', color: 'bg-[#C9A227]' },
  { name: 'מעקב משלוחים', desc: 'סטטוס הזמנות בזמן אמת', icon: Truck, href: '/track', color: 'bg-orange-500' },
  { name: 'מכולות', desc: 'לוגיסטיקה כבדה', icon: Container, href: '/container', color: 'bg-indigo-500' },
  { name: 'מרכז ניתוח', desc: 'תובנות ודאטה', icon: BarChart3, href: '/admin/analysis', color: 'bg-pink-500' },
  { name: 'לוח תכנון', desc: 'סידור עבודה ומרקרים', icon: PenTool, href: '/admin/whiteboard', color: 'bg-teal-500' },
];

export default function SabanOS_Home() {
  return (
    <main className="min-h-screen bg-[#0b141a] text-white p-6 md:p-12 font-sans" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-16 text-center">
          <h1 className="text-6xl font-black mb-4 tracking-tighter italic text-[#C9A227]">SabanOS</h1>
          <p className="text-gray-400 text-xl font-bold">מערכת ניהול לוגיסטית מאוחדת - ח. סבן</p>
        </header>

        {/* Apps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {apps.map((app) => (
            <Link key={app.href} href={app.href}>
              <div className="group bg-[#202c33] p-8 rounded-[2.5rem] border border-gray-800 hover:border-[#C9A227]/50 transition-all cursor-pointer h-full flex flex-col items-center text-center hover:shadow-[0_0_30px_rgba(201,162,39,0.1)]">
                <div className={`p-4 rounded-3xl ${app.color} bg-opacity-10 mb-6 group-hover:scale-110 transition-transform`}>
                  <app.icon className={`w-10 h-10 ${app.color.replace('bg-', 'text-')}`} />
                </div>
                <h3 className="text-2xl font-black mb-2">{app.name}</h3>
                <p className="text-gray-500 font-medium">{app.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Status Bar */}
        <footer className="mt-20 border-t border-gray-800 pt-8 flex justify-between items-center text-gray-500 text-sm font-bold uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            SabanOS Online
          </div>
          <div>Version 2.0.1 - 2025</div>
        </footer>
      </div>
    </main>
  );
}
