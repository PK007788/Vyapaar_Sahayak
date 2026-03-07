function Services({ language }) {

  const content = {

    en: {
      title: "Everything your shop truly needs",
      services: [
        {
          title: "Smart Billing",
          text: "Create clear and professional invoices in seconds without touching complicated accounting software."
        },
        {
          title: "Voice Billing",
          text: "Simply say what you sold and the system prepares the bill while recording it in your ledger."
        },
        {
          title: "Customer Ledger",
          text: "Never forget who owes what. Every customer's balance stays safely remembered."
        },
        {
          title: "Payment Tracking",
          text: "Know which payments arrived and which ones still need a gentle reminder."
        }
      ]
    },

    hi: {
      title: "आपकी दुकान के लिए ज़रूरी हर सुविधा",
      services: [
        {
          title: "स्मार्ट बिलिंग",
          text: "कुछ ही क्षणों में साफ और भरोसेमंद बिल बनाएं, बिना किसी जटिल अकाउंटिंग सिस्टम के।"
        },
        {
          title: "आवाज़ से बिल बनाना",
          text: "बस बोलिए आपने क्या बेचा और सिस्टम अपने आप बिल तैयार कर देगा।"
        },
        {
          title: "ग्राहक हिसाब",
          text: "कौन कितना उधार रखता है यह कभी भूलना नहीं पड़ेगा। हर ग्राहक का हिसाब सुरक्षित रहेगा।"
        },
        {
          title: "भुगतान निगरानी",
          text: "किसने भुगतान किया और किसे याद दिलाना है यह साफ दिखाई देगा।"
        }
      ]
    }

  }


  const data = content[language]


  return (

    <section className="py-24">

      <div className="max-w-6xl mx-auto px-6">

        <h2 className="text-3xl font-semibold text-center mb-16 text-slate-900">

          {data.title}

        </h2>

        <div className="flex gap-6 overflow-x-auto pb-4">

          {data.services.map((service, index) => (

            <div
              key={index}
              className="min-w-[260px] bg-white p-8 rounded-2xl shadow"
            >

              <h3 className="text-xl font-semibold mb-3">

                {service.title}

              </h3>

              <p className="text-slate-600">

                {service.text}

              </p>

            </div>

          ))}

        </div>

      </div>

    </section>

  )
}

export default Services