export default function SeedPage() {
  const uploadMasterData = async () => {
    try {
      const colRef = collection(db, 'products');
      for (const prod of sabanFullData) {
        // שימוש בשם המוצר כ-ID כדי למנוע כפילויות
        const docId = prod.product_name.replace(/\//g, "-");
        await setDoc(docRef(colRef, docId), prod);
      }
      alert('כל הנתונים ההנדסיים הועלו בהצלחה!');
    } catch (e) {
      console.error(e);
      alert('שגיאה בהעלאה. וודא שחוקי ה-Firestore פתוחים.');
    }
  };

  return (
    <div className="p-10 text-center bg-black min-h-screen">
      <h1 className="text-sabanGold text-2xl mb-6 font-bold">מערכת הזרקת ידע - ח. סבן</h1>
      <button onClick={uploadMasterData} className="btn-huge bg-sabanGold text-black font-black p-6 rounded-2xl shadow-2xl">
        העלה קטלוג מומחה מלא 🚀
      </button>
    </div>
  );
}
// src/app/seed/page.tsx

export default function SeedPage() {
  // 1. הגדרת המערך בתוך משתנה
  const sabanFullData = [
    {
      "product_name": "Sika MonoTop-610 / 910N",
      "category": "Repair",
      "engineering_solution": "ציפוי הגנה נגד קורוזיה וחיזוק הידבקות בין בטון ישן לחדש.",
      "coverage": 1.8,
      "pro_tip": "להרטיב את המצע עד מצב SSD לפני יישום.",
      "media": {
        "image": "...",
        "video": "..."
      }
    },
     {
    product_name: "דבק 132 C2TE-S1 (כרמית)",
    category: "Adhesives",
    engineering_solution: "דבק גמיש S1 לאריחים גדולים/מדוקקים, פנים/חוץ ובריכות",
    coverage: 1.5,
    application_method: "מסורית; Back-Butter; כיסוי ≥95%; פריימר 82-P בתשתיות חלקות",
    pro_tip: "S1 לגמישות; זמן פתוח E; החלקה T",
    diagnostic_questions: ["מה סוג התשתית?", "מה גודל האריח?", "פנים/חוץ/בריכה?"]
  },
  {
    product_name: "אקווניר EXTRA (נירלט)",
    category: "Paints",
    engineering_solution: "צבע אקרילי בטכנולוגיית USP למראה חלק ואחיד",
    coverage: 13.0,
    application_method: "הכנת קיר; פריימר 2X; 2 שכבות",
    pro_tip: "הפריימר הוא הבסיס - בלי זה הצבע עלול להתקלף",
    diagnostic_questions: ["אזור יישום?", "סוג תשתית?", "איזה ביצועים חשובים?"]
  }
[
  {
    "product_name": "Sika MonoTop-610 / 910N",
    "category": "Repair",
    "engineering_solution": "ציפוי הגנה נגד קורוזיה וחיזוק הידבקות בין בטון ישן לחדש.",
    "coverage": 1.8,
    "pro_tip": "להרטיב את המצע עד מצב SSD לפני יישום.",
    "media": {
      "image": "https://gilar.co.il/products/%d7%a1%d7%99%d7%a7%d7%94-%d7%9e%d7%95%d7%a0%d7%95%d7%98%d7%95%d7%a4-610/",
      "video": "https://www.youtube.com/watch?v=KxKXmsY8-2c"
    }
  },
  {
    "product_name": "Sika MonoTop-620",
    "category": "Repair",
    "engineering_solution": "שפכטל צמנטי להחלקה ותיקון קירות ותקרות במערכות שיקום.",
    "coverage": 1.8,
    "pro_tip": "ליישם בשכבות דקות כדי לקבל החלקה מיטבית.",
    "media": {
      "image": "https://gilar.co.il/products/%d7%a1%d7%99%d7%a7%d7%94-%d7%9e%d7%95%d7%a0%d7%95%d7%98%d7%95%d7%a4-620/",
      "video": "https://www.youtube.com/watch?v=sxPpDvH2zN8"
    }
  },
  {
    "product_name": "Sika MonoTop-4200 MultiFlow",
    "category": "Repair",
    "engineering_solution": "מרגמה צמנטית רב-שימושית לשיקום מבנים וליציקות עיגון.",
    "coverage": 1.8,
    "pro_tip": "להתאים יחס מים כדי לקבל סמיכות נכונה בין שיקום לדייס.",
    "media": {
      "image": "https://gilar.co.il/products/%d7%a1%d7%99%d7%a7%d7%94-%d7%9e%d7%95%d7%a0%d7%95%d7%98%d7%95%d7%a4-4200-multiflow/",
      "video": "https://www.youtube.com/watch?v=hSJbV3Yd5Do"
    }
  },
  {
    "product_name": "Sika MonoTop MUR 722",
    "category": "Repair",
    "engineering_solution": "מרגמה לשיקום ותמיכה קונסטרוקטיבית בשילוב רשתות חיזוק.",
    "coverage": 1.5,
    "pro_tip": "ליישם על תשתית יציבה ונקייה ללא חלקים רופפים.",
    "media": {
      "image": "https://gilar.co.il/wp-content/uploads/2023/11/Sika-monotop-722-MUR.pdf",
      "video": "https://www.youtube.com/watch?v=3n6o9E8N0L4"
    }
  },
  {
    "product_name": "Sika MonoTop-612",
    "category": "Repair",
    "engineering_solution": "מרגמת שיקום R3 לחיזוק ושיקום בטון במאונך ועליון.",
    "coverage": 1.8,
    "pro_tip": "לערבב היטב במהירות נמוכה לקבלת מרקם אחיד.",
    "media": {
      "image": "https://eth.sika.com/dam/dms/et01/e/sika-monotop-612.pdf",
      "video": "https://www.youtube.com/watch?v=dVip0vCBf6w"
    }
  },
  {
    "product_name": "Sika MonoTop-612 F",
    "category": "Repair",
    "engineering_solution": "מרגמת שיקום מהירה עם סיבים לעבודה בעוביים משתנים.",
    "coverage": 1.9,
    "pro_tip": "להרטיב את התשתית ולמנוע מים עומדים לפני יישום.",
    "media": {
      "image": "https://nga.sika.com/dam/dms/ng01/0/sika-monotop-612f.pdf",
      "video": "https://www.youtube.com/watch?v=2HehRuwZQak"
    }
  },
  {
    "product_name": "Sika MonoTop-612 IQ",
    "category": "Repair",
    "engineering_solution": "מרגמת שיקום סיבים בעלת חוזק גבוה לתנאי אקלים חמים.",
    "coverage": 1.8,
    "pro_tip": "ליישם בשכבות של עד 30 מ\"מ לקבלת תוצאה מיטבית.",
    "media": {
      "image": "https://irq.sika.com/content/dam/dms/iq01/4/sika-monotop-612iq.pdf",
      "video": "https://www.youtube.com/watch?v=KxKXmsY8-2c"
    }
  },
  {
    "product_name": "Sika MonoTop-723 N",
    "category": "Repair",
    "engineering_solution": "מרגמת החלקה וחיזוק לשיקום בטון במערכות רב שכבתיות.",
    "coverage": 1.7,
    "pro_tip": "לסיים בהחלקה עם מאלג' לקבלת מרקם אחיד.",
    "media": {
      "image": "https://gbr.sika.com/en/construction/concrete-repair.html",
      "video": "https://www.youtube.com/watch?v=sxPpDvH2zN8"
    }
  },
  {
    "product_name": "Sika MonoTop-412 N",
    "category": "Repair",
    "engineering_solution": "מרגמה מבוססת פולימר לתיקוני עומק בינוניים וגבוהים.",
    "coverage": 1.8,
    "pro_tip": "להרטיב את המצע לפני היישום אך ללא מים עומדים.",
    "media": {
      "image": "https://gbr.sika.com/en/construction/concrete-repair.html",
      "video": "https://www.youtube.com/watch?v=aqM2I6k29nI"
    }
  },
  {
    "product_name": "Sika MonoTop-352",
    "category": "Repair",
    "engineering_solution": "מרגמה טיקסוטרופית לתיקוני קונסטרוקציה במאונך ועליון.",
    "coverage": 1.9,
    "pro_tip": "לא להניח שכבות עבות מדי כדי למנוע שקיעה.",
    "media": {
      "image": "https://gbr.sika.com/en/construction/concrete-repair.html",
      "video": "https://www.youtube.com/watch?v=dVip0vCBf6w"
    }
  },
  {
    "product_name": "Sikadur-31 Plus",
    "category": "Bonding",
    "engineering_solution": "דבק אפוקסי דו-רכיבי להדבקה מבנית ושיקום נקודתי.",
    "coverage": 2.0,
    "pro_tip": "לוודא ניקוי מוחלט של שמנים ואבק לפני היישום.",
    "media": {
      "image": "https://gbr.sika.com/en/construction/structural-strengthening/adhesives-and-bonding/rigid-bonding/sikadur-31-plus.html",
      "video": "https://www.youtube.com/watch?v=CDP4i0-FMQo"
    }
  },
  {
    "product_name": "Sikadur-31 Hi-Mod Gel",
    "category": "Bonding",
    "engineering_solution": "דבק אפוקסי בעל מודולוס גבוה להדבקה מבנית ואיטום סדקים.",
    "coverage": 2.1,
    "pro_tip": "להקפיד על יחס ערבוב מדויק A:B לקבלת חוזק מרבי.",
    "media": {
      "image": "https://usa.sika.com/en/construction/repair-protection/multi-purpose-epoxies/adhesives/sikadur-31-hi-modgel.html",
      "video": "https://www.youtube.com/watch?v=aqM2I6k29nI"
    }
  },
  {
    "product_name": "Sikadur-31 SBA",
    "category": "Bonding",
    "engineering_solution": "מערכת הדבקה אפוקסית להרכבת סגמנטים בגשרים.",
    "coverage": 2.2,
    "pro_tip": "להתאים טמפרטורות עבודה לפי גרסת המוצר.",
    "media": {
      "image": "https://usa.sika.com/en/construction/repair-protection/multi-purpose-epoxies/adhesives/sikadur-31-sba-normalset.html",
      "video": "https://www.youtube.com/watch?v=sxPpDvH2zN8"
    }
  },
  {
    "product_name": "Sikadur-52",
    "category": "Bonding",
    "engineering_solution": "שרף אפוקסי נוזלי להזרקת סדקים מבניים בעומקים שונים.",
    "coverage": 1.2,
    "pro_tip": "להזריק בהדרגה מהנקודה הנמוכה ועד יציאת חומר.",
    "media": {
      "image": "https://usa.sika.com/en/construction/repair-protection/multi-purpose-epoxies/overlays/sikadur-52-us.html",
      "video": "https://www.youtube.com/watch?v=CDP4i0-FMQo"
    }
  },
  {
    "product_name": "Sikadur-52 Injection Normal",
    "category": "Bonding",
    "engineering_solution": "שרף הזרקה בעל צמיגות נמוכה למילוי סדקים דקים ובינוניים.",
    "coverage": 1.3,
    "pro_tip": "להבטיח מצב SSD ללא מים עומדים.",
    "media": {
      "image": "https://gbr.sika.com/en/construction/structural-strengthening/crack-repair-injectionresin/waterproofing-injection/crack-waterproofing/sikadur-52-injectionnormal.html",
      "video": "https://www.youtube.com/watch?v=dVip0vCBf6w"
    }
  },
  {
    "product_name": "Sikadur-330",
    "category": "Bonding",
    "engineering_solution": "אפוקסי מרוכב להדבקת למינציות CFRP לחיזוק מבני.",
    "coverage": 1.5,
    "pro_tip": "לספוג את הלמינציה היטב בדבק לפני ההנחה.",
    "media": {
      "image": "https://gbr.sika.com/en/construction/structural-strengthening.html",
      "video": "https://www.youtube.com/watch?v=KxKXmsY8-2c"
    }
  },
  {
    "product_name": "Sikadur-300",
    "category": "Bonding",
    "engineering_solution": "שרף אפוקסי לשימוש עם יריעות CFRP במערכות חיזוק.",
    "coverage": 1.6,
    "pro_tip": "להבטיח רטיבות מלאה של סיבי ה‑CFRP לקבלת הדבקה אופטימלית.",
    "media": {
      "image": "https://gbr.sika.com/en/construction/structural-strengthening.html",
      "video": "https://www.youtube.com/watch?v=sxPpDvH2zN8"
    }
  },
  {
    "product_name": "Sikadur-20 Crack Seal",
    "category": "Bonding",
    "engineering_solution": "שרף סגירה אפוקסי לסדקים לא פעילים.",
    "coverage": 1.4,
    "pro_tip": "לנקות היטב את קצוות הסדק לפני מריחה.",
    "media": {
      "image": "https://gbr.sika.com/en/construction/repair-protection.html",
      "video": "https://www.youtube.com/watch?v=2HehRuwZQak"
    }
  },
  {
    "product_name": "Sikadur-55 SLV",
    "category": "Bonding",
    "engineering_solution": "אפוקסי דל-צמיגות לחיזוק והזרקת סדקים עדינים.",
    "coverage": 1.1,
    "pro_tip": "לחמם מעט את החומר לקבלת זרימה טובה יותר במזג קר.",
    "media": {
      "image": "https://gbr.sika.com/en/construction/structural-strengthening.html",
      "video": "https://www.youtube.com/watch?v=aqM2I6k29nI"
    }
  },
  {
    "product_name": "Sikadur-41",
    "category": "Bonding",
    "engineering_solution": "מרגמת תיקון אפוקסית בעלת חוזק גבוה לשיקום נקודתי.",
    "coverage": 2.0,
    "pro_tip": "ליישם במשטחים נקיים ומחוספסים לשיפור ההדבקה.",
    "media": {
      "image": "https://gbr.sika.com/en/construction/repair-protection.html",
      "video": "https://www.youtube.com/watch?v=CDP4i0-FMQo"
    }
  },

  {
    "product_name": "Sika MonoTop-110 Nautic",
    "category": "Repair",
    "engineering_solution": "מרגמת שיקום מהירה לעמידות גבוהה בסביבות ימאיות.",
    "coverage": 1.8,
    "pro_tip": "ליישם בשכבות דקות לקבלת חוזק מיטבי במים מלוחים.",
    "media": {
      "image": "https://gbr.sika.com/en/construction/concrete-repair.html",
      "video": "https://www.youtube.com/watch?v=dVip0vCBf6w"
    }
  },
  {
    "product_name": "Sika MonoTop-3020",
    "category": "Repair",
    "engineering_solution": "מרגמת שיקום בעלת עמידות גבוהה לכלורידים ולקרבונציה.",
    "coverage": 1.9,
    "pro_tip": "לוודא פתיחת נקבוביות המצע לפני יישום.",
    "media": {
      "image": "https://gbr.sika.com/en/construction/concrete-repair.html",
      "video": "https://www.youtube.com/watch?v=sxPpDvH2zN8"
    }
  },
  {
    "product_name": "Sika MonoTop-412 S",
    "category": "Repair",
    "engineering_solution": "מרגמת שיקום חזקה לעומסים בינוניים וגבוהים.",
    "coverage": 1.8,
    "pro_tip": "להקפיד על ערבוב אחיד להשגת מרקם טיקסוטרופי.",
    "media": {
      "image": "https://gbr.sika.com/en/construction/concrete-repair.html",
      "video": "https://www.youtube.com/watch?v=CDP4i0-FMQo"
    }
  },
  {
    "product_name": "Sika MonoTop-436",
    "category": "Repair",
    "engineering_solution": "מרגמה סיבית לשיקום עמודים וקורות בעומס גבוה.",
    "coverage": 1.7,
    "pro_tip": "להרטיב את האזור לפני מריחה למניעת יניקה מהירה.",
    "media": {
      "image": "https://gbr.sika.com/en/construction/concrete-repair.html",
      "video": "https://www.youtube.com/watch?v=KxKXmsY8-2c"
    }
  },
  {
    "product_name": "Sikadur-3000",
    "category": "Bonding",
    "engineering_solution": "מערכת אפוקסית בעלת זיווג גבוה למערכות CFRP.",
    "coverage": 1.6,
    "pro_tip": "לוודא שמירה על טמפ׳ עבודה מתאימה למניעת התקשות מוקדמת.",
    "media": {
      "image": "https://gbr.sika.com/en/construction/structural-strengthening.html",
      "video": "https://www.youtube.com/watch?v=sxPpDvH2zN8"
    }
  },
  {
    "product_name": "Sikadur-37 Rapid",
    "category": "Bonding",
    "engineering_solution": "אפוקסי מהיר להתקנות חירום וחיזוק מקומי.",
    "coverage": 2.2,
    "pro_tip": "להכין מראש את האזור כיוון שהחומר מתקשה במהירות.",
    "media": {
      "image": "https://gbr.sika.com/en/construction/repair-protection.html",
      "video": "https://www.youtube.com/watch?v=2HehRuwZQak"
    }
  },
  {
    "product_name": "Sikadur-140 Resin",
    "category": "Bonding",
    "engineering_solution": "שרף אפוקסי בעל צמיגות בינונית לתיקוני מבנה וחיזוקים.",
    "coverage": 1.5,
    "pro_tip": "להקפיד על טמפרטורה קבועה לשמירה על צמיגות מיטבית.",
    "media": {
      "image": "https://gbr.sika.com/en/construction/structural-strengthening.html",
      "video": "https://www.youtube.com/watch?v=CDP4i0-FMQo"
    }
  },
  {
    "product_name": "Sikadur-730",
    "category": "Bonding",
    "engineering_solution": "דבק אפוקסי ייעודי להדבקת אלמנטי פלדה לבטון.",
    "coverage": 2.0,
    "pro_tip": "לנקות תחילה את חלודה ושומנים מהפלדה.",
    "media": {
      "image": "https://gbr.sika.com/en/construction/structural-strengthening.html",
      "video": "https://www.youtube.com/watch?v=dVip0vCBf6w"
    }
  ];

  const handleSeed = async () => {
    // פונקציית ההזרקה שלך שמשתמשת ב-sabanFullData
    console.log("Seeding data...", sabanFullData);
    // כאן הקוד של Firebase שכתבנו
  };

  return (
    <div className="p-10 text-center">
      <button 
        onClick={handleSeed}
        className="bg-sabanGold p-4 rounded-lg font-bold text-black"
      >
        לחץ להזרקת קטלוג מומחה מלא 🚀
      </button>
    </div>
  );
}
