import { useState } from "react"
import Modal from "./Modal"

export function CustomerModal({ isOpen, onClose, onSubmit, language }) {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    await onSubmit({ name: name.trim(), phone: phone.trim() })
    setLoading(false)
    setName("")
    setPhone("")
    onClose()
  }

  const isHi = language === "hi"

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isHi ? "नया ग्राहक जोड़ें" : "Add New Customer"}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            {isHi ? "ग्राहक का नाम" : "Customer Name"}
          </label>
          <input
            type="text"
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={isHi ? "उदा. सुरेश प्रोविजन स्टोर" : "e.g. Suresh Provision Store"}
            className="w-full px-4 py-3 text-lg rounded-xl border border-slate-200 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            {isHi ? "मोबाइल नंबर (वैकल्पिक)" : "Mobile Number (Optional)"}
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="9876543210"
            className="w-full px-4 py-3 text-lg rounded-xl border border-slate-200 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition"
          />
        </div>
        <div className="pt-4 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-3 px-4 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition text-lg">
            {isHi ? "रद्द करें" : "Cancel"}
          </button>
          <button type="submit" disabled={loading} className="flex-[2] py-3 px-4 rounded-xl font-bold bg-brand text-white hover:bg-brand-dark transition shadow-soft disabled:opacity-50 text-lg">
            {loading ? "..." : (isHi ? "ग्राहक जोड़ें" : "Save Customer")}
          </button>
        </div>
      </form>
    </Modal>
  )
}
