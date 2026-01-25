'use client';

import React, { useState, useRef, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { db } from "@/lib/firebase"; // וודא שהקובץ קיים בנתיב זה
import { doc, getDoc, updateDoc } from "firebase/firestore";
import dynamic from 'next/dynamic';

// טעינה דינמית של המפה כדי למנוע שגיאות Build
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });

import 'leaflet/dist/leaflet.css';

export default function HachmatProApp({ params }: { params: { id: string } }) {
  const [task, setTask] = useState<any>(null);
  const [step, setStep] = useState(1); 
  const [formData, setFormData] = useState({ returns: '0', comments: '' });
  const sigPad = useRef<any>(null);

  useEffect(() => {
    const fetchTask = async () => {
      const docSnap = await getDoc(doc(db, "tasks", params.id));
      if (docSnap.exists()) setTask(docSnap.data());
    };
    fetchTask();
  }, [params.id]);

  const sendToSaban365 = async () => {
    if (sigPad.current.isEmpty()) return alert("חכמת, חייב חתימה בשביל הארכיון!");

    const signatureBase64 = sigPad.current.getTrimmedCanvas().toDataURL('image/png').split(',')[1];

    try {
      const powerAutomateUrl = "https://defaultae1f0547569d471693f95b9524aa2b.31.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/bff0c0523978498e8a3ddc9fa163f2a8/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=aEqAGkUi5xEpFiBhe_tQmnO4EzRGHTqA1OdKJjFNqyM";

      const payload = {
        customer: task.client,
        items: task.items,
        address: task.address,
        returns: formData.returns,
        fileContent: signatureBase64,
        fileName: `תעודה_חתומה_${task.client}.pdf`
      };

      const res = await fetch(powerAutomateUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        await updateDoc(doc(db, "tasks", params.id), { status: "מאושר לחיוב", completedAt: new Date() });
        alert("נשלח בהצלחה ל-SharePoint! סע לשלום.");
      }
    } catch (e) {
      alert("תקלה בשליחה ל-365");
    }
  };

  if (!task) return <div style={{textAlign:'center', padding:'50px'}}>טוען משימה לחכמת...</div>;

  return (
    <div dir="rtl" style={{background:'#f4f7f6', minHeight:'100vh'}}>
      <header style={{background:'#075E54', color:'#fff', padding:'15px', display:'flex', justifyContent:'space-between'}}>
        <span>ח. סבן לוגיסטיקה</span>
        <span>שלום חכמת 🚚</span>
      </header>

      <div style={{padding:'15px'}}>
        {step === 1 ? (
          <>
            <div style={{background:'#fff', padding:'15px', borderRadius:'12px', marginBottom:'15px'}}>
              <h3>📍 יעד: {task.client}</h3>
              <p>{task.address}</p>
              <button onClick={() => window.open(`waze://?q=${encodeURIComponent(task.address)}&navigate=yes`)} 
                style={{width:'100%', padding:'12px', background:'#3498db', color:'#fff', border:'none', borderRadius:'8px', fontWeight:'bold'}}>
                נווט ב-WAZE
              </button>
            </div>
            
            <div style={{height:'250px', borderRadius:'12px', overflow:'hidden', marginBottom:'15px'}}>
               {/* המפה תיטען רק בצד הלקוח */}
               <MapContainer center={[32.18, 34.87]} zoom={13} style={{height:'100%', width:'100%'}}>
                 <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
               </MapContainer>
            </div>

            <button onClick={() => setStep(2)} style={{width:'100%', padding:'18px', background:'#2ecc71', color:'#fff', border:'none', borderRadius:'12px', fontSize:'18px', fontWeight:'bold'}}>
              התחל פריקה וחתימה
            </button>
          </>
        ) : (
          <div style={{background:'#fff', padding:'15px', borderRadius:'12px'}}>
            <h3>📦 דיווח פריקה</h3>
            <div style={{marginBottom:'15px'}}>מוצרים: {task.items}</div>
            
            <div style={{marginBottom:'20px'}}>
              <label>החזרת משטחים: </label>
              <input type="number" value={formData.returns} onChange={e => setFormData({...formData, returns: e.target.value})} style={{width:'60px', padding:'5px'}} />
            </div>

            <div style={{border:'2px dashed #075E54', borderRadius:'8px', padding:'10px', marginBottom:'15px'}}>
              <p>חתימת לקוח:</p>
              <SignatureCanvas ref={sigPad} canvasProps={{width: 300, height: 150, className: 'sigCanvas'}} />
            </div>

            <button onClick={sendToSaban365} style={{width:'100%', padding:'15px', background:'#075E54', color:'#fff', border:'none', borderRadius:'8px', fontWeight:'bold'}}>
              שלח תעודה ל-365 ✅
            </button>
          </>
        )}
      </div>
    </div>
  );
}
