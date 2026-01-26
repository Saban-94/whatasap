// וודא ששורות אלו קיימות בראש הקובץ ב-src/app/order/page.tsx
import { db } from "@/lib/firebase"; 
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// פונקציית השליחה שתעדכן את שחר שאול ב-Firebase
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    await addDoc(collection(db, "tasks"), {
      client: "שחר שאול", // המוח יזהה את זה אוטומטית בהמשך
      project: "גלגל המזלות 73",
      items: cart.map(i => i.name).join(', '),
      status: "חדש",
      timestamp: serverTimestamp(),
    });
    alert("ההזמנה של שחר עודכנה במאגר!");
  } catch (error) {
    console.error("שגיאה בחיבור למאגר:", error);
  }
};
