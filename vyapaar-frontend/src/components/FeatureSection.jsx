function FeatureSection({ language = "en" }) {
  const content = {
    en: {
      title: "Built for trust, designed for ease",
      subtitle: "Running a shop is about relationships and years of hard work. We quiet the numbers so you can focus on the people.",
      features: [
        {
          title: "Your Digital Bahi-Khata",
          desc: "Never lose a ledger again. Everything is safely backed up to the cloud and available exactly when you need it.",
          icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
            </svg>
          )
        },
        {
          title: "Zero Typing Needed",
          desc: "Just converse naturally. Whether you use English or Hindi, the system understands your business terminology.",
          icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>
            </svg>
          )
        },
        {
          title: "Transparent Statements",
          desc: "Generate and share clear, professional statements with your customers in seconds via WhatsApp.",
          icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
            </svg>
          )
        }
      ]
    },
    hi: {
      title: "भरोसे के लिए बना, आसानी के लिए डिज़ाइन किया गया",
      subtitle: "दुकान चलाना रिश्तों और वर्षों की मेहनत की कहानी है। हम हिसाब चुपचाप संभालते हैं ताकि आप ग्राहकों पर ध्यान दे सकें।",
      features: [
        {
          title: "आपका डिजिटल बही-खाता",
          desc: "अब कोई लेजर नहीं खोएगा। सब कुछ क्लाउड पर सुरक्षित है और जरूरत पड़ने पर तुरंत उपलब्ध है।",
          icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
            </svg>
          )
        },
        {
          title: "टाइपिंग की जरूरत नहीं",
          desc: "बस स्वाभाविक रूप से बात करें। चाहे आप अंग्रेजी या हिंदी का उपयोग करें, सिस्टम आपकी व्यावसायिक शब्दावली को समझता है।",
          icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>
            </svg>
          )
        },
        {
          title: "पारदर्शी स्टेटमेंट",
          desc: "व्हाट्सएप के माध्यम से सेकंडों में अपने ग्राहकों के साथ स्पष्ट, पेशेवर स्टेटमेंट जेनरेट और शेयर करें।",
          icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
            </svg>
          )
        }
      ]
    }
  };

  const data = content[language];

  return (
    <section className="py-32 relative overflow-hidden bg-white">
      {/* Subtle User Uploaded Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-50 mix-blend-luminosity">
         <img src="/images/A%20Quaint%20Village%20Market.jpg" className="w-full h-full object-cover" alt="" />
      </div>
      <div className="absolute inset-0 bg-white/90 backdrop-blur-[2px] z-0 pointer-events-none" />

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand/5 rounded-full blur-[120px] -mr-96 -mt-96 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] -ml-72 -mb-72" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-24 items-center">
          <div className="flex-1">
            <div className="inline-block px-4 py-1.5 rounded-full bg-brand/10 border border-brand/20 text-brand font-black text-[10px] uppercase tracking-[0.2em] mb-8">
              Reliability & Security
            </div>
            
            <h2 className="text-5xl md:text-7xl font-display font-bold text-ink mb-10 leading-[0.9] tracking-tight">
              {data.title.split(',')[0]}<span className="text-brand">, {data.title.split(',')[1]}</span>
            </h2>
            
            <p className="text-xl md:text-2xl text-slate-600 mb-16 leading-relaxed max-w-xl font-medium opacity-80">
              {data.subtitle}
            </p>
            
            <div className="space-y-12">
              {data.features.map((feature, i) => (
                <div key={i} className="flex gap-6 group">
                  <div className="flex-shrink-0 w-16 h-16 rounded-[22px] bg-white shadow-lift border border-slate-100 text-brand flex items-center justify-center group-hover:bg-brand group-hover:text-white group-hover:shadow-2xl hover:-rotate-6 transition-all duration-500 transform">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-ink mb-3 font-display">{feature.title}</h3>
                    <p className="text-lg text-slate-600 leading-relaxed max-w-md font-medium opacity-70">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex-1 relative w-full flex justify-center mt-20 lg:mt-0">
             <div className="relative w-full max-w-lg">
                <div className="absolute inset-0 bg-brand/10 rounded-full opacity-30 blur-3xl transform scale-125"></div>
                
                <div className="relative bg-white/40 backdrop-blur-2xl p-10 rounded-[64px] shadow-2xl border border-white/60 overflow-hidden transform hover:scale-[1.02] transition-all duration-700">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <svg width="200" height="200" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" stroke="currentColor" fill="none" strokeWidth="1" /></svg>
                  </div>

                  <div className="space-y-6 relative z-10">
                     <div className="flex items-center justify-between mb-10">
                        <div className="h-4 w-24 bg-slate-900/10 rounded-full" />
                        <div className="w-3 h-3 rounded-full bg-brand" />
                     </div>

                     <div className="h-20 bg-white/80 rounded-3xl border border-white flex items-center px-6 gap-5 shadow-sm transform hover:-translate-x-2 transition-transform">
                       <div className="w-12 h-12 rounded-full bg-brand text-white flex items-center justify-center font-black text-xl shadow-lg">R</div>
                       <div className="flex-1">
                         <div className="h-5 w-32 bg-slate-200 rounded-full mb-2"></div>
                         <div className="h-3 w-20 bg-slate-100 rounded-full"></div>
                       </div>
                       <div className="font-display font-black text-brand">₹5,200</div>
                     </div>

                     <div className="h-20 bg-white/80 rounded-3xl border border-white flex items-center px-6 gap-5 shadow-sm transform hover:translate-x-2 transition-transform scale-105 shadow-xl">
                       <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-black text-xl shadow-lg">S</div>
                       <div className="flex-1">
                         <div className="h-5 w-48 bg-slate-200 rounded-full mb-2"></div>
                         <div className="h-3 w-28 bg-slate-100 rounded-full"></div>
                       </div>
                       <div className="font-display font-black text-blue-500">PAID</div>
                     </div>

                     <div className="h-20 bg-white/40 rounded-3xl border border-white/50 flex items-center px-6 gap-5 opacity-40">
                       <div className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center font-black text-xl">A</div>
                       <div className="flex-1">
                         <div className="h-5 w-24 bg-slate-200 rounded-full mb-2"></div>
                         <div className="h-3 w-16 bg-slate-100 rounded-full"></div>
                       </div>
                       <div className="font-display font-black text-slate-400">₹850</div>
                     </div>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FeatureSection