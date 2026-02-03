'use client';
export const dynamic = 'force-dynamic';
const PRIMARY_MODEL = "gemini-flash-latest";
import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, ShoppingCart, Calculator, ShieldCheck, AlertCircle, ArrowRight, Plus } from 'lucide-react';
import Link from 'next/link';

// --- המוח המאוחד מוטמע ישירות (מניעת שגיאות Build) ---
const SABAN_RULES = [
  {
    category: "איטום",
    rules: [
      {
        Trigger_Product: ["סיקה 107", "Sika 107"],
        Recommended_Addons: ["סרט סיקה-סיל טייפ", "מברשת איטום"],
        Expert_Tip: "שחר, זכור: סיקה 107 מחייב שתי שכבות וסרטי פינות בכל החיבורים.",
        Calculation: 3 // ק"ג למ"ר
      }
    ]
  },
  {
    category: "גבס",
    rules: [
      {
        Trigger_Product: ["גבס", "לוחות גבס", "גבס ירוק"],
        Recommended_Addons: ["ניצבים", "מסלולים", "ברגי גבס", "סרט שריון"],
        Expert_Tip: "בגבס ירוק חובה להשתמש בברגים עמידי רטיבות בחדרים רטובים.",
        Calculation: "pro_gypsum"
      }
    ]
  },
  {
    category: "שיקום_בטון",
    rules: [
      {
        Trigger_Product: ["סיקה רפ", "Sika Rep"],
        Recommended_Addons: ["מונוטופ 610", "פריימר מקשר"],
        Expert_Tip: "אם הברזל חשוף, חובה ליישם מונוטופ 610 נגד חלודה לפני הסגירה.",
        Calculation: 1.8 // ק"ג למ"ר לכל מ"מ
      }
    ]
  }
];

export default function SabanSmartChat() {
  const [messages, setMessages] = useState<any[]>([
    { role: 'bot', content: 'שלום שחר! כאן המוח של ח. סבן. אני זוכר שאנחנו בגלגל המזלות 73. מה בונים היום?' }
  ]);
  const [input, setInput] = useState('');
  const [sqm, setSqm] = useState<number | null>(null);
  const scrollRef = useRef<any>(null);

  const processLogic = (text: string) => {
    const term = text.toLowerCase();
    
    // בדיקת מ"ר בטקסט
    const foundSqm = text.match(/\d+/);
    if (foundSqm) setSqm(parseInt(foundSqm[0]));

    for (const group of SABAN_RULES) {
      for (const rule of group.rules) {
        if (rule.Trigger_Product.some(t => term.includes(t.toLowerCase()))) {
          let content = `${rule.Expert_Tip} `;
          
          if (rule.Calculation === "pro_gypsum" && (foundSqm || sqm)) {
            const currentSqm = foundSqm ? parseInt(foundSqm[0]) : sqm;
            const studs = Math.ceil(currentSqm! / 0.6);
            const screws = currentSqm! * 10;
            content += `ל-${currentSqm} מ"ר גבס, חישבתי לך ${studs} ניצבים ו-${screws} ברגים.`;
          } else if (typeof rule.Calculation === 'number' && (foundSqm || sqm)) {
            const currentSqm = foundSqm ? parseInt(foundSqm[0]) : sqm;
            const total = Math.ceil((currentSqm! * rule.Calculation) / 25);
            content += `ל-${currentSqm} מ"ר, תצטרך כ-${total} שקים/סטים.`;
          }

          return { content, addons: rule.Recommended_Addons };
        }
      }
    }
    
    if (term.includes('מכולה') || term.includes('פינוי')) {
      return { content: "שחר, בהרצליה חייבים לפנות מכולה עד שישי ב-14:00. לסגור לך פינוי?" };
    }

    return { content: "הבנתי, אני בודק זמינות במחסן של ראמי... עוד משהו שתרצה להוסיף?" };
  };

  const handleSend = () => {
    if (!input) return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);

    const result = processLogic(input);
    
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: result.content, 
        addons: result.addons 
      }]);
    }, 600);
    
    setInput('');
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div dir="rtl" className="flex flex-col h-screen bg-[#FDFBF7] font-sans text-right">
      <header className="bg-white p-6 shadow-sm border-b flex justify-between items-center sticky top-0 z-50">
        <Link href="/dashboard" className="text-gray-400 p-2"><ArrowRight size={24} /></Link>
        <div className="text-center">
          <h1 className="font-black text-xl text-gray-800 italic">Saban AI Agent</h1>
          <p className="text-[9px] text-blue-500 font-bold uppercase tracking-widest">מומחה איטום וגבס PRO</p>
        </div>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end animate-in fade-in duration-500'}`}>
            <div className={`max-w-[85%] p-5 rounded-[30px] shadow-sm text-sm font-bold leading-relaxed ${
              m.role === 'user' ? 'bg-[#1976D2] text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
            }`}>
              {m.content}
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

      <footer className="p-6 bg-white border-t rounded-t-[45px] shadow-2xl">
        <div className="relative flex items-center gap-3">
          <input 
            type="text"
            className="flex-1 p-5 pr-6 bg-gray-50 rounded-3xl border-none font-bold text-gray-700 text-lg shadow-inner focus:ring-2 focus:ring-blue-100"
            placeholder="דבר עם המוח (למשל: 'גבס ל-50 מ''ר')..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button onClick={handleSend} className="bg-[#1976D2] text-white p-5 rounded-3xl shadow-lg active:scale-95 transition-all">
            <Send size={24} />
          </button>
        </div>
      </footer>
    </div>
  );
}
