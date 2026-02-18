'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
// PascalCase import - התיקון שמונע שגיאת build
import { Clock, Truck, User } from 'lucide-react';

interface TimelineEvent {
  id: string;
  driver_name: string;
  event_time: string;
  location: string;
  activity_type: string;
}

export default function TimelineView() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTimeline() {
      try {
        const { data, error } = await supabase
          .from('driver_activities') 
          .select('*')
          .order('event_time', { ascending: false })
          .limit(10);

        if (error) throw error;
        setEvents(data || []);
      } catch (err) {
        console.error('Error fetching timeline:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchTimeline();

    // הגדרת סוג מפורש ל-payload כדי לעבור TypeScript Validation ב-Vercel
    const subscription = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'driver_activities' }, 
        (payload: { new: TimelineEvent }) => {
          setEvents(prev => [payload.new, ...prev].slice(0, 10));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const formatTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleTimeString('he-IL', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (e) {
      return '--:--';
    }
  };

  return (
    <div className="mt-8 p-6 bg-slate-800 rounded-xl border border-slate-700 text-right" dir="rtl">
      <h2 className="text-xl font-semibold mb-6 text-sky-400 flex items-center gap-2 justify-start">
        <Clock className="w-6 h-6" />
        ציר זמן פעילות נהגים (זמן אמת)
      </h2>

      {loading ? (
        <div className="text-center py-10 text-slate-400 animate-pulse font-medium">
          טוען נתונים מהשטח...
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-10 text-slate-400 border-2 border-dashed border-slate-700 rounded-lg">
          <p className="font-bold text-lg">אין פעילות רשומה כרגע</p>
          <p className="text-sm mt-2 opacity-70">נתוני איתוראן יופיעו כאן לאחר סנכרון הקבצים</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="relative pr-6 border-r-2 border-slate-600 pb-4 last:pb-0">
              {/* הנקודה בציר הזמן */}
              <div className="absolute -right-[9px] top-1 w-4 h-4 bg-sky-500 rounded-full border-4 border-slate-800 shadow-[0_0_8px_rgba(14,165,233,0.5)]"></div>
              
              <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600 hover:border-sky-500 transition-all duration-200 group">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-slate-100 flex items-center gap-2">
                    <User size={14} className="text-sky-400" /> 
                    {event.driver_name}
                  </span>
                  <span className="text-xs text-slate-400 font-mono bg-slate-800 px-2 py-1 rounded">
                    {formatTime(event.event_time)}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Truck size={14} className="text-slate-400 mt-1 shrink-0 group-hover:text-sky-300 transition-colors" />
                  <div className="text-sm leading-tight">
                    <span className="text-sky-300 font-semibold">{event.activity_type}</span>
                    <p className="text-slate-400 text-xs mt-1 italic">
                      {event.location ? event.location : "מיקום לא זוהה"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
