function TrustBar({ language }) {

  const content = {

    en: {
      title: "Quietly supporting thousands of Indian businesses",
      items: [
        "Retail Stores",
        "Kirana Shops",
        "Small Businesses",
        "Street Vendors",
        "Local Traders"
      ]
    },

    hi: {
      title: "हज़ारों भारतीय व्यवसायों के साथ खड़ा",
      items: [
        "खुदरा दुकानें",
        "किराना दुकानें",
        "छोटे व्यवसाय",
        "सड़क विक्रेता",
        "स्थानीय व्यापारी"
      ]
    }

  }

  const data = content[language]


  return (

    <section className="py-20 bg-white">

      <div className="max-w-6xl mx-auto text-center px-6">

        <p className="text-slate-600 mb-10">

          {data.title}

        </p>

        <div className="flex justify-center gap-10 flex-wrap text-slate-500">

          {data.items.map((item, index) => (

            <span key={index}>{item}</span>

          ))}

        </div>

      </div>

    </section>

  )
}

export default TrustBar