'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Chat from '@/components/Chat'; // וודא שהקומפוננטה קיימת

export default function Home() {
  const searchParams = useSearchParams();
  const [userName, setUserName] = useState('אורח');
  const [lastProject, setLastProject] = useState('');

  useEffect(() => {
    const user = searchParams.get('user');
    if (user === 'shahar') {
      setUserName('שחר שאול');
      setLastProject('בילו 53, רעננה'); // מבוסס על ה-CSV שלך
    }
  }, [searchParams]);

  return (
    <main className="min-h-screen bg-[#0b141a]">
      {/* הברכה האישית של ג'ימיני */}
      <div className="p-6 bg-[#202c33] border-b border-gray-700 text-right rtl">
        <h2 className="text-[#C9A227] font-black text-xl italic">בוקר טוב, {userName} אחי.</h2>
        <p className="text-gray-400 text-xs">יועץ ה-AI של ח. סבן איתך. זוכר שאנחנו עובדים על פרויקט **{lastProject}**.</p>
      </div>

      <Chat initialMessage={`אהלן ${userName}, מה להעמיס לך היום למשאית?`} />
    </main>
  );
}
