import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react"

const STORAGE_KEY = "vyapaar_lang"
const STORAGE_PIN_KEY = "vyapaar_lang_pinned"

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || "en"
    } catch {
      return "en"
    }
  })
  const [pinned, setPinned] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_PIN_KEY) === "1"
    } catch {
      return false
    }
  })

  const setLanguage = useCallback((lang, { pin = false } = {}) => {
    const next = lang === "hi" ? "hi" : "en"
    setLanguageState(next)
    if (pin) setPinned(true)
    try {
      localStorage.setItem(STORAGE_KEY, next)
      if (pin) localStorage.setItem(STORAGE_PIN_KEY, "1")
    } catch {
      // ignore
    }
  }, [])

  const unpin = useCallback(() => {
    setPinned(false)
    try {
      localStorage.setItem(STORAGE_PIN_KEY, "0")
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, language)
    } catch {
      // ignore
    }
  }, [language])

  const value = useMemo(() => ({ language, setLanguage, pinned, unpin }), [language, setLanguage, pinned, unpin])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider")
  return ctx
}

