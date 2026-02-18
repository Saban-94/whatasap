"use client";

import { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { pushToast } from "@/components/ToastManager";
import { Download, Share2, FileText, Calendar, Clock, Search, FilterX } from "lucide-react";

// --- Types ---
type Product = { sku: string; name: string; weight?: number; qty: number; };
type OrderStatus = "בהכנה" | "יצאה להובלה" | "סופקה" | "בוטלה";
type Order = { 
  id: string; 
  customerName: string; 
  products: Product[]; 
  total: number; 
  status: OrderStatus; 
  createdAt: string; 
  address?: string; 
  phone?: string; 
};

// פונקציית התוכן הראשית (מופרדת כדי לעטוף ב-Suspense)
function OrderHistoryContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // --- States ---
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>("active");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [timeFrom, setTimeFrom] = useState("");
  const [timeTo, setTimeTo] = useState("");
  const [openRow, setOpenRow] = useState<string | null>(null);

  // --- Initial Load ---
  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());
    const stored = JSON.parse(localStorage.getItem("orderFilters") || "{}");

    setSelectedTab(params.tab || stored.selectedTab || "active");
    setSearch(params.q || stored.search || "");
    setDateFrom(params.from || stored.dateFrom || "");
    setDateTo(params.to || stored.dateTo || "");
    setTimeFrom(params.tfrom || stored.timeFrom || "");
    setTimeTo(params.tto || stored.timeTo || "");
    
    // ייבוא דינמי של ה-JSON כדי למנוע שגיאות ב-Build
    import("@/data/orders.json").then(data => setOrders(data.default as Order[])).catch(() => setOrders([]));
  }, [searchParams]);

  // --- Sync State with URL & LocalStorage ---
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedTab) params.set("tab", selectedTab);
    if (search) params.set("q", search);
    if (dateFrom) params.set("from", dateFrom);
    if (dateTo) params.set("to", dateTo);
    if (timeFrom) params.set("tfrom", timeFrom);
    if (timeTo) params.set("tto", timeTo);

    router.replace(`${pathname}?${params.toString()}`);
    localStorage.setItem("orderFilters", JSON.stringify({ selectedTab, search, dateFrom, dateTo, timeFrom, timeTo }));
  }, [selectedTab, search, dateFrom, dateTo, timeFrom, timeTo, router, pathname]);

  // --- Filtering Logic ---
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      if (selectedTab === "active" && !["בהכנה", "יצאה להובלה"].includes(order.status)) return false;
      if (selectedTab === "history" && order.status !== "סופקה") return false;
      if (selectedTab === "cancelled" && order.status !== "בוטלה") return false;

      const q = search.toLowerCase();
      if (q && !order.customerName.toLowerCase().includes(q) && !order.id.includes(q)) return false;

      const orderDate = new Date(order.createdAt);
      if (dateFrom && orderDate < new Date(dateFrom)) return false;
      if (dateTo && orderDate > new Date(dateTo + "T23:59:59")) return false;
      
      if (timeFrom || timeTo) {
        const h = orderDate.getHours().toString().padStart(2, '0');
        const m = orderDate.getMinutes().toString().padStart(2, '0');
        const orderTime = `${h}:${m}`;
        if (timeFrom && orderTime < timeFrom) return false;
        if (timeTo && orderTime > timeTo) return false;
      }
      return true;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, selectedTab, search, dateFrom, dateTo, timeFrom, timeTo]);

  // --- Export Actions ---
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredOrders.map(o => ({
      "הזמנה": o.id, "לקוח": o.customerName, "סכום": o.total, "סטטוס": o.status, "תאריך": new Date(o.createdAt).toLocaleString('he-IL')
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    XLSX.writeFile(wb, `Saban_Orders_${new Date().toLocaleDateString()}.xlsx`);
    pushToast("הקובץ נוצר בהצלחה", "success");
  };

  const shareToWA = () => {
    const text = `דוח הזמנות ח. סבן:\n` + filteredOrders.map(o => `#${o.id} - ${o.customerName} (${o.status})`).join('\n');
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0b141a] text-white p-8 font-sans" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-3xl font-black flex items-center gap-3 italic text-[#e9edef]">
          <div className="w-2 h-10 bg-[#00a884] rounded-full"></div>
          ניהול הזמנות סבן
        </h1>
        <div className="flex gap-2">
          <button onClick={exportToExcel} className="flex items-center gap-2 bg-[#202c33] border border-white/10 px-4 py-2 rounded-xl hover:bg-[#2a3942] transition-all font-bold">
            <Download size={18} /> Excel
          </button>
          <button onClick={shareToWA} className="flex items-center gap-2 bg-[#00a884] px-4 py-2 rounded-xl font-black shadow-lg hover:bg-[#06cf9c] transition-all">
            <Share2 size={18} /> שתף לקבוצה
          </button>
        </div>
      </div>

      {/* Filters Dashboard */}
      <div className="bg-[#202c33] p-6 rounded-3xl border border-white/5 shadow-2xl mb-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="space-y-2">
          <label className="text-xs text-gray-400 font-bold uppercase">חימוש חופשי</label>
          <div className="relative">
            <Search className="absolute right-3 top-2.5 text-gray-500" size={18} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="חפש לקוח/הזמנה..." className="w-full bg-[#2a3942] rounded-xl pr-10 py-2.5 outline-none border border-transparent focus:border-[#00a884] text-sm" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs text-gray-400 font-bold uppercase">תאריך</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full bg-[#2a3942] rounded-xl px-4 py-2.5 outline-none border border-transparent focus:border-[#00a884] text-sm" />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-gray-400 font-bold uppercase">שעת יציאה</label>
          <input type="time" value={timeFrom} onChange={e => setTimeFrom(e.target.value)} className="w-full bg-[#2a3942] rounded-xl px-4 py-2.5 outline-none border border-transparent focus:border-[#00a884] text-sm" />
        </div>
        <div className="flex items-end">
          <button onClick={() => { setSearch(""); setDateFrom(""); setTimeFrom(""); }} className="flex items-center gap-2 text-red-400 font-bold text-sm hover:underline p-2">
            <FilterX size={16} /> נקה הכל
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {["active", "history", "cancelled"].map(tab => (
          <button key={tab} onClick={() => setSelectedTab(tab)} className={clsx(
            "px-6 py-2.5 rounded-2xl font-black text-sm transition-all",
            selectedTab === tab ? "bg-[#00a884] text-white shadow-lg" : "bg-[#202c33] text-gray-400 border border-transparent hover:border-white/10"
          )}>
            {tab === "active" ? "הזמנות בטיפול" : tab === "history" ? "הושלמו" : "מבוטלות"}
          </button>
        ))}
      </div>

      {/* Table Container */}
      <div className="bg-[#202c33] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
        <table className="w-full text-right">
          <thead className="bg-[#2a3942] text-gray-400 text-[11px] font-black uppercase tracking-widest">
            <tr>
              <th className="p-5">מספר</th>
              <th className="p-5">לקוח ויעד</th>
              <th className="p-5">זמן יצירה</th>
              <th className="p-5">סכום</th>
              <th className="p-5">סטטוס</th>
              <th className="p-5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredOrders.map(o => (
              <>
                <tr key={o.id} className="hover:bg-white/[0.02] cursor-pointer transition-colors" onClick={() => setOpenRow(openRow === o.id ? null : o.id)}>
                  <td className="p-5 font-mono text-[#00a884] font-bold">#{o.id}</td>
                  <td className="p-5">
                    <div className="font-bold text-[#e9edef]">{o.customerName}</div>
                    <div className="text-xs text-gray-500 font-medium">{o.address || "בילו 58, תל אביב"}</div>
                  </td>
                  <td className="p-5 text-sm text-gray-400">{new Date(o.createdAt).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="p-5 font-black text-white">{o.total} ₪</td>
                  <td className="p-5">
                    <span className={clsx(
                      "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                      o.status === "סופקה" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                    )}>{o.status}</span>
                  </td>
                  <td className="p-5"><FileText size={18} className="text-gray-600" /></td>
                </tr>
                {openRow === o.id && (
                  <tr className="bg-black/20 animate-in fade-in slide-in-from-top-1 duration-300">
                    <td colSpan={6} className="p-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-3">
                          <h4 className="text-xs font-black text-[#00a884] uppercase tracking-widest border-b border-white/5 pb-2">פירוט סחורה להעמסה</h4>
                          {o.products.map((p, idx) => (
                            <div key={idx} className="flex justify-between text-sm bg-white/[0.02] p-2 rounded-lg">
                              <span className="text-gray-300">{p.name} <span className="text-[10px] text-gray-500">[{p.sku}]</span></span>
                              <span className="font-bold text-[#00a884]">x {p.qty}</span>
                            </div>
                          ))}
                        </div>
                        <div className="bg-[#2a3942] p-6 rounded-3xl border border-white/5">
                          <div className="flex justify-between items-center mb-6">
                            <span className="text-xs font-bold text-gray-400 uppercase">מידע לנהג</span>
                            <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-gray-300">{o.phone || "050-9620049"}</span>
                          </div>
                          <p className="text-xl font-black mb-1">{o.address || "בילו 58, תל אביב"}</p>
                          <p className="text-sm text-gray-400 font-medium">לקוח: {o.customerName}</p>
                          <div className="mt-8 flex justify-between items-center border-t border-white/5 pt-4">
                            <span className="text-xs font-bold text-gray-500 uppercase">סה"כ לתשלום</span>
                            <span className="text-2xl font-black text-[#00a884]">{o.total} ₪</span>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
        {filteredOrders.length === 0 && (
          <div className="p-20 text-center text-gray-500 font-bold italic">לא נמצאו הזמנות שתואמות את הסינון...</div>
        )}
      </div>
    </div>
  );
}

// 📦 הקומפוננטה שעוטפת ב-Suspense כדי לפתור את שגיאת ה-Build
export default function OrderHistoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0b141a] flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-[#00a884] border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-black italic tracking-tighter">טוען מערכת לוגיסטית...</h2>
      </div>
    }>
      <OrderHistoryContent />
    </Suspense>
  );
}
