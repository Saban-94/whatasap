'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileJson, 
  RefreshCcw, 
  Database, 
  Save, 
  AlertCircle, 
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// רשימת הקבצים במערכת
const DATA_FILES = [
  { id: 'customer_history', name: 'customer_history.json', description: 'היסטוריית לקוחות (מהווטסאפ)', table: 'customers' },
  { id: 'inventory', name: 'inventory.json', description: 'מלאי נוכחי וזמינות', table: 'inventory' },
  { id: 'products', name: 'products.json', description: 'קטלוג מוצרים כללי', table: 'products' },
  { id: 'technical_knowledge', name: 'technical_knowledge.json', description: 'ידע טכני לאיטום ובנייה', table: 'knowledge_base' },
  { id: 'saban_master_brain', name: 'saban_master_brain.json', description: 'המוח הלוגיסטי המרכזי', table: 'master_brain' }
];

export default function DataFileManager() {
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'syncing' | 'success'>('idle');

  // פונקציה לטעינת קובץ (במציאות זה יבוצע דרך API)
  const loadFile = async (file: any) => {
    setSelectedFile(file);
    setStatus('idle');
    // כאן תתבצע קריאת fetch ל-API שמביא את תוכן הקובץ
    setFileContent('// טוען נתונים מהקובץ...');
  };

  // פונקציה לסנכרון קובץ ל-Supabase (העבודה השחורה)
  const syncToSupabase = async () => {
    if (!selectedFile) return;
    setStatus('syncing');
    
    try {
      const jsonData = JSON.parse(fileContent);
      
      // ביצוע Upsert (עדכון אם קיים, הוספה אם חדש) לטבלה המתאימה
      const { error } = await supabase
        .from(selectedFile.table)
        .upsert(jsonData);

      if (error) throw error;
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      alert("שגיאת סנכרון: וודא שה-JSON תקין ושהטבלה קיימת ב-Supabase");
      setStatus('idle');
    }
  };

  return (
    <div className="p-8 bg-[#0b141a] min-h-screen text-white font-sans" dir="rtl">
      <header className="mb-8 border-b border-gray-800 pb-6">
        <h1 className="text-2xl font-black text-[#00a884] flex items-center gap-3">
          <Database size={28} /> ניהול מאגרי נתונים - סבן הנדסה
        </h1>
        <p className="text-gray-500 mt-2 text-sm">סנכרון בין קבצי JSON מקומיים לענן (Supabase)</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* רשימת קבצים */}
        <div className="space-y-3">
          {DATA_FILES.map((file) => (
            <button
              key={file.id}
              onClick={() => loadFile(file)}
              className={`w-full text-right p-4 rounded-xl border transition-all flex items-center justify-between ${
                selectedFile?.id === file.id 
                ? 'bg-[#00a884]/10 border-[#00a884] shadow-lg shadow-[#00a884]/10' 
                : 'bg-[#111b21] border-gray-800 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileJson className={selectedFile?.id === file.id ? 'text-[#00a884]' : 'text-gray-500'} />
                <div>
                  <p className="text-sm font-bold">{file.name}</p>
                  <p className="text-[10px] text-gray-500 italic">{file.description}</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-700" />
            </button>
          ))}
        </div>

        {/* עורך תוכן הקובץ */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {selectedFile ? (
            <div className="bg-[#111b21] rounded-2xl border border-gray-800 flex flex-col h-[600px] overflow-hidden">
              <div className="bg-[#202c33] p-4 flex justify-between items-center border-b border-gray-800">
                <span className="text-xs font-mono text-gray-400">עורך: {selectedFile.name}</span>
                <div className="flex gap-2">
                   <button 
                    onClick={syncToSupabase}
                    disabled={status === 'syncing'}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    {status === 'syncing' ? <RefreshCcw className="animate-spin" size={14}/> : <RefreshCcw size={14} />}
                    סנכרן ל-Supabase
                  </button>
                  <button className="bg-[#00a884] hover:bg-[#06cf9c] px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all">
                    <Save size={14} /> שמור קובץ
                  </button>
                </div>
              </div>
              
              <textarea 
                className="flex-1 bg-[#0b141a] p-6 font-mono text-sm text-blue-300 outline-none resize-none overflow-y-auto"
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                spellCheck={false}
              />

              {status === 'success' && (
                <div className="bg-green-900/20 p-3 flex items-center gap-3 text-green-500 text-xs font-bold">
                  <CheckCircle2 size={16} /> הנתונים סונכרנו בהצלחה לטבלת {selectedFile.table}!
                </div>
              )}
            </div>
          ) : (
            <div className="h-full border-2 border-dashed border-gray-800 rounded-2xl flex flex-col items-center justify-center text-gray-600">
              <AlertCircle size={48} className="mb-4 opacity-20" />
              <p>בחר קובץ מהרשימה כדי לצפות בנתונים או לסנכרן לענן</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
