"use client"

import type React from "react"

import { useState, useEffect } from "react"
import extendedUserStore, { type ExtendedUser, type Foul } from "../data/extended-user-store"
import itemStore, { type RegisteredItem } from "../data/item-store"
import "./SecurityGate.css"

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
        <p>Scan an ID card or enter ID manually</p>
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
          <li>STAFF1 to STAFF5 - Staff members</li>
        </ul>
        <div className="time-restriction-notice">
          <h4>Time Restrictions:</h4>
          <p>Entry and exit are only allowed between 6:00 AM and 12:00 AM.</p>
          <p>After-hours access will be registered as a foul.</p>
          <p>Three fouls will result in ID suspension and disciplinary action.</p>
        </div>
      </div>
    </div>
  )
}

// Person Information Display Component
const PersonInfoDisplay = ({
  person,
  onRecordEntry,
  onRecordExit,
}: {
  person: ExtendedUser
  onRecordEntry: () => void
  onRecordExit: () => void
}) => {
  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Format time for display
  const formatTime = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Determine if ID is expired
  const isExpired = () => {
    if (!person.idExpiryDate) return false
    return new Date(person.idExpiryDate) < new Date()
  }

  // Get foul count
  const getFoulCount = () => {
    return person.fouls?.length || 0
  }

  return (
    <div className="person-info-container">
      <div className="person-header">
        <h2>Person Information</h2>
        <div className={`status-badge ${person.status || "active"}`}>
          {person.status?.charAt(0).toUpperCase() + person.status?.slice(1) || "Active"}
        </div>
      </div>

      <div className="person-details">
        <div className="person-photo">
          <img
            src={person.photo || "/placeholder.svg?height=200&width=200"}
            alt={`Photo of ${person.name}`}
            className="photo-image"
          />
        </div>

        <div className="person-info">
          <div className="info-row">
            <div className="info-label">Name:</div>
            <div className="info-value">{person.name}</div>
          </div>

          <div className="info-row">
            <div className="info-label">ID:</div>
            <div className="info-value">{person.id}</div>
          </div>

          <div className="info-row">
            <div className="info-label">Role:</div>
            <div className="info-value">
              <span className={`role-badge role-${person.role.type}`}>
                {person.role.type.charAt(0).toUpperCase() + person.role.type.slice(1)}
              </span>
            </div>
          </div>

          <div className="info-row">
            <div className="info-label">ID Issue Date:</div>
            <div className="info-value">{formatDate(person.idIssueDate)}</div>
          </div>

          <div className="info-row">
            <div className="info-label">ID Expiry Date:</div>
            <div className={`info-value ${isExpired() ? "expired" : ""}`}>
              {formatDate(person.idExpiryDate)}
              {isExpired() && <span className="expired-tag">EXPIRED</span>}
            </div>
          </div>

          <div className="info-row">
            <div className="info-label">Last Entry:</div>
            <div className="info-value">{formatTime(person.lastEntry)}</div>
          </div>

          <div className="info-row">
            <div className="info-label">Last Exit:</div>
            <div className="info-value">{formatTime(person.lastExit)}</div>
          </div>

          <div className="info-row">
            <div className="info-label">Fouls:</div>
            <div className="info-value">
              <span className={`foul-count ${getFoulCount() > 0 ? "has-fouls" : ""}`}>
                {getFoulCount()}
                {getFoulCount() > 0 && (
                  <span className="foul-warning">
                    {getFoulCount() >= 3 ? " (ID Suspended)" : ` (${3 - getFoulCount()} more until suspension)`}
                  </span>
                )}
              </span>
            </div>
          </div>

          {person.suspensionDate && (
            <div className="info-row">
              <div className="info-label">Suspended On:</div>
              <div className="info-value suspended-date">{formatDate(person.suspensionDate)}</div>
            </div>
          )}

          {person.suspensionReason && (
            <div className="info-row">
              <div className="info-label">Reason:</div>
              <div className="info-value suspended-reason">{person.suspensionReason}</div>
            </div>
          )}
        </div>
      </div>

      <div className="entry-exit-actions">
        <button
          className="entry-button"
          onClick={onRecordEntry}
          disabled={person.status === "suspended"}
          title={person.status === "suspended" ? "ID is suspended" : ""}
        >
          Record Entry
        </button>
        <button
          className="exit-button"
          onClick={onRecordExit}
          disabled={person.status === "suspended"}
          title={person.status === "suspended" ? "ID is suspended" : ""}
        >
          Record Exit
        </button>
      </div>
    </div>
  )
}

// Foul History Component
const FoulHistory = ({ fouls }: { fouls?: Foul[] }) => {
  if (!fouls || fouls.length === 0) {
    return (
      <div className="foul-history-container">
        <h3>Foul History</h3>
        <p className="no-fouls-message">No fouls recorded.</p>
      </div>
    )
  }

  // Format date for display
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="foul-history-container">
      <h3>Foul History</h3>
      <div className="fouls-table-container">
        <table className="fouls-table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Type</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {fouls.map((foul) => (
              <tr key={foul.id}>
                <td>{formatDateTime(foul.timestamp)}</td>
                <td>
                  <span className={`foul-type foul-${foul.type}`}>
                    {foul.type === "after_hours_entry"
                      ? "After Hours Entry"
                      : foul.type === "after_hours_exit"
                        ? "After Hours Exit"
                        : "Other Violation"}
                  </span>
                </td>
                <td>{foul.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Item Registration Form Component
const ItemRegistrationForm = ({ userId }: { userId: string }) => {
  const [formData, setFormData] = useState({
    itemType: "",
    brand: "",
    model: "",
    serialNumber: "",
    description: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validate form
    if (!formData.itemType || !formData.brand || !formData.serialNumber) {
      setError("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)

    try {
      // Generate expiration date (1 year from now)
      const now = new Date()
      const expirationDate = new Date(now)
      expirationDate.setFullYear(now.getFullYear() + 1)

      // Create new item
      const newItem: RegisteredItem = {
        id: itemStore.generateItemId(),
        userId,
        itemType: formData.itemType,
        brand: formData.brand,
        model: formData.model,
        serialNumber: formData.serialNumber,
        description: formData.description,
        registrationDate: now.toISOString(),
        expirationDate: expirationDate.toISOString(),
        status: "active",
      }

      // Save item
      itemStore.addItem(newItem)

      // Reset form
      setFormData({
        itemType: "",
        brand: "",
        model: "",
        serialNumber: "",
        description: "",
      })

      setSuccess("Item registered successfully!")
    } catch (err) {
      setError("Failed to register item. Please try again.")
      console.error("Item registration error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="item-registration-container">
      <h3>Register New Item</h3>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="item-form">
        <div className="form-group">
          <label htmlFor="itemType" className="form-label">
            Item Type <span className="required">*</span>
          </label>
          <select
            id="itemType"
            name="itemType"
            className="form-input"
            value={formData.itemType}
            onChange={handleChange}
            required
          >
            <option value="">Select Item Type</option>
            <option value="Laptop">Laptop</option>
            <option value="Tablet">Tablet</option>
            <option value="Smartphone">Smartphone</option>
            <option value="Desktop">Desktop Computer</option>
            <option value="Monitor">Monitor</option>
            <option value="Printer">Printer</option>
            <option value="Camera">Camera</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="brand" className="form-label">
              Brand <span className="required">*</span>
            </label>
            <input
              type="text"
              id="brand"
              name="brand"
              className="form-input"
              value={formData.brand}
              onChange={handleChange}
              placeholder="e.g., Dell, Apple"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="model" className="form-label">
              Model
            </label>
            <input
              type="text"
              id="model"
              name="model"
              className="form-input"
              value={formData.model}
              onChange={handleChange}
              placeholder="e.g., XPS 15, MacBook Pro"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="serialNumber" className="form-label">
            Serial Number <span className="required">*</span>
          </label>
          <input
            type="text"
            id="serialNumber"
            name="serialNumber"
            className="form-input"
            value={formData.serialNumber}
            onChange={handleChange}
            placeholder="e.g., SN123456789"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            className="form-textarea"
            value={formData.description}
            onChange={handleChange}
            placeholder="Additional details about the item"
            rows={3}
          />
        </div>

        <button type="submit" className="submit-button" disabled={isSubmitting}>
          {isSubmitting ? "Registering..." : "Register Item"}
        </button>
      </form>
    </div>
  )
}

// Registered Items Display Component
const RegisteredItemsDisplay = ({ userId }: { userId: string }) => {
  const [items, setItems] = useState<RegisteredItem[]>([])
  const [selectedItem, setSelectedItem] = useState<RegisteredItem | null>(null)
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  // Load items on component mount and when store changes
  useEffect(() => {
    loadItems()

    // Subscribe to changes
    const unsubscribe = itemStore.subscribe(() => {
      loadItems()
    })

    // Cleanup subscription on unmount
    return unsubscribe
  }, [userId])

  // Load items for the user
  const loadItems = () => {
    const userItems = itemStore.getItemsByUserId(userId)
    setItems(userItems)
  }

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Handle check in
  const handleCheckIn = (item: RegisteredItem) => {
    setIsCheckingIn(true)
    setTimeout(() => {
      itemStore.checkInItem(item.id)
      setIsCheckingIn(false)
    }, 500)
  }

  // Handle check out
  const handleCheckOut = (item: RegisteredItem) => {
    setIsCheckingOut(true)
    setTimeout(() => {
      itemStore.checkOutItem(item.id)
      setIsCheckingOut(false)
    }, 500)
  }

  // Determine if item is expired
  const isExpired = (item: RegisteredItem) => {
    if (!item.expirationDate) return false
    return new Date(item.expirationDate) < new Date()
  }

  return (
    <div className="registered-items-container">
      <h3>Registered Items</h3>

      {items.length === 0 ? (
        <div className="no-items-message">No registered items found for this user.</div>
      ) : (
        <div className="items-table-container">
          <table className="items-table">
            <thead>
              <tr>
                <th>Item Type</th>
                <th>Brand/Model</th>
                <th>Serial Number</th>
                <th>Registration Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className={isExpired(item) ? "expired-item" : ""}>
                  <td>{item.itemType}</td>
                  <td>
                    {item.brand} {item.model}
                  </td>
                  <td>{item.serialNumber}</td>
                  <td>{formatDate(item.registrationDate)}</td>
                  <td>
                    <span className={`status-badge status-${item.status}`}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                    {isExpired(item) && <span className="expired-tag">EXPIRED</span>}
                  </td>
                  <td>
                    <div className="item-actions">
                      <button className="view-button" onClick={() => setSelectedItem(item)} title="View Details">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="action-icon"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      </button>
                      {item.status !== "checked-out" && (
                        <button
                          className="checkout-button"
                          onClick={() => handleCheckOut(item)}
                          disabled={isCheckingOut}
                          title="Check Out"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="action-icon"
                          >
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                          </svg>
                        </button>
                      )}
                      {item.status === "checked-out" && (
                        <button
                          className="checkin-button"
                          onClick={() => handleCheckIn(item)}
                          disabled={isCheckingIn}
                          title="Check In"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="action-icon"
                          >
                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                            <polyline points="10 17 15 12 10 7"></polyline>
                            <line x1="15" y1="12" x2="3" y2="12"></line>
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Item Details Modal */}
      {selectedItem && (
        <div className="modal-overlay">
          <div className="modal-container item-details-modal">
            <div className="modal-header">
              <h3>Item Details</h3>
              <button className="close-button" onClick={() => setSelectedItem(null)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="item-details">
                <div className="detail-row">
                  <div className="detail-label">ID:</div>
                  <div className="detail-value">{selectedItem.id}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Item Type:</div>
                  <div className="detail-value">{selectedItem.itemType}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Brand:</div>
                  <div className="detail-value">{selectedItem.brand}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Model:</div>
                  <div className="detail-value">{selectedItem.model || "N/A"}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Serial Number:</div>
                  <div className="detail-value">{selectedItem.serialNumber}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Description:</div>
                  <div className="detail-value">{selectedItem.description || "N/A"}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Registration Date:</div>
                  <div className="detail-value">{formatDate(selectedItem.registrationDate)}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Expiration Date:</div>
                  <div className={`detail-value ${isExpired(selectedItem) ? "expired" : ""}`}>
                    {formatDate(selectedItem.expirationDate)}
                    {isExpired(selectedItem) && <span className="expired-tag">EXPIRED</span>}
                  </div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Status:</div>
                  <div className="detail-value">
                    <span className={`status-badge status-${selectedItem.status}`}>
                      {selectedItem.status.charAt(0).toUpperCase() + selectedItem.status.slice(1)}
                    </span>
                  </div>
                </div>
                {selectedItem.lastCheckIn && (
                  <div className="detail-row">
                    <div className="detail-label">Last Check In:</div>
                    <div className="detail-value">{new Date(selectedItem.lastCheckIn).toLocaleString()}</div>
                  </div>
                )}
                {selectedItem.lastCheckOut && (
                  <div className="detail-row">
                    <div className="detail-label">Last Check Out:</div>
                    <div className="detail-value">{new Date(selectedItem.lastCheckOut).toLocaleString()}</div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="close-button" onClick={() => setSelectedItem(null)}>
                Close
              </button>
              {selectedItem.status !== "checked-out" ? (
                <button
                  className="checkout-button-large"
                  onClick={() => {
                    handleCheckOut(selectedItem)
                    setSelectedItem(null)
                  }}
                >
                  Check Out Item
                </button>
              ) : (
                <button
                  className="checkin-button-large"
                  onClick={() => {
                    handleCheckIn(selectedItem)
                    setSelectedItem(null)
                  }}
                >
                  Check In Item
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Main Security Gate Component
const SecurityGate = () => {
  const [scannedUserId, setScannedUserId] = useState<string | null>(null)
  const [scannedUser, setScannedUser] = useState<ExtendedUser | null>(null)
  const [showItemRegistration, setShowItemRegistration] = useState(false)
  const [scanHistory, setScanHistory] = useState<
    Array<{ userId: string; timestamp: string; action: "scan" | "entry" | "exit" | "foul" }>
  >([])
  const [notification, setNotification] = useState<{
    show: boolean
    type: "success" | "warning" | "error"
    message: string
  }>({ show: false, type: "success", message: "" })

  // Handle ID scan
  const handleScan = (userId: string) => {
    setScannedUserId(userId)
    const user = extendedUserStore.getExtendedUserById(userId)
    setScannedUser(user || null)

    // Add to scan history
    setScanHistory((prev) => [
      { userId, timestamp: new Date().toISOString(), action: "scan" },
      ...prev.slice(0, 9), // Keep only the last 10 entries
    ])

    // Reset item registration form visibility
    setShowItemRegistration(false)

    // Show notification if user is suspended
    if (user?.status === "suspended") {
      showNotification("error", `ID ${userId} is suspended. Please contact the discipline department.`)
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

  // Handle recording entry
  const handleRecordEntry = () => {
    if (scannedUserId) {
      const result = extendedUserStore.recordEntry(scannedUserId)
      setScannedUser(extendedUserStore.getExtendedUserById(scannedUserId) || null)

      // Add to scan history
      setScanHistory((prev) => [
        { userId: scannedUserId, timestamp: new Date().toISOString(), action: "entry" },
        ...prev.slice(0, 9), // Keep only the last 10 entries
      ])

      // Show notification based on result
      if (!result.success) {
        showNotification("error", result.message || "Failed to record entry")
      } else if (result.foul) {
        // Add foul to scan history
        setScanHistory((prev) => [
          { userId: scannedUserId, timestamp: new Date().toISOString(), action: "foul" },
          ...prev.slice(0, 9), // Keep only the last 10 entries
        ])

        showNotification("warning", result.message || "Entry recorded with foul")

        // Check if user is now suspended
        const updatedUser = extendedUserStore.getExtendedUserById(scannedUserId)
        if (updatedUser?.status === "suspended") {
          showNotification(
            "error",
            `ID ${scannedUserId} has been suspended due to 3 fouls. The discipline department has been notified.`,
          )
        }
      } else {
        showNotification("success", "Entry recorded successfully")
      }
    }
  }

  // Handle recording exit
  const handleRecordExit = () => {
    if (scannedUserId) {
      const result = extendedUserStore.recordExit(scannedUserId)
      setScannedUser(extendedUserStore.getExtendedUserById(scannedUserId) || null)

      // Add to scan history
      setScanHistory((prev) => [
        { userId: scannedUserId, timestamp: new Date().toISOString(), action: "exit" },
        ...prev.slice(0, 9), // Keep only the last 10 entries
      ])

      // Show notification based on result
      if (!result.success) {
        showNotification("error", result.message || "Failed to record exit")
      } else if (result.foul) {
        // Add foul to scan history
        setScanHistory((prev) => [
          { userId: scannedUserId, timestamp: new Date().toISOString(), action: "foul" },
          ...prev.slice(0, 9), // Keep only the last 10 entries
        ])

        showNotification("warning", result.message || "Exit recorded with foul")

        // Check if user is now suspended
        const updatedUser = extendedUserStore.getExtendedUserById(scannedUserId)
        if (updatedUser?.status === "suspended") {
          showNotification(
            "error",
            `ID ${scannedUserId} has been suspended due to 3 fouls. The discipline department has been notified.`,
          )
        }
      } else {
        showNotification("success", "Exit recorded successfully")
      }
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

  // Get current time status
  const getCurrentTimeStatus = () => {
    const now = new Date()
    const hours = now.getHours()

    // Allowed hours: 6am to 12am (midnight)
    if (hours >= 6 && hours < 24) {
      return { allowed: true, message: "Access Allowed (6:00 AM - 12:00 AM)" }
    } else {
      return { allowed: false, message: "After Hours (Access Restricted)" }
    }
  }

  const timeStatus = getCurrentTimeStatus()

  return (
    <div className="security-gate-container">
      <div className="security-header">
        <h1>Security Gate Access Control</h1>
        <p>Scan ID cards and manage personal items</p>
        <div className={`time-status ${timeStatus.allowed ? "time-allowed" : "time-restricted"}`}>
          {timeStatus.message}
        </div>
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

      <div className="security-content">
        <div className="left-panel">
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
                    <span className="history-action">
                      {entry.action === "scan"
                        ? "Scanned ID"
                        : entry.action === "entry"
                          ? "Recorded Entry"
                          : entry.action === "exit"
                            ? "Recorded Exit"
                            : "Recorded Foul"}
                    </span>
                    <span className="history-id">{entry.userId}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="right-panel">
          {scannedUser ? (
            <>
              <PersonInfoDisplay
                person={scannedUser}
                onRecordEntry={handleRecordEntry}
                onRecordExit={handleRecordExit}
              />

              {/* Foul History */}
              {scannedUser.fouls && scannedUser.fouls.length > 0 && <FoulHistory fouls={scannedUser.fouls} />}

              <div className="items-section">
                <div className="items-header">
                  <h2>Personal Items</h2>
                  <button
                    className="toggle-registration-button"
                    onClick={() => setShowItemRegistration(!showItemRegistration)}
                    disabled={scannedUser.status === "suspended"}
                  >
                    {showItemRegistration ? "Hide Registration Form" : "Register New Item"}
                  </button>
                </div>

                {showItemRegistration && <ItemRegistrationForm userId={scannedUser.id} />}

                <RegisteredItemsDisplay userId={scannedUser.id} />
              </div>
            </>
          ) : (
            <div className="no-user-scanned">
              <div className="no-user-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="no-user-svg"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <h2>No ID Card Scanned</h2>
              <p>Please scan an ID card or enter an ID manually to view person information</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SecurityGate
