"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
type Order = { id: string; customerName: string; products: Product[]; total: number; status: OrderStatus; createdAt: string; address?: string; phone?: string; };

export default function OrderHistoryPage() {
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

  // --- Load Filters from URL & LocalStorage ---
  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());
    const stored = JSON.parse(localStorage.getItem("orderFilters") || "{}");

    setSelectedTab(params.tab || stored.selectedTab || "active");
    setSearch(params.q || stored.search || "");
    setDateFrom(params.from || stored.dateFrom || "");
    setDateTo(params.to || stored.dateTo || "");
    setTimeFrom(params.tfrom || stored.timeFrom || "");
    setTimeTo(params.tto || stored.timeTo || "");
    
    // טעינת דאטה ראשונית (כאן אפשר למשוך מה-API שלך)
    import("@/data/orders.json").then(data => setOrders(data.default as Order[]));
  }, []);

  // --- Update URL & LocalStorage ---
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
  }, [selectedTab, search, dateFrom, dateTo, timeFrom, timeTo]);

  // --- Filtering Logic ---
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // סינון טאבים
      if (selectedTab === "active" && !["בהכנה", "יצאה להובלה"].includes(order.status)) return false;
      if (selectedTab === "history" && order.status !== "סופקה") return false;
      if (selectedTab === "cancelled" && order.status !== "בוטלה") return false;

      // סינון חיפוש
      const q = search.toLowerCase();
      if (q && !order.customerName.toLowerCase().includes(q) && !order.id.includes(q)) return false;

      // סינון תאריך ושעה
      const orderDate = new Date(order.createdAt);
      if (dateFrom && orderDate < new Date(dateFrom)) return false;
      if (dateTo && orderDate > new Date(dateTo + "T23:59:59")) return false;
      
      if (timeFrom || timeTo) {
        const h = orderDate.getHours();
        const m = orderDate.getMinutes();
        const orderTime = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`;
        if (timeFrom && orderTime < timeFrom) return false;
        if (timeTo && orderTime > timeTo) return false;
      }

      return true;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, selectedTab, search, dateFrom, dateTo, timeFrom, timeTo]);

  // --- Export Actions ---
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredOrders.map(o => ({
      "הזמנה": o.id, "לקוח": o.customerName, "כתובת": o.address, "סכום": o.total, "סטטוס": o.status, "תאריך": new Date(o.createdAt).toLocaleString('he-IL')
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    XLSX.writeFile(wb, `Saban_Orders_${new Date().toLocaleDateString()}.xlsx`);
    pushToast("הקובץ נוצר בהצלחה", "success");
  };

  const shareToWA = () => {
    const text = `דוח הזמנות ח. סבן (${new Date().toLocaleDateString()}):\n` + 
      filteredOrders.map(o => `#${o.id} - ${o.customerName} - ${o.status}`).join('\n');
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0b141a] text-white p-8 font-sans" dir="rtl">
      {/* Header & Stats */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <div className="w-3 h-8 bg-[#00a884] rounded-full"></div>
          היסטוריית הזמנות - סבן
        </h1>
        <div className="flex gap-3">
          <button onClick={exportToExcel} className="flex items-center gap-2 bg-[#202c33] hover:bg-[#2a3942] px-4 py-2 rounded-xl border border-gray-700 transition-all">
            <Download size={18} /> Excel
          </button>
          <button onClick={shareToWA} className="flex items-center gap-2 bg-[#00a884] hover:bg-[#06cf9c] px-4 py-2 rounded-xl font-bold transition-all">
            <Share2 size={18} /> שתף בוואטסאפ
          </button>
        </div>
      </div>

      {/* Filters Area */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-[#202c33] p-6 rounded-2xl border border-gray-700 shadow-2xl">
        <div className="relative">
          <Search className="absolute right-3 top-3 text-gray-500" size={18} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="חפש לקוח או הזמנה..." className="w-full bg-[#2a3942] rounded-xl pr-10 py-2 outline-none border border-gray-600 focus:border-[#00a884]" />
        </div>
        <div className="flex items-center gap-2 bg-[#2a3942] rounded-xl px-3 border border-gray-600">
          <Calendar size={18} className="text-gray-500" />
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="bg-transparent outline-none w-full text-sm" />
        </div>
        <div className="flex items-center gap-2 bg-[#2a3942] rounded-xl px-3 border border-gray-600">
          <Clock size={18} className="text-gray-500" />
          <input type="time" value={timeFrom} onChange={e => setTimeFrom(e.target.value)} className="bg-transparent outline-none w-full text-sm" />
        </div>
        <button onClick={() => { setSearch(""); setDateFrom(""); setDateTo(""); setTimeFrom(""); setTimeTo(""); }} className="flex items-center justify-center gap-2 text-red-400 hover:text-red-300 font-bold">
          <FilterX size={18} /> איפוס מסננים
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {["active", "history", "cancelled"].map(tab => (
          <button key={tab} onClick={() => setSelectedTab(tab)} className={clsx(
            "px-6 py-2 rounded-full font-bold transition-all",
            selectedTab === tab ? "bg-[#00a884] text-white" : "bg-[#202c33] text-gray-400 hover:bg-[#2a3942]"
          )}>
            {tab === "active" ? "הזמנות פתוחות" : tab === "history" ? "הושלמו" : "בוטלו"}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-[#202c33] rounded-2xl overflow-hidden border border-gray-700 shadow-2xl">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-[#2a3942] text-gray-400 text-sm uppercase">
              <th className="p-4">הזמנה</th>
              <th className="p-4">לקוח</th>
              <th className="p-4">תאריך ושעה</th>
              <th className="p-4">סכום</th>
              <th className="p-4">סטטוס</th>
              <th className="p-4 text-center">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <>
                <tr key={order.id} className="border-b border-gray-700 hover:bg-[#2a3942] transition-colors cursor-pointer" onClick={() => setOpenRow(openRow === order.id ? null : order.id)}>
                  <td className="p-4 font-bold">#{order.id}</td>
                  <td className="p-4">
                    <div className="font-bold text-white">{order.customerName}</div>
                    <div className="text-xs text-gray-500">{order.address || "תל אביב"}</div>
                  </td>
                  <td className="p-4 text-sm">{new Date(order.createdAt).toLocaleString('he-IL')}</td>
                  <td className="p-4 font-black text-[#00a884]">{order.total} ₪</td>
                  <td className="p-4">
                    <span className={clsx(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase",
                      order.status === "סופקה" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                    )}>{order.status}</span>
                  </td>
                  <td className="p-4 text-center text-gray-500">
                    <FileText size={20} className="inline" />
                  </td>
                </tr>
                {openRow === order.id && (
                  <tr className="bg-[#0b141a]">
                    <td colSpan={6} className="p-6">
                      <div className="grid grid-cols-2 gap-8 animate-fadeIn">
                        <div>
                          <h4 className="text-[#00a884] font-bold mb-4">פירוט סחורה:</h4>
                          {order.products.map((p, i) => (
                            <div key={i} className="flex justify-between py-2 border-b border-gray-800 text-sm">
                              <span>{p.name} (מק"ט: {p.sku})</span>
                              <span className="font-bold">x{p.qty}</span>
                            </div>
                          ))}
                        </div>
                        <div className="bg-[#202c33] p-4 rounded-xl border border-gray-700">
                          <h4 className="text-gray-400 text-xs mb-2 uppercase">פרטי משלוח</h4>
                          <p className="font-bold mb-1">בילו 58, תל אביב</p>
                          <p className="text-sm text-gray-400">טארק: 050-9620049</p>
                          <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between font-black">
                            <span>סה"כ לתשלום:</span>
                            <span className="text-xl text-[#00a884]">{order.total} ₪</span>
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
      </div>
    </div>
  );
}
