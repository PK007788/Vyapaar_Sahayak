import { useState } from "react"
import Modal from "./Modal"

export function InvoiceModal({ isOpen, onClose, onSubmit, customers, language }) {
  const [customerId, setCustomerId] = useState("")
  const [items, setItems] = useState([{ item_name: "", quantity: 1, unit_price: "" }])
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    const validItems = items
      .filter((i) => i.item_name.trim() && Number(i.quantity) > 0 && Number(i.unit_price) >= 0)
      .map((i) => ({ item_name: i.item_name.trim(), quantity: Number(i.quantity), unit_price: Number(i.unit_price) }))
      
    if (!customerId || validItems.length === 0) return
    setLoading(true)
    await onSubmit({ customer_id: Number(customerId), items: validItems })
    setLoading(false)
    setCustomerId("")
    setItems([{ item_name: "", quantity: 1, unit_price: "" }])
    onClose()
  }

  const isHi = language === "hi"

  const total = items.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.unit_price || 0)), 0)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isHi ? "नया बिल बनाएँ" : "Create New Invoice"}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            {isHi ? "ग्राहक चुनें" : "Select Customer"}
          </label>
          <select
            required
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="w-full px-4 py-3 text-lg rounded-xl border border-slate-200 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition bg-white"
          >
            <option value="" disabled>{isHi ? "किसके लिए बिल बना रहे हैं?" : "Who is this bill for?"}</option>
            {customers.map((c) => (
              <option key={c.customer_id ?? c.id} value={c.customer_id ?? c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            {isHi ? "आइटम विवरण" : "Item Details"}
          </label>
          <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-2 no-scrollbar">
            {items.map((item, i) => (
              <div key={i} className="flex gap-2 items-start bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    required
                    placeholder={isHi ? "क्या खरीदा?" : "What did they buy?"}
                    value={item.item_name}
                    onChange={(e) => {
                      const next = [...items]
                      next[i] = { ...next[i], item_name: e.target.value }
                      setItems(next)
                    }}
                    className="w-full px-3 py-2 text-base rounded-lg border border-slate-200 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      placeholder={isHi ? "मात्रा" : "Qty"}
                      value={item.quantity}
                      onChange={(e) => {
                        const next = [...items]
                        next[i] = { ...next[i], quantity: e.target.value }
                        setItems(next)
                      }}
                      className="w-1/3 px-3 py-2 text-base font-medium rounded-lg border border-slate-200 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none"
                    />
                    <div className="relative w-2/3">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                      <input
                        type="number"
                        required
                        min="0"
                        step="any"
                        placeholder={isHi ? "दाम" : "Price"}
                        value={item.unit_price}
                        onChange={(e) => {
                          const next = [...items]
                          next[i] = { ...next[i], unit_price: e.target.value }
                          setItems(next)
                        }}
                        className="w-full pl-8 pr-3 py-2 text-base font-bold rounded-lg border border-slate-200 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none"
                      />
                    </div>
                  </div>
                </div>
                {items.length > 1 && (
                  <button type="button" onClick={() => setItems(prev => prev.filter((_, idx) => idx !== i))} className="p-2 text-slate-400 hover:text-red-500 bg-white rounded-lg border border-slate-200 shadow-sm mt-1">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setItems((prev) => [...prev, { item_name: "", quantity: 1, unit_price: "" }])}
            className="mt-3 w-full py-2.5 rounded-lg border-2 border-dashed border-slate-200 text-brand font-medium hover:border-brand hover:bg-brand/5 transition-colors flex items-center justify-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            {isHi ? "और आइटम जोड़ें" : "Add Another Item"}
          </button>
        </div>

        <div className="flex justify-between items-center bg-brand/5 p-4 rounded-xl border border-brand/10">
          <span className="font-semibold text-slate-600">{isHi ? "कुल राशि (Total)" : "Total Amount:"}</span>
          <span className="font-display font-bold text-2xl text-brand">₹{total.toLocaleString()}</span>
        </div>

        <div className="pt-2 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-3 px-4 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition text-lg">
            {isHi ? "रद्द करें" : "Cancel"}
          </button>
          <button type="submit" disabled={loading} className="flex-[2] py-3 px-4 rounded-xl font-bold bg-brand text-white hover:bg-brand-dark transition shadow-soft disabled:opacity-50 text-lg">
            {loading ? "..." : (isHi ? "बिल बनाएँ" : "Create Invoice")}
          </button>
        </div>
      </form>
    </Modal>
  )
}
