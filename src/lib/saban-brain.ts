// src/lib/saban-brain.ts

export const analyzeDelivery = (ituranData: any[], pdfData: any[], rules: any[]) => {
  return pdfData.map((ticket: any) => {
    // 1. איתור אירוע פריקה (PTO) תואם במיקום
    const ptoEvent = ituranData.find((event: any) => 
      event.address && ticket.address && 
      (event.address.includes(ticket.address) || ticket.address.includes(event.address))
    );

    // 2. חישוב פער זמנים (בדקות)
    const timeGap = ptoEvent ? Math.abs(ticket.manualTime - ptoEvent.duration) : 0;
    
    // 3. הגדרת אנומליות
    let loss = 0;
    let anomalyMessages: string[] = [];

    // בדיקת חוקי ציוד (Gear)
    if (ticket.items) {
      ticket.items.forEach((item: any) => {
        const rule = rules.find((r: any) => r.item === item.name);
        if (rule && ticket.gear && !ticket.gear.includes(rule.required)) {
          loss += 50;
          anomalyMessages.push(`חסר חיוב: ${rule.required}`);
        }
      });
    }

    // בדיקת התאמה לאיתורן
    if (!ptoEvent) {
      anomalyMessages.push("לא נמצא אירוע פריקה באיתורן");
    } else if (timeGap > 15) {
      anomalyMessages.push(`חריגת זמן פריקה: ${timeGap} דק'`);
    }

    const isAnomalous = anomalyMessages.length > 0;

    return {
      ticketId: ticket.id,
      driver: ticket.driver,
      address: ticket.address,
      isAnomalous,
      anomalyType: anomalyMessages.join(" | "),
      // אם יש אנומליה ולא חושב הפסד ספציפי מחוקים, ניתן קנס גנרי של 100
      loss: isAnomalous ? (loss || 100) : 0,
      timestamp: new Date().toISOString()
    };
  });
};
