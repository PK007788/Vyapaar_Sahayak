import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useLanguage } from "../context/LanguageContext"
import LanguagePickerModal from "./LanguagePickerModal"

const HEADLINE_MS = 20_000
const FADE_MS = 600
const TYPE_MS = 55

const content = {
  en: {
    title: "Vyapaar Sahayak",
    subtitle:
      "Built with care for Indian shopkeepers who wake before sunrise, open their shutters with hope, and trust every day of hard work to provide for their families.",
    line: "A gentle digital companion that helps you remember every bill, every payment, and every customer promise.",
    start: "Start Free",
    learn: "Learn More",
  },
  hi: {
    title: "व्यापार सहायक",
    subtitle:
      "भारतीय दुकानदारों के लिए बनाया गया एक सच्चा सहायक, जो हर सुबह उम्मीद के साथ दुकान खोलते हैं और अपने परिश्रम से अपने परिवार का भविष्य बनाते हैं।",
    line: "एक ऐसा साथी जो हर बिल, हर भुगतान और हर ग्राहक के भरोसे को संभाल कर रखे।",
    start: "शुरू करें",
    learn: "और जानें",
  },
}

export default function Hero() {
  const navigate = useNavigate()
  const { language, setLanguage, pinned } = useLanguage()
  const [lang, setLang] = useState(language)
  const [typedCount, setTypedCount] = useState(0)
  const [fadeVisible, setFadeVisible] = useState(true)
  const [pickerOpen, setPickerOpen] = useState(false)
  const cycleStartRef = useRef(Date.now())

  useEffect(() => {
    setLang(language)
    setTypedCount(0)
    cycleStartRef.current = Date.now()
  }, [language])

  const title = content[lang].title
  const showCaret = fadeVisible && typedCount < title.length

  useEffect(() => {
    if (!fadeVisible || typedCount >= title.length) return
    const t = setTimeout(() => setTypedCount((c) => c + 1), TYPE_MS)
    return () => clearTimeout(t)
  }, [fadeVisible, typedCount, title.length])

  useEffect(() => {
    if (pinned) return
    if (!fadeVisible || typedCount < title.length) return
    const elapsed = Date.now() - cycleStartRef.current
    const remaining = Math.max(0, HEADLINE_MS - elapsed)
    const t = setTimeout(() => {
      setFadeVisible(false)
      setTimeout(() => {
        setLang((prev) => (prev === "en" ? "hi" : "en"))
        setTypedCount(0)
        cycleStartRef.current = Date.now()
        setFadeVisible(true)
      }, FADE_MS)
    }, remaining)
    return () => clearTimeout(t)
  }, [fadeVisible, typedCount, title.length, pinned])

  const displayedTitle = title.slice(0, typedCount)

  return (
    <section className="relative pt-32 pb-32 md:pt-48 md:pb-56 overflow-hidden min-h-screen flex items-center justify-center">
      {/* Background Image - Premium Cinematic Version */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/hero-bg.png" 
          alt="Premium Indian Market" 
          className="w-full h-full object-cover scale-105"
        />
        {/* Layered Overlays for Depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-cream/20 via-cream/40 to-cream z-10"></div>
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] z-5"></div>
      </div>
      
      <div className="relative z-20 max-w-5xl mx-auto text-center px-6">
        <div className="bg-white/40 backdrop-blur-2xl px-8 py-12 md:px-16 md:py-20 rounded-[48px] border border-white/60 shadow-lift inline-block w-full">
          <h1 className="text-6xl md:text-8xl font-display font-bold text-ink mb-10 tracking-tight leading-[1.1]">
            <span
              className={`inline transition-opacity duration-700 ${fadeVisible ? "opacity-100" : "opacity-0"}`}
            >
              {displayedTitle}
              {showCaret && <span className="animate-caret inline-block w-0.5 h-[0.9em] bg-brand align-middle ml-1" />}
            </span>
          </h1>

          <p className="text-2xl md:text-3xl text-slate-800 leading-relaxed mb-8 font-medium max-w-3xl mx-auto opacity-90">
            {content[lang].subtitle}
          </p>
          <p className="text-xl md:text-2xl text-slate-700 leading-relaxed mb-16 max-w-2xl mx-auto opacity-80">
            {content[lang].line}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="inline-flex items-center justify-center px-10 py-5 rounded-2xl bg-brand text-white font-bold text-xl hover:bg-brand-dark transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 w-full sm:w-auto active:scale-95 shadow-lift"
            >
              {content[lang].start}
            </button>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center px-10 py-5 rounded-2xl bg-white/60 backdrop-blur-md border border-white/80 text-ink font-bold text-xl hover:bg-white/80 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 w-full sm:w-auto active:scale-95 shadow-sm"
            >
              {content[lang].learn}
            </a>
          </div>
        </div>
      </div>

      <LanguagePickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(picked) => {
          setLanguage(picked, { pin: true })
          setPickerOpen(false)
          navigate("/login")
        }}
      />
    </section>
  )
}
