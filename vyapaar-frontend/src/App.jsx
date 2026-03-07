import { useState, useEffect } from "react"

import Navbar from "./components/Navbar"
import Hero from "./components/Hero"
import Services from "./components/Services"
import FeatureSection from "./components/FeatureSection"
import TrustBar from "./components/TrustBar"
import CTA from "./components/CTA"

function App() {

  const [language, setLanguage] = useState("en")
  const [visible, setVisible] = useState(true)

  useEffect(() => {

    const interval = setInterval(() => {

      setVisible(false)

      setTimeout(() => {

        setLanguage(prev => prev === "en" ? "hi" : "en")
        setVisible(true)

      }, 600)

    }, 15000)

    return () => clearInterval(interval)

  }, [])


  return (

    <div className={`bg-[#f7f7f2] transition-opacity duration-700 ${visible ? "opacity-100" : "opacity-0"}`}>

      <Navbar />

      <Hero language={language} />

      <Services language={language} />

      <FeatureSection language={language} />

      <TrustBar language={language} />

      <CTA language={language} />

    </div>

  )
}

export default App