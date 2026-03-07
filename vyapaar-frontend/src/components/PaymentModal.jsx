import { useState } from "react"
import Modal from "./Modal"

export function PaymentModal({ isOpen, onClose, onSubmit, customers, language }) {
  const [customerId, setCustomerId] = useState("")
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    const amt = parseFloat(amount)
    if (!customerId || isNaN(amt) || amt <= 0) return
    setLoading(true)
    await onSubmit({ customer_id: Number(customerId), amount: amt })
    setLoading(false)
    setCustomerId("")
    setAmount("")
    onClose()
  }

  const isHi = language === "hi"

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isHi ? "भुगतान दर्ज करें" : "Record Payment"}>
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
            <option value="" disabled>{isHi ? "किससे पैसे मिले?" : "Who paid you?"}</option>
            {customers.map((c) => (
              <option key={c.customer_id ?? c.id} value={c.customer_id ?? c.id}>
                {c.name} {c.balance > 0 ? `(Remaining: ₹${c.balance})` : ''}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            {isHi ? "रकम (₹)" : "Amount Received (₹)"}
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">₹</span>
            <input
              type="number"
              required
              min="1"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full pl-10 pr-4 py-3 text-3xl font-display font-bold rounded-xl border border-slate-200 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition"
            />
          </div>
        </div>
        <div className="pt-4 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-3 px-4 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition text-lg">
            {isHi ? "रद्द करें" : "Cancel"}
          </button>
          <button type="submit" disabled={loading} className="flex-[2] py-3 px-4 rounded-xl font-bold bg-ink text-white hover:bg-slate-800 transition shadow-soft disabled:opacity-50 text-lg">
            {loading ? "..." : (isHi ? "जमा करें" : "Record ₹")}
          </button>
        </div>
      </form>
    </Modal>
  )
}
