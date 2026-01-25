'use client';

import React, { useState, useRef, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { db } from "@/lib/firebase"; 
import { doc, getDoc, updateDoc } from "firebase/firestore";
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, MapPin, Navigation, CheckCircle2, PenTool } from 'lucide-react';

// טעינה דינמית של המפה כדי למנוע שגיאות Build ב-Vercel
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });

import 'leaflet/dist/leaflet.css';

export default function SabanClientApp({ params }: { params: { id: string } }) {
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
    
    // תיקון לאייקונים של Leaflet שנעלמים לפעמים ב-Next.js
    import('leaflet').then(L => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
    });
  }, [params.id]);

  const handleSubmit = async () => {
    if (sigPad.current.isEmpty()) return alert("חכמת, חייב חתימה לאישור!");
    const sigData = sigPad.current.getTrimmedCanvas().toDataURL('image/png').split(',')[1];

    try {
      // הלינק של ה-Flow שלך ב-Power Automate
      const flowUrl = "https://defaultae1f0547569d471693f95b9524aa2b.31.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/bff0c0523978498e8a3ddc9fa163f2a8/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=aEqAGkUi5xEpFiBhe_tQmnO4EzRGHTqA1OdKJjFNqyM";

      await fetch(flowUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: task.client,
          address: task.address,
          items: task.items,
          returns: formData.returns,
          fileContent: sigData,
          fileName: `חתימה_${task.client}.pdf`
        })
      });

      await updateDoc(doc(db, "tasks", params.id), { status: "בוצע", completedAt: new Date() });
      setStep(3);
    } catch (e) {
      alert("שגיאה בשליחה ל-SharePoint");
    }
  };

  if (!task) return <div className="p-10 text-center font-bold">טוען משימה...</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans" dir="rtl">
      {/* Header מודרני */}
      <header className="bg-[#075E54] text-white p-5 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Truck size={28} />
          <h1 className="text-xl font-black italic">SABAN LOGISTICS</h1>
        </div>
      </header>

      <main className="p-4 max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="bg-white p-6 rounded-3xl shadow-lg mb-4 border border-gray-100">
                <div className="flex items-start gap-3 mb-4">
                  <MapPin className="text-red-600 mt-1" size={24} />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{task.client}</h2>
                    <p className="text-gray-500">{task.address}</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => window.open(`waze://?q=${encodeURIComponent(task.address)}&navigate=yes`)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <Navigation size={20} /> נווט ליעד ב-WAZE
                </button>
              </div>

              {/* כאן המפה החיה */}
              <div className="h-64 rounded-3xl overflow-hidden shadow-inner mb-6 border-4 border-white">
                <MapContainer center={[32.0853, 34.7818]} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[32.0853, 34.7818]} />
                </MapContainer>
              </div>

              <button 
                onClick={() => setStep(2)}
                className="w-full bg-[#2ecc71] hover:bg-[#27ae60] text-white py-5 rounded-3xl text-2xl font-black shadow-xl transition-transform active:scale-95"
              >
                התחל פריקה וחתימה
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="bg-white p-6 rounded-3xl shadow-lg">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <PenTool className="text-[#075E54]" /> אישור מסירה דיגיטלי
                </h3>
                
                <div className="bg-gray-50 p-4 rounded-2xl mb-4 border border-gray-100">
                  <p className="text-sm text-gray-600">ציוד שנפרק:</p>
                  <p className="font-bold text-lg">{task.items}</p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">החזרת משטחים ריקים:</label>
                  <input 
                    type="number" 
                    className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-center text-2xl font-bold focus:border-[#075E54] outline-none"
                    value={formData.returns}
                    onChange={(e) => setFormData({...formData, returns: e.target.value})}
                  />
                </div>

                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-2 bg-white mb-6">
                  <p className="text-center text-xs text-gray-400 mb-2">חתימת הלקוח על המסך</p>
                  <SignatureCanvas ref={sigPad} canvasProps={{ className: 'w-full h-48 rounded-xl cursor-crosshair' }} />
                </div>

                <div className="flex gap-3">
                  <button onClick={() => sigPad.current.clear()} className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold">נקה</button>
                  <button onClick={handleSubmit} className="flex-[2] py-4 bg-[#075E54] text-white rounded-2xl font-bold shadow-lg">שלח ל-SHAREPOINT ✅</button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center p-10 bg-white rounded-3xl shadow-xl">
              <CheckCircle2 size={100} className="text-green-500 mx-auto mb-6" />
              <h2 className="text-3xl font-black text-gray-800 mb-2">עבודה טובה!</h2>
              <p className="text-gray-500">התעודה החתומה נשלחה בהצלחה למשרד.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
