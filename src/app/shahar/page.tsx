'use client';
import React, { useState, useEffect, useRef } from 'react';
// ... שאר ה-Imports

// תמונות פרופיל מעודכנות
const SHAHAR_PROFILE_PIC = "https://api.dicebear.com/7.x/pixel-art/svg?seed=ShaharShaul";
const SABAN_AI_PROFILE_PIC = "https://media-mrs2-1.cdn.whatsapp.net/v/t61.24694-24/524989315_1073256511118475_7315275522833323073_n.jpg?ccb=11-4&oh=01_Q5Aa3wFxRPXggH-pzRFes-D1aIk6klzJrTv9Ks5RbOrhtvKfvQ&oe=69A5059E&_nc_sid=5e03e0&_nc_cat=111";

export default function ShaharUnifiedApp() {
  // ... שאר ה-State והלוגיקה

  return (
    <div className={`${isDarkMode ? 'bg-[#0b141a] text-white' : 'bg-[#f0f2f5] text-black'} flex h-screen w-full transition-colors`} dir="rtl">
      
      {/* Sidebar */}
      <div className={`w-80 border-l ${isDarkMode ? 'border-[#202c33] bg-[#111b21]' : 'border-gray-200 bg-white'} hidden lg:flex flex-col`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
             <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full hover:bg-gray-500/10">
                {isDarkMode ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} />}
             </button>
             {/* תמונת פרופיל שחר */}
             <img src={SHAHAR_PROFILE_PIC} className="w-10 h-10 rounded-full border-2 border-[#C9A227] bg-[#202c33]" />
          </div>

          {/* ... כרטיס VIP ופרויקטים ... */}
        </div>
      </div>

      {/* אזור הצ'אט */}
      <div className="flex-1 flex flex-col relative">
        <header className={`${isDarkMode ? 'bg-[#202c33]' : 'bg-white shadow-sm'} h-16 px-4 flex items-center justify-between z-10`}>
          <div className="flex items-center gap-3">
             {/* תמונת פרופיל גימני החדשה */}
             <div className="relative">
                <img src={SABAN_AI_PROFILE_PIC} className="w-10 h-10 rounded-full border border-[#00a884] object-cover" />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a884] border-2 border-[#202c33] rounded-full"></div>
             </div>
             <div>
               <p className="text-sm font-bold tracking-tight">גימני - יועץ ח.סבן</p>
               <p className="text-[10px] text-[#00a884] font-medium">מחובר למלאי בזמן אמת</p>
             </div>
          </div>
          {/* ... כפתורי Header ... */}
        </header>

        {/* זרימת הודעות */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-6 bg-[url('https://i.ibb.co/S6mXvY7/whatsapp-bg.png')] bg-opacity-10">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'ai' ? 'justify-start' : 'justify-end'} items-end gap-2`}>
              {msg.sender === 'ai' && (
                <img src={SABAN_AI_PROFILE_PIC} className="w-6 h-6 rounded-full border border-[#C9A227]/30 mb-1" />
              )}
              <div className={`max-w-[85%] md:max-w-[60%] p-4 rounded-2xl shadow-lg relative ${msg.sender === 'ai' ? (isDarkMode ? 'bg-[#202c33] rounded-tr-none' : 'bg-white text-black') : 'bg-[#005c4b] rounded-tl-none text-white'}`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                
                {/* ... כרטיסי מוצרים ... */}
                
                <span className="text-[9px] mt-2 opacity-40 block text-left">{msg.time}</span>
              </div>
              {msg.sender === 'user' && (
                <img src={SHAHAR_PROFILE_PIC} className="w-6 h-6 rounded-full border border-[#00a884]/30 mb-1" />
              )}
            </div>
          ))}
          {/* ... אפקט הקלדה ו-Scroll ... */}
        </div>

        {/* ... פוטר הקלדה ... */}
      </div>
      {/* ... מודאל סיכום ו-Sidebar הזמנה ... */}
    </div>
  );
}
