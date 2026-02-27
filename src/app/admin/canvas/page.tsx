'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Warp } from "@paper-design/shaders-react";
import { useAudioLevel } from "@/hooks/use-audio-level"; // וודא שההוק קיים
import { Search, Send, Mic, MicOff, Database, Zap, Info } from 'lucide-react';

export default function SabanAICanvas() {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const { audioLevel } = useAudioLevel(); // רמת האודיו משפיעה על ה-Shader
  
  // פרמטרים ל-Shader (החזון הוויזואלי של סבן)
  const shaderParams = {
    color1: "#00a884", // ירוק סבן
    color2: "#111b21", // כחול כהה ווטסאפ
    color3: "#53bdeb", // תכלת אישור
    speed: 6.0,
    scale: 0.4,
    distortion: 0.3
  };

  return (
    <div className="min-h-screen bg-[#0b141a] text-white flex flex-col items-center justify-between p-8 font-sans overflow-hidden" dir="rtl">
      
      {/* Header - סטטוס מערכת */}
      <div className="w-full max-w-5xl flex justify-between items-center opacity-70">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-[#00a884] rounded-full animate-ping" />
          <span className="text-[10px] font-black uppercase tracking-widest">Saban Master Brain v2.0</span>
        </div>
        <div className="flex items-center gap-6 text-[10px] font-bold">
          <span className="flex items-center gap-1"><Database size={12}/> Sync: 100%</span>
          <span className="flex items-center gap-1"><Zap size={12}/> AI: Active</span>
        </div>
      </div>

      {/* Center - ה-Orb של סבן (הלב של ה-AI) */}
      <div className="relative flex flex-col items-center justify-center">
        {/* הילה חיצונית */}
        <div 
          className="absolute inset-0 bg-[#00a884] opacity-20 blur-[100px] transition-all duration-300"
          style={{ transform: `scale(${1 + audioLevel * 2})` }}
        />
        
        {/* ה-Shader המעגלי */}
        <div 
          className="rounded-full overflow-hidden border-4 border-[#111b21] shadow-[0_0_50px_rgba(0,168,132,0.3)] transition-transform duration-75"
          style={{ 
            width: 320, 
            height: 320,
            transform: `scale(${1 + audioLevel * 0.2})` 
          }}
        >
          <Warp
            width={320}
            height={320}
            colors={[shaderParams.color1, shaderParams.color2, shaderParams.color3]}
            speed={shaderParams.speed}
            scale={shaderParams.scale}
            distortion={shaderParams.distortion}
            softness={0.9}
            swirl={1.5}
          />
        </div>

        <div className="mt-8 text-center">
          <h2 className="text-2xl font-black tracking-tighter text-[#00a884] mb-1">במה אני יכול לעזור?</h2>
          <p className="text-xs text-gray-500 font-medium">שאל על מלאי, מפרטים טכניים או מחירים</p>
        </div>
      </div>

      {/* Bottom - Input מעוצב קנבס */}
      <div className="w-full max-w-2xl relative mb-4">
        <div className="bg-[#1c272d]/80 backdrop-blur-2xl p-2 rounded-[2.5rem] border border-gray-700 shadow-2xl flex items-center gap-2">
          <button 
            onClick={() => setIsListening(!isListening)}
            className={`p-4 rounded-full transition-all ${isListening ? 'bg-red-500 animate-pulse' : 'text-gray-500 hover:bg-gray-800'}`}
          >
            {isListening ? <MicOff size={22} /> : <Mic size={22} />}
          </button>
          
          <input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חפש במלאי (למשל: כמה סיקה 107 יש בבני ברק?)" 
            className="flex-1 bg-transparent outline-none text-sm py-4 px-2 placeholder:text-gray-600"
          />
          
          <button className="bg-[#00a884] hover:bg-[#06cf9c] p-4 rounded-full text-white shadow-lg transition-all active:scale-95">
            <Send size={22} />
          </button>
        </div>
        
        {/* תגיות מהירות */}
        <div className="flex justify-center gap-2 mt-4">
          {['בדיקת מלאי', 'מפרט טכני', 'מחירון VIP'].map(tag => (
            <button key={tag} className="text-[9px] font-bold border border-gray-800 px-3 py-1 rounded-full text-gray-500 hover:border-[#00a884] hover:text-[#00a884] transition-all">
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
