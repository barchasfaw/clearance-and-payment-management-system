"use client"

import { useState, type FormEvent } from "react"
import { authenticateStaff } from "../data/staff-credentials"
import "./login-page.css"

interface LoginPageProps {
  onLogin?: (userData: any) => void
}

const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")

    if (!username || !password) {
      setError("Please enter both username and password")
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Authenticate using our helper function
      const staffMember = authenticateStaff(username, password)

      if (staffMember) {
        console.log("Login successful:", staffMember)

        // Call the onLogin callback if provided
        if (onLogin) {
          onLogin(staffMember)
        }
      } else {
        setError("Invalid username or password")
      }
    } catch (err) {
      setError("An error occurred during login")
      console.error("Login error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-header">
          <div className="logo-container">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="logo-icon"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
          <h1 className="login-title">Dormitory Clearance System</h1>
          <p className="login-subtitle">Staff Portal</p>
        </div>

        <div className="login-card">
          <div className="card-header">
            <h2 className="card-title">Staff Login</h2>
            <p className="card-description">Enter your credentials to access the system</p>
          </div>

          <div className="card-body">
            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="username" className="form-label">
                  Username
                </label>
                <div className="input-container">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="input-icon"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <input
                    type="text"
                    id="username"
                    className="form-input"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="form-header">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <a href="#forgot-password" className="forgot-password">
                    Forgot password?
                  </a>
                </div>
                <div className="input-container">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="input-icon"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <input
                    type="password"
                    id="password"
                    className="form-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="checkbox-container">
                <input
                  type="checkbox"
                  id="remember-me"
                  className="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember-me" className="checkbox-label">
                  Remember me for 30 days
                </label>
              </div>

              <button type="submit" className="submit-button" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </div>

          <div className="card-footer">
            <p className="footer-text">
              By signing in, you agree to the dormitory clearance system's terms and conditions.
            </p>
          </div>
        </div>

        <p className="help-text">Need help? Contact the system administrator</p>
      </div>
    </div>
  )
}

export default LoginPage

