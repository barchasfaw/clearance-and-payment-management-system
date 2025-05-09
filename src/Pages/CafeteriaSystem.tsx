"use client"

import type React from "react"

import { useState, useEffect } from "react"
import extendedUserStore, { type ExtendedUser } from "../data/extended-user-store"
import mealStore, {
  type MealRecord,
  type MealType,
  type MealTimeWindow,
  MEAL_TIME_WINDOWS,
} from "../data/meal-store"
import "./CafeteriaSystem.css"

// ID Card Scanner Component
const IDCardScanner = ({ onScan }: { onScan: (userId: string) => void }) => {
  const [manualId, setManualId] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [scanError, setScanError] = useState("")

  // Simulate scanning an ID card
  const handleScan = () => {
    setIsScanning(true)
    setScanError("")

    // Simulate a delay for scanning
    setTimeout(() => {
      const users = extendedUserStore.getAllExtendedUsers()
      if (users.length > 0) {
        // Randomly select a user to simulate scanning
        const randomUser = users[Math.floor(Math.random() * users.length)]
        onScan(randomUser.id)
      } else {
        setScanError("No users found in the system")
      }
      setIsScanning(false)
    }, 1500)
  }

  // Handle manual ID entry
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualId.trim()) {
      setScanError("Please enter an ID")
      return
    }

    setScanError("")
    onScan(manualId.trim())
    setManualId("")
  }

  return (
    <div className="id-scanner-container">
      <div className="scanner-header">
        <h2>ID Card Scanner</h2>
        <p>Scan student ID card or enter ID manually</p>
      </div>

      <div className="scanner-actions">
        <button className={`scan-button ${isScanning ? "scanning" : ""}`} onClick={handleScan} disabled={isScanning}>
          {isScanning ? (
            <>
              <span className="scanning-indicator"></span>
              Scanning...
            </>
          ) : (
            "Scan ID Card"
          )}
        </button>

        <div className="manual-entry">
          <h3>Manual Entry</h3>
          <form onSubmit={handleManualSubmit} className="manual-form">
            <input
              type="text"
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              placeholder="Enter ID (e.g., STU001)"
              className="manual-input"
              disabled={isScanning}
            />
            <button type="submit" className="submit-button" disabled={isScanning}>
              Submit
            </button>
          </form>
        </div>
      </div>

      {scanError && <div className="scan-error">{scanError}</div>}

      <div className="scanner-help">
        <h4>Available Test IDs:</h4>
        <ul>
          <li>STU001 to STU005 - Students</li>
        </ul>
      </div>
    </div>
  )
}

// Meal Time Status Component
const MealTimeStatus = () => {
  const [currentStatus, setCurrentStatus] = useState<{
    mealType: MealType | null
    timeWindow: MealTimeWindow | null
    isWithinMealTime: boolean
  }>({ mealType: null, timeWindow: null, isWithinMealTime: false })
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
      setCurrentStatus(mealStore.getCurrentMealType())
    }, 60000) // Update every minute

    // Initial update
    setCurrentStatus(mealStore.getCurrentMealType())

    return () => clearInterval(timer)
  }, [])

  // Format time for display
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":").map(Number)
    return new Date(0, 0, 0, hours, minutes).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  // Get time until next meal
  const getTimeUntilNextMeal = () => {
    if (!currentStatus.timeWindow || currentStatus.isWithinMealTime) return ""

    const now = currentTime
    const [nextHours, nextMinutes] = currentStatus.timeWindow.startTime.split(":").map(Number)

    const nextMealTime = new Date(now)
    nextMealTime.setHours(nextHours, nextMinutes, 0, 0)

    // If next meal is tomorrow
    if (nextMealTime < now) {
      nextMealTime.setDate(nextMealTime.getDate() + 1)
    }

    const diffMs = nextMealTime.getTime() - now.getTime()
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    return `${diffHrs}h ${diffMins}m`
  }

  return (
    <div className="meal-time-status">
      <div className="current-time">
        <h3>Current Time</h3>
        <div className="time-display">{currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
      </div>

      <div className="meal-status">
        {currentStatus.isWithinMealTime && currentStatus.timeWindow ? (
          <div className="active-meal-time">
            <h3>Current Meal</h3>
            <div className="meal-badge meal-active">
              {currentStatus.timeWindow.displayName} Time
              <span className="meal-time-range">
                ({formatTime(currentStatus.timeWindow.startTime)} - {formatTime(currentStatus.timeWindow.endTime)})
              </span>
            </div>
          </div>
        ) : (
          <div className="next-meal-time">
            <h3>Next Meal</h3>
            <div className="meal-badge meal-inactive">
              {currentStatus.timeWindow?.displayName}
              <span className="meal-time-range">
                ({formatTime(currentStatus.timeWindow?.startTime || "00:00")} -{" "}
                {formatTime(currentStatus.timeWindow?.endTime || "00:00")})
              </span>
            </div>
            <div className="time-until">Time until next meal: {getTimeUntilNextMeal()}</div>
          </div>
        )}
      </div>

      <div className="all-meal-times">
        <h3>Today's Meal Schedule</h3>
        <div className="meal-schedule">
          {MEAL_TIME_WINDOWS.map((timeWindow) => (
            <div
              key={timeWindow.mealType}
              className={`meal-schedule-item ${currentStatus.mealType === timeWindow.mealType ? "current-meal" : ""}`}
            >
              <div className="meal-name">{timeWindow.displayName}</div>
              <div className="meal-time">
                {formatTime(timeWindow.startTime)} - {formatTime(timeWindow.endTime)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Student Information Display Component
const StudentInfoDisplay = ({
  student,
  onRecordMeal,
}: {
  student: ExtendedUser
  onRecordMeal: (mealType: MealType) => void
}) => {
  const [todaysMeals, setTodaysMeals] = useState<MealRecord[]>([])
  const [currentMealStatus, setCurrentMealStatus] = useState<{
    mealType: MealType | null
    timeWindow: MealTimeWindow | null
    isWithinMealTime: boolean
  }>({ mealType: null, timeWindow: null, isWithinMealTime: false })

  // Load today's meals for this student
  useEffect(() => {
    const meals = mealStore.getMealRecordsByUserIdAndDate(student.id, new Date())
    setTodaysMeals(meals)
    setCurrentMealStatus(mealStore.getCurrentMealType())

    // Subscribe to changes
    const unsubscribe = mealStore.subscribe(() => {
      const updatedMeals = mealStore.getMealRecordsByUserIdAndDate(student.id, new Date())
      setTodaysMeals(updatedMeals)
    })

    return unsubscribe
  }, [student.id])

  // Check if student has had a specific meal today
  const hasHadMeal = (mealType: MealType) => {
    return todaysMeals.some((meal) => meal.mealType === mealType)
  }

  // Format time for display
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Check if student is eligible for current meal
  const isEligibleForCurrentMeal = () => {
    if (!currentMealStatus.isWithinMealTime || !currentMealStatus.mealType) return false
    return !hasHadMeal(currentMealStatus.mealType)
  }

  return (
    <div className="student-info-container">
      <div className="student-header">
        <h2>Student Information</h2>
      </div>

      <div className="student-details">
        <div className="student-photo">
          <img
            src={student.photo || "/placeholder.svg?height=200&width=200"}
            alt={`Photo of ${student.name}`}
            className="photo-image"
          />
        </div>

        <div className="student-info">
          <div className="info-row">
            <div className="info-label">Name:</div>
            <div className="info-value">{student.name}</div>
          </div>

          <div className="info-row">
            <div className="info-label">ID:</div>
            <div className="info-value">{student.id}</div>
          </div>

          <div className="info-row">
            <div className="info-label">Role:</div>
            <div className="info-value">
              <span className={`role-badge role-${student.role.type}`}>
                {student.role.type.charAt(0).toUpperCase() + student.role.type.slice(1)}
              </span>
            </div>
          </div>

          {student.role.type === "student" && student.role.details && (
            <>
              <div className="info-row">
                <div className="info-label">Grade:</div>
                <div className="info-value">{student.role.details.grade || "N/A"}</div>
              </div>

              <div className="info-row">
                <div className="info-label">Department:</div>
                <div className="info-value">{student.role.details.department || "N/A"}</div>
              </div>
            </>
          )}

          <div className="meal-status-section">
            <h3>Today's Meal Status</h3>
            <div className="meal-status-grid">
              {MEAL_TIME_WINDOWS.map((timeWindow) => (
                <div key={timeWindow.mealType} className="meal-status-item">
                  <div className="meal-status-name">{timeWindow.displayName}</div>
                  <div
                    className={`meal-status-indicator ${
                      hasHadMeal(timeWindow.mealType) ? "meal-taken" : "meal-not-taken"
                    }`}
                  >
                    {hasHadMeal(timeWindow.mealType) ? "Taken" : "Not Taken"}
                  </div>
                  {hasHadMeal(timeWindow.mealType) && (
                    <div className="meal-time-taken">
                      at{" "}
                      {formatTime(todaysMeals.find((meal) => meal.mealType === timeWindow.mealType)?.timestamp || "")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="meal-actions">
        {currentMealStatus.isWithinMealTime && currentMealStatus.mealType ? (
          <div className="current-meal-action">
            <h3>Current Meal: {currentMealStatus.timeWindow?.displayName}</h3>
            {isEligibleForCurrentMeal() ? (
              <button className="record-meal-button" onClick={() => onRecordMeal(currentMealStatus.mealType!)}>
                Record {currentMealStatus.timeWindow?.displayName} Meal
              </button>
            ) : (
              <div className="meal-already-taken">
                {hasHadMeal(currentMealStatus.mealType)
                  ? `Student has already taken ${currentMealStatus.timeWindow?.displayName} today.`
                  : `Not eligible for ${currentMealStatus.timeWindow?.displayName} at this time.`}
              </div>
            )}
          </div>
        ) : (
          <div className="no-meal-time">
            <h3>No Active Meal Time</h3>
            <p>
              Next meal: {currentMealStatus.timeWindow?.displayName} at{" "}
              {currentMealStatus.timeWindow?.startTime
                ? new Date(`2000-01-01T${currentMealStatus.timeWindow.startTime}:00`).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "N/A"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// Meal History Component
const MealHistory = ({ userId }: { userId: string }) => {
  const [mealRecords, setMealRecords] = useState<MealRecord[]>([])
  const [filterDays, setFilterDays] = useState<number>(7)

  // Load meal records
  useEffect(() => {
    loadMealRecords()

    // Subscribe to changes
    const unsubscribe = mealStore.subscribe(() => {
      loadMealRecords()
    })

    return unsubscribe
  }, [userId, filterDays])

  // Load meal records for the user
  const loadMealRecords = () => {
    const allRecords = mealStore.getMealRecordsByUserId(userId)

    // Filter by date range
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - filterDays)

    const filteredRecords = allRecords.filter((record) => {
      const recordDate = new Date(record.timestamp)
      return recordDate >= cutoffDate
    })

    // Sort by date (newest first)
    filteredRecords.sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    })

    setMealRecords(filteredRecords)
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  // Format time for display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Group records by date
  const recordsByDate: Record<string, MealRecord[]> = {}
  mealRecords.forEach((record) => {
    const date = new Date(record.timestamp)
    const dateKey = date.toISOString().split("T")[0]

    if (!recordsByDate[dateKey]) {
      recordsByDate[dateKey] = []
    }

    recordsByDate[dateKey].push(record)
  })

  return (
    <div className="meal-history-container">
      <div className="meal-history-header">
        <h3>Meal History</h3>
        <div className="filter-controls">
          <label htmlFor="filter-days">Show:</label>
          <select
            id="filter-days"
            value={filterDays}
            onChange={(e) => setFilterDays(Number(e.target.value))}
            className="filter-select"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
      </div>

      {Object.keys(recordsByDate).length === 0 ? (
        <div className="no-meals-message">No meal records found for this time period.</div>
      ) : (
        <div className="meal-history-list">
          {Object.entries(recordsByDate).map(([dateKey, records]) => (
            <div key={dateKey} className="meal-history-day">
              <div className="meal-history-date">{formatDate(dateKey)}</div>
              <div className="meal-history-records">
                {records.map((record) => (
                  <div key={record.id} className="meal-history-record">
                    <div className={`meal-type-indicator meal-${record.mealType}`}>
                      {record.mealType.charAt(0).toUpperCase() + record.mealType.slice(1)}
                    </div>
                    <div className="meal-time">{formatTime(record.timestamp)}</div>
                  </div>
                ))}

                {/* Show missing meals */}
                {MEAL_TIME_WINDOWS.map((timeWindow) => {
                  const hasMeal = records.some((record) => record.mealType === timeWindow.mealType)
                  if (!hasMeal) {
                    return (
                      <div key={`missing-${timeWindow.mealType}`} className="meal-history-record meal-missing">
                        <div className="meal-type-indicator meal-missing">{timeWindow.displayName}</div>
                        <div className="meal-status">Not taken</div>
                      </div>
                    )
                  }
                  return null
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Main Cafeteria System Component
const CafeteriaSystem = () => {
  const [scannedUserId, setScannedUserId] = useState<string | null>(null)
  const [scannedStudent, setScannedStudent] = useState<ExtendedUser | null>(null)
  const [scanHistory, setScanHistory] = useState<Array<{ userId: string; timestamp: string; action: "scan" | "meal" }>>(
    [],
  )
  const [notification, setNotification] = useState<{
    show: boolean
    type: "success" | "warning" | "error"
    message: string
  }>({ show: false, type: "success", message: "" })

  // Handle ID scan
  const handleScan = (userId: string) => {
    setScannedUserId(userId)
    const user = extendedUserStore.getExtendedUserById(userId)

    if (user) {
      setScannedStudent(user)

      // Add to scan history
      setScanHistory((prev) => [
        { userId, timestamp: new Date().toISOString(), action: "scan" },
        ...prev.slice(0, 9), // Keep only the last 10 entries
      ])
    } else {
      showNotification("error", `User with ID ${userId} not found.`)
    }
  }

  // Show notification
  const showNotification = (type: "success" | "warning" | "error", message: string) => {
    setNotification({
      show: true,
      type,
      message,
    })

    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }))
    }, 5000)
  }

  // Handle recording a meal
  const handleRecordMeal = (mealType: MealType) => {
    if (!scannedUserId) return

    const result = mealStore.recordMeal(scannedUserId, mealType, "STAFF2", "CAFE001")

    if (result.success) {
      showNotification("success", result.message || "Meal recorded successfully")

      // Add to scan history
      setScanHistory((prev) => [
        { userId: scannedUserId, timestamp: new Date().toISOString(), action: "meal" },
        ...prev.slice(0, 9), // Keep only the last 10 entries
      ])
    } else {
      showNotification("error", result.message || "Failed to record meal")
    }
  }

  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  return (
    <div className="cafeteria-system-container">
      <div className="cafeteria-header">
        <h1>Cafeteria Management System</h1>
        <p>Scan student ID cards to record meals</p>
      </div>

      {/* Notification */}
      {notification.show && (
        <div className={`notification notification-${notification.type}`}>
          <div className="notification-content">
            <span className="notification-message">{notification.message}</span>
            <button
              className="notification-close"
              onClick={() => setNotification((prev) => ({ ...prev, show: false }))}
            >
              &times;
            </button>
          </div>
        </div>
      )}

      <div className="cafeteria-content">
        <div className="left-panel">
          <MealTimeStatus />

          <IDCardScanner onScan={handleScan} />

          {/* Scan History */}
          <div className="scan-history">
            <h3>Recent Activity</h3>
            {scanHistory.length === 0 ? (
              <p className="no-history">No recent activity</p>
            ) : (
              <ul className="history-list">
                {scanHistory.map((entry, index) => (
                  <li key={index} className={`history-item action-${entry.action}`}>
                    <span className="history-time">{formatTimestamp(entry.timestamp)}</span>
                    <span className="history-action">{entry.action === "scan" ? "Scanned ID" : "Recorded Meal"}</span>
                    <span className="history-id">{entry.userId}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="right-panel">
          {scannedStudent ? (
            <>
              <StudentInfoDisplay student={scannedStudent} onRecordMeal={handleRecordMeal} />

              <MealHistory userId={scannedStudent.id} />
            </>
          ) : (
            <div className="no-student-scanned">
              <div className="no-student-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="no-student-svg"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <h2>No Student ID Scanned</h2>
              <p>Please scan a student ID card or enter an ID manually to view student information and record meals</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CafeteriaSystem
