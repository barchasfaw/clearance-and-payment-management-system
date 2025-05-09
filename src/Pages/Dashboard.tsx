"use client"

import { useState, useEffect } from "react"
import AdminRegistration from "./AdminRegistration"
import UserManagement from "./UserManagement"
import SecurityGate from "./SecurityGate"
import CafeteriaSystem from "./CafeteriaSystem"
import type { StaffCredential } from "../data/staff-credentials"
import "./Dashboard.css"

interface DashboardProps {
  user: StaffCredential
  onLogout: () => void
}

const Dashboard = ({ user, onLogout }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState<string>("dashboard")

  // Add this effect after the useState declaration
  useEffect(() => {
    // Reset to dashboard if current tab is not allowed for this role
    if (
      (activeTab === "register" && user.role !== "admin") ||
      (activeTab === "manage" && user.role !== "admin") ||
      (activeTab === "security" && user.role !== "security" && user.role !== "admin") ||
      (activeTab === "cafeteria" && user.role !== "cafe" && user.role !== "admin")
    ) {
      setActiveTab("dashboard")
    }
  }, [activeTab, user.role])

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="dashboard-logo">
          <h1>Dormitory Clearance System</h1>
        </div>
        <div className="dashboard-user">
          <span className="user-name">
            {user.name} ({user.role})
          </span>
          <button className="logout-button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <aside className="dashboard-sidebar">
          <nav className="sidebar-nav">
            <ul>
              <li>
                <button
                  className={`nav-button ${activeTab === "dashboard" ? "active" : ""}`}
                  onClick={() => setActiveTab("dashboard")}
                >
                  Dashboard
                </button>
              </li>

              {/* Admin-only pages */}
              {user.role === "admin" && (
                <>
                  <li>
                    <button
                      className={`nav-button ${activeTab === "register" ? "active" : ""}`}
                      onClick={() => setActiveTab("register")}
                    >
                      Register User
                    </button>
                  </li>
                  <li>
                    <button
                      className={`nav-button ${activeTab === "manage" ? "active" : ""}`}
                      onClick={() => setActiveTab("manage")}
                    >
                      Manage Users
                    </button>
                  </li>
                </>
              )}

              {/* Security-only pages */}
              {(user.role === "security" || user.role === "admin") && (
                <li>
                  <button
                    className={`nav-button ${activeTab === "security" ? "active" : ""}`}
                    onClick={() => setActiveTab("security")}
                  >
                    Security Gate
                  </button>
                </li>
              )}

              {/* Cafeteria-only pages */}
              {(user.role === "cafe" || user.role === "admin") && (
                <li>
                  <button
                    className={`nav-button ${activeTab === "cafeteria" ? "active" : ""}`}
                    onClick={() => setActiveTab("cafeteria")}
                  >
                    Cafeteria
                  </button>
                </li>
              )}

              {/* Common pages for all roles */}
              <li>
                <button
                  className={`nav-button ${activeTab === "reports" ? "active" : ""}`}
                  onClick={() => setActiveTab("reports")}
                >
                  Reports
                </button>
              </li>
              <li>
                <button
                  className={`nav-button ${activeTab === "settings" ? "active" : ""}`}
                  onClick={() => setActiveTab("settings")}
                >
                  Settings
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        <main className="dashboard-main">
          {activeTab === "register" && user.role === "admin" && <AdminRegistration />}
          {activeTab === "dashboard" && (
            <div className="placeholder-content">
              <h2>Welcome, {user.name}</h2>
              <p>Role: {user.role}</p>
              <p>Email: {user.email}</p>
              <p>Welcome to the Dormitory Clearance System dashboard.</p>
            </div>
          )}
          {activeTab === "manage" && user.role === "admin" && <UserManagement />}
          {activeTab === "security" && (user.role === "security" || user.role === "admin") && <SecurityGate />}
          {activeTab === "cafeteria" && (user.role === "cafe" || user.role === "admin") && <CafeteriaSystem />}
          {activeTab === "reports" && (
            <div className="placeholder-content">
              <h2>Reports</h2>
              <p>View and generate system reports.</p>
            </div>
          )}
          {activeTab === "settings" && (
            <div className="placeholder-content">
              <h2>Settings</h2>
              <p>Configure system settings and preferences.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default Dashboard
