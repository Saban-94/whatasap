'use client';

import React, { useState, useEffect } from 'react';
import { FileJson, RefreshCcw, Save, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

const DATA_FILES = [
  { id: 'customer_history', name: 'customer_history.json' },
  { id: 'inventory', name: 'inventory.json' },
  { id: 'products', name: 'products.json' },
  { id: 'technical_knowledge', name: 'technical_knowledge.json' },
  { id: 'saban_master_brain', name: 'saban_master_brain.json' }
];

export default function DataFileManager() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // טעינת קובץ מהשרת
  const loadFile = async (fileName: string) => {
    setLoading(true);
    setSelectedFile(fileName);
    try {
      const res = await fetch(`/api/admin/files?file=${fileName}`);
      const data = await res.json();
      if (data.content) setContent(JSON.stringify(data.content, null, 2));
      else setContent('[]');
    } catch (e) {
      alert("שגיאה בטעינת הקובץ");
    }
    setLoading(false);
  };

  // שמירת הקובץ לשרת
  const saveFile = async () => {
    if (!selectedFile) return;
    setLoading(true);
    try {
      const parsedContent = JSON.parse(content);
      const res = await fetch('/api/admin/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: selectedFile, content: parsedContent })
      });

      if (res.ok) {
        setStatus('success');
        setTimeout(() => setStatus('idle'), 3000);
      }
    } catch (e) {
      alert("שגיאה: וודא שה-JSON שכתבת תקין (סוגריים, פסיקים וכד')");
      setStatus('error');
    }
    setLoading(false);
  };

  return (
    <div className="p-8 bg-[#0b141a] min-h-screen text-white" dir="rtl">
      <header className="mb-8 border-b border-gray-800 pb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-[#00a884]">מרכז ניהול קבצי נתונים</h1>
          <p className="text-gray-500 text-sm mt-1">עריכה ושמירה ישירה של בסיסי נתונים JSON</p>
        </div>
        {selectedFile && (
          <button 
            onClick={saveFile}
            disabled={loading}
            className="bg-[#00a884] hover:bg-[#06cf9c] px-8 py-2 rounded-full font-bold flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />}
            שמור שינויים בקובץ
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="space-y-2">
          {DATA_FILES.map(f => (
            <button 
              key={f.id}
              onClick={() => loadFile(f.id)}
              className={`w-full text-right p-4 rounded-xl border flex items-center gap-3 transition-all ${
                selectedFile === f.id ? 'bg-[#00a884]/10 border-[#00a884]' : 'bg-[#111b21] border-gray-800 hover:border-gray-700'
              }`}
            >
              <FileJson className={selectedFile === f.id ? 'text-[#00a884]' : 'text-gray-500'} />
              <span className="text-sm font-bold">{f.name}</span>
            </button>
          ))}
        </div>

        <div className="lg:col-span-3 bg-[#111b21] rounded-2xl border border-gray-800 overflow-hidden flex flex-col h-[70vh]">
          {selectedFile ? (
            <>
              <div className="bg-[#202c33] p-3 text-[10px] font-mono text-gray-400 flex justify-between">
                <span>FILE_PATH: /src/data/{selectedFile}.json</span>
                {status === 'success' && <span className="text-green-500 flex items-center gap-1"><CheckCircle2 size={12}/> נשמר בהצלחה</span>}
              </div>
              <textarea 
                className="flex-1 bg-[#0b141a] p-6 font-mono text-sm text-blue-300 outline-none resize-none"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                spellCheck={false}
              />
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-600 italic">
              בחר קובץ מהרשימה לעריכה
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
