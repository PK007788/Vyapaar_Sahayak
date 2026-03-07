function TrustBar({ language = "en" }) {
  const icons = {
    Retail: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
    Kirana: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg>,
    Wholesalers: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    Pharmacies: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M2 12h20"/></svg>,
    Hardware: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
  }

  const content = {
    en: {
      title: "Trusted by thousands of Indian businesses",
      description: "Join the community of forward-thinking shopkeepers.",
      items: [
        { label: "Retail Stores", iconKey: "Retail" },
        { label: "Kirana Shops", iconKey: "Kirana" },
        { label: "Wholesalers", iconKey: "Wholesalers" },
        { label: "Pharmacies", iconKey: "Pharmacies" },
        { label: "Hardware", iconKey: "Hardware" }
      ],
    },
    hi: {
      title: "हज़ारों भारतीय व्यवसायों द्वारा भरोसेमंद",
      description: "प्रगतिशील दुकानदारों के समुदाय में शामिल हों।",
      items: [
        { label: "रिटेल स्टोर", iconKey: "Retail" },
        { label: "किराना दुकान", iconKey: "Kirana" },
        { label: "थोक व्यापारी", iconKey: "Wholesalers" },
        { label: "मेडिकल स्टोर", iconKey: "Pharmacies" },
        { label: "हार्डवेयर", iconKey: "Hardware" }
      ],
    },
  }
  
  const data = content[language]

  return (
    <section id="trust" className="py-32 relative">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20 max-w-2xl mx-auto">
           <h2 className="text-4xl md:text-5xl font-display font-bold text-ink mb-6 tracking-tight leading-tight">{data.title}</h2>
           <p className="text-xl text-slate-600 font-medium opacity-80">{data.description}</p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-6 md:gap-10">
          {data.items.map((item, index) => (
            <div 
              key={index}
              className="flex items-center gap-5 px-8 py-5 rounded-[32px] bg-white/40 backdrop-blur-xl border border-white/60 shadow-soft hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-default group"
            >
              <div className="p-3 bg-brand text-white rounded-2xl shadow-lg transform group-hover:scale-110 transition-transform duration-500">
                 {icons[item.iconKey]}
              </div>
              <span className="font-bold text-xl text-ink font-display">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TrustBar