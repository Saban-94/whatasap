'use client';
import { useState, useEffect } from 'react';

export default function ChatAssistant() {
  const [messages, setMessages] = useState<{role: string, parts: {text: string}[]}[]>([]);
  const [input, setInput] = useState('');

  // טעינת היסטוריה מהדפדפן
  useEffect(() => {
    const saved = localStorage.getItem('saban_chat_history');
    if (saved) setMessages(JSON.parse(saved));
  }, []);

  // שמירת היסטוריה בכל שינוי
  useEffect(() => {
    localStorage.setItem('saban_chat_history', JSON.stringify(messages));
  }, [messages]);

  const sendMessage = async () => {
    const userMessage = { role: "user", parts: [{ text: input }] };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');

    const res = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: input, history: messages }),
    });
    
    const data = await res.json();
    setMessages([...newMessages, { role: "model", parts: [{ text: data.text }] }]);
  };

  return (
    <div className="fixed bottom-24 right-6 w-80 saban-card z-50 flex flex-col max-h-[400px]">
      <div className="overflow-y-auto flex-1 mb-4 text-sm">
        {messages.map((m, i) => (
          <div key={i} className={`mb-2 ${m.role === 'user' ? 'text-blue-600 font-bold' : 'text-sabanGold'}`}>
            {m.role === 'user' ? '👤 אתה: ' : '🤖 יועץ סבן: '} {m.parts[0].text}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-gray-100 rounded-lg p-2 text-black"
          placeholder="שאל את המומחה..."
        />
        <button onClick={sendMessage} className="p-2 bg-saban-dark-blue rounded-lg text-white">שלח</button>
      </div>
      <button onClick={() => setMessages([])} className="text-[10px] mt-2 opacity-50 underline">איפוס מוח 🧠</button>
    </div>
  );
}
