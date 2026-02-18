"use client";

import React, { useEffect, useMemo, useState, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { pushToast } from "@/components/ToastManager";
import { Download, Share2, FileText, Calendar, Clock, Search, FilterX, Phone, Truck, HardHat } from "lucide-react";

// --- Types ---
type Product = { sku: string; name: string; qty: number; };
type OrderStatus = "בהכנה" | "יצאה להובלה" | "סופקה" | "בוטלה";
type DeliveryMethod = "הובלה" | "איסוף עצמי";

interface Order {
  id: string;
  customerName: string;
  project: string;
  contactName: string;
  phone: string;
  deliveryMethod: DeliveryMethod;
  products: Product[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  address: string;
}

// --- תוכן העמוד ---
function OrderHistoryContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>("active");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [timeFrom, setTimeFrom] = useState("");
  const [openRow, setOpenRow] = useState<string | null>(null);

  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());
    const stored = JSON.parse(localStorage.getItem("orderFilters") || "{}");

    setSelectedTab(params.tab || stored.selectedTab || "active");
    setSearch(params.q || stored.search || "");
    setDateFrom(params.from || stored.dateFrom || "");
    setTimeFrom(params.tfrom || stored.timeFrom || "");
    
    import("@/data/orders.json").then(data => setOrders(data.default as Order[])).catch(() => setOrders([]));
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedTab) params.set("tab", selectedTab);
    if (search) params.set("q", search);
    if (dateFrom) params.set("from", dateFrom);
    if (timeFrom) params.set("tfrom", timeFrom);

    router.replace(`${pathname}?${params.toString()}`);
    localStorage.setItem("orderFilters", JSON.stringify({ selectedTab, search, dateFrom, timeFrom }));
  }, [selectedTab, search, dateFrom, timeFrom, router, pathname]);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      if (selectedTab === "active" && !["בהכנה", "יצאה להובלה"].includes(order.status)) return false;
      if (selectedTab === "history" && order.status !== "סופקה") return false;
      if (selectedTab === "cancelled" && order.status !== "בוטלה") return false;

      const q = search.toLowerCase();
      const matchSearch = order.customerName.toLowerCase().includes(q) || 
                          order.project.toLowerCase().includes(q) || 
                          order.id.includes(q);
      if (q && !matchSearch) return false;
      if (dateFrom && !order.createdAt.startsWith(dateFrom)) return false;
      return true;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, selectedTab, search, dateFrom]);

  const exportToExcel = () => {
    const data = filteredOrders.map(o => ({
      "מספר": o.id, "פרויקט": o.project, "לקוח": o.customerName, "טלפון": o.phone, "אספקה": o.deliveryMethod, "סכום": o.total, "סטטוס": o.status
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    XLSX.writeFile(wb, `Saban_Logistics_${new Date().toLocaleDateString()}.xlsx`);
    pushToast("הקובץ מוכן להורדה", "success");
  };

  return (
    <div className="min-h-screen bg-[#0b141a] text-[#e9edef] p-4 md:p-8 font-sans" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black flex items-center gap-3 italic">
          <div className="w-1.5 h-8 bg-[#00a884] rounded-full"></div>
          בקרה לוגיסטית סבן
        </h1>
        <div className="flex gap-2">
          <button onClick={exportToExcel} className="p-2 bg-[#202c33] rounded-xl border border-white/5 hover:bg-[#2a3942] transition-all">
            <Download size={20} />
          </button>
          <button onClick={() => window.open('https://wa.me/?text=דוח לוגיסטי')} className="p-2 bg-[#00a884] rounded-xl hover:bg-[#06cf9c] transition-all">
            <Share2 size={20} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#202c33] p-3 rounded-2xl border border-white/5 flex items-center gap-2">
          <Search size={18} className="text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="חפש לקוח/פרויקט..." className="bg-transparent outline-none w-full text-sm" />
        </div>
        <div className="bg-[#202c33] p-3 rounded-2xl border border-white/5 flex items-center gap-2 text-sm">
          <Calendar size={18} className="text-gray-500" />
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="bg-transparent outline-none w-full" />
        </div>
        <div className="bg-[#202c33] p-3 rounded-2xl border border-white/5 flex items-center gap-2 text-sm">
          <Clock size={18} className="text-gray-500" />
          <input type="time" value={timeFrom} onChange={e => setTimeFrom(e.target.value)} className="bg-transparent outline-none w-full" />
        </div>
        <button onClick={() => { setSearch(""); setDateFrom(""); setTimeFrom(""); }} className="text-red-400 text-xs font-bold hover:underline">נקה מסננים</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {["active", "history", "cancelled"].map(tab => (
          <button key={tab} onClick={() => setSelectedTab(tab)} className={clsx(
            "px-6 py-2 rounded-xl text-xs font-black transition-all",
            selectedTab === tab ? "bg-[#00a884] text-white" : "bg-[#202c33] text-gray-400"
          )}>
            {tab === "active" ? "בביצוע" : tab === "history" ? "סופק" : "בוטל"}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#202c33] rounded-3xl border border-white/5 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-[#2a3942] text-[10px] text-gray-400 uppercase font-black tracking-widest">
            <tr>
              <th className="p-5 tracking-tighter">הזמנה</th>
              <th className="p-5">פרויקט ולקוח</th>
              <th className="p-5">אספקה</th>
              <th className="p-5 text-left">סכום</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(o => (
              <React.Fragment key={o.id}>
                <tr className="border-b border-white/5 hover:bg-white/[0.02] cursor-pointer" onClick={() => setOpenRow(openRow === o.id ? null : o.id)}>
                  <td className="p-5 font-mono text-[#00a884] font-bold">#{o.id}</td>
                  <td className="p-5">
                    <div className="font-black text-white">{o.project}</div>
                    <div className="text-[10px] text-gray-500">{o.customerName}</div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase">
                      {o.deliveryMethod === "הובלה" ? <Truck size={12} className="text-blue-400"/> : <HardHat size={12} className="text-purple-400"/>}
                      {o.deliveryMethod}
                    </div>
                  </td>
                  <td className="p-5 text-left font-black text-white">{o.total} ₪</td>
                </tr>
                {openRow === o.id && (
                  <tr className="bg-black/10">
                    <td colSpan={4} className="p-6">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-2">
                           <h4 className="text-[10px] font-black text-[#00a884] uppercase mb-4 tracking-widest">פירוט סחורה</h4>
                           {o.products.map((p, i) => (
                             <div key={i} className="flex justify-between bg-white/5 p-2 rounded-lg text-sm">
                               <span>{p.name}</span>
                               <span className="font-bold">x{p.qty}</span>
                             </div>
                           ))}
                         </div>
                         <div className="bg-[#2a3942] p-4 rounded-2xl">
                           <p className="text-xs text-gray-400 mb-1 font-bold">כתובת למשלוח:</p>
                           <p className="font-black text-lg mb-4">{o.address}</p>
                           <p className="text-xs text-gray-400 mb-1 font-bold">איש קשר:</p>
                           <p className="font-bold">{o.contactName} - <span className="text-[#00a884]">{o.phone}</span></p>
                         </div>
                       </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        {filteredOrders.length === 0 && <div className="p-20 text-center text-gray-600 font-bold italic">המחסן שקט... אין הזמנות.</div>}
      </div>
    </div>
  );
}

// --- ה-Default Export שחייב להיות כאן כדי למנוע את שגיאת ה-Build ---
export default function OrderHistoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0b141a] flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-[#00a884] border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-lg font-black text-[#00a884] italic animate-pulse">טוען נתונים...</h2>
      </div>
    }>
      <OrderHistoryContent />
    </Suspense>
  );
}
