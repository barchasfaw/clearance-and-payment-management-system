"use client"

import type React from "react"
import { useState, useEffect } from "react"
import extendedUserStore, { type ExtendedUser } from "../data/extended-user-store"
import libraryStore, { type LibraryRecord, type Book, type BorrowRecord } from "../data/library-store"
import "./LibrarySystem.css"

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

// Student Information Display Component
const StudentInfoDisplay = ({
  student,
  onRecordEntry,
  onRecordExit,
}: {
  student: ExtendedUser
  onRecordEntry: () => void
  onRecordExit: () => void
}) => {
  const [libraryRecord, setLibraryRecord] = useState<LibraryRecord | undefined>(undefined)
  const [activeBorrows, setActiveBorrows] = useState<BorrowRecord[]>([])

  // Load library record and active borrows
  useEffect(() => {
    const record = libraryStore.getTodayLibraryRecord(student.id)
    setLibraryRecord(record)

    const borrows = libraryStore.getActiveBorrowRecordsByUserId(student.id)
    setActiveBorrows(borrows)

    // Subscribe to changes
    const unsubscribe = libraryStore.subscribe(() => {
      const updatedRecord = libraryStore.getTodayLibraryRecord(student.id)
      setLibraryRecord(updatedRecord)

      const updatedBorrows = libraryStore.getActiveBorrowRecordsByUserId(student.id)
      setActiveBorrows(updatedBorrows)
    })

    return unsubscribe
  }, [student.id])

  // Format time for display
  const formatTime = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Check if student is currently in the library
  const isInLibrary = libraryRecord?.entryTime && !libraryRecord?.exitTime

  // Check if student has overdue books
  const hasOverdueBooks = activeBorrows.some((borrow) => borrow.status === "overdue")

  return (
    <div className="student-info-container">
      <div className="student-header">
        <h2>Student Information</h2>
        <div className={`status-badge ${isInLibrary ? "status-in" : "status-out"}`}>
          {isInLibrary ? "Currently In Library" : "Not In Library"}
        </div>
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

          <div className="info-row">
            <div className="info-label">Today's Entry:</div>
            <div className="info-value">{formatTime(libraryRecord?.entryTime)}</div>
          </div>

          <div className="info-row">
            <div className="info-label">Today's Exit:</div>
            <div className="info-value">{formatTime(libraryRecord?.exitTime)}</div>
          </div>

          <div className="info-row">
            <div className="info-label">Books Borrowed:</div>
            <div className="info-value">
              <span className={`borrow-count ${hasOverdueBooks ? "has-overdue" : ""}`}>
                {activeBorrows.length}
                {hasOverdueBooks && <span className="overdue-warning"> (Has Overdue Books)</span>}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="entry-exit-actions">
        <button className="entry-button" onClick={onRecordEntry} disabled={isInLibrary}>
          Record Entry
        </button>
        <button className="exit-button" onClick={onRecordExit} disabled={!isInLibrary}>
          Record Exit
        </button>
      </div>
    </div>
  )
}

// Book Search and Borrowing Component
const BookBorrowing = ({ userId }: { userId: string }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [books, setBooks] = useState<Book[]>([])
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [notification, setNotification] = useState<{
    show: boolean
    type: "success" | "error"
    message: string
  }>({ show: false, type: "success", message: "" })

  // Load books on component mount
  useEffect(() => {
    loadBooks()

    // Subscribe to changes
    const unsubscribe = libraryStore.subscribe(() => {
      loadBooks()
    })

    return unsubscribe
  }, [])

  // Load books based on search query
  const loadBooks = () => {
    if (searchQuery.trim()) {
      setBooks(libraryStore.searchBooks(searchQuery))
    } else {
      setBooks(libraryStore.getAllBooks())
    }
  }

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // Apply search when query changes
  useEffect(() => {
    loadBooks()
  }, [searchQuery])

  // Handle borrow book
  const handleBorrowBook = (book: Book) => {
    if (!book.available) return
    setSelectedBook(book)
    setIsConfirmModalOpen(true)
  }

  // Confirm borrow book
  const confirmBorrowBook = () => {
    if (!selectedBook) return

    const result = libraryStore.borrowBook(userId, selectedBook.id)

    if (result.success) {
      showNotification("success", result.message || "Book borrowed successfully")
    } else {
      showNotification("error", result.message || "Failed to borrow book")
    }

    setIsConfirmModalOpen(false)
    setSelectedBook(null)
  }

  // Show notification
  const showNotification = (type: "success" | "error", message: string) => {
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

  return (
    <div className="book-borrowing-container">
      <div className="book-borrowing-header">
        <h3>Book Catalog</h3>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by title, author, or category..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
      </div>

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

      {books.length === 0 ? (
        <div className="no-books-message">
          <p>No books found. {searchQuery ? "Try adjusting your search query." : "The library catalog is empty."}</p>
        </div>
      ) : (
        <div className="books-grid">
          {books.map((book) => (
            <div key={book.id} className={`book-card ${!book.available ? "book-unavailable" : ""}`}>
              <div className="book-cover">
                <img
                  src={book.coverImage || "/placeholder.svg?height=200&width=150"}
                  alt={`Cover of ${book.title}`}
                  className="cover-image"
                />
                {!book.available && <div className="unavailable-overlay">Unavailable</div>}
              </div>
              <div className="book-details">
                <h4 className="book-title">{book.title}</h4>
                <p className="book-author">by {book.author}</p>
                <p className="book-category">{book.category}</p>
                <button className="borrow-button" onClick={() => handleBorrowBook(book)} disabled={!book.available}>
                  {book.available ? "Borrow" : "Unavailable"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm Borrow Modal */}
      {isConfirmModalOpen && selectedBook && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Confirm Borrowing</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to borrow the following book?</p>
              <p>
                <strong>Title:</strong> {selectedBook.title}
              </p>
              <p>
                <strong>Author:</strong> {selectedBook.author}
              </p>
              <p>
                <strong>Category:</strong> {selectedBook.category}
              </p>
              <p className="borrow-terms">
                This book will be due in 14 days. Late returns will incur a fine of $0.50 per day.
              </p>
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={() => setIsConfirmModalOpen(false)}>
                Cancel
              </button>
              <button className="confirm-button" onClick={confirmBorrowBook}>
                Confirm Borrow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Borrowing History Component
const BorrowingHistory = ({ userId }: { userId: string }) => {
  const [borrowRecords, setBorrowRecords] = useState<BorrowRecord[]>([])
  const [books, setBooks] = useState<Record<string, Book>>({})
  const [selectedRecord, setSelectedRecord] = useState<BorrowRecord | null>(null)
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false)
  const [notification, setNotification] = useState<{
    show: boolean
    type: "success" | "error"
    message: string
  }>({ show: false, type: "success", message: "" })

  // Load borrow records on component mount
  useEffect(() => {
    loadBorrowRecords()

    // Subscribe to changes
    const unsubscribe = libraryStore.subscribe(() => {
      loadBorrowRecords()
    })

    return unsubscribe
  }, [userId])

  // Load borrow records for the user
  const loadBorrowRecords = () => {
    const records = libraryStore.getBorrowRecordsByUserId(userId)
    setBorrowRecords(records)

    // Load book details for each record
    const bookDetails: Record<string, Book> = {}
    records.forEach((record) => {
      const book = libraryStore.getBookById(record.bookId)
      if (book) {
        bookDetails[record.bookId] = book
      }
    })
    setBooks(bookDetails)
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  // Calculate days until due or days overdue
  const calculateDaysStatus = (record: BorrowRecord) => {
    if (record.status === "returned") {
      return { days: 0, isOverdue: false }
    }

    const now = new Date()
    const dueDate = new Date(record.dueDate)
    const diffTime = dueDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return {
      days: Math.abs(diffDays),
      isOverdue: diffDays < 0,
    }
  }

  // Handle return book
  const handleReturnBook = (record: BorrowRecord) => {
    setSelectedRecord(record)
    setIsReturnModalOpen(true)
  }

  // Confirm return book
  const confirmReturnBook = () => {
    if (!selectedRecord) return

    const result = libraryStore.returnBook(selectedRecord.id)

    if (result.success) {
      showNotification("success", result.message || "Book returned successfully")
    } else {
      showNotification("error", result.message || "Failed to return book")
    }

    setIsReturnModalOpen(false)
    setSelectedRecord(null)
  }

  // Show notification
  const showNotification = (type: "success" | "error", message: string) => {
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

  // Group records by status
  const activeRecords = borrowRecords.filter((record) => record.status === "borrowed" || record.status === "overdue")

  const returnedRecords = borrowRecords.filter((record) => record.status === "returned")

  return (
    <div className="borrowing-history-container">
      <div className="borrowing-history-header">
        <h3>Borrowing History</h3>
      </div>

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

      {borrowRecords.length === 0 ? (
        <div className="no-records-message">
          <p>No borrowing records found for this student.</p>
        </div>
      ) : (
        <div className="borrowing-sections">
          {/* Active Borrows Section */}
          <div className="borrowing-section">
            <h4 className="section-title">Currently Borrowed Books</h4>
            {activeRecords.length === 0 ? (
              <p className="no-active-borrows">No books currently borrowed.</p>
            ) : (
              <div className="active-borrows">
                {activeRecords.map((record) => {
                  const book = books[record.bookId]
                  const { days, isOverdue } = calculateDaysStatus(record)

                  return (
                    <div key={record.id} className={`borrow-card ${isOverdue ? "overdue" : ""}`}>
                      <div className="borrow-book-info">
                        <div className="book-cover-small">
                          <img
                            src={book?.coverImage || "/placeholder.svg?height=100&width=75"}
                            alt={`Cover of ${book?.title || "book"}`}
                            className="cover-image-small"
                          />
                        </div>
                        <div className="borrow-details">
                          <h5 className="borrow-book-title">{book?.title || "Unknown Book"}</h5>
                          <p className="borrow-book-author">by {book?.author || "Unknown Author"}</p>
                          <p className="borrow-dates">
                            Borrowed: {formatDate(record.borrowDate)}
                            <br />
                            Due: {formatDate(record.dueDate)}
                          </p>
                          <div className={`due-status ${isOverdue ? "overdue-status" : "due-status"}`}>
                            {isOverdue
                              ? `Overdue by ${days} day${days !== 1 ? "s" : ""} ($${(days * 0.5).toFixed(2)} fine)`
                              : `Due in ${days} day${days !== 1 ? "s" : ""}`}
                          </div>
                        </div>
                      </div>
                      <button className="return-button" onClick={() => handleReturnBook(record)}>
                        Return Book
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Returned Books Section */}
          {returnedRecords.length > 0 && (
            <div className="borrowing-section">
              <h4 className="section-title">Previously Returned Books</h4>
              <div className="returned-borrows">
                <table className="returned-table">
                  <thead>
                    <tr>
                      <th>Book Title</th>
                      <th>Borrowed</th>
                      <th>Returned</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {returnedRecords.map((record) => {
                      const book = books[record.bookId]

                      return (
                        <tr key={record.id}>
                          <td>{book?.title || "Unknown Book"}</td>
                          <td>{formatDate(record.borrowDate)}</td>
                          <td>{record.returnDate ? formatDate(record.returnDate) : "N/A"}</td>
                          <td>
                            <span className="status-returned">
                              Returned
                              {record.fine ? ` (Fine: $${record.fine.toFixed(2)})` : ""}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Return Book Modal */}
      {isReturnModalOpen && selectedRecord && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Confirm Return</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to return the following book?</p>
              <p>
                <strong>Title:</strong> {books[selectedRecord.bookId]?.title || "Unknown Book"}
              </p>
              <p>
                <strong>Borrowed:</strong> {formatDate(selectedRecord.borrowDate)}
              </p>
              <p>
                <strong>Due:</strong> {formatDate(selectedRecord.dueDate)}
              </p>

              {calculateDaysStatus(selectedRecord).isOverdue && (
                <p className="return-warning">
                  This book is overdue. A fine of ${(calculateDaysStatus(selectedRecord).days * 0.5).toFixed(2)} will be
                  applied.
                </p>
              )}
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={() => setIsReturnModalOpen(false)}>
                Cancel
              </button>
              <button className="confirm-button" onClick={confirmReturnBook}>
                Confirm Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Library Entry/Exit History Component
const LibraryHistory = ({ userId }: { userId: string }) => {
  const [libraryRecords, setLibraryRecords] = useState<LibraryRecord[]>([])
  const [filterDays, setFilterDays] = useState<number>(7)

  // Load library records
  useEffect(() => {
    loadLibraryRecords()

    // Subscribe to changes
    const unsubscribe = libraryStore.subscribe(() => {
      loadLibraryRecords()
    })

    return unsubscribe
  }, [userId, filterDays])

  // Load library records for the user
  const loadLibraryRecords = () => {
    const allRecords = libraryStore.getLibraryRecordsByUserId(userId)

    // Filter by date range
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - filterDays)
    const cutoffDateStr = cutoffDate.toISOString().split("T")[0]

    const filteredRecords = allRecords.filter((record) => {
      return record.date >= cutoffDateStr
    })

    // Sort by date (newest first)
    filteredRecords.sort((a, b) => {
      return b.date.localeCompare(a.date)
    })

    setLibraryRecords(filteredRecords)
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
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

  // Calculate duration
  const calculateDuration = (entryTime?: string, exitTime?: string) => {
    if (!entryTime || !exitTime) return "N/A"

    const entry = new Date(entryTime).getTime()
    const exit = new Date(exitTime).getTime()
    const durationMs = exit - entry

    const hours = Math.floor(durationMs / (1000 * 60 * 60))
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))

    return `${hours}h ${minutes}m`
  }

  return (
    <div className="library-history-container">
      <div className="library-history-header">
        <h3>Library Visit History</h3>
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

      {libraryRecords.length === 0 ? (
        <div className="no-records-message">
          <p>No library visit records found for this time period.</p>
        </div>
      ) : (
        <div className="library-records-table-container">
          <table className="library-records-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Entry Time</th>
                <th>Exit Time</th>
                <th>Duration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {libraryRecords.map((record) => (
                <tr key={record.id}>
                  <td>{formatDate(record.date)}</td>
                  <td>{formatTime(record.entryTime)}</td>
                  <td>{formatTime(record.exitTime)}</td>
                  <td>{calculateDuration(record.entryTime, record.exitTime)}</td>
                  <td>
                    {record.entryTime && !record.exitTime ? (
                      <span className="status-in-progress">In Progress</span>
                    ) : record.entryTime && record.exitTime ? (
                      <span className="status-completed">Completed</span>
                    ) : (
                      <span className="status-incomplete">Incomplete</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// Main Library System Component
const LibrarySystem = () => {
  const [scannedUserId, setScannedUserId] = useState<string | null>(null)
  const [scannedStudent, setScannedStudent] = useState<ExtendedUser | null>(null)
  const [activeTab, setActiveTab] = useState<"borrow" | "history" | "visits">("borrow")
  const [scanHistory, setScanHistory] = useState<
    Array<{ userId: string; timestamp: string; action: "scan" | "entry" | "exit" | "borrow" | "return" }>
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

  // Handle recording entry
  const handleRecordEntry = () => {
    if (!scannedUserId) return

    const result = libraryStore.recordEntry(scannedUserId)

    if (result.success) {
      showNotification("success", result.message || "Library entry recorded successfully")

      // Add to scan history
      setScanHistory((prev) => [
        { userId: scannedUserId, timestamp: new Date().toISOString(), action: "entry" },
        ...prev.slice(0, 9), // Keep only the last 10 entries
      ])
    } else {
      showNotification("error", result.message || "Failed to record entry")
    }
  }

  // Handle recording exit
  const handleRecordExit = () => {
    if (!scannedUserId) return

    const result = libraryStore.recordExit(scannedUserId)

    if (result.success) {
      showNotification("success", result.message || "Library exit recorded successfully")

      // Add to scan history
      setScanHistory((prev) => [
        { userId: scannedUserId, timestamp: new Date().toISOString(), action: "exit" },
        ...prev.slice(0, 9), // Keep only the last 10 entries
      ])
    } else {
      showNotification("error", result.message || "Failed to record exit")
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
    <div className="library-system-container">
      <div className="library-header">
        <h1>Library Management System</h1>
        <p>Scan student ID cards to record library visits and manage book borrowing</p>
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

      <div className="library-content">
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
                            : entry.action === "borrow"
                              ? "Borrowed Book"
                              : "Returned Book"}
                    </span>
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
              <StudentInfoDisplay
                student={scannedStudent}
                onRecordEntry={handleRecordEntry}
                onRecordExit={handleRecordExit}
              />

              <div className="tabs-container">
                <div className="tabs-header">
                  <button
                    className={`tab-button ${activeTab === "borrow" ? "active" : ""}`}
                    onClick={() => setActiveTab("borrow")}
                  >
                    Borrow Books
                  </button>
                  <button
                    className={`tab-button ${activeTab === "history" ? "active" : ""}`}
                    onClick={() => setActiveTab("history")}
                  >
                    Borrowing History
                  </button>
                  <button
                    className={`tab-button ${activeTab === "visits" ? "active" : ""}`}
                    onClick={() => setActiveTab("visits")}
                  >
                    Library Visits
                  </button>
                </div>

                <div className="tabs-content">
                  {activeTab === "borrow" && <BookBorrowing userId={scannedStudent.id} />}
                  {activeTab === "history" && <BorrowingHistory userId={scannedStudent.id} />}
                  {activeTab === "visits" && <LibraryHistory userId={scannedStudent.id} />}
                </div>
              </div>
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
              <p>
                Please scan a student ID card or enter an ID manually to view student information and manage library
                activities
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LibrarySystem
