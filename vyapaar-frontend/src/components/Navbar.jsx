function Navbar() {
  return (
    <nav className="flex justify-between items-center px-10 py-6 text-white">

      <h1 className="text-2xl font-bold">
        Vyapaar Sahayak
      </h1>

      <div className="flex items-center gap-6 text-sm">

        <button className="hover:text-blue-400">
          Features
        </button>

        <button className="hover:text-blue-400">
          Pricing
        </button>

        <button className="hover:text-blue-400">
          Login
        </button>

        <div className="border-l border-gray-600 h-6"></div>

        <button className="hover:text-blue-400">
          EN
        </button>

        <button className="hover:text-blue-400">
          हिंदी
        </button>

      </div>

    </nav>
  )
}

export default Navbar