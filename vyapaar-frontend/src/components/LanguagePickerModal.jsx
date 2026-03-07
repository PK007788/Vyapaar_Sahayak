import { useEffect } from "react"

export default function LanguagePickerModal({ open, onClose, onPick }) {
  useEffect(() => {
    if (!open) return
    function onKeyDown(e) {
      if (e.key === "Escape") onClose?.()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-lift p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-600">Before we start</p>
            <h3 className="font-display text-xl font-semibold text-ink mt-1">Choose your language</h3>
            <p className="text-sm text-slate-600 mt-2">
              You can change it later, but we’ll keep it consistent for you.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-ink transition"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 grid gap-3">
          <button
            type="button"
            onClick={() => onPick?.("en")}
            className="w-full text-left px-5 py-4 rounded-2xl border border-slate-200 hover:border-brand hover:bg-brand/5 transition"
          >
            <p className="font-medium text-ink">English</p>
            <p className="text-sm text-slate-600 mt-0.5">For Indian shopkeepers</p>
          </button>

          <button
            type="button"
            onClick={() => onPick?.("hi")}
            className="w-full text-left px-5 py-4 rounded-2xl border border-slate-200 hover:border-brand hover:bg-brand/5 transition"
          >
            <p className="font-medium text-ink">हिंदी</p>
            <p className="text-sm text-slate-600 mt-0.5">भारतीय दुकानदारों के लिए</p>
          </button>
        </div>
      </div>
    </div>
  )
}

