import { createContext, useState, useCallback } from "react"

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("ledger_user")
    return savedUser ? JSON.parse(savedUser) : null
  })

  const login = useCallback((userData) => {
    setUser(userData)
    localStorage.setItem("ledger_user", JSON.stringify(userData))
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem("ledger_user")
  }, [])

  const value = {
    user,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
