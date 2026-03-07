import { useState, useEffect } from "react"

function Hero() {

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


  const content = {

    en: {
      title: "Vyapaar Sahayak",
      subtitle:
        "Built with care for Indian shopkeepers who wake before sunrise, open their shutters with hope, and trust every day of hard work to provide for their families.",
      line:
        "A gentle digital companion that helps you remember every bill, every payment, and every customer promise.",
      start: "Start Free",
      learn: "Learn More"
    },

    hi: {
      title: "व्यापार सहायक",
      subtitle:
        "भारतीय दुकानदारों के लिए बनाया गया एक सच्चा सहायक, जो हर सुबह उम्मीद के साथ दुकान खोलते हैं और अपने परिश्रम से अपने परिवार का भविष्य बनाते हैं।",
      line:
        "एक ऐसा साथी जो हर बिल, हर भुगतान और हर ग्राहक के भरोसे को संभाल कर रखे।",
      start: "शुरू करें",
      learn: "और जानें"
    }

  }

  return (

    <section className="pt-32 pb-24">

      <div
        className={`max-w-6xl mx-auto grid md:grid-cols-2 gap-14 items-center px-6 transition-opacity duration-700 ${visible ? "opacity-100" : "opacity-0"}`}
      >

        {/* TEXT SIDE */}

        <div>

          <h1 className="text-5xl font-bold text-slate-900 mb-6">

            {content[language].title}

          </h1>

          <p className="text-lg text-slate-600 leading-relaxed mb-6">

            {content[language].subtitle}

          </p>

          <p className="text-lg text-slate-600 leading-relaxed mb-10">

            {content[language].line}

          </p>

          <div className="flex gap-4">

            <button className="bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700">

              {content[language].start}

            </button>

            <button className="border border-slate-300 px-6 py-3 rounded-xl hover:bg-gray-100">

              {content[language].learn}

            </button>

          </div>

        </div>


        {/* ILLUSTRATION SIDE */}

        <div className="relative flex items-center justify-center">

          {/* main rounded background */}

          <div className="absolute w-[420px] h-[420px] bg-emerald-100 rounded-full blur-2xl"></div>


          {/* illustration container */}

          <div className="relative bg-white shadow-xl rounded-3xl p-10">

            <img
              src="/illustrations/mobile.svg"
              alt="Finance assistant"
              className="w-[260px]"
            />

          </div>


          {/* floating element 1 */}

          <div className="absolute -top-6 -left-6 bg-white shadow-md rounded-xl px-4 py-2 text-sm">

            ₹500 invoice

          </div>


          {/* floating element 2 */}

          <div className="absolute bottom-0 -right-6 bg-white shadow-md rounded-xl px-4 py-2 text-sm">

            Ledger updated

          </div>

        </div>

      </div>

    </section>

  )
}

export default Hero