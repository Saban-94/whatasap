'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, ShoppingCart, Calculator, ShieldCheck, AlertCircle, ArrowRight, Package } from 'lucide-react';
import Link from 'next/link';

// טעינת המוח המאוחד v2.0
import sabanUnifiedBrain from '@/data/saban_unified_v2_final.json';

export default function SabanSmartChat() {
  const [messages, setMessages] = useState<any[]>([
    { role: 'bot', content: 'שלום שחר! כאן המוח של ח. סבן. אני רואה שאתה עובד בגלגל המזלות 73. מה בונים היום?' }
  ]);
  const [input, setInput] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [sqm, setSqm] = useState<number | null>(null);
  const scrollRef = useRef<any>(null);

  // מנוע הדיאלוג החכם - Saban Agent Logic
  const processMessage = (text: string) => {
    const term = text.toLowerCase();
    let response = { content: "אני בודק בקטלוג...", type: 'chat', data: null as any };

    // 1. חיפוש חוקים ב-Ruleset המאוחד
    for (const group of sabanUnifiedBrain.ruleset) {
      for (const rule of group.rules) {
        if (rule.Trigger_Product.some(t => term.includes(t.toLowerCase()))) {
          let content = `${rule.Expert_Tip} `;
          
          // אם המשתמש הזכיר מ"ר או שיש מ"ר פעיל
          const foundSqm = text.match(/\d+/);
          const currentSqm = foundSqm ? parseInt(foundSqm[0]) : sqm;
          
          if (currentSqm) {
            setSqm(currentSqm);
            // לוגיקת חישוב דינמית לפי הקטגוריה
            if (group.category === "גבס") {
              const studs = Math.ceil(currentSqm / 0.6);
              const screws = currentSqm * 10;
              content += `ל-${currentSqm} מ"ר גבס, המוח מוסיף לך אוטומטית ${studs} ניצבים ו-${screws} ברגים. להמשיך?`;
            } else if (rule.Calculation_Logic) {
              const logicKey = Object.keys(rule.Calculation_Logic)[0];
              const factor = parseFloat(rule.Calculation_Logic[logicKey]) || 1;
              const total = Math.ceil((currentSqm * factor) / 25);
              content += `לפי החישוב של ראמי, תצטרך כ-${total} שקים/דליים.`;
            }
          } else {
            content += "כמה מ\"ר אתה מבצע כדי שאחשב לך כמויות מדויקות?";
          }

          return { 
            content, 
            type: 'expert', 
            addons: rule.Recommended_Addons,
            product: rule.Trigger_Product[0]
          };
        }
      }
    }

    // 2. הגנה רגולטורית (מגן קנסות)
    if (term.includes('מכולה') || term.includes('פינוי')) {
      return {
        content: "שחר אחי, זכור שבהרצליה חייבים לפנות מכולה עד שישי ב-14:00. להזמין לך החלפה לבוקר?",
        type: 'warning'
      };
    }

    return response;
  };

  const handleSend = () => {
    if (!input) return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);

    const result = processMessage(input);
    
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: result.content, 
        type: result.type,
        addons: result.addons 
      }]);
      
      // אם זוהה מוצר, נוסיף לסל (דוגמה בסיסית)
      if (result.type === 'expert') {
        // כאן ניתן להוסיף לוגיקה שמוסיפה את המוצר והאד-אונס לסל באמת
      }
    }, 800);
    
    setInput('');
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div dir="rtl" className="flex flex-col h-screen bg-[#FDFBF7] font-sans">
      {/* Header */}
      <header className="bg-white p-6 shadow-sm border-b flex justify-between items-center sticky top-0 z-50">
        <Link href="/dashboard" className="text-gray-400"><ArrowRight size={24} /></Link>
        <div className="text-center">
          <h1 className="font-black text-xl text-gray-800 italic">Saban AI Agent</h1>
          <p className="text-[9px] text-blue-500 font-bold uppercase tracking-widest">מומחה איטום וגבס PRO</p>
        </div>
        <div className="w-10"></div>
      </header>

      {/* אזור השיחה */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end animate-in slide-in-from-bottom-2'}`}>
            <div className={`max-w-[85%] p-5 rounded-[30px] shadow-sm text-sm font-bold leading-relaxed ${
              m.role === 'user' 
                ? 'bg-[#1976D2] text-white rounded-br-none' 
                : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
            }`}>
              {m.content}
              
              {/* כפתורי מוצרים משלימים (Upsell) */}
              {m.addons && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {m.addons.map((addon: string, idx: number) => (
                    <button key={idx} className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-xl text-[10px] border border-blue-100 flex items-center gap-1">
                      <Plus size={12} /> הוסף {addon}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </main>

      {/* Footer והזנה */}
      <footer className="p-6 bg-white border-t rounded-t-[45px] shadow-2xl">
        {sqm && (
          <div className="mb-4 flex justify-center">
            <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-[10px] font-black flex items-center gap-2">
              <Calculator size={12} /> המוח מחשב לפי: {sqm} מ"ר
            </span>
          </div>
        )}
        <div className="relative flex items-center gap-3">
          <input 
            type="text"
            className="flex-1 p-5 pr-6 bg-gray-50 rounded-3xl border-none focus:ring-2 focus:ring-blue-400 font-bold text-gray-700 text-lg shadow-inner"
            placeholder="שאל את המוח (למשל: 'צריך גבס ל-50 מ''ר')..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            className="bg-[#1976D2] text-white p-5 rounded-3xl shadow-lg active:scale-90 transition-all"
          >
            <Send size={24} />
          </button>
        </div>
      </footer>
    </div>
  );
}

// רכיב פלוס קטן
function Plus({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14"/>
    </svg>
  );
}
