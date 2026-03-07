import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { api } from "../lib/api"
import { useLanguage } from "../context/LanguageContext"
import { t } from "../lib/i18n"
import { CustomerModal } from "../components/CustomerModal"
import { PaymentModal } from "../components/PaymentModal"
import { InvoiceModal } from "../components/InvoiceModal"
import LanguageToggle from "../components/LanguageToggle"

export default function Dashboard() {
  const { logout } = useAuth()
  const { language } = useLanguage()
  const isHi = language === "hi"
  
  const [dashboard, setDashboard] = useState(null)
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [statementCustomerId, setStatementCustomerId] = useState("")
  const [statement, setStatement] = useState(null)

  // Modal states
  const [isCustomerModalOpen, setCustomerModalOpen] = useState(false)
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false)
  const [isInvoiceModalOpen, setInvoiceModalOpen] = useState(false)
  const [isInvoiceDetailsOpen, setInvoiceDetailsOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [isLoadingInvoice, setIsLoadingInvoice] = useState(false)

  function loadDashboard() {
    api.dashboard().then(setDashboard).catch(() => setDashboard(null))
  }
  function loadCustomers() {
    api.customers().then((data) => setCustomers(Array.isArray(data) ? data : [])).catch(() => setCustomers([]))
  }

  useEffect(() => {
    setLoading(true)
    Promise.all([api.dashboard(), api.customers()])
      .then(([d, c]) => {
        setDashboard(d)
        setCustomers(Array.isArray(c) ? c : [])
      })
      .catch((e) => setError(e?.message || "Failed to load"))
      .finally(() => setLoading(false))
  }, [])

  async function handleAddCustomer(data) {
    setError("")
    try {
      await api.createCustomer({ name: data.name, phone: data.phone || undefined })
      loadCustomers()
      loadDashboard()
    } catch (e) {
      setError(e?.message || "Could not add customer")
      throw e // Let modal handle loading state revert
    }
  }

  async function handlePayment(data) {
    setError("")
    try {
      await api.recordPayment({ customer_id: data.customer_id, amount: data.amount })
      loadCustomers()
      loadDashboard()
    } catch (e) {
      setError(e?.message || "Could not record payment")
      throw e
    }
  }

  async function handleInvoice(data) {
    setError("")
    try {
      await api.createInvoice({ customer_id: data.customer_id, items: data.items })
      loadDashboard()
    } catch (e) {
      setError(e?.message || "Could not create invoice")
      throw e
    }
  }

  const handleViewInvoice = async (invoiceId) => {
    if (!invoiceId) return;
    setIsLoadingInvoice(true)
    setInvoiceDetailsOpen(true)
    try {
      const res = await api.getInvoiceDetails(invoiceId)
      if (res.status === "success") {
        setSelectedInvoice(res)
      } else {
        setError(res.message || "Failed to load invoice details")
        setInvoiceDetailsOpen(false)
      }
    } catch (err) {
      setError(err.message)
      setInvoiceDetailsOpen(false)
    } finally {
      setIsLoadingInvoice(false)
    }
  }

  async function loadStatement() {
    if (!statementCustomerId) return
    setError("")
    try {
      const data = await api.statement(Number(statementCustomerId))
      setStatement(data)
    } catch (e) {
      setError(e?.message || "Could not load statement")
      setStatement(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F7F6] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <div className="w-10 h-10 border-[3px] border-[#1A8C66]/30 border-t-[#1A8C66] rounded-full animate-spin"></div>
           <p className="text-slate-600 font-bold tracking-tight animate-pulse">{isHi ? "लोड हो रहा है..." : "Loading Workspace..."}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F4F7F6] p-4 sm:p-6 lg:p-8 flex justify-center items-center font-sans tracking-tight">
      <div className="w-full max-w-[1400px] bg-white rounded-[40px] shadow-sm flex overflow-hidden min-h-[90vh] relative border border-slate-100">
        
        {/* Subtle India background texture inside the main app card */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none mix-blend-multiply">
           <img src="/dashboard_bg.png" className="w-full h-full object-cover grayscale" alt="" />
        </div>

        {/* --- Sidebar Navigation --- */}
        <aside className="w-64 border-r border-[#F0F4F2] bg-white/80 backdrop-blur-sm flex flex-col pt-8 pb-8 px-6 z-10 hidden lg:flex shrink-0">
          <Link to="/" className="font-display font-bold text-lg text-slate-800 flex items-center gap-3 mb-12">
            <div className="w-8 h-8 bg-[#1A8C66] rounded-xl flex items-center justify-center text-white text-xs shadow-md shadow-[#1A8C66]/20">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            {isHi ? "व्यापार सहायक" : "Vyapaar Sahayak"}
          </Link>

          <nav className="space-y-1.5 flex-1">
             <button className="flex items-center gap-3 w-full px-4 py-3.5 text-[15px] font-bold rounded-2xl bg-[#1A8C66]/10 text-[#1A8C66] transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                {t(language, "dashboard")}
             </button>
             <button onClick={() => setInvoiceModalOpen(true)} className="flex items-center gap-3 w-full px-4 py-3.5 text-[15px] font-bold rounded-2xl text-slate-500 hover:bg-[#F4F7F6] hover:text-slate-800 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"/><polyline points="14 2 14 8 20 8"/><path d="M2 15h10"/><path d="M9 18l3-3-3-3"/></svg>
                {t(language, "createInvoice")}
             </button>
             <button onClick={() => setPaymentModalOpen(true)} className="flex items-center gap-3 w-full px-4 py-3.5 text-[15px] font-bold rounded-2xl text-slate-500 hover:bg-[#F4F7F6] hover:text-slate-800 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                {t(language, "recordPayment")}
             </button>
             <button onClick={() => setCustomerModalOpen(true)} className="flex items-center gap-3 w-full px-4 py-3.5 text-[15px] font-bold rounded-2xl text-slate-500 hover:bg-[#F4F7F6] hover:text-slate-800 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                {isHi ? "ग्राहक जोड़ें" : "Add Customer"}
             </button>
          </nav>
        </aside>

        {/* --- Main Dashboard Area --- */}
        <main className="flex-1 flex flex-col bg-white/50 backdrop-blur-sm z-10 overflow-hidden relative">
          
          {/* Top Header */}
          <header className="px-6 py-6 md:px-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
             <div className="relative w-full max-w-sm transition-all duration-300 focus-within:max-w-md group">
               <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#1A8C66]">
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
               </div>
               <input 
                 type="text" 
                 placeholder={isHi ? "सर्च (जल्द आ रहा है)" : "Search (Voice coming soon)"}
                 disabled
                 className="w-full pl-12 pr-4 py-3.5 bg-[#F4F7F6] border-none rounded-2xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-[#1A8C66]/20 transition-all outline-none text-slate-700 placeholder:text-slate-400 shadow-inner"
               />
             </div>
             
             <div className="flex items-center gap-4">
               <div className="hidden sm:block">
                 <LanguageToggle />
               </div>
               <div className="h-12 px-2 rounded-full border border-slate-100 flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-700 pl-3">Admin</span>
                  <button onClick={logout} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  </button>
               </div>
             </div>
          </header>

          <div className="flex-1 overflow-y-auto px-6 py-4 md:px-10 pb-12 w-full no-scrollbar">
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl text-sm font-bold border border-red-100 flex items-center gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            <div className="flex items-center gap-4 mb-8">
               <h1 className="text-[34px] font-bold text-slate-900 tracking-tight leading-none">{isHi ? "डैशबोर्ड" : "Dashboard"}</h1>
            </div>

            {dashboard && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                {/* Green Master Card (Upcoming payments analogue) */}
                <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-[#12684b] to-[#1A8C66] rounded-3xl p-6 text-white relative overflow-hidden shadow-xl shadow-[#1A8C66]/20">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-6 opacity-90"><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                  <p className="text-white/80 text-[11px] font-bold uppercase tracking-widest mb-1.5">{t(language, "customers")}</p>
                  <p className="text-[32px] font-display font-bold leading-none">{dashboard.total_customers ?? 0}</p>
                </div>

                <div className="bg-[#EEF6F3] rounded-3xl p-6 text-slate-800 relative">
                  <div className="w-10 h-10 rounded-xl bg-[#1A8C66]/10 text-[#1A8C66] flex items-center justify-center mb-5"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
                  <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest mb-1.5">{t(language, "outstanding")}</p>
                  <p className="text-[26px] font-bold tracking-tight leading-none">₹{Number(dashboard.outstanding_balance ?? 0).toLocaleString()}</p>
                </div>

                <div className="bg-[#F8FAF9] rounded-3xl p-6 text-slate-800 border border-[#F0F4F2]">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center mb-5"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg></div>
                  <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest mb-1.5">{t(language, "todayInvoices")}</p>
                  <p className="text-[26px] font-bold tracking-tight leading-none">{dashboard.today_invoices ?? 0}</p>
                </div>

                <div className="bg-[#F8FAF9] rounded-3xl p-6 text-slate-800 border border-[#F0F4F2]">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center mb-5"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
                  <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest mb-1.5">{t(language, "recentActivity")}</p>
                  <p className="text-[26px] font-bold tracking-tight leading-none">{Array.isArray(dashboard.recent_transactions) ? dashboard.recent_transactions.length : 0}</p>
                </div>
              </div>
            )}

            <div className="grid lg:grid-cols-[1.5fr_1fr] xl:grid-cols-[2fr_1fr] gap-6 items-start">
               
               {/* Left Column: Recent Transactions (Account Statement) */}
               <div className="flex flex-col h-auto min-h-[500px]">
                  <div className="flex justify-between items-center mb-6 px-1">
                     <h2 className="font-bold text-slate-900 text-lg tracking-tight">{isHi ? "हाल के लेनदेन" : "Recent transactions"}</h2>
                     
                     {statement && (
                        <div className="flex items-center gap-3">
                           <span className="text-sm font-bold text-slate-600 bg-[#F4F7F6] px-4 py-2 rounded-xl">
                             {customers.find(c => (c.customer_id ?? c.id).toString() === statementCustomerId)?.name || ""}
                           </span>
                        </div>
                     )}
                  </div>

                  {!statement ? (
                     <div className="flex-1 flex flex-col items-center justify-center py-24 bg-[#F8FAF9] rounded-[32px] border-2 border-dashed border-[#F0F4F2] text-slate-400">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-5 text-slate-300"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        <p className="font-bold text-slate-500 mb-1">{isHi ? "कोई ग्राहक नहीं चुना गया" : "No customer selected"}</p>
                        <p className="text-sm font-medium">{isHi ? "विवरण देखने के लिए किसी ग्राहक को चुनें।" : "Select someone from available cards to view ledger."}</p>
                     </div>
                  ) : (
                     <div className="w-full">
                        <table className="w-full text-left border-collapse">
                          <tbody className="divide-y divide-[#F0F4F2]">
                            {/* Header row mock style */}
                            <tr className="border-t-2 border-b-2 border-[#F0F4F2] text-slate-400 text-[12px] font-bold uppercase tracking-widest">
                               <td className="py-4 px-2">Description</td>
                               <td className="py-4 text-right">Amount</td>
                               <td className="py-4 text-right px-2">Balance</td>
                            </tr>
                            {(Array.isArray(statement) ? statement : statement.entries || statement.transactions || []).length === 0 ? (
                               <tr><td colSpan="3" className="py-12 text-center text-slate-400 font-bold">No transactions recorded yet.</td></tr>
                            ) : (
                               (Array.isArray(statement) ? statement : statement.entries || statement.transactions || []).map((row, i) => {
                                 const typeStr = (row.type || row.description || "").toLowerCase();
                                 const isInvoice = typeStr.includes('invoice') || typeStr.includes('credit');
                                 
                                 return (
                                 <tr 
                                   key={i} 
                                   onClick={() => row.invoice_id && handleViewInvoice(row.invoice_id)}
                                   className={`transition-all group ${row.invoice_id ? 'cursor-pointer hover:bg-[#F8FAF9] rounded-2xl' : ''}`}
                                 >
                                   <td className="py-5 px-2">
                                      <div className="flex items-center gap-4">
                                         <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 border border-[#F0F4F2] ${isInvoice ? 'bg-white text-slate-800' : 'bg-white text-[#1A8C66]'}`}>
                                           {isInvoice ? (
                                             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                           ) : (
                                             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                                           )}
                                         </div>
                                         <div className="flex flex-col gap-1">
                                           <span className="text-slate-900 font-bold text-[15px] capitalize tracking-tight">{row.type || row.description || "—"}</span>
                                           <span className="text-[13px] text-slate-400 font-medium">{row.created_at || row.date || "—"}</span>
                                         </div>
                                      </div>
                                   </td>
                                   <td className={`py-5 text-right font-bold tracking-tight w-32 ${isInvoice ? 'text-slate-800 text-[15px]' : 'text-[#1A8C66] text-[15px]'}`}>
                                     {isInvoice && "+"}{row.amount != null ? (typeof row.amount === "string" ? row.amount : `₹${Number(row.amount).toLocaleString()}`) : "—"}
                                   </td>
                                   <td className="py-5 text-right font-bold tracking-tight text-slate-500 w-28 px-2">
                                     <div className="flex items-center justify-end gap-2">
                                       {row.balance != null ? `₹${Number(row.balance).toLocaleString()}` : "—"}
                                       {row.invoice_id ? (
                                         <span className="bg-slate-100 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity text-slate-600">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                                         </span>
                                       ) : <span className="w-6"></span>}
                                     </div>
                                   </td>
                                 </tr>
                               )})
                            )}
                          </tbody>
                        </table>
                     </div>
                  )}
               </div>

               {/* Right Column: Available Cards (Customer List) */}
               <div className="bg-[#F8FAF9] rounded-[32px] p-6 lg:p-8 flex flex-col h-[650px]">
                  <div className="flex justify-between items-center mb-6">
                     <h2 className="font-bold text-slate-900 tracking-tight text-lg">{isHi ? "उपलब्ध कार्ड" : "Available cards"}</h2>
                     <button className="text-xs font-bold text-slate-500 hover:text-[#1A8C66] transition-colors">
                        View all
                     </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto no-scrollbar pb-4 -mx-2 px-2">
                    {customers.length === 0 ? (
                       <div className="text-center p-8 text-slate-500 text-sm font-bold">
                         {isHi ? "अभी कोई ग्राहक नहीं है।" : "No customers yet."}
                       </div>
                    ) : (
                       <div className="space-y-4">
                         {customers.map((c) => {
                           const isSelected = statementCustomerId === (c.customer_id ?? c.id).toString()
                           return (
                             <button 
                               key={c.customer_id ?? c.id} 
                               onClick={() => {
                                 setStatementCustomerId((c.customer_id ?? c.id).toString())
                                 setTimeout(loadStatement, 0)
                               }}
                               className={`w-full text-left flex justify-between items-center p-5 rounded-[24px] transition-all duration-300 ${isSelected ? 'bg-white shadow-sm ring-1 ring-[#1A8C66]/30 border-transparent transform scale-[1.02]' : 'bg-white/60 border border-[#F0F4F2] hover:bg-white hover:shadow-sm'}`}
                             >
                                <div className="flex flex-col gap-3 w-full">
                                  <div className="flex justify-between items-start w-full">
                                    <span className={`text-[17px] font-bold tracking-tight ${Number(c.balance ?? c.current_balance ?? 0) > 0 ? 'text-[#1A8C66]' : 'text-slate-800'}`}>
                                       {Number(c.balance ?? c.current_balance ?? 0).toLocaleString()} <span className="text-[11px] font-bold text-slate-400">INR</span>
                                    </span>
                                    <div className={`w-8 h-4 rounded-full flex items-center p-0.5 ${isSelected ? 'bg-[#1A8C66] justify-end' : 'bg-slate-200 justify-start'}`}>
                                      <div className="w-3 h-3 bg-white rounded-full"></div>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between w-full pt-2">
                                     <span className="font-bold text-slate-800 text-[14px]">{c.name}</span>
                                     <span className="font-bold text-slate-400 text-xs tracking-widest">{c.phone || "---"}</span>
                                  </div>
                                </div>
                             </button>
                           )
                         })}
                       </div>
                    )}
                  </div>
               </div>
            </div>

          </div>
        </main>
      </div>

      {/* Render Modals */}
      <CustomerModal 
        isOpen={isCustomerModalOpen} 
        onClose={() => setCustomerModalOpen(false)} 
        onSubmit={handleAddCustomer} 
        language={language} 
      />
      <PaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setPaymentModalOpen(false)} 
        onSubmit={handlePayment} 
        customers={customers}
        language={language} 
      />
      <InvoiceModal 
        isOpen={isInvoiceModalOpen} 
        onClose={() => setInvoiceModalOpen(false)} 
        onSubmit={handleInvoice} 
        customers={customers}
        language={language} 
      />

      {/* Invoice Details Modal */}
      {isInvoiceDetailsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in font-sans">
          <div className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl relative border border-slate-100">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <h3 className="font-bold text-xl text-slate-900 tracking-tight">
                {isHi ? "इनवॉइस विवरण" : "Invoice Details"}
              </h3>
              <button 
                onClick={() => {
                  setInvoiceDetailsOpen(false)
                  setSelectedInvoice(null)
                }}
                className="p-2.5 text-slate-400 hover:text-slate-800 bg-[#F4F7F6] hover:bg-slate-200 rounded-full transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            
            <div className="p-8">
              {isLoadingInvoice ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
                  <div className="w-10 h-10 border-[3px] border-[#1A8C66]/30 border-t-[#1A8C66] rounded-full animate-spin"></div>
                  <p className="text-[15px] font-bold tracking-tight">{isHi ? "विवरण लोड हो रहा है..." : "Loading details..."}</p>
                </div>
              ) : selectedInvoice ? (
                <div>
                  <div className="flex justify-between items-start mb-8 pb-8 border-b border-slate-100">
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">{isHi ? "इनवॉइस नंबर" : "Invoice No."}</p>
                      <p className="font-mono font-bold text-slate-800 text-lg bg-[#F4F7F6] px-3.5 py-1.5 -ml-3 rounded-xl inline-block">#{selectedInvoice.invoice.invoice_number}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">{isHi ? "तारीख" : "Date"}</p>
                      <p className="font-bold text-slate-700 text-[16px]">{selectedInvoice.invoice.created_at.split('T')[0]}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4 flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">
                    <span>{isHi ? "आइटम" : "Items"}</span>
                    <span>{isHi ? "कुल" : "Total"}</span>
                  </div>
                  <div className="bg-[#F8FAF9] rounded-2xl overflow-hidden mb-8">
                    <ul className="divide-y divide-[#F0F4F2]">
                      {selectedInvoice.items.map((item, idx) => (
                        <li key={idx} className="p-4 px-5 flex justify-between items-center transition-colors">
                          <div className="flex flex-col gap-1">
                            <span className="font-bold text-slate-800 text-[15px] tracking-tight">{item.item_name}</span>
                            <span className="text-[13px] text-slate-500 font-medium">{item.quantity} x ₹{item.unit_price}</span>
                          </div>
                          <span className="font-bold text-slate-800 text-[16px]">₹{item.line_total}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex justify-between items-center pt-8 border-t-2 border-dashed border-[#F0F4F2] -mx-8 -mb-8 px-8 pb-8">
                    <span className="font-bold text-slate-500 uppercase tracking-widest text-[12px]">{isHi ? "कुल राशि" : "Grand Total"}</span>
                    <span className="text-[32px] font-bold text-[#1A8C66] tracking-tight">₹{selectedInvoice.invoice.total_amount}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 text-[15px] font-bold bg-[#F8FAF9] rounded-3xl border border-dashed border-[#F0F4F2]">
                  {isHi ? "विवरण नहीं मिल सका।" : "Could not load details."}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}