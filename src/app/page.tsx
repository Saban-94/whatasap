'use client';
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Send, HardHat, Camera, FileUp, ShoppingCart, Play, User, History, Info } from 'lucide-react';
import productData from '@/data/products.json'; // ייבוא נתוני המוצרים
import customerData from '@/data/customers.json'; // ייבוא נתוני הלקוחות

// --- סוגי נתונים (Interfaces) ---
interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  application_method: string;
  unit: string;
  image_url: string;
  video_url: string;
  // נכסים אופציונליים נוספים שהיו בגרסאות קודמות, למשל:
  drying_time?: string;
  coverage?: string;
}

interface Customer {
  id: string;
  name: string;
  company: string;
  active_projects: string[];
  preferences: string;
  credit_status: string;
  magic_link_token: string;
  profile_image_url: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  product?: Product | null;
}

// --- קומפוננטת כרטיס מוצר ---
const ProductCard = ({ product }: { product: Product }) => (
  <div className="mt-4 bg-[#162127] rounded-2xl overflow-hidden border border-gray-700 shadow-2xl max-w-sm mr-auto ml-0 text-right font-sans">
    <img src={product.image_url} alt={product.name} className="w-full h-40 object-cover border-b border-gray-700" />
    <div className="p-4 space-y-3">
      <h4 className="text-[#C9A227] font-black text-lg tracking-tighter leading-none">{product.name}</h4>
      <p className="text-gray-400 text-[11px] leading-tight">{product.description}</p>
      <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
        <div className="bg-[#202c33] p-2 rounded-lg border border-gray-800">
          <span className="text-gray-500 block uppercase mb-1 font-black">יישום</span>
          {product.application_method}
        </div>
        <div className="bg-[#202c33] p-2 rounded-lg border border-gray-800">
          <span className="text-gray-500 block uppercase mb-1 font-black">אריזה</span>
          {product.unit}
        </div>
      </div>
      <button className="w-full bg-[#C9A227] text-black font-black py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-[#e0b52d] transition-all text-xs">
        <ShoppingCart size={14} /> בצע הזמנה
      </button>
    </div>
  </div>
);

// --- קומפוננטת הצ'אט הראשית ---
function SabanChatContent() {
  const searchParams = useSearchParams();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); // רפרנס להעלאת קבצים

  // טעינת פרופיל הלקוח וברכה אישית
  useEffect(() => {
    const token = searchParams.get('user');
    const foundCustomer = customerData.find(c => c.magic_link_token === token);

    if (foundCustomer) {
      setCustomer(foundCustomer);
      setMessages([
        { role: 'assistant', content: `אהלן ${foundCustomer.name} אחי! ברוך הבא למוקד VIP של ח. סבן. אני רואה שאתה עובד על פרויקט **${foundCustomer.active_projects[0]}**. מה להכין לך היום?` }
      ]);
    } else {
      // אם אין זיהוי - לקוח אורח
      setCustomer(null); // או אובייקט לקוח אורח
      setMessages([
        { role: 'assistant', content: `שלום אחי! כאן מוקד ה-VIP של ח. סבן. איך אני יכול לעזור לך היום? (לכניסה כקבלן רשום, יש להשתמש בלינק האישי)` }
      ]);
    }
  }, [searchParams]);

  // גלילה אוטומטית לתחתית הצ'אט
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isThinking]);

  // טיפול בשליחת הודעה (סימולציה)
  const handleSend = () => {
    if (!input.trim() || isThinking) return;

    const userMessageContent = input;
    setMessages(prev => [...prev, { role: 'user', content: userMessageContent }]);
    setInput('');
    setIsThinking(true);

    // סימולציה של תגובת AI
    setTimeout(() => {
      setIsThinking(false);
      // סימולציה: אם המשתמש מזכיר "חול", המערכת מציגה כרטיס מוצר
      if (userMessageContent.includes("חול")) {
        const sandProduct = productData.find(p => p.name.includes("חול"));
        if (sandProduct) {
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: `בטח, אחי. יש לנו בלה חול נקי במלאי. הנה הפרטים:`, 
            product: sandProduct 
          }]);
        } else {
          setMessages(prev => [...prev, { role: 'assistant', content: "אנחנו יכולים לספק לך חול. כמה בלות תרצה?" }]);
        }
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: `הבנתי, ${customer?.name || 'אחי'}. אני בודק את זה עבורך במלאי.` }]);
      }
    }, 1500);
  };

  // טיפול בהעלאת קבצים (סימולציה)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMessages(prev => [...prev, { role: 'user', content: `העלה קובץ: ${file.name}. אנא נתח צילום/מסמך זה.` }]);
      setIsThinking(true);
      setTimeout(() => {
        setIsThinking(false);
        const sikadurProduct = productData.find(p => p.name.includes("Sikadur 52"));
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'מניתוח הצילום, אני מזהה סדק הדורש טיפול מיידי. אני ממליץ על Sikadur 52 להזרקה.', 
          product: sikadurProduct || null 
        }]);
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0b141a] text-right" dir="rtl">
      {/* Header VIP */}
      <div className="bg-[#202c33] p-4 flex items-center justify-between border-b border-gray-700 shadow-xl z-10 font-sans">
        <div className="flex items-center gap-3">
          {customer?.profile_image_url ? (
            <img 
              src={customer.profile_image_url} 
              alt={customer.name} 
              className="w-10 h-10 rounded-full object-cover border-2 border-[#C9A227] shadow-inner"
            />
          ) : (
            <div className="w-10 h-10 bg-[#C9A227] rounded-full flex items-center justify-center text-black font-black text-xl border-2 border-yellow-600 shadow-inner">ח</div>
          )}
          <div>
            <h1 className="font-bold text-white text-sm">ח. סבן - Intelligence</h1>
            <p className="text-[9px] text-green-500 font-black tracking-widest uppercase italic">VIP SERVICE | {customer?.name || 'אורח'}</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-[#C9A227] transition-colors"><History size={20} /></button>
      </div>

      {/* אזור ההודעות */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcd2de8.png')] bg-repeat opacity-95">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-start'
