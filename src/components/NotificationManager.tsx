'use client';

import { useEffect } from 'react';

export default function NotificationManager() {
  useEffect(() => {
    // מניעת הרצה בשרת
    if (typeof window !== 'undefined') {
      const OneSignalDeferred = (window as any).OneSignalDeferred || [];
      
      OneSignalDeferred.push(async (OneSignal: any) => {
        await OneSignal.init({
          appId: "546472ac-f9ab-4c6c-beb2-e41c72af9849",
          safari_web_id: "web.onesignal.auto.195e7e66-9dea-4e11-b56c-b4a654da5ab7",
          notifyButton: {
            enable: true,
            displayPredicate: () => {
              return OneSignal.isPushNotificationsEnabled().then((isEnabled: boolean) => {
                return !isEnabled; // הצג כפתור רק אם התראות לא מאופשרות
              });
            }
          },
          allowLocalhostAsSecureOrigin: true, // מאפשר בדיקה בסביבת פיתוח
        });
      });
    }
  }, []);

  return null; // רכיב שקוף שרק מריץ לוגיקה
}
