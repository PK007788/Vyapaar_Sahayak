export default function About({ language = "en" }) {
  const content = {
    en: {
      title: "From the Creator",
      text: "Vyapaar Sahayak began as a simple idea while I was learning about how small businesses manage their daily work. Many shopkeepers still rely on notebooks, memory, and informal records to track payments, invoices, and customer balances. While these methods work, they can become difficult to manage as the number of customers and transactions grows.\n\nI built Vyapaar Sahayak as a learning project to explore how technology and artificial intelligence could simplify everyday accounting tasks for small businesses. The goal is to create a system that can record invoices, payments, and customer ledgers with minimal effort, and eventually allow shopkeepers to manage their accounts using natural language and voice commands.\n\nThis project is still evolving. My aim is to keep improving it - making it simpler, faster, and more practical for real-world use.",
      name: "Prajnan Kumar Sarma",
      role: "Creator, Vyapaar Sahayak",
    },
    hi: {
      title: "निर्माता की ओर से",
      text: "व्यापार सहायक की शुरुआत एक साधारण विचार से हुई। जब मैं यह समझने की कोशिश कर रहा था कि छोटे व्यवसाय अपनी रोज़मर्रा की हिसाब-किताब कैसे संभालते हैं, तब मैंने देखा कि कई दुकानदार अभी भी नोटबुक, याददाश्त और अनौपचारिक तरीकों पर निर्भर करते हैं। ये तरीके काम तो करते हैं, लेकिन ग्राहकों और लेन-देन की संख्या बढ़ने पर इन्हें संभालना कठिन हो सकता है।\n\nमैंने व्यापार सहायक को एक सीखने वाले प्रोजेक्ट के रूप में बनाया, ताकि यह समझ सकूँ कि तकनीक और कृत्रिम बुद्धिमत्ता छोटे व्यवसायों के रोज़मर्रा के हिसाब-किताब को कैसे सरल बना सकती है। इसका उद्देश्य ऐसा सिस्टम बनाना है जो बिल, भुगतान और ग्राहक लेजर को आसानी से रिकॉर्ड कर सके, और आगे चलकर दुकानदारों को अपनी भाषा में बोलकर भी अपना हिसाब-किताब संभालने की सुविधा दे।\n\nयह प्रोजेक्ट अभी विकसित हो रहा है। मेरा लक्ष्य इसे लगातार बेहतर बनाना है, ताकि यह वास्तविक उपयोग के लिए और भी सरल, तेज़ और उपयोगी बन सके।",
      name: "Prajnan Kumar Sarma",
      role: "निर्माता, व्यापार सहायक",
    }
  }

  const data = content[language];

  return (
    <section id="about" className="py-40 relative">
      <div className="max-w-5xl mx-auto px-6">
        <div className="bg-white/50 backdrop-blur-xl rounded-[64px] border border-white/60 p-12 md:p-20 shadow-soft">
          <div className="flex flex-col md:flex-row items-center gap-16 md:gap-24">
            <div className="relative group shrink-0">
              <div className="absolute inset-0 bg-brand rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="w-56 h-72 md:w-80 md:h-[420px] rounded-3xl overflow-hidden bg-slate-100 border-8 border-white shadow-2xl transition-all duration-700 hover:scale-[1.02] relative z-10 grayscale hover:grayscale-0">
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
            
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-8">
                <div className="w-12 h-[2px] bg-brand/30" />
                <span className="text-brand font-black uppercase tracking-[0.2em] text-sm">{data.title}</span>
              </div>
              
              <h2 className="text-3xl md:text-5xl font-display font-bold text-ink mb-10 leading-tight">
                {language === "hi" ? "व्यापारियों के लिए एक सच्ची सोच।" : "A heartfelt solution for modern shopkeepers."}
              </h2>
              
              <div className="text-lg md:text-xl text-slate-600 leading-relaxed mb-12 italic font-medium opacity-90 relative space-y-4">
                <span className="text-6xl text-brand/20 font-serif absolute -top-8 -left-6">"</span>
                {data.text.split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
                <span className="text-6xl text-brand/20 font-serif absolute -bottom-12 -right-6">"</span>
              </div>
              
              <div className="pt-8 border-t border-slate-100">
                <div className="font-display font-black text-3xl text-ink tracking-tight">{data.name}</div>
                <div className="text-brand font-bold mt-2 uppercase tracking-widest text-xs flex items-center justify-center md:justify-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand" />
                  {data.role}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
