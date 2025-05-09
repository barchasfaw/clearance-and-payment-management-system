"use client"

import { useState } from "react"
import LoginPage from "./Pages/login-page"
import Dashboard from "./Pages/Dashboard"
import "./App.css"
import type { StaffCredential } from "./data/staff-credentials"

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState<StaffCredential | null>(null)

  // Handle login
  const handleLogin = (userData: StaffCredential) => {
    setCurrentUser(userData)
    setIsLoggedIn(true)
  }

  // Handle logout
  const handleLogout = () => {
    setCurrentUser(null)
    setIsLoggedIn(false)
  }

  return (
    <div className="App">
      {isLoggedIn && currentUser ? (
        <Dashboard user={currentUser} onLogout={handleLogout} />
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </div>
  )
}

export default App
