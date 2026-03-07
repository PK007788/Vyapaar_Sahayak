function CTA({ language }) {

  const content = {

    en: {
      title: "A small shop can carry big dreams",
      text: "Let Vyapaar Sahayak quietly manage your accounts while you focus on growing your Indian business.",
      button: "Begin your journey"
    },

    hi: {
      title: "एक छोटी दुकान भी बड़े सपने रख सकती है",
      text: "व्यापार सहायक आपके हिसाब संभालेगा ताकि आप अपने भारतीय व्यवसाय को आगे बढ़ा सकें।",
      button: "अपनी शुरुआत करें"
    }

  }

  const data = content[language]

  return (

    <section className="bg-emerald-900 text-white py-24">

      <div className="max-w-4xl mx-auto text-center px-6">

        <h2 className="text-4xl font-semibold mb-6">

          {data.title}

        </h2>

        <p className="text-lg mb-10">

          {data.text}

        </p>

        <button className="bg-white text-emerald-900 px-8 py-4 rounded-xl font-semibold">

          {data.button}

        </button>

      </div>

    </section>

  )
}

export default CTA