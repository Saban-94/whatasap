// src/lib/saban-brain.ts

export const analyzeDelivery = (ituranData: any[], pdfData: any[], rules: any[]) => {
  // הפונקציה מתחילה כאן
  const analysis = pdfData.map((ticket: any) => {
    // 1. בדיקת PTO (מנוף)
    const ptoEvent = ituranData.find((event: any) => 
      event.address && ticket.address && 
      (event.address.includes(ticket.address) || ticket.address.includes(event.address))
    );

    const timeGap = ptoEvent ? Math.abs(ticket.manualTime - ptoEvent.duration) : 0;
    const isAnomalous = !ptoEvent || timeGap > 15;

    let loss = 0;
    let anomalyType = "";

    // 2. בדיקת חוקי העסק
    if (ticket.items) {
      ticket.items.forEach((item: any) => {
        const rule = rules.find((r: any) => r.item === item.name);
        if (rule && ticket.gear && !ticket.gear.includes(rule.required)) {
          loss += 50;
          anomalyType = `חסר חיוב: ${rule.required}`;
        }
      });
    }

    if (!ptoEvent) {
      anomalyType = "לא נמצא אירוע פריקה באיתורן";
    }

    return {
      ticketId: ticket.id,
      driver: ticket.driver,
      address: ticket.address,
      isAnomalous,
      anomalyType: anomalyType || (timeGap > 15 ? "חריגת זמן פריקה" : ""),
      loss: isAnomalous ? (loss || 100) : 0
    };
  }); // כאן נסגר ה-map

  return analysis; // עכשיו ה-return נמצא בתוך הפונקציה הראשית
}; // וכאן נסגרת הפונקציה analyzeDelivery
