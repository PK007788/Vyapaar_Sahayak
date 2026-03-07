import { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import LanguageToggle from "./LanguageToggle"

export default function Navbar({ language = "en" }) {
  const { isLoggedIn } = useAuth()
  
  // Auto-hide navbar logic
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY
    if (currentScrollY > lastScrollY && currentScrollY > 100) {
      // Scrolling down & past threshold -> hide
      setIsVisible(false)
    } else {
      // Scrolling up -> show
      setIsVisible(true)
    }
    setLastScrollY(currentScrollY)
  }, [lastScrollY])

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/40 shadow-sm transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="flex justify-between items-center max-w-6xl mx-auto px-6 py-5 text-ink">
        <Link to="/" className="font-display text-2xl font-bold text-brand hover:text-brand-dark transition-all flex items-center gap-2">
          <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
            <img src="/images/logo.png" alt="VS" className="w-full h-full object-contain" />
          </div>
          {language === "hi" ? "व्यापार सहायक" : "Vyapaar Sahayak"}
        </Link>

        <div className="flex items-center gap-8 text-sm font-semibold">
          <a href="/#services" className="text-slate-600 hover:text-ink transition uppercase tracking-wider text-[11px] whitespace-nowrap">Features</a>
          <Link to="/about" className="text-slate-600 hover:text-ink transition uppercase tracking-wider text-[11px] whitespace-nowrap">About</Link>
          <a href="/#trust" className="text-slate-600 hover:text-ink transition uppercase tracking-wider text-[11px] whitespace-nowrap">Who it’s for</a>

          {isLoggedIn ? (
            <Link
              to="/app"
              className="text-slate-600 hover:text-ink transition uppercase tracking-wider text-[11px] whitespace-nowrap"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              className="px-6 py-2.5 rounded-xl bg-brand text-white font-bold hover:bg-brand-dark transition-all shadow-lift hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
            >
              Login
            </Link>
          )}

          <div className="border-l border-slate-200 h-5" aria-hidden />

          <LanguageToggle />
        </div>
      </div>
    </nav>
  )
}
