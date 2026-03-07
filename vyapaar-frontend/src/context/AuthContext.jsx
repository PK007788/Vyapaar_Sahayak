import { createContext, useContext, useState, useCallback, useEffect } from "react"
import { getToken, setToken as persistToken, clearToken } from "../lib/authToken"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(getToken)
  const isLoggedIn = !!token

  const setToken = useCallback((newToken) => {
    if (newToken) persistToken(newToken)
    else clearToken()
    setTokenState(newToken || "")
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setTokenState("")
  }, [])

  useEffect(() => {
    setTokenState(getToken())
  }, [])

  return (
    <AuthContext.Provider value={{ token, isLoggedIn, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
