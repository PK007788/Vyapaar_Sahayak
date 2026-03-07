import { ServiceIcon } from "./Illustrations"

function Services({ language = "en" }) {

  const content = {

    en: {
      title: "Everything your shop truly needs",
      hint: "Swipe to explore",
      services: [
        {
          title: "Smart Billing",
          text: "Create clean invoices in seconds, with totals you can trust.",
          icon: "billing",
          tag: "Bills"
        },
        {
          title: "Voice Billing",
          text: "Speak the items—your bill and ledger update together.",
          icon: "voice",
          tag: "Voice"
        },
        {
          title: "Customer Ledger",
          text: "Balances stay remembered, even on the busiest days.",
          icon: "ledger",
          tag: "Ledger"
        },
        {
          title: "Payment Tracking",
          text: "See what’s paid, what’s pending, and what needs a gentle nudge.",
          icon: "payments",
          tag: "Payments"
        }
      ]
    },

    hi: {
      title: "आपकी दुकान के लिए ज़रूरी हर सुविधा",
      hint: "और देखें",
      services: [
        {
          title: "स्मार्ट बिलिंग",
          text: "कुछ ही क्षणों में साफ और भरोसेमंद बिल बनाएं।",
          icon: "billing",
          tag: "बिल"
        },
        {
          title: "आवाज़ से बिल बनाना",
          text: "बस बोलिए आपने क्या बेचा—बिल और हिसाब साथ में अपडेट होगा।",
          icon: "voice",
          tag: "आवाज़"
        },
        {
          title: "ग्राहक हिसाब",
          text: "कौन कितना उधार रखता है—यह हमेशा सुरक्षित रहेगा।",
          icon: "ledger",
          tag: "हिसाब"
        },
        {
          title: "भुगतान निगरानी",
          text: "किसने भुगतान किया और किसे याद दिलाना है—सब साफ दिखेगा।",
          icon: "payments",
          tag: "भुगतान"
        }
      ]
    }

  }


  const data = content[language]


  return (

    <section id="services" className="py-32 relative overflow-hidden">
      {/* Subtle User Uploaded Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-50 mix-blend-multiply grayscale-[30%]">
         <img src="/images/Indian%20street%20market%20at%20sunset.jpg" className="w-full h-full object-cover" alt="" />
      </div>
      <div className="absolute inset-0 bg-cream/80 backdrop-blur-sm z-0 pointer-events-none" />
      
      <div className="absolute top-0 left-0 w-full h-full bg-grid opacity-[0.2] pointer-events-none z-0" />
      
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-baseline justify-between gap-6 mb-16">
          <div>
            <h2 className="font-display text-5xl md:text-6xl font-bold text-ink leading-tight">
              {data.title}
            </h2>
            <p className="text-slate-600 mt-4 text-xl font-medium max-w-xl">
              {language === "en" ? "Precision tools built for the everyday rhythm of an Indian shop." : "दुकान की रोज़मर्रा की रफ्तार के लिए खास तौर पर बनाए गए टूल्स।"}
            </p>
          </div>
          <div className="flex items-center gap-3 text-brand font-bold uppercase tracking-widest text-xs bg-brand/10 px-4 py-2 rounded-full border border-brand/20">
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
            <span>{data.hint}</span>
          </div>
        </div>

        <div className="relative">
          <div className="flex gap-8 overflow-x-auto pb-8 pt-4 snap-x snap-mandatory scroll-smooth no-scrollbar">
          {data.services.map((service, index) => (
            <div
              key={index}
              className="min-w-[340px] snap-center bg-white/60 backdrop-blur-2xl p-10 rounded-[40px] shadow-soft hover:shadow-lift hover:-translate-y-2 transition-all duration-500 border border-white/80 group relative overflow-hidden"
            >
              <div className="absolute inset-0 opacity-[0.4] noise group-hover:opacity-[0.6] transition-opacity" />
              <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-brand/5 group-hover:bg-brand/10 transition-colors duration-500" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-brand text-white flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform duration-500">
                    <ServiceIcon kind={service.icon} className="w-7 h-7" />
                  </div>
                  <span className="text-xs px-4 py-1.5 rounded-full bg-ink text-white font-bold tracking-wider uppercase">
                    {service.tag}
                  </span>
                </div>

                <h3 className="text-2xl font-bold mb-4 text-ink font-display">
                  {service.title}
                </h3>

                <p className="text-slate-600 leading-relaxed text-lg font-medium opacity-80">
                  {service.text}
                </p>
              </div>
            </div>
          ))}
        </div>
        </div>

      </div>

    </section>

  )
}

export default Services