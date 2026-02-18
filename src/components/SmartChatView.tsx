"use client";
import { useState } from "react";
import { processSmartOrder } from "@/lib/dataEngine";

export default function SmartChatView({ customerId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    const userMsg = { role: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    
    const response = await processSmartOrder(customerId, input);
    setMessages(prev => [...prev, response]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-screen bg-[#e5ddd5]">
      {/* Header WhatsApp Style */}
      <div className="bg-[#075e54] text-white p-4 flex items-center shadow-lg">
        <div className="font-bold">ה. סבן - שירות VIP</div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs p-3 rounded-lg shadow ${msg.role === 'user' ? 'bg-[#dcf8c6]' : 'bg-white'}`}>
              {msg.text}
              {msg.meta?.recommendations && (
                <div className="mt-2 border-t pt-2 text-sm font-bold">
                  המלצת המערכת: {msg.meta.recommendations.map(r => `${r.qty} x ${r.name}`).join(", ")}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white flex gap-2">
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border rounded-full px-4 py-2 focus:outline-none"
          placeholder="כתוב הודעה..."
        />
        <button onClick={handleSend} className="bg-[#128c7e] text-white rounded-full p-2 w-12 h-12 flex items-center justify-center">
          🕊️
        </button>
      </div>
    </div>
  );
}
