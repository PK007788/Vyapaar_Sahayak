import { useEffect, useState } from "react";

export default function HowItWorks({ language = "en" }) {
  const [activeStep, setActiveStep] = useState(0);

  const content = {
    en: {
      title: "How Vyapaar Sahayak Works",
      subtitle: "Three simple steps to manage your business effortlessly.",
      steps: [
        {
          title: "1. Speak or Type",
          description: "Just say or type your command like 'Amit ka 500 ka bill bana do'. No complex forms.",
        },
        {
          title: "2. Intelligent Understanding",
          description: "Our AI understands your request and automatically identifies the customer and transaction.",
        },
        {
          title: "3. Auto-Updated Ledger",
          description: "The invoice is created and the ledger is updated instantly. You're done!",
        },
      ]
    },
    hi: {
      title: "व्यापार सहायक कैसे काम करता है",
      subtitle: "अपने व्यवसाय को आसानी से प्रबंधित करने के लिए तीन सरल कदम।",
      steps: [
        {
          title: "1. बोलें या लिखें",
          description: "बस बोलें या टाइप करें जैसे 'अमित का 500 का बिल बना दो'। कोई जटिल फॉर्म नहीं।",
        },
        {
          title: "2. समझदार AI",
          description: "हमारा AI आपके अनुरोध को समझता है और ग्राहक और लेन-देन की पहचान करता है।",
        },
        {
          title: "3. ऑटो-अपडेटेड लेजर",
          description: "बिल बन जाता है और लेजर तुरंत अपडेट हो जाता है। आपका काम हो गया!",
        },
      ]
    }
  };

  const data = content[language];

  // Auto-advance steps
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative -mt-16 md:-mt-24 pt-20 md:pt-24 pb-28 md:pb-32 bg-[#F8FBFA] overflow-hidden" id="how-it-works">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-24 md:h-32 bg-gradient-to-b from-[#F8FBFA] to-transparent z-10" />
        <img
          src="/images/Mandala Background With Gradient Colour, Png, Mandala, Wedding Background Image And Wallpaper for Free Download.jpg"
          alt=""
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-white/70" />
        <div className="absolute bottom-0 left-0 right-0 h-24 md:h-32 bg-gradient-to-b from-transparent to-[#F8FBFA] z-10" />
        <div className="absolute -top-40 -left-16 w-80 h-80 rounded-full bg-brand/10 blur-3xl" />
        <div className="absolute -bottom-32 right-0 w-96 h-96 rounded-full bg-sky-100/80 blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16 md:mb-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-white/80 px-4 py-1.5 text-[11px] font-bold tracking-[0.16em] uppercase text-brand mb-6">
            <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
            Workflow
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-ink mb-4 tracking-tight">{data.title}</h2>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">{data.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-stretch">
          {/* Steps List */}
          <div className="space-y-5">
            {data.steps.map((step, index) => (
              <div
                key={index}
                className={`group flex gap-5 p-6 rounded-[28px] border transition-all duration-300 cursor-pointer ${activeStep === index ? "bg-white shadow-lift border-brand/30 -translate-y-0.5" : "bg-white/70 border-slate-200/70 hover:bg-white hover:border-slate-300"}`}
                onClick={() => setActiveStep(index)}
              >
                <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center font-display font-bold text-lg transition-colors ${activeStep === index ? "bg-brand text-white shadow-md" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"}`}>
                  {index + 1}
                </div>
                <div>
                  <h3 className={`text-2xl font-display font-bold mb-2 transition-colors ${activeStep === index ? "text-brand-dark" : "text-slate-800"}`}>
                    {step.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-lg">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Visual Showcase */}
          <div className="relative min-h-[430px] bg-gradient-to-b from-white to-[#F2F7F5] rounded-[36px] border border-white/80 p-8 md:p-10 shadow-lift overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-grid opacity-35" />
            <div className="absolute -top-24 right-10 w-48 h-48 rounded-full bg-brand/10 blur-3xl" />

            {/* Step 1 Visual */}
            <div className={`absolute w-full px-6 md:px-8 transition-all duration-700 ease-in-out ${activeStep === 0 ? "opacity-100 scale-100 translate-x-0" : "opacity-0 scale-95 translate-x-8 -z-10"}`}>
              <div className="bg-white rounded-2xl shadow-soft p-5 border border-slate-200/80">
                <div className="flex items-center gap-3 text-slate-500 mb-4 border-b border-slate-100 pb-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>
                  </svg>
                  <span className="text-sm font-bold tracking-wide uppercase">Command Input</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-6 rounded-full bg-brand animate-pulse" />
                  <span className="text-xl font-semibold text-ink">Amit ka 500 ka bill bana do</span>
                </div>
              </div>
            </div>

            {/* Step 2 Visual */}
            <div className={`absolute w-full px-6 md:px-8 transition-all duration-700 ease-in-out ${activeStep === 1 ? "opacity-100 scale-100 translate-x-0" : "opacity-0 scale-95 translate-x-8 -z-10"}`}>
              <div className="bg-white rounded-2xl shadow-soft p-6 border border-slate-200/80 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
                    </svg>
                  </div>
                  <div className="text-sm font-bold uppercase tracking-wide text-slate-700">Intent Parsed Successfully</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-[#F4FAF7] rounded-xl border border-brand/10">
                    <div className="text-[10px] text-slate-500 font-bold uppercase mb-1 tracking-wide">Customer</div>
                    <div className="font-semibold text-brand-dark">Amit Traders</div>
                  </div>
                  <div className="p-3 bg-[#F4FAF7] rounded-xl border border-brand/10">
                    <div className="text-[10px] text-slate-500 font-bold uppercase mb-1 tracking-wide">Amount</div>
                    <div className="font-semibold text-brand-dark">₹500.00</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 Visual */}
            <div className={`absolute w-full px-6 md:px-8 transition-all duration-700 ease-in-out ${activeStep === 2 ? "opacity-100 scale-100 translate-x-0" : "opacity-0 scale-95 translate-x-8 -z-10"}`}>
              <div className="bg-white rounded-2xl shadow-soft p-1 border border-slate-200/80 overflow-hidden">
                 <div className="bg-gradient-to-r from-[#168E67] to-brand text-white p-5 rounded-t-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold tracking-wide">Invoice #INV-204</span>
                      <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-semibold uppercase tracking-wide">Paid</span>
                    </div>
                    <div className="text-3xl font-bold">₹500.00</div>
                 </div>
                 <div className="p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Bill to:</span>
                      <span className="font-semibold text-ink">Amit Traders</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Date:</span>
                      <span className="font-semibold text-ink">Today, 10:45 AM</span>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
 // you can change the background image by updating the `src` attribute of the `<img>` tag within the `HowItWorks` component. Currently, it is set to `"/images/howitworks.jpg"`. You can replace this path with the path to your desired background image. For example: `"/images/custom-howitworks-bg.jpg"`. Make sure the new image is placed in the correct directory (e.g., `public/images/`) so that it can be accessed properly.