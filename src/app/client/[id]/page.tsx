'use client';

import React, { useState, useRef, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, MapPin, CheckCircle2, Navigation, PenLine } from 'lucide-react';

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });

import 'leaflet/dist/leaflet.css';

export default function SabanUnifiedClient({ params }: { params: { id: string } }) {
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
    if (sigPad.current.isEmpty()) return alert("חכמת, חייב חתימה לאישור הפריקה!");
    const signatureBase64 = sigPad.current.getTrimmedCanvas().toDataURL('image/png').split(',')[1];

    try {
      const powerAutomateUrl = "https://defaultae1f0547569d471693f95b9524aa2b.31.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/bff0c0523978498e8a3ddc9fa163f2a8/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=aEqAGkUi5xEpFiBhe_tQmnO4EzRGHTqA1OdKJjFNqyM";

      await fetch(powerAutomateUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: task.client,
          items: task.items,
          address: task.address,
          returns: formData.returns,
          fileContent: signatureBase64,
          fileName: `תעודה_${task.client}_${new Date().getTime()}.pdf`
        })
      });

      await updateDoc(doc(db, "tasks", params.id), { status: "מאושר לחיוב", completedAt: new Date() });
      setStep(3); // מסך סיום
    } catch (e) {
      alert("תקלה בשליחה למשרד");
    }
  };

  if (!task) return <div className="p-10 text-center">טוען נתונים עבור חכמת...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans" dir="rtl">
      <header className="bg-[#075E54] text-white p-4 shadow-lg flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Truck size={24} />
          <h1 className="font-bold">סבן לוגיסטיקה</h1>
        </div>
        <span className="text-sm">חכמת | {task.client}</span>
      </header>

      <main className="p-4 max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
                <div className="flex items-start gap-3 mb-4">
                  <MapPin className="text-red-500 shrink-0" />
                  <div>
                    <h2 className="text-xl font-bold">{task.client}</h2>
                    <p className="text-slate-500">{task.address}</p>
                  </div>
                </div>
                <button onClick={() => window.open(`waze://?q=${encodeURIComponent(task.address)}&navigate=yes`)}
                  className="w-full bg-blue-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                  <Navigation size={20} /> ניווט ב-WAZE
                </button>
              </div>

              <div className="h-64 rounded-2xl overflow-hidden shadow-inner mb-6 border-4 border-white">
                <MapContainer center={[32.18, 34.87]} zoom={13} className="h-full w-full">
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                </MapContainer>
              </div>

              <button onClick={() => setStep(2)} className="w-full bg-[#2ecc71] text-white py-4 rounded-2xl text-xl font-bold shadow-lg">
                התחל פריקה ודיווח
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}>
              <div className="bg-white rounded-2xl p-6 shadow-sm border-t-4 border-[#075E54]">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <PenLine size={20} /> דיווח סיום פריקה
                </h3>
                <div className="bg-slate-50 p-4 rounded-xl mb-4 text-sm">
                  <strong>פירוט העמסה:</strong> {task.items}
                </div>

                <div className="flex items-center justify-between mb-6">
                  <label className="font-semibold">החזרת משטחים:</label>
                  <input type="number" value={formData.returns} onChange={e => setFormData({...formData, returns: e.target.value})}
                    className="w-20 p-2 border-2 border-slate-200 rounded-lg text-center font-bold" />
                </div>

                <div className="border-2 border-dashed border-slate-300 rounded-xl p-2 mb-4 bg-white">
                  <p className="text-xs text-slate-400 mb-2 mr-2">חתימת לקוח / נציג בשטח:</p>
                  <SignatureCanvas ref={sigPad} canvasProps={{ className: 'w-full h-40' }} />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <button onClick={() => sigPad.current.clear()} className="bg-slate-200 py-3 rounded-xl font-bold">נקה</button>
                  <button onClick={sendToSaban365} className="col-span-2 bg-[#075E54] text-white py-3 rounded-xl font-bold shadow-md">שלח תעודה ✅</button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center p-10">
              <CheckCircle2 size={80} className="text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">עבודה טובה, חכמת!</h2>
              <p className="text-slate-500">התעודה נשמרה ב-SharePoint והמשימה עודכנה.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
