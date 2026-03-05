import Navbar from "./components/Navbar"

function App() {

  return (

  <div className="min-h-screen bg-slate-50 text-slate-900">  

      <Navbar />

      <div className="flex flex-col items-center justify-center text-center mt-40">

       <h1 className="text-6xl font-bold mb-6 text-slate-900">
          Vyapaar Sahayak
       </h1>

        <p className="text-xl text-gray-300 mb-10">
          AI-powered accounting assistant for Indian shopkeepers
        </p>

        <div className="flex gap-6">

          <button className="bg-blue-600 px-8 py-4 rounded-xl hover:bg-blue-700 transition">
            Start Free
          </button>

          <button className="border border-gray-500 px-8 py-4 rounded-xl hover:bg-gray-800 transition">
            Login
          </button>

        </div>

      </div>

    </div>

  )
}

export default App