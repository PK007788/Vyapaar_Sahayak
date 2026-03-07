import { Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import ProtectedRoute from "./components/ProtectedRoute"
import Landing from "./pages/Landing"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import About from "./pages/About"
import { useLanguage } from "./context/LanguageContext"

function App() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="min-h-screen bg-cream">
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Navbar language={language} />
              <Landing language={language} />
            </>
          }
        />
        <Route
          path="/about"
          element={
            <>
              <Navbar language={language} />
              <About />
            </>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  )
}

export default App
