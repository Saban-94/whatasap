'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Clock, truck, User } from 'lucide-react';

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
        // משיכת נתונים מטרבלת הנהגים/פעילות בסופבייס
        const { data, error } = await supabase
          .from('driver_activities') // וודא שזה שם הטבלה שלך
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

    // האזנה לשינויים בזמן אמת (Real-time)
    const subscription = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'driver_activities' }, 
        payload => {
          setEvents(prev => [payload.new as TimelineEvent, ...prev].slice(0, 10));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return (
    <div className="mt-8 p-6 bg-slate-800 rounded-xl border border-slate-700 text-right" dir="rtl">
      <h2 className="text-xl font-semibold mb-6 text-sky-400 flex items-center gap-2">
        <Clock className="text-sky-400" />
        ציר זמן פעילות נהגים (זמן אמת)
      </h2>

      {loading ? (
        <div className="text-center py-10 text-slate-400 animate-pulse">טוען נתונים מהשטח...</div>
      ) : events.length === 0 ? (
        <div className="text-center py-10 text-slate-400">
          <p>אין פעילות רשומה כרגע.</p>
          <p className="text-sm mt-2">נתוני איתוראן יופיעו כאן לאחר סנכרון.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="relative pr-6 border-r-2 border-slate-600 pb-4 last:pb-0">
              <div className="absolute -right-[9px] top-1 w-4 h-4 bg-sky-500 rounded-full border-4 border-slate-800"></div>
              <div className="bg-slate-700/50 p-3 rounded-lg border border-slate-600 hover:border-sky-500 transition-colors">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-100 flex items-center gap-1">
                    <User size={14} /> {event.driver_name}
                  </span>
                  <span className="text-xs text-slate-400">{new Date(event.event_time).toLocaleTimeString('he-IL')}</span>
                </div>
                <p className="text-sm text-slate-300">{event.activity_type} - {event.location}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
