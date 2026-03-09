import { useState, useRef, useEffect, useCallback } from "react"
import { useAuth } from "../context/AuthContext"

/**
 * VoiceCommand – Microphone STT + TTS assistant panel for the Dashboard.
 * Uses browser-native Web Speech APIs only (no external services).
 */
export default function VoiceCommand({ language = "hi", onCommandResult }) {
  const { token } = useAuth()
  const isHi = language === "hi"

  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [history, setHistory] = useState([]) // [{userText, response, status}]
  const [supported, setSupported] = useState(true)
  const [isSpeaking, setIsSpeaking] = useState(false)

  const recognitionRef = useRef(null)
  const historyEndRef = useRef(null)

  // Check browser support on mount
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) setSupported(false)
  }, [])

  // Auto-scroll history to bottom
  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [history])

  // ──────────────────────────────────────────
  // Text-to-Speech helper
  // ──────────────────────────────────────────
  function speak(message) {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel() // stop any ongoing speech
    const utterance = new SpeechSynthesisUtterance(message)
    utterance.lang = "hi-IN"
    utterance.rate = 0.95
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }

  // ──────────────────────────────────────────
  // Build spoken response from API result
  // ──────────────────────────────────────────
  function buildSpokenText(result) {
    if (!result) return "Mujhe samajh nahi aaya, kya aap dobara bol sakte hain?"

    const status = result.status

    if (status === "success") {
      return result.message || "Kaam ho gaya!"
    }

    if (status === "clarification_needed") {
      return result.message || "Konse customer ki baat kar rahe ho?"
    }

    if (status === "invoice_step") {
      return result.message || "Aage ki jaankari dijiye."
    }

    if (status === "error") {
      return result.message || "Kuch gadbad ho gayi."
    }

    if (status === "info") {
      return result.message || "Yeh feature jaldi aa raha hai."
    }

    // uncertain or anything else
    return result.message || "Mujhe samajh nahi aaya, kya aap dobara bol sakte hain?"
  }

  // ──────────────────────────────────────────────────────────────
  // normalizeSpeech – converts Devanagari STT output to Hinglish
  // so the NLP model (trained on Roman Hinglish) gets accurate input.
  // Extend this map as needed.
  // ──────────────────────────────────────────────────────────────
  function normalizeSpeech(text) {
    const replacements = [
      // Numbers / currency
      ["रुपए", "rupaye"],
      ["रुपये", "rupaye"],
      ["रूपए", "rupaye"],
      ["रूपये", "rupaye"],
      ["सौ", "sau"],
      ["हजार", "hazaar"],
      ["लाख", "lakh"],
      // Common verbs
      ["दे दिए", "de diye"],
      ["दे दी", "de di"],
      ["दिए", "diye"],
      ["लिख दो", "likh do"],
      ["जोड़ो", "jodo"],
      ["जोड़", "jod"],
      ["हटाओ", "hatao"],
      ["दिखाओ", "dikhao"],
      ["बताओ", "batao"],
      ["करो", "karo"],
      // Directions / prepositions
      ["को", "ko"],
      ["का", "ka"],
      ["की", "ki"],
      ["के", "ke"],
      ["ने", "ne"],
      ["से", "se"],
      ["में", "mein"],
      ["पर", "par"],
      // Credit / debit keywords
      ["उधार", "udhar"],
      ["जमा", "jama"],
      ["बकाया", "bakaya"],
      ["भुगतान", "bhugtaan"],
      ["इनवॉइस", "invoice"],
      ["बिल", "bill"],
      ["ग्राहक", "customer"],
      // Interrogatives
      ["कितना", "kitna"],
      ["क्या", "kya"],
      ["कौन", "kaun"],
      ["कब", "kab"],
      ["कहाँ", "kahan"],
    ]

    let normalized = text
    for (const [hindi, roman] of replacements) {
      normalized = normalized.replaceAll(hindi, roman)
    }
    return normalized
  }

  // ──────────────────────────────────────────
  // Send recognized text to backend
  // ──────────────────────────────────────────
  async function sendCommand(rawText) {
    if (!rawText?.trim()) return
    setIsProcessing(true)

    // Normalize: convert Devanagari → Hinglish before sending
    const text = normalizeSpeech(rawText)

    try {
      const res = await fetch("http://127.0.0.1:8000/ai-command", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ text }),
      })

      if (!res.ok) {
        // Try to extract backend error detail for better debugging
        let detail = `HTTP ${res.status}`
        try {
          const errBody = await res.json()
          detail = errBody?.detail || detail
        } catch (_) { /* ignore parse error */ }
        throw new Error(detail)
      }

      const data = await res.json()
      const result = data.result || {}
      const spokenText = buildSpokenText(result)

      setHistory((prev) => [
        ...prev,
        {
          userText: rawText,   // show original spoken text in history
          normalized: text !== rawText ? text : null,
          response: result.message || spokenText,
          options: result.options || [],
          status: result.status || "uncertain",
          intent: data.intent || "",
        },
      ])

      speak(spokenText)
      onCommandResult?.(data)
    } catch (err) {
      console.error("[VoiceCommand] sendCommand error:", err)
      const errMsg = isHi
        ? `त्रुटि: ${err.message}`
        : `Error: ${err.message}`
      setHistory((prev) => [
        ...prev,
        {
          userText: rawText,
          response: errMsg,
          status: "error",
          intent: "",
          options: [],
        },
      ])
      speak(isHi ? "Kuch gadbad ho gayi. Dobara try karein." : "Something went wrong. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  // ──────────────────────────────────────────
  // Start / stop speech recognition
  // ──────────────────────────────────────────
  function toggleListening() {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      alert("Aapka browser Speech Recognition support nahi karta.")
      return
    }

    const recognition = new SR()
    recognitionRef.current = recognition

    recognition.lang = "hi-IN"
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => {
      setIsListening(true)
      setTranscript("")
    }

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript
      setTranscript(spokenText)
      sendCommand(spokenText)
    }

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  // ──────────────────────────────────────────
  // Text input handler
  // ──────────────────────────────────────────
  const [inputText, setInputText] = useState("")

  const handleTextSubmit = useCallback((e) => {
    e.preventDefault()
    const trimmed = inputText.trim()
    if (!trimmed || isProcessing) return
    setInputText("")
    setTranscript(trimmed)
    sendCommand(trimmed)
  }, [inputText, isProcessing])

  // ──────────────────────────────────────────
  // UI
  // ──────────────────────────────────────────
  if (!supported) {
    return (
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-700 text-sm font-bold">
        {isHi
          ? "आपका ब्राउज़र वॉइस कमांड्स सपोर्ट नहीं करता। Chrome आज़माएं।"
          : "Your browser doesn't support voice commands. Try Chrome."}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* ── Input Row ── */}
      <div className="flex items-center gap-3">
        {/* Text display / interim transcript */}
        <div className="relative flex-1">
          <div className="w-full pl-4 pr-4 py-3.5 bg-[#F4F7F6] border border-transparent focus-within:border-[#1A8C66]/30 rounded-2xl text-sm font-bold text-slate-700 min-h-[52px] flex items-center transition-all">
            {isListening ? (
              <span className="text-[#1A8C66] animate-pulse flex items-center gap-2">
                <span className="w-2 h-2 bg-[#1A8C66] rounded-full animate-ping" />
                {isHi ? "सुन रहा हूँ..." : "Listening..."}
              </span>
            ) : isProcessing ? (
              <span className="text-slate-400 flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-slate-300 border-t-[#1A8C66] rounded-full animate-spin" />
                {isHi ? "प्रोसेस हो रहा है..." : "Processing..."}
              </span>
            ) : transcript ? (
              <span className="text-slate-800">
                <span className="text-slate-400 font-medium mr-1">
                  {isHi ? "आपने कहा:" : "You said:"}
                </span>
                {transcript}
              </span>
            ) : (
              <span className="text-slate-400">
                {isHi
                  ? "माइक बटन दबाएं या नीचे टाइप करें..."
                  : "Click mic or type below..."}
              </span>
            )}
          </div>
        </div>

        {/* Microphone Button */}
        <button
          onClick={toggleListening}
          disabled={isProcessing}
          title={isListening ? (isHi ? "रोकें" : "Stop") : (isHi ? "बोलें" : "Speak")}
          className={`
            relative w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 shadow-md
            ${isListening
              ? "bg-red-500 hover:bg-red-600 shadow-red-200 scale-105"
              : isProcessing
              ? "bg-slate-300 cursor-not-allowed"
              : "bg-[#1A8C66] hover:bg-[#157a58] shadow-[#1A8C66]/30 hover:scale-105 active:scale-95"
            }
          `}
        >
          {/* Pulse ring when listening */}
          {isListening && (
            <span className="absolute inset-0 rounded-2xl ring-4 ring-red-400 animate-ping opacity-40" />
          )}

          {isListening ? (
            // Stop icon
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            // Mic icon
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          )}
        </button>

        {/* TTS speaking indicator */}
        {isSpeaking && (
          <div className="w-10 h-10 rounded-xl bg-[#EEF6F3] flex items-center justify-center shrink-0" title="Speaking...">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A8C66" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
            </svg>
          </div>
        )}
      </div>

      {/* ── Text Input Row ── */}
      <form onSubmit={handleTextSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={isHi ? "यहाँ टाइप करें..." : "Type here..."}
          disabled={isProcessing}
          className="flex-1 pl-4 pr-4 py-3 bg-[#F4F7F6] border border-transparent focus:border-[#1A8C66]/30 focus:outline-none rounded-2xl text-sm font-medium text-slate-700 placeholder-slate-400 transition-all"
        />
        <button
          type="submit"
          disabled={isProcessing || !inputText.trim()}
          className="px-5 py-3 bg-[#1A8C66] text-white text-sm font-bold rounded-2xl hover:bg-[#157a58] disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          {isHi ? "भेजें" : "Send"}
        </button>
      </form>

      {/* ── Command History ── */}
      {history.length > 0 && (
        <div className="bg-[#F8FAF9] rounded-[24px] border border-[#F0F4F2] overflow-hidden">
          <div className="px-5 py-3 border-b border-[#F0F4F2] flex justify-between items-center">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              {isHi ? "वॉइस इतिहास" : "Voice History"}
            </span>
            <button
              onClick={() => setHistory([])}
              className="text-[11px] font-bold text-slate-400 hover:text-red-500 transition-colors"
            >
              {isHi ? "साफ़ करें" : "Clear"}
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto no-scrollbar divide-y divide-[#F0F4F2]">
            {history.map((item, i) => (
              <div key={i} className="px-5 py-4">
                {/* User utterance */}
                <div className="flex items-start gap-2 mb-2">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center mt-0.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </span>
                  <p className="text-[13px] font-medium text-slate-700 leading-snug">{item.userText}</p>
                </div>

                {/* Assistant response */}
                <div className="flex items-start gap-2">
                  <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${
                    item.status === "success" ? "bg-[#EEF6F3]" :
                    item.status === "error" ? "bg-red-50" : "bg-amber-50"
                  }`}>
                    {item.status === "success" ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1A8C66" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    ) : item.status === "error" ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    )}
                  </span>
                  <div>
                    <p className="text-[13px] font-bold text-slate-800 leading-snug">{item.response}</p>
                    {/* Show what was actually sent to the API after normalization */}
                    {item.normalized && (
                      <p className="text-[11px] text-slate-400 font-medium mt-1">
                        → <span className="italic">{item.normalized}</span>
                      </p>
                    )}
                    {item.options?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {item.options.map((opt, j) => (
                          <span
                            key={j}
                            onClick={() => sendCommand(opt)}
                            className="text-[11px] font-bold px-2.5 py-1 bg-white border border-[#1A8C66]/30 text-[#1A8C66] rounded-full cursor-pointer hover:bg-[#EEF6F3] transition-colors"
                          >
                            {opt}
                          </span>
                        ))}
                      </div>
                    )}
                    {item.intent && (
                      <span className="mt-1.5 inline-block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {item.intent.replace(/_/g, " ")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={historyEndRef} />
          </div>
        </div>
      )}
    </div>
  )
}
