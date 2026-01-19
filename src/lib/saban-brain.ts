// src/lib/saban-brain.ts

export const analyzeDelivery = (ituranData: any[], pdfData: any[], rules: any[]) => {
  const analysis = pdfData.map((ticket: any) => {
    // 1. בדיקת PTO (מנוף) - הצלבת איתורן מול דיווח ידני
    const ptoEvent = ituranData.find((event: any) => 
      event.address && ticket.address && 
      (event.address.includes(ticket.address) || ticket.address.includes(event.address))
    );

    // 2. חישוב חריגת זמן (אם יש פער של מעל 15 דקות)
    const timeGap = ptoEvent ? Math.abs(ticket.manualTime - ptoEvent.duration) : 0;
    const isAnomalous = !ptoEvent || timeGap > 15;

    // 3. בדיקת חוקי העסק (בלות/משטחים)
    let loss = 0;
    let anomalyType = "";

    ticket.items.forEach((item: any) => {
      const rule = rules.find((r: any) => r.item === item.name);
      if (rule && !ticket.gear.includes(rule.required)) {
        loss += 50; // קנס סמלי על אי חיוב ציוד
        anomalyType = `חסר חיוב: ${rule.required}`;
      }
    });

    if (!ptoEvent) anomalyType = "לא נמצא אירוע פריקה באיתורן";

    return {
      ticketId: ticket.id,
      driver: ticket.driver,
      address: ticket.address,
      isAnomalous,
      anomalyType: anomalyType || (timeGap > 15 ? "חריגת זמן פריקה" : ""),
      loss: isAnomalous ? (loss || 100) : 0 // חישוב הפסד משוער
    };
  });

  return analysis;
};
