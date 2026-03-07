import { useLanguage } from "../context/LanguageContext"

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex items-center gap-1 text-sm bg-white/50 backdrop-blur-md px-2 py-1.5 rounded-xl border border-white/40 shadow-sm">
      <button
        type="button"
        onClick={() => setLanguage("en", { pin: true })}
        className={`px-3 py-1 rounded-lg transition font-medium ${language === "en" ? "bg-brand text-white shadow-sm" : "text-slate-500 hover:text-ink hover:bg-white/60"}`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage("hi", { pin: true })}
        className={`px-3 py-1 rounded-lg transition font-medium ${language === "hi" ? "bg-brand text-white shadow-sm" : "text-slate-500 hover:text-ink hover:bg-white/60"}`}
      >
        हिंदी
      </button>
    </div>
  )
}
