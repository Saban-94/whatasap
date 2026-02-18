// ... (שאר ה-Imports וה-Logic נשארים אותו דבר)

// עדכון מבנה השורות בטבלה להצגת פרויקט ואיש קשר בולטים
<tbody className="divide-y divide-white/5">
  {filteredOrders.map(o => (
    <tr key={o.id} className="hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => setOpenRow(openRow === o.id ? null : o.id)}>
      <td className="p-4 font-mono text-[#00a884] font-bold">#{o.id}</td>
      
      {/* עמודה חדשה: פרויקט ולקוח */}
      <td className="p-4">
        <div className="font-black text-[#e9edef] text-base">{o.project || "פרויקט כללי"}</div>
        <div className="text-xs text-gray-500 font-bold italic">לקוח: {o.customerName}</div>
      </td>

      {/* עמודה חדשה: איש קשר בשטח */}
      <td className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#202c33] flex items-center justify-center text-[10px] border border-white/10">📞</div>
          <div>
            <div className="text-sm font-bold text-gray-200">{o.contactName || "טארק"}</div>
            <div className="text-[11px] text-[#00a884] font-mono">{o.phone || "050-9620049"}</div>
          </div>
        </div>
      </td>

      {/* עמודה חדשה: שיטת אספקה */}
      <td className="p-4">
        <div className={clsx(
          "inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-tighter",
          o.deliveryMethod === "הובלה" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
        )}>
          {o.deliveryMethod === "הובלה" ? "🚚 הובלת סבן" : "🏗️ איסוף עצמי"}
        </div>
      </td>

      <td className="p-4 text-sm text-gray-400 font-medium">
        {new Date(o.createdAt).toLocaleDateString('he-IL')} <br/>
        <span className="text-[10px]">{new Date(o.createdAt).toLocaleTimeString('he-IL', {hour:'2-digit', minute:'2-digit'})}</span>
      </td>

      <td className="p-4 font-black text-white text-lg">{o.total} ₪</td>
    </tr>
  ))}
</tbody>
