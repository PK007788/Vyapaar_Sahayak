import { useState, useRef, useEffect, useCallback } from "react"
import { useAuth } from "../context/AuthContext"

/**
 * VoiceCommand – Hands-free conversational voice assistant panel.
 *
 * Features:
 *   • Auto-listen loop: after TTS response, mic restarts automatically
 *   • Beep sound: plays a short beep when recording starts
 *   • Silence handling: 10s → reminder, 5s → finalize invoice
 *   • Manual toggle: mic button still works for start/stop
 *   • Text input: fallback for noisy environments
 */
export default function VoiceCommand({ language = "hi", onCommandResult }) {
  const { token } = useAuth()
  const isHi = language === "hi"

  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [history, setHistory] = useState([])
  const [supported, setSupported] = useState(true)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [conversationActive, setConversationActive] = useState(false)

  const recognitionRef = useRef(null)
  const historyEndRef = useRef(null)
  const silenceTimerRef = useRef(null)
  const reminderTimerRef = useRef(null)
  const shouldAutoListenRef = useRef(false)
  const audioContextRef = useRef(null)
  const debounceTimerRef = useRef(null) // NEW: for patient listening

  // Check browser support on mount
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) setSupported(false)
  }, [])

  // Auto-scroll history to bottom
  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [history])

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      clearSilenceTimers()
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
      recognitionRef.current?.abort()
    }
  }, [])

  // ──────────────────────────────────────────
  // Beep sound using Web Audio API
  // ──────────────────────────────────────────
  function playBeep() {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
      }
      const ctx = audioContextRef.current

      // Short 880Hz sine beep, 120ms duration
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.type = "sine"
      oscillator.frequency.setValueAtTime(880, ctx.currentTime)

      // Quick fade in/out for a clean beep
      gainNode.gain.setValueAtTime(0, ctx.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01)
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.12)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.12)
    } catch (err) {
      console.warn("[VoiceCommand] Beep failed:", err)
    }
  }

  // ──────────────────────────────────────────
  // Silence timer management
  // ──────────────────────────────────────────
  function clearSilenceTimers() {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }
    if (reminderTimerRef.current) {
      clearTimeout(reminderTimerRef.current)
      reminderTimerRef.current = null
    }
  }

  function startSilenceTimers() {
    clearSilenceTimers()

    // 10 seconds → send reminder
    silenceTimerRef.current = setTimeout(() => {
      console.log("[VoiceCommand] 10s silence → sending reminder")
      sendSilenceTimeout()

      // 5 more seconds → finalize
      reminderTimerRef.current = setTimeout(() => {
        console.log("[VoiceCommand] 5s after reminder → finalizing")
        sendSilenceTimeout()
      }, 5000)
    }, 10000)
  }

  async function sendSilenceTimeout() {
    try {
      const res = await fetch("http://127.0.0.1:8000/ai-command/silence-timeout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

      if (!res.ok) return

      const data = await res.json()
      const responseMsg = data.response || ""

      if (responseMsg) {
        setHistory((prev) => [
          ...prev,
          {
            userText: "⏳ (silence)",
            response: responseMsg,
            status: data.status || "info",
            intent: "",
            options: [],
            continue_listening: data.continue_listening ?? false,
          },
        ])
        speak(responseMsg, data.continue_listening ?? false)
      }

      if (!data.continue_listening) {
        // Conversation ended (invoice finalized)
        setConversationActive(false)
        shouldAutoListenRef.current = false
        clearSilenceTimers()
        stopListening()
      }
    } catch (err) {
      console.error("[VoiceCommand] Silence timeout error:", err)
    }
  }

  // ──────────────────────────────────────────
  // Text-to-Speech with auto-listen callback
  // ──────────────────────────────────────────
  function speak(message, continueListening = false) {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(message)
    utterance.lang = "hi-IN"
    utterance.rate = 0.95

    utterance.onstart = () => {
      setIsSpeaking(true)
      // Stop listening while TTS is speaking to avoid feedback
      stopListening()
      clearSilenceTimers()
    }

    utterance.onend = () => {
      setIsSpeaking(false)

      // Auto-restart listening if conversation is ongoing
      if (continueListening || shouldAutoListenRef.current) {
        shouldAutoListenRef.current = true
        setConversationActive(true)
        // Small delay so TTS audio fully stops before mic opens
        setTimeout(() => {
          startListening()
        }, 300)
      }
    }

    utterance.onerror = () => {
      setIsSpeaking(false)
    }

    window.speechSynthesis.speak(utterance)
  }

  // ──────────────────────────────────────────
  // Build spoken response from API result
  // ──────────────────────────────────────────
  function buildSpokenText(result) {
    if (!result) return "Mujhe samajh nahi aaya, kya aap dobara bol sakte hain?"

    const msg = result.response || result.message
    const status = result.status

    if (status === "success") return msg || "Kaam ho gaya!"
    if (status === "clarification_needed") return msg || "Konse customer ki baat kar rahe ho?"
    if (status === "invoice_step" || status === "silence_warning") return msg || "Aage ki jaankari dijiye."
    if (status === "error") return msg || "Kuch gadbad ho gayi."
    if (status === "info") return msg || "Yeh feature jaldi aa raha hai."

    return msg || "Mujhe samajh nahi aaya, kya aap dobara bol sakte hain?"
  }

  // ──────────────────────────────────────────
  // Normalize Devanagari → Hinglish
  // ──────────────────────────────────────────
  function normalizeSpeech(text) {
    const replacements = [
      // Numbers / currency
      ["रुपए", "rupaye"], ["रुपये", "rupaye"], ["रूपए", "rupaye"], ["रूपये", "rupaye"],
      ["सौ", "sau"], ["हजार", "hazaar"], ["लाख", "lakh"],
      // Common verbs
      ["दे दिए", "de diye"], ["दे दी", "de di"], ["दिए", "diye"],
      ["लिख दो", "likh do"], ["जोड़ो", "jodo"], ["जोड़", "jod"],
      ["हटाओ", "hatao"], ["दिखाओ", "dikhao"], ["बताओ", "batao"], ["करो", "karo"],
      // Directions / prepositions
      ["को", "ko"], ["का", "ka"], ["की", "ki"], ["के", "ke"],
      ["ने", "ne"], ["से", "se"], ["में", "mein"], ["पर", "par"],
      // Credit / debit keywords
      ["उधार", "udhar"], ["जमा", "jama"], ["बकाया", "bakaya"],
      ["भुगतान", "bhugtaan"], ["इनवॉइस", "invoice"], ["बिल", "bill"],
      ["ग्राहक", "customer"],
      // Interrogatives
      ["कितना", "kitna"], ["क्या", "kya"], ["कौन", "kaun"], ["कब", "kab"], ["कहाँ", "kahan"],
      // Finish commands
      ["हो गया", "ho gaya"], ["बस", "bas"], ["और नहीं", "aur nahi"],
      ["ख़तम", "khatam"], ["ठीक है", "theek hai"],
      // Items / common words
      ["और", "aur"], ["नाम", "naam"], ["हाँ", "haan"], ["नहीं", "nahi"],
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
    clearSilenceTimers()

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
        let detail = `HTTP ${res.status}`
        try {
          const errBody = await res.json()
          detail = errBody?.detail || detail
        } catch (_) {}
        throw new Error(detail)
      }

      const data = await res.json()
      const result = data.result || data
      const spokenText = buildSpokenText(result)
      const responseMsg = result.response || result.message || spokenText
      const continueListening = data.continue_listening ?? result.continue_listening ?? false

      setHistory((prev) => [
        ...prev,
        {
          userText: rawText,
          normalized: text !== rawText ? text : null,
          response: responseMsg,
          options: result.options || [],
          status: result.status || "uncertain",
          intent: data.intent || result.intent || "",
          continue_listening: continueListening,
        },
      ])

      // Track whether we're in a conversation
      if (continueListening) {
        shouldAutoListenRef.current = true
        setConversationActive(true)
      } else {
        shouldAutoListenRef.current = false
        setConversationActive(false)
      }

      // Speak response — auto-listen will restart from utterance.onend
      speak(spokenText, continueListening)
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
      shouldAutoListenRef.current = false
      setConversationActive(false)
      speak(isHi ? "Kuch gadbad ho gayi. Dobara try karein." : "Something went wrong. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  // ──────────────────────────────────────────
  // Start listening (with beep)
  // ──────────────────────────────────────────
  function startListening() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      alert("Aapka browser Speech Recognition support nahi karta.")
      return
    }

    // Don't restart if already listening
    if (recognitionRef.current) {
      try { recognitionRef.current.abort() } catch (_) {}
    }

    const recognition = new SR()
    recognitionRef.current = recognition

    recognition.lang = "hi-IN"
    recognition.continuous = true      // Let the user speak freely
    recognition.interimResults = true  // Get real-time text updates

    recognition.onstart = () => {
      setIsListening(true)
      setTranscript("")
      playBeep() // 🔊 Beep when listening starts

      // Start silence timers if in a conversation
      if (shouldAutoListenRef.current) {
        startSilenceTimers()
      }
    }

    recognition.onresult = (event) => {
      clearSilenceTimers()
      
      // Combine all results (interim + final) into a single string
      let currentTranscript = ""
      for (let i = 0; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript
      }
      
      setTranscript(currentTranscript)

      // Clear the previous debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      // Wait 2000ms for user to stop speaking before sending command
      debounceTimerRef.current = setTimeout(() => {
        // Stop recognizing so we don't double-trigger while processing
        recognition.stop()
        sendCommand(currentTranscript)
      }, 2000)
    }

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error)
      setIsListening(false)

      // If it's a "no-speech" error during conversation, restart
      if (event.error === "no-speech" && shouldAutoListenRef.current) {
        setTimeout(() => startListening(), 300)
      }
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  // ──────────────────────────────────────────
  // Stop listening
  // ──────────────────────────────────────────
  function stopListening() {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.abort() } catch (_) {}
      recognitionRef.current = null
    }
    setIsListening(false)
  }

  // ──────────────────────────────────────────
  // Toggle (manual mic button)
  // ──────────────────────────────────────────
  function toggleListening() {
    if (isListening || conversationActive) {
      // Stop everything — user wants to end the conversation
      shouldAutoListenRef.current = false
      setConversationActive(false)
      clearSilenceTimers()
      stopListening()
      window.speechSynthesis?.cancel()
      setIsSpeaking(false)
      return
    }

    startListening()
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

  const showActiveState = isListening || conversationActive
  const statusLabel = isListening
    ? (isHi ? "सुन रहा हूँ" : "Listening")
    : isSpeaking
    ? (isHi ? "जवाब दे रहा हूँ" : "Responding")
    : isProcessing
    ? (isHi ? "प्रोसेसिंग" : "Processing")
    : conversationActive
    ? (isHi ? "बातचीत चालू" : "Conversation live")
    : (isHi ? "तैयार" : "Ready")

  return (
    <div className="w-full space-y-4">
      <div className="relative overflow-hidden rounded-[34px] border border-white/70 bg-gradient-to-r from-[#0f6c4d] via-[#1A8C66] to-[#0d5e43] p-1 shadow-[0_22px_40px_-20px_rgba(16,95,69,0.55)]">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 18% 20%, rgba(255,255,255,0.45), transparent 45%), radial-gradient(circle at 82% 80%, rgba(255,255,255,0.25), transparent 50%)" }} />

        <div className="relative flex flex-col gap-3 rounded-[30px] bg-white/14 px-4 py-4 sm:px-5 backdrop-blur-md md:flex-row md:items-center md:gap-4">
          <div className="hidden h-12 w-12 shrink-0 rounded-full bg-white/20 sm:flex items-center justify-center text-white shadow-inner shadow-white/20">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-100/90 mb-1">
              {isHi ? "वॉइस असिस्टेंट" : "Voice Assistant"}
            </p>
            <div className="text-white text-[24px] sm:text-[30px] leading-tight font-medium tracking-tight truncate">
              {transcript || (isHi ? "कुछ भी पूछें" : "Ask anything")}
            </div>
            {!transcript && (
              <p className="text-[12px] mt-1 text-emerald-50/80 font-semibold">
                {isHi ? "माइक दबाएं या नीचे टाइप करके भेजें" : "Tap the mic or type below to send"}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <div className="px-3 py-1.5 rounded-full bg-white/20 text-white text-xs font-bold tracking-wide border border-white/25">
              {statusLabel}
            </div>

            <button
              onClick={toggleListening}
              disabled={isProcessing}
              title={
                showActiveState
                  ? (isHi ? "बातचीत रोकें" : "Stop conversation")
                  : (isHi ? "बोलें" : "Speak")
              }
              className={`relative h-16 w-16 rounded-full flex items-center justify-center transition-all duration-300 border border-white/40 ${
                showActiveState
                  ? "bg-[#ef4444] text-white scale-[1.03] shadow-[0_0_0_10px_rgba(239,68,68,0.18)]"
                  : isProcessing
                  ? "bg-slate-300 text-white cursor-not-allowed"
                  : "bg-white/95 text-[#0f6c4d] hover:scale-105 shadow-lg"
              }`}
            >
              {isListening && <span className="absolute inset-0 rounded-full border-4 border-white/45 animate-ping" />}

              {showActiveState ? (
                <svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="6" width="12" height="12" rx="2.4" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                  <path d="M19 11v1a7 7 0 0 1-14 0v-1" />
                  <line x1="12" y1="19" x2="12" y2="22" />
                  <line x1="8" y1="22" x2="16" y2="22" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleTextSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={isHi ? "यहाँ टाइप करें..." : "Type here..."}
          disabled={isProcessing}
          className="flex-1 pl-4 pr-4 py-3.5 bg-[#F4F7F6] border border-transparent focus:border-[#1A8C66]/30 focus:outline-none rounded-2xl text-sm font-medium text-slate-700 placeholder-slate-400 transition-all"
        />
        <button
          type="submit"
          disabled={isProcessing || !inputText.trim()}
          className="px-5 py-3.5 bg-[#1A8C66] text-white text-sm font-bold rounded-2xl hover:bg-[#157a58] disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          {isHi ? "भेजें" : "Send"}
        </button>
      </form>

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
                    item.status === "error" ? "bg-red-50" :
                    item.status === "invoice_step" || item.status === "silence_warning" ? "bg-blue-50" :
                    "bg-amber-50"
                  }`}>
                    {item.status === "success" ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1A8C66" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    ) : item.status === "error" ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    ) : item.status === "invoice_step" || item.status === "silence_warning" ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
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
