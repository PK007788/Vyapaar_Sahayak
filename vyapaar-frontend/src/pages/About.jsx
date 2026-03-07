import { Link } from "react-router-dom"
import { useLanguage } from "../context/LanguageContext"
import { LedgerHeartIllustration } from "../components/Illustrations"
import Footer from "../components/Footer"

const content = {
  en: {
    title: "From the Creator",
    subtitle: "Why I built Vyapaar Sahayak",
    p1: "Vyapaar Sahayak began as a simple idea while I was learning about how small businesses manage their daily work. Many shopkeepers still rely on notebooks, memory, and informal records to track payments, invoices, and customer balances. While these methods work, they can become difficult to manage as the number of customers and transactions grows.",
    p2: "I built Vyapaar Sahayak as a learning project to explore how technology and artificial intelligence could simplify everyday accounting tasks for small businesses. The goal is to create a system that can record invoices, payments, and customer ledgers with minimal effort, and eventually allow shopkeepers to manage their accounts using natural language and voice commands.",
    p3: "This project is still evolving. My aim is to keep improving it - making it simpler, faster, and more practical for real-world use.",
    sign: "Prajnan Kumar Sarma",
    back: "Back to home",
  },
  hi: {
    title: "निर्माता की ओर से",
    subtitle: "मैंने व्यापार सहायक क्यों बनाया",
    p1: "व्यापार सहायक की शुरुआत एक साधारण विचार से हुई। जब मैं यह समझने की कोशिश कर रहा था कि छोटे व्यवसाय अपनी रोज़मर्रा की हिसाब-किताब कैसे संभालते हैं, तब मैंने देखा कि कई दुकानदार अभी भी नोटबुक, याददाश्त और अनौपचारिक तरीकों पर निर्भर करते हैं। ये तरीके काम तो करते हैं, लेकिन ग्राहकों और लेन-देन की संख्या बढ़ने पर इन्हें संभालना कठिन हो सकता है।",
    p2: "मैंने व्यापार सहायक को एक सीखने वाले प्रोजेक्ट के रूप में बनाया, ताकि यह समझ सकूँ कि तकनीक और कृत्रिम बुद्धिमत्ता छोटे व्यवसायों के रोज़मर्रा के हिसाब-किताब को कैसे सरल बना सकती है। इसका उद्देश्य ऐसा सिस्टम बनाना है जो बिल, भुगतान और ग्राहक लेजर को आसानी से रिकॉर्ड कर सके, और आगे चलकर दुकानदारों को अपनी भाषा में बोलकर भी अपना हिसाब-किताब संभालने की सुविधा दे।",
    p3: "यह प्रोजेक्ट अभी विकसित हो रहा है। मेरा लक्ष्य इसे लगातार बेहतर बनाना है, ताकि यह वास्तविक उपयोग के लिए और भी सरल, तेज़ और उपयोगी बन सके।",
    sign: "Prajnan Kumar Sarma",
    back: "वापस घर",
  },
}

export default function About() {
  const { language } = useLanguage()
  const data = content[language] || content.en

  return (
    <div className="min-h-screen pt-32 pb-40 relative overflow-hidden bg-cream">
      {/* Abstract Background Accents */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand/5 rounded-full blur-[100px] -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[80px] -ml-24 -mb-24" />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div className="bg-white/40 backdrop-blur-2xl rounded-[64px] border border-white/60 p-12 md:p-24 shadow-soft">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            <div className="relative group shrink-0">
              <div className="absolute inset-0 bg-brand rounded-3xl blur-2xl opacity-10 group-hover:opacity-30 transition-opacity" />
              <div className="w-64 h-80 md:w-80 md:h-[440px] rounded-3xl overflow-hidden bg-slate-100 border-8 border-white shadow-2xl transition-all duration-700 hover:scale-[1.02] relative z-10 grayscale hover:grayscale-0">
                <img 
                  src="/images/my photo.jpeg" 
                  alt="Creator" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://ui-avatars.com/api/?name=Creator&background=10B981&color=fff&size=512";
                  }}
                />
              </div>
            </div>
            
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-4 mb-10">
                <div className="w-12 h-[2px] bg-brand/30" />
                <span className="text-brand font-black uppercase tracking-[0.3em] text-xs">
                  {language === "hi" ? "निर्माता की ओर से" : "Word from the Creator"}
                </span>
              </div>
              
              <h2 className="text-3xl md:text-5xl font-display font-bold text-ink mb-8 leading-[1.1] tracking-tight">
                {language === "hi" ? "व्यापारियों के लिए एक सच्ची सोच।" : "A heartfelt solution for modern shopkeepers."}
              </h2>
              
              <div className="space-y-6 text-lg md:text-xl text-slate-600 leading-relaxed mb-12 italic font-medium opacity-90 relative">
                <span className="text-6xl text-brand/10 font-serif absolute -top-8 -left-8 select-none">"</span>
                <p>{data.p1}</p>
                <p>{data.p2}</p>
                <p>{data.p3}</p>
                <span className="text-6xl text-brand/10 font-serif absolute -bottom-10 -right-8 select-none">"</span>
              </div>
              
              <div className="pt-10 border-t border-slate-200/50">
                <div className="font-display font-black text-3xl text-ink tracking-tight mb-2">
                   {language === "hi" ? "Prajnan Kumar Sarma" : "Prajnan Kumar Sarma"}
                </div>
                <div className="text-brand font-bold uppercase tracking-widest text-sm flex items-center justify-center lg:justify-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-brand" />
                  {language === "hi" ? "निर्माता, व्यापार सहायक" : "Creator, Vyapaar Sahayak"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add Footer to About Page */}
      <div className="mt-32">
        <Footer language={language} />
      </div>
    </div>
  )
}
