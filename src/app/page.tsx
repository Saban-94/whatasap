'use client';
import { db } from "./firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { useState, useEffect } from 'react';
import Link from 'next/link';

// קישור לתמונת הפרופיל (של מנהל/נציג סבן 94)
const PROFILE_PIC_URL = 'https://via.placeholder.com/150/075E54/FFFFFF?text=ח.סבן'; 
const LOGO_URL = 'https://via.placeholder.com/80x40/25D366/FFFFFF?text=ח.סבן'; // לינק ללוגו שלך

export default function OrderPage() {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', address: '', phone: '', driverNotes: '', requestedDate: '' });
  const [loading, setLoading] = useState(false);
  
  const [pendingContainer, setPendingContainer] = useState<any>(null); // מכולה שממתינה לבחירת פעולה

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDocs(collection(db, "products"));
        setAllProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { console.error("Firebase error loading products", e); }
    };
    load();
  }, []);

  const addToCart = (product: any, action?: string) => {
    // אם זו מכולה, נוסיף את הפעולה לשם המוצר
    const itemToAdd = { 
      ...product, 
      name: action ? `${product.name} - ${action}` : product.name, 
      action: action || 'אספקה', // 'אספקה' למוצרים רגילים, 'הצבה'/'החלפה'/'הוצאה' למכולות
      qty: 1 
    };
    setCart([...cart, itemToAdd]);
    setPendingContainer(null); // סוגרים את הפופ-אפ של המכולה
    setSearch(''); // מנקים את שדה החיפוש
  };

  const sendOrder = async () => {
    if (!form.phone || cart.length === 0) return alert("אנא מלאו פרטים ובחרו מוצרים להזמנה.");
    setLoading(true);

    const payload = {
      customer: form.name || "לקוח",
      phone: form.phone,
      address: form.address || "איסוף עצמי",
      driverNotes: form.driverNotes || "", // הערות לנהג
      requestedDate: form.requestedDate || new Date().toISOString().split('T')[0], // תאריך מבוקש
      items: cart.map(i => `${i.name}`).join(", "), // למשל: "מכולה 8 קוב - הצבה, טיט (x1)"
      status: "חדש", // סטטוס התחלתי
      timestamp: new Date()
    };

    try {
      // שליחה ל-Power Automate
      await fetch("https://defaultae1f0547569d471693f95b9524aa2b.31.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/0828f74ee7e44228b96c93eab728f280/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=lgdg1Hw--Z35PWOK6per2K02fql76m_WslheLXJL-eA", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // שמירה ב-Firebase
      await addDoc(collection(db, "orders"), payload);

      alert("הזמנתכם נקלטה בהצלחה! ✅ נציג סבן 94 יצור עמכם קשר בהקדם.");
      setCart([]); // מנקים את העגלה
      setForm({ name: '', address: '', phone: '', driverNotes: '', requestedDate: '' }); // מנקים את הטופס
    } catch (err) {
      console.error("Error sending order:", err);
      alert("אירעה תקלה בשליחת ההזמנה. אנא נסו שוב.");
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <main dir="rtl" style={mainStyle}>
      <div style={containerStyle}>
        {/* כותרת עם לוגו ותמונת פרופיל */}
        <div style={headerStyle}>
          <img src={LOGO_URL} alt="Logo" style={logoStyle} />
          <div style={profileAreaStyle}>
            <img src={PROFILE_PIC_URL} alt="Profile" style={profilePicStyle} />
            <span style={profileNameStyle}>ח. סבן 94</span>
          </div>
        </div>
        
        {/* הודעת פתיחה כמו בצ'אט */}
        <div style={welcomeMessageStyle}>
          <p>שלום! ברוכים הבאים למערכת הזמנות ח. סבן 94. 🤝</p>
          <p>אנא מלאו פרטים ובחרו מוצרים לביצוע הזמנה מהירה ונוחה.</p>
        </div>

        {/* טופס פרטי הלקוח */}
        <input type="text" placeholder="שם מלא" style={inputStyle} value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
        <input type="tel" placeholder="טלפון *" style={inputStyle} value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
        <input type="text" placeholder="כתובת/אתר בנייה לאספקה" style={inputStyle} value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
        <input type="date" placeholder="תאריך מבוקש לאספקה/פעולה" style={inputStyle} value={form.requestedDate} onChange={e => setForm({...form, requestedDate: e.target.value})} />
        <textarea placeholder="הערות מיוחדות לנהג (לדוגמה: 'להציב ליד ערימת חול')" style={textAreaStyle} value={form.driverNotes} onChange={e => setForm({...form, driverNotes: e.target.value})} />
        
        {/* שדה חיפוש מוצרים */}
        <div style={{ position: 'relative' }}>
          <input type="text" placeholder="🔍 חפש חומר או מכולה..." style={searchStyle} value={search} onChange={e => setSearch(e.target.value)} />
          {search.length > 1 && (
            <div style={searchResultsStyle}>
              {allProducts.filter(p => p.name.includes(search)).map(p => (
                <div 
                  key={p.id} 
                  onClick={() => {
                    // הלוגיקה הקריטית למכולות
                    if (p.type === 'container') {
                      setPendingContainer(p); 
                    } else {
                      addToCart(p);
                    }
                  }} 
                  style={searchItemStyle}
                >
                  {p.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* פופ-אפ בחירת פעולה למכולה */}
        {pendingContainer && (
          <div style={containerActionModalStyle}>
            <h4>איזו פעולה לבצע ב"{pendingContainer.name}"?</h4>
            <div style={actionButtonsGroupStyle}>
              <button onClick={() => addToCart(pendingContainer, 'הצבה')} style={actionButtonStyle}>הצבה</button>
              <button onClick={() => addToCart(pendingContainer, 'החלפה')} style={actionButtonStyle}>החלפה</button>
              <button onClick={() => addToCart(pendingContainer, 'הוצאה')} style={actionButtonStyle}>הוצאה</button>
            </div>
            <button onClick={() => setPendingContainer(null)} style={cancelButtonStyle}>ביטול</button>
          </div>
        )}

        {/* עגלת הזמנה */}
        <div style={cartContainerStyle}>
          <strong style={{ display: 'block', marginBottom: '10px' }}>🛒 עגלת הזמנה:</strong>
          {cart.length === 0 ? (
            <p style={{ color: '#888', textAlign: 'center' }}>העגלה ריקה. התחילו להוסיף מוצרים!</p>
          ) : (
            cart.map((c, i) => (
              <div key={i} style={cartItemStyle}>
                <span>{c.name}</span>
                {/* אפשרות להסיר פריט מהעגלה */}
                <button onClick={() => setCart(cart.filter((_, idx) => idx !== i))} style={removeCartItemStyle}>X</button>
              </div>
            ))
          )}
        </div>

        {/* כפתור שליחת הזמנה */}
        <button onClick={sendOrder} disabled={loading} style={sendOrderButtonStyle}>
          {loading ? "שולח הזמנה..." : "✅ שלח הזמנה למשרד"}
        </button>

        {/* קישור למעקב הזמנות */}
        <div style={trackOrderLinkContainerStyle}>
          <Link href="/track" style={trackOrderLinkStyle}>
            📊 עקוב אחרי סטטוס הזמנה / מכולה קיימת
          </Link>
        </div>
      </div>
    </main>
  );
}

// אובייקטי עיצוב (סטיילים)
const mainStyle: React.CSSProperties = {
  padding: '15px',
  fontFamily: 'Arial, sans-serif',
  backgroundColor: '#e5ddd5', // רקע בהיר דמוי וואטסאפ
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start', // ליישר למעלה
};

const containerStyle: React.CSSProperties = {
  maxWidth: '480px',
  width: '100%',
  backgroundColor: '#fff',
  borderRadius: '15px',
  boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
  padding: '25px',
  boxSizing: 'border-box',
  direction: 'rtl',
  marginTop: '20px',
  marginBottom: '20px',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px',
  borderBottom: '1px solid #eee',
  paddingBottom: '15px',
};

const logoStyle: React.CSSProperties = {
  height: '40px',
  borderRadius: '8px', // פינות מעוגלות ללוגו
};

const profileAreaStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
};

const profilePicStyle: React.CSSProperties = {
  width: '40px',
  height: '40px',
  borderRadius: '50%', // תמונה עגולה
  objectFit: 'cover',
  border: '2px solid #25D366', // גבול ירוק כמו בוואטסאפ
};

const profileNameStyle: React.CSSProperties = {
  fontWeight: 'bold',
  color: '#075E54', // ירוק כהה
};

const welcomeMessageStyle: React.CSSProperties = {
  backgroundColor: '#dcf8c6', // רקע ירקרק להודעה
  borderRadius: '15px',
  padding: '15px',
  marginBottom: '25px',
  textAlign: 'center',
  color: '#075E54',
  lineHeight: '1.6',
  boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 15px',
  marginBottom: '15px',
  borderRadius: '8px',
  border: '1px solid #ddd',
  boxSizing: 'border-box',
  fontSize: '16px',
};

const textAreaStyle: React.CSSProperties = {
  ...inputStyle, // יורש את העיצוב מה-input
  minHeight: '80px',
  resize: 'vertical',
};

const searchStyle: React.CSSProperties = {
  ...inputStyle,
  borderColor: '#075E54', // גבול ירוק לשדה החיפוש
  fontWeight: 'bold',
};

const searchResultsStyle: React.CSSProperties = {
  position: 'absolute',
  width: '100%',
  backgroundColor: '#fff',
  zIndex: 10,
  border: '1px solid #eee',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  marginTop: '-10px', // להצמיד לתיבת החיפוש
};

const searchItemStyle: React.CSSProperties = {
  padding: '12px 15px',
  cursor: 'pointer',
  borderBottom: '1px solid #eee',
  transition: 'background-color 0.2s ease',
};

// הוספת אפקט ריחוף לתוצאות החיפוש
searchItemStyle[':hover'] = {
  backgroundColor: '#f0f0f0',
};

const containerActionModalStyle: React.CSSProperties = {
  backgroundColor: '#f9f9f9',
  padding: '20px',
  borderRadius: '12px',
  border: '2px solid #075E54',
  margin: '20px 0',
  textAlign: 'center',
  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
};

const actionButtonsGroupStyle: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
  justifyContent: 'center',
  marginTop: '15px',
};

const actionButtonStyle: React.CSSProperties = {
  flex: '1',
  padding: '12px',
  backgroundColor: '#075E54',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '16px',
  transition: 'background-color 0.2s ease',
  minWidth: '100px',
};

actionButtonStyle[':hover'] = {
  backgroundColor: '#054d44',
};

const cancelButtonStyle: React.CSSProperties = {
  marginTop: '15px',
  border: 'none',
  background: 'none',
  color: 'red',
  cursor: 'pointer',
  fontSize: '14px',
};

const cartContainerStyle: React.CSSProperties = {
  margin: '25px 0',
  borderTop: '1px solid #eee',
  paddingTop: '20px',
  borderBottom: '1px solid #eee',
  paddingBottom: '20px',
};

const cartItemStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: '#f5f5f5',
  padding: '10px 15px',
  borderRadius: '8px',
  marginBottom: '8px',
  fontWeight: '600',
  color: '#333',
};

const removeCartItemStyle: React.CSSProperties = {
  backgroundColor: '#ff4d4f',
  color: '#fff',
  border: 'none',
  borderRadius: '50%',
  width: '25px',
  height: '25px',
  fontSize: '14px',
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',
};

removeCartItemStyle[':hover'] = {
  backgroundColor: '#cc0000',
};

const sendOrderButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '18px',
  backgroundColor: '#25D366', // ירוק וואטסאפ
  color: '#fff',
  border: 'none',
  borderRadius: '12px',
  fontWeight: 'bold',
  cursor: 'pointer',
  fontSize: '20px',
  marginTop: '25px',
  boxShadow: '0 4px 10px rgba(37,211,102,0.4)',
  transition: 'background-color 0.2s ease',
};

sendOrderButtonStyle[':hover'] = {
  backgroundColor: '#1da852',
};

const trackOrderLinkContainerStyle: React.CSSProperties = {
  marginTop: '20px',
  textAlign: 'center',
};

const trackOrderLinkStyle: React.CSSProperties = {
  color: '#075E54', // ירוק כהה
  textDecoration: 'underline',
  fontSize: '16px',
  fontWeight: '600',
};
