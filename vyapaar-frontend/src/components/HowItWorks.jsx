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
    <section className="py-24 bg-white" id="how-it-works">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-ink mb-4">{data.title}</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">{data.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Steps List */}
          <div className="space-y-8">
            {data.steps.map((step, index) => (
              <div 
                key={index}
                className={`flex gap-6 p-6 rounded-2xl transition-all duration-300 cursor-pointer ${activeStep === index ? 'bg-brand/5 border border-brand/20 shadow-sm' : 'hover:bg-slate-50 border border-transparent'}`}
                onClick={() => setActiveStep(index)}
              >
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-colors ${activeStep === index ? 'bg-brand text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}>
                  {index + 1}
                </div>
                <div>
                  <h3 className={`text-xl font-semibold mb-2 transition-colors ${activeStep === index ? 'text-brand-dark' : 'text-slate-800'}`}>
                    {step.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Visual Showcase */}
          <div className="relative h-[400px] bg-slate-50 rounded-3xl border border-slate-100 p-8 shadow-inner overflow-hidden flex items-center justify-center">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-grid opacity-50" />
            
            {/* Step 1 Visual */}
            <div className={`absolute w-full px-8 transition-all duration-700 ease-in-out ${activeStep === 0 ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-95 translate-x-8 -z-10'}`}>
              <div className="bg-white rounded-xl shadow-soft p-4 border border-slate-200">
                <div className="flex items-center gap-3 text-slate-500 mb-3 border-b border-slate-100 pb-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>
                  </svg>
                  <span className="text-sm font-medium">Command Input</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-5 bg-brand animate-pulse" />
                  <span className="text-lg font-medium text-ink">Amit ka 500 ka bill bana do</span>
                </div>
              </div>
            </div>

            {/* Step 2 Visual */}
            <div className={`absolute w-full px-8 transition-all duration-700 ease-in-out ${activeStep === 1 ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-95 translate-x-8 -z-10'}`}>
              <div className="bg-white rounded-xl shadow-soft p-5 border border-slate-200 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
                    </svg>
                  </div>
                  <div className="text-sm font-medium text-ink">Intent Parsed Successfully</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-medium uppercase mb-1">Customer</div>
                    <div className="font-semibold text-brand-dark">Amit Traders</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-medium uppercase mb-1">Amount</div>
                    <div className="font-semibold text-brand-dark">₹500.00</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 Visual */}
            <div className={`absolute w-full px-8 transition-all duration-700 ease-in-out ${activeStep === 2 ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-95 translate-x-8 -z-10'}`}>
              <div className="bg-white rounded-xl shadow-soft p-1 border border-slate-200">
                 <div className="bg-brand text-white p-4 rounded-t-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">Invoice #INV-204</span>
                      <span className="text-xs bg-white/20 px-2 py-1 rounded">Paid</span>
                    </div>
                    <div className="text-2xl font-bold">₹500.00</div>
                 </div>
                 <div className="p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Bill to:</span>
                      <span className="font-medium text-ink">Amit Traders</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Date:</span>
                      <span className="font-medium text-ink">Today, 10:45 AM</span>
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
