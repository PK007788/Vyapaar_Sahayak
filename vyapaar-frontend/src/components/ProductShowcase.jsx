import React from 'react';

export default function ProductShowcase({ language = "en" }) {
  const content = {
    en: {
      title: "Everything you need, in one beautiful dashboard",
      subtitle: "See your daily progress, manage customers, and generate invoices with minimal typing.",
      feature1: "Real-time ledger updates",
      feature2: "Effortless invoicing",
      feature3: "Instant payment records"
    },
    hi: {
      title: "आपकी ज़रूरत की हर चीज़, एक सुंदर डैशबोर्ड में",
      subtitle: "अपनी दैनिक प्रगति देखें, ग्राहकों को प्रबंधित करें, और बिना ज़्यादा टाइप किए बिल बनाएँ।",
      feature1: "रियल-टाइम लेजर अपडेट",
      feature2: "आसान बिलिंग",
      feature3: "तुरंत भुगतान रिकॉर्ड"
    }
  };

  const data = content[language];

  return (
    <section className="py-24 bg-cream relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
      
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16 relative z-10">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-ink mb-6 max-w-3xl mx-auto leading-tight">
            {data.title}
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {data.subtitle}
          </p>
        </div>

        <div className="relative mx-auto max-w-5xl">
          {/* Main Mockup container */}
          <div className="relative rounded-2xl bg-white p-2 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-200 z-10 transform transition-transform duration-500 hover:scale-[1.01]">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white rounded-xl shadow-inner pointer-events-none"></div>
            
            {/* Window controls */}
            <div className="relative flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50/80 rounded-t-xl">
              <div className="w-3 h-3 rounded-full bg-slate-300"></div>
              <div className="w-3 h-3 rounded-full bg-slate-300"></div>
              <div className="w-3 h-3 rounded-full bg-slate-300"></div>
              <div className="mx-auto text-xs font-medium text-slate-400 bg-white px-3 py-1 rounded-md shadow-sm border border-slate-100">app.vyapaarsahayak.com</div>
            </div>

            {/* Dashboard Content Mock */}
            <div className="relative bg-cream/50 p-6 md:p-8 rounded-b-xl">
              {/* Command Bar */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 mb-8 flex items-center gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-brand" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>
                </svg>
                <div className="text-slate-400 text-sm font-medium">Try "Record a 500rs payment from Rahul"</div>
                <div className="ml-auto flex gap-2">
                  <div className="px-2 py-1 bg-slate-100 rounded text-[10px] font-medium text-slate-500">⌘ K</div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Today's Collection", value: "₹8,450", trend: "+12%" },
                  { label: "Outstanding", value: "₹42,100", trend: "-5%" },
                  { label: "Active Customers", value: "284", trend: "+3" },
                  { label: "Invoices Generated", value: "45", trend: "" }
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <div className="text-xs text-slate-500 font-medium mb-1">{stat.label}</div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-xl font-bold text-ink">{stat.value}</div>
                      {stat.trend && <div className={`text-[10px] font-bold ${stat.trend.startsWith('+') ? 'text-brand' : 'text-slate-400'}`}>{stat.trend}</div>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions & Recent */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                   <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                     <div className="font-semibold text-ink">Recent Transactions</div>
                     <div className="text-xs font-medium text-brand cursor-pointer">View All</div>
                   </div>
                   <div className="divide-y divide-slate-50">
                     {[
                       { name: "Suresh Provision Store", time: "10:45 AM", type: "Payment Received", amount: "+₹1,200", status: "Completed" },
                       { name: "Rahul General Store", time: "09:30 AM", type: "Invoice Created", amount: "₹450", status: "Pending" },
                       { name: "Amit Traders", time: "Yesterday", type: "Payment Received", amount: "+₹5,500", status: "Completed" },
                     ].map((item, i) => (
                       <div key={i} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer">
                         <div className="flex items-center gap-3">
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${item.type === 'Invoice Created' ? 'bg-amber-50 text-amber-600' : 'bg-brand/10 text-brand'}`}>
                             {item.name[0]}
                           </div>
                           <div>
                             <div className="text-sm font-medium text-ink">{item.name}</div>
                             <div className="text-xs text-slate-500">{item.type} • {item.time}</div>
                           </div>
                         </div>
                         <div className="text-right">
                           <div className={`text-sm font-semibold ${item.amount.startsWith('+') ? 'text-brand' : 'text-ink'}`}>{item.amount}</div>
                           <div className="text-[10px] font-medium text-slate-400">{item.status}</div>
                         </div>
                       </div>
                     ))}
                   </div>
                </div>

                <div className="space-y-4">
                   <button className="w-full bg-brand hover:bg-brand-dark text-white font-medium py-3 rounded-xl shadow-sm transition-colors flex justify-center items-center gap-2">
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                     Create Invoice
                   </button>
                   <button className="w-full bg-white border border-slate-200 hover:border-brand hover:text-brand text-ink font-medium py-3 rounded-xl shadow-sm transition-colors flex justify-center items-center gap-2">
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
                     Record Payment
                   </button>
                   <button className="w-full bg-white border border-slate-200 hover:border-brand hover:text-brand text-ink font-medium py-3 rounded-xl shadow-sm transition-colors flex justify-center items-center gap-2">
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
                     Add Customer
                   </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative background blur */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[80%] bg-gradient-to-r from-brand/5 via-blue-50/20 to-brand/5 blur-3xl rounded-full -z-10"></div>
        </div>

        {/* Feature tags below mockup */}
        <div className="flex flex-wrap justify-center gap-4 mt-12 relative z-10">
          {[data.feature1, data.feature2, data.feature3].map((feature, i) => (
            <div key={i} className="bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100 flex items-center gap-2 text-sm font-medium text-slate-600">
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
               {feature}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
