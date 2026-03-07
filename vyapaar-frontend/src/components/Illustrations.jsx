export function LedgerHeartIllustration({ className = "" }) {
  return (
    <svg
      viewBox="0 0 420 320"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Ledger with heart"
    >
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="hsl(140 45% 92%)" />
          <stop offset="1" stopColor="hsl(60 30% 96%)" />
        </linearGradient>
        <linearGradient id="card" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#f8fafc" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="18" stdDeviation="16" floodColor="#0f172a" floodOpacity="0.10" />
        </filter>
      </defs>

      <rect x="0" y="0" width="420" height="320" rx="36" fill="url(#bg)" />

      <g filter="url(#shadow)">
        <rect x="92" y="64" width="236" height="176" rx="28" fill="url(#card)" />
      </g>

      <rect x="122" y="94" width="164" height="12" rx="6" fill="hsl(140 50% 40%)" opacity="0.18" />
      <rect x="122" y="122" width="192" height="10" rx="5" fill="#0f172a" opacity="0.08" />
      <rect x="122" y="144" width="176" height="10" rx="5" fill="#0f172a" opacity="0.08" />
      <rect x="122" y="166" width="148" height="10" rx="5" fill="#0f172a" opacity="0.08" />

      <g transform="translate(0,0)">
        <circle cx="306" cy="202" r="34" fill="hsl(140 50% 40%)" opacity="0.10" />
        <path
          d="M306 222c-16-9-26-18-26-31 0-9 7-16 16-16 5 0 9 2 10 5 2-3 6-5 10-5 9 0 16 7 16 16 0 13-10 22-26 31z"
          fill="hsl(140 50% 40%)"
          opacity="0.85"
        />
      </g>

      <g opacity="0.9">
        <path
          d="M70 254c22-16 46-25 74-26 29-1 56 7 82 22 33 19 71 25 118 16"
          fill="none"
          stroke="hsl(140 50% 40%)"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.25"
        />
      </g>
    </svg>
  )
}

/** Faded market-scene background: stalls, awnings, silhouettes. Use as section background. */
export function FadedMarketScene({ className = "", opacity = 0.08 }) {
  return (
    <svg
      viewBox="0 0 800 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
      style={{ opacity }}
      preserveAspectRatio="xMidYMax slice"
    >
      <defs>
        <linearGradient id="fade-market" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="hsl(140 40% 30%)" />
          <stop offset="1" stopColor="hsl(160 25% 25%)" />
        </linearGradient>
      </defs>
      {/* Striped awnings / stall tops */}
      <path d="M0 120 L0 80 L120 60 L120 100 Z" fill="url(#fade-market)" />
      <path d="M100 100 L100 65 L220 45 L220 85 Z" fill="url(#fade-market)" />
      <path d="M200 85 L200 50 L340 30 L340 70 Z" fill="url(#fade-market)" />
      <path d="M320 70 L320 38 L460 20 L460 55 Z" fill="url(#fade-market)" />
      <path d="M440 55 L440 28 L580 12 L580 48 Z" fill="url(#fade-market)" />
      <path d="M560 48 L560 22 L720 8 L720 42 Z" fill="url(#fade-market)" />
      <path d="M680 42 L680 18 L800 5 L800 38 Z" fill="url(#fade-market)" />
      {/* Stall bases / tables */}
      <rect x="20" y="180" width="100" height="24" rx="4" fill="url(#fade-market)" />
      <rect x="140" y="170" width="90" height="28" rx="4" fill="url(#fade-market)" />
      <rect x="260" y="175" width="95" height="26" rx="4" fill="url(#fade-market)" />
      <rect x="400" y="168" width="88" height="30" rx="4" fill="url(#fade-market)" />
      <rect x="530" y="172" width="92" height="26" rx="4" fill="url(#fade-market)" />
      <rect x="660" y="178" width="85" height="24" rx="4" fill="url(#fade-market)" />
      {/* Simple figure silhouettes */}
      <ellipse cx="70" cy="155" rx="12" ry="18" fill="url(#fade-market)" />
      <ellipse cx="200" cy="148" rx="10" ry="16" fill="url(#fade-market)" />
      <ellipse cx="380" cy="152" rx="11" ry="17" fill="url(#fade-market)" />
      <ellipse cx="580" cy="150" rx="10" ry="16" fill="url(#fade-market)" />
      <ellipse cx="720" cy="155" rx="12" ry="18" fill="url(#fade-market)" />
    </svg>
  )
}

/** Faded bazaar strip for dark CTA section - light strokes so it shows on dark green */
export function FadedMarketSceneDark({ className = "", opacity = 0.15 }) {
  return (
    <svg
      viewBox="0 0 800 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
      style={{ opacity }}
      preserveAspectRatio="xMidYMax slice"
    >
      <defs>
        <linearGradient id="fade-dark" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="hsl(0 0% 100%)" />
          <stop offset="0.5" stopColor="hsl(0 0% 98%)" />
          <stop offset="1" stopColor="hsl(0 0% 100%)" />
        </linearGradient>
      </defs>
      {/* Soft stall / awning outlines */}
      <path d="M0 90 L80 70 L160 90 L80 110 Z" stroke="url(#fade-dark)" strokeWidth="1.5" fill="none" />
      <path d="M120 80 L200 58 L280 80 L200 102 Z" stroke="url(#fade-dark)" strokeWidth="1.5" fill="none" />
      <path d="M240 70 L320 48 L400 70 L320 92 Z" stroke="url(#fade-dark)" strokeWidth="1.5" fill="none" />
      <path d="M360 78 L440 56 L520 78 L440 100 Z" stroke="url(#fade-dark)" strokeWidth="1.5" fill="none" />
      <path d="M480 72 L560 50 L640 72 L560 94 Z" stroke="url(#fade-dark)" strokeWidth="1.5" fill="none" />
      <path d="M600 82 L680 60 L760 82 L680 104 Z" stroke="url(#fade-dark)" strokeWidth="1.5" fill="none" />
      <path d="M720 75 L800 55 L800 95 L720 115 Z" stroke="url(#fade-dark)" strokeWidth="1.5" fill="none" />
    </svg>
  )
}

export function ServiceIcon({ kind = "billing", className = "" }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  }
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden xmlns="http://www.w3.org/2000/svg">
      {kind === "billing" && (
        <>
          <path {...common} d="M7 3h10v18l-2-1-3 1-3-1-2 1V3z" />
          <path {...common} d="M9 8h6M9 12h6" opacity="0.7" />
        </>
      )}
      {kind === "voice" && (
        <>
          <path {...common} d="M12 14a3 3 0 0 0 3-3V7a3 3 0 0 0-6 0v4a3 3 0 0 0 3 3z" />
          <path {...common} d="M19 11a7 7 0 0 1-14 0" opacity="0.7" />
          <path {...common} d="M12 18v3" />
        </>
      )}
      {kind === "ledger" && (
        <>
          <path {...common} d="M5 4h12a2 2 0 0 1 2 2v14H7a2 2 0 0 0-2 2V4z" />
          <path {...common} d="M9 8h7M9 12h7M9 16h5" opacity="0.7" />
        </>
      )}
      {kind === "payments" && (
        <>
          <path {...common} d="M3 7h18v10H3V7z" />
          <path {...common} d="M3 10h18" opacity="0.7" />
          <path {...common} d="M7 14h4" />
        </>
      )}
    </svg>
  )
}

