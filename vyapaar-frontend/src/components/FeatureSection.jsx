function FeatureSection({ language }) {

  const content = {

    en: {
      title: "A helping hand for every Bharatiya shopkeeper",
      p1: "Running a shop is not only about selling goods. It is about trust, relationships, and years of hard work.",
      p2: "Vyapaar Sahayak quietly manages the numbers while you focus on the people who walk into your shop every day."
    },

    hi: {
      title: "हर भारतीय दुकानदार के लिए एक सच्चा सहायक",
      p1: "दुकान चलाना केवल सामान बेचना नहीं है। यह भरोसे, रिश्तों और वर्षों की मेहनत की कहानी है।",
      p2: "व्यापार सहायक चुपचाप आपके हिसाब संभालता है ताकि आप अपने ग्राहकों पर ध्यान दे सकें।"
    }

  }

  const data = content[language]

  return (

    <section className="py-28">

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-14 items-center px-6">

        <div>

          <h2 className="text-4xl font-semibold mb-6">

            {data.title}

          </h2>

          <p className="text-lg text-slate-600 mb-6">

            {data.p1}

          </p>

          <p className="text-lg text-slate-600">

            {data.p2}

          </p>

        </div>

        <div className="bg-emerald-50 p-12 rounded-3xl">

          <img
            src="/illustrations/mobile.svg"
            alt="Mobile dashboard"
          />

        </div>

      </div>

    </section>

  )
}

export default FeatureSection