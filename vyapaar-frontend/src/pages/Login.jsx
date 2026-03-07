import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { api } from "../lib/api"
import { useLanguage } from "../context/LanguageContext"
import { t } from "../lib/i18n"
import LanguageToggle from "../components/LanguageToggle"

export default function Login() {
  const navigate = useNavigate()
  const { setToken } = useAuth()
  const { language } = useLanguage()
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await api.login(phone, password)

      if (res?.status === "error" || res?.status === "fail") {
        setError(res?.message || "Login failed. Check your credentials.")
        return
      }

      const token = res?.access_token
      if (token) {
        setToken(token)
        navigate("/app", { replace: true })
      } else {
        setError("Invalid response from server.")
      }
    } catch (err) {
      setError(err?.message || "Login failed. Check phone and password.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-cream bg-[url('/dashboard_bg.png')] bg-cover bg-center bg-fixed relative overflow-hidden">
      <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px] pointer-events-none"></div>
      <div className="absolute top-6 right-6 z-20">
        <LanguageToggle />
      </div>
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/70 backdrop-blur-2xl rounded-[32px] shadow-lift border border-white/50 p-8 md:p-12 transition-all duration-500 hover:shadow-2xl">
          <h1 className="font-display text-4xl font-bold text-ink mb-2 tracking-tight">{t(language, "loginTitle")}</h1>
          <p className="text-slate-600 font-medium mb-10 text-lg opacity-80">{t(language, "loginSubtitle")}</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <p className="text-red-600 text-sm bg-red-50 rounded-xl px-4 py-2">{error}</p>
            )}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1.5">
                {t(language, "phone")}
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={language === "hi" ? "10 अंकों का मोबाइल नंबर" : "10-digit mobile number"}
                className="w-full px-5 py-4 rounded-2xl bg-white/50 border border-white/60 focus:bg-white/80 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition-all duration-300 placeholder:text-slate-400 font-medium shadow-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                {t(language, "password")}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl bg-white/50 border border-white/60 focus:bg-white/80 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition-all duration-300 font-medium shadow-sm"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-brand text-white font-bold text-lg hover:bg-brand-dark transition-all duration-300 shadow-lift hover:shadow-2xl hover:-translate-y-0.5 disabled:opacity-60 flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  {t(language, "signingIn")}
                </>
              ) : t(language, "signIn")}
            </button>
          </form>

          <p className="mt-8 text-center text-slate-600 text-sm">
            <Link to="/register" className="text-brand font-medium hover:underline">{t(language, "dontHaveAccount")}</Link>
          </p>
          <p className="mt-3 text-center text-slate-600 text-sm">
            <Link to="/" className="text-slate-500 font-medium hover:underline">{t(language, "backToHome")}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
