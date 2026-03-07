import { Link } from "react-router-dom"

function CTA({ language = "en" }) {
  const content = {
    en: {
      title: "A small shop can carry big dreams",
      text: "Let Vyapaar Sahayak quietly manage your accounts while you focus on growing your Indian business.",
      button: "Begin your journey",
    },
    hi: {
      title: "एक छोटी दुकान भी बड़े सपने रख सकती है",
      text: "व्यापार सहायक आपके हिसाब संभालेगा ताकि आप अपने भारतीय व्यवसाय को आगे बढ़ा सकें।",
      button: "अपनी शुरुआत करें",
    },
  }
  const data = content[language]

  return (
    <section className="py-24 relative px-6 overflow-hidden bg-white">
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="bg-gradient-to-b from-white to-slate-50/50 rounded-[64px] px-8 py-20 md:py-28 text-center border border-slate-200 relative overflow-hidden group shadow-sm transition-all duration-700 hover:shadow-xl hover:border-brand/20">
          
          {/* Beautiful Abstract Gradients (No Images) */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand/10 rounded-full blur-[120px] -mr-96 -mt-96 pointer-events-none group-hover:bg-brand/15 transition-colors duration-1000" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px] -ml-72 -mb-72 pointer-events-none group-hover:bg-emerald-500/15 transition-colors duration-1000" />
          
          <div className="relative z-10 flex flex-col items-center">
            <h2 className="font-display text-5xl md:text-7xl font-bold mb-8 tracking-tight leading-tight text-slate-900 group-hover:scale-[1.01] transition-transform duration-700">
              {data.title}
            </h2>
            
            <p className="text-xl md:text-2xl text-slate-600 font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
              {data.text}
            </p>
            
            <div className="relative inline-block group/btn">
              <div className="absolute inset-0 bg-brand rounded-2xl blur-lg opacity-40 group-hover/btn:opacity-80 group-hover/btn:blur-xl transition-all duration-500"></div>
              <Link
                to="/login"
                className="relative inline-flex items-center justify-center px-10 py-5 rounded-2xl bg-brand text-white font-bold text-xl hover:bg-brand-dark transition-all duration-300 active:scale-95"
              >
                {data.button}
                <svg className="w-6 h-6 ml-3 transform group-hover/btn:translate-x-1.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CTA