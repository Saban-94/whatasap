// src/lib/saban-brain.ts

export const analyzeDelivery = (ituranData, pdfData, rules) => {
  const analysis = pdfData.map(ticket => {
    // 1. בדיקת PTO (מנוף) - הצלבת איתורן מול דיוח ידני
    const ptoEvent = ituranData.find(event => 
      event.address.includes(ticket.address) && event.status === 'מנוע עובד'
    );

    const timeGap = ptoEvent ? 
      calculateGap(ticket.manualTime, ptoEvent.duration) : 'לא זוהה PTO';

    // 2. בדיקת חוקי ציוד (בלות ומשטחים)
    const missingGear = [];
    rules.forEach(rule => {
      if (ticket.items.includes(rule.item) && !ticket.gear.includes(rule.required)) {
        missingGear.push(rule.required);
      }
    });

    return {
      ticketId: ticket.id,
      driver: ticket.driver,
      location: ticket.address,
      ptoGap: timeGap,
      isGapHigh: timeGap > 15, // חריגה מעל 15 דקות
      missingGear, // מה שכחנו לחייב
      potentialLoss: missingGear.length * 75 // חישוב כספי משוער
    };
  });

  return analysis;
};
