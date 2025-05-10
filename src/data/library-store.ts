// This file serves as a mock database for storing library records
// In a real application, this would be replaced with a proper database

export interface LibraryRecord {
  id: string
  userId: string
  entryTime?: string
  exitTime?: string
  date: string // ISO date string (YYYY-MM-DD)
}

export interface Book {
  id: string
  title: string
  author: string
  isbn: string
  category: string
  available: boolean
  coverImage?: string
}

export interface BorrowRecord {
  id: string
  userId: string
  bookId: string
  borrowDate: string
  dueDate: string
  returnDate?: string
  status: "borrowed" | "returned" | "overdue"
  fine?: number
}

// Mock implementation of a library store
class LibraryStore {
  private libraryRecords: LibraryRecord[] = []
  private books: Book[] = []
  private borrowRecords: BorrowRecord[] = []
  private listeners: (() => void)[] = []

  // Load initial data from localStorage if available
  constructor() {
    try {
      const savedLibraryRecords = localStorage.getItem("dormitory_library_records")
      if (savedLibraryRecords) {
        this.libraryRecords = JSON.parse(savedLibraryRecords)
      }

      const savedBooks = localStorage.getItem("dormitory_library_books")
      if (savedBooks) {
        this.books = JSON.parse(savedBooks)
      } else {
        // Initialize with sample books
        this.initializeSampleBooks()
      }

      const savedBorrowRecords = localStorage.getItem("dormitory_borrow_records")
      if (savedBorrowRecords) {
        this.borrowRecords = JSON.parse(savedBorrowRecords)
      } else {
        // Initialize with sample borrow records
        this.initializeSampleBorrowRecords()
      }
    } catch (error) {
      console.error("Failed to load library data from localStorage:", error)
      // Initialize with sample data if loading fails
      this.initializeSampleBooks()
      this.initializeSampleBorrowRecords()
    }
  }

  // Initialize with sample books
  private initializeSampleBooks() {
    this.books = [
      {
        id: "BOOK001",
        title: "Introduction to Computer Science",
        author: "John Smith",
        isbn: "978-1234567890",
        category: "Computer Science",
        available: true,
        coverImage:
          "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      },
      {
        id: "BOOK002",
        title: "Advanced Mathematics",
        author: "Jane Doe",
        isbn: "978-0987654321",
        category: "Mathematics",
        available: true,
        coverImage:
          "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      },
      {
        id: "BOOK003",
        title: "Physics Fundamentals",
        author: "Robert Johnson",
        isbn: "978-5678901234",
        category: "Physics",
        available: false,
        coverImage:
          "https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      },
      {
        id: "BOOK004",
        title: "The Art of Literature",
        author: "Emily Williams",
        isbn: "978-2345678901",
        category: "Literature",
        available: true,
        coverImage:
          "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      },
      {
        id: "BOOK005",
        title: "World History",
        author: "Michael Brown",
        isbn: "978-3456789012",
        category: "History",
        available: true,
        coverImage:
          "https://images.unsplash.com/photo-1461360228754-6e81c478b882?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      },
      {
        id: "BOOK006",
        title: "Principles of Economics",
        author: "Sarah Miller",
        isbn: "978-4567890123",
        category: "Economics",
        available: true,
        coverImage:
          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      },
      {
        id: "BOOK007",
        title: "Introduction to Psychology",
        author: "David Wilson",
        isbn: "978-5678901234",
        category: "Psychology",
        available: true,
        coverImage:
          "https://images.unsplash.com/photo-1576671081837-49000212a370?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      },
      {
        id: "BOOK008",
        title: "Organic Chemistry",
        author: "Lisa Taylor",
        isbn: "978-6789012345",
        category: "Chemistry",
        available: false,
        coverImage:
          "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      },
      {
        id: "BOOK009",
        title: "Modern Art",
        author: "Thomas Anderson",
        isbn: "978-7890123456",
        category: "Art",
        available: true,
        coverImage:
          "https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      },
      {
        id: "BOOK010",
        title: "Environmental Science",
        author: "Jennifer Clark",
        isbn: "978-8901234567",
        category: "Environmental Science",
        available: true,
        coverImage:
          "https://images.unsplash.com/photo-1497644083578-611b798c60f3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      },
    ]
    this.saveToStorage()
  }

  // Initialize with sample borrow records
  private initializeSampleBorrowRecords() {
    const sampleUserIds = ["STU001", "STU002", "STU003", "STU004", "STU005"]
    const now = new Date()

    // Make BOOK003 and BOOK008 unavailable
    this.borrowRecords = [
      {
        id: "BOR001",
        userId: "STU001",
        bookId: "BOOK003",
        borrowDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        status: "borrowed",
      },
      {
        id: "BOR002",
        userId: "STU002",
        bookId: "BOOK008",
        borrowDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
        dueDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        status: "overdue",
        fine: 3 * 0.5, // $0.50 per day
      },
    ]

    // Add some returned books
    for (let i = 0; i < 5; i++) {
      const userId = sampleUserIds[Math.floor(Math.random() * sampleUserIds.length)]
      const bookId = `BOOK00${Math.floor(Math.random() * 7) + 1}`
      const borrowDate = new Date(now.getTime() - (20 + i * 5) * 24 * 60 * 60 * 1000)
      const returnDate = new Date(borrowDate.getTime() + (7 + Math.floor(Math.random() * 7)) * 24 * 60 * 60 * 1000)

      this.borrowRecords.push({
        id: `BOR00${3 + i}`,
        userId,
        bookId,
        borrowDate: borrowDate.toISOString(),
        dueDate: new Date(borrowDate.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days after borrow
        returnDate: returnDate.toISOString(),
        status: "returned",
      })
    }

    this.saveToStorage()
  }

  // Save data to localStorage
  private saveToStorage() {
    try {
      localStorage.setItem("dormitory_library_records", JSON.stringify(this.libraryRecords))
      localStorage.setItem("dormitory_library_books", JSON.stringify(this.books))
      localStorage.setItem("dormitory_borrow_records", JSON.stringify(this.borrowRecords))
    } catch (error) {
      console.error("Failed to save library data to localStorage:", error)
    }
  }

  // Get today's library record for a user
  getTodayLibraryRecord(userId: string): LibraryRecord | undefined {
    const today = new Date().toISOString().split("T")[0]
    return this.libraryRecords.find((record) => record.userId === userId && record.date === today)
  }

  // Record entry
  recordEntry(userId: string): { success: boolean; message?: string; record?: LibraryRecord } {
    const today = new Date().toISOString().split("T")[0]
    const now = new Date().toISOString()

    // Check if there's already an entry for today
    let record = this.getTodayLibraryRecord(userId)

    if (record) {
      // If already has entry but no exit, just return the record
      if (record.entryTime && !record.exitTime) {
        return {
          success: true,
          message: "Student is already in the library.",
          record,
        }
      }

      // If has both entry and exit, update with new entry
      if (record.entryTime && record.exitTime) {
        record.entryTime = now
        record.exitTime = undefined
        this.saveToStorage()
        this.notifyListeners()
        return {
          success: true,
          message: "Re-entry recorded successfully.",
          record,
        }
      }
    } else {
      // Create new record
      record = {
        id: `LIB${Date.now()}`,
        userId,
        entryTime: now,
        date: today,
      }

      this.libraryRecords.push(record)
      this.saveToStorage()
      this.notifyListeners()

      return {
        success: true,
        message: "Library entry recorded successfully.",
        record,
      }
    }

    return { success: false, message: "Failed to record entry." }
  }

  // Record exit
  recordExit(userId: string): { success: boolean; message?: string; record?: LibraryRecord } {
    const today = new Date().toISOString().split("T")[0]
    const now = new Date().toISOString()

    // Find today's record
    const recordIndex = this.libraryRecords.findIndex((record) => record.userId === userId && record.date === today)

    if (recordIndex >= 0) {
      const record = this.libraryRecords[recordIndex]

      // Check if already exited
      if (record.exitTime) {
        return {
          success: false,
          message: "Student has already exited the library today.",
          record,
        }
      }

      // Update exit time
      this.libraryRecords[recordIndex] = {
        ...record,
        exitTime: now,
      }

      this.saveToStorage()
      this.notifyListeners()

      return {
        success: true,
        message: "Library exit recorded successfully.",
        record: this.libraryRecords[recordIndex],
      }
    }

    return {
      success: false,
      message: "No entry record found for today. Cannot record exit.",
    }
  }

  // Get all books
  getAllBooks(): Book[] {
    return [...this.books]
  }

  // Get available books
  getAvailableBooks(): Book[] {
    return this.books.filter((book) => book.available)
  }

  // Get book by ID
  getBookById(bookId: string): Book | undefined {
    return this.books.find((book) => book.id === bookId)
  }

  // Search books
  searchBooks(query: string): Book[] {
    const lowercaseQuery = query.toLowerCase()
    return this.books.filter(
      (book) =>
        book.title.toLowerCase().includes(lowercaseQuery) ||
        book.author.toLowerCase().includes(lowercaseQuery) ||
        book.isbn.includes(query) ||
        book.category.toLowerCase().includes(lowercaseQuery),
    )
  }

  // Get borrow records by user ID
  getBorrowRecordsByUserId(userId: string): BorrowRecord[] {
    return this.borrowRecords.filter((record) => record.userId === userId)
  }

  // Get active borrow records by user ID (borrowed or overdue)
  getActiveBorrowRecordsByUserId(userId: string): BorrowRecord[] {
    return this.borrowRecords.filter(
      (record) => record.userId === userId && (record.status === "borrowed" || record.status === "overdue"),
    )
  }

  // Borrow a book
  borrowBook(userId: string, bookId: string): { success: boolean; message?: string; record?: BorrowRecord } {
    // Check if book exists and is available
    const bookIndex = this.books.findIndex((book) => book.id === bookId)

    if (bookIndex < 0) {
      return { success: false, message: "Book not found." }
    }

    if (!this.books[bookIndex].available) {
      return { success: false, message: "Book is not available for borrowing." }
    }

    // Check if user has too many books already
    const activeRecords = this.getActiveBorrowRecordsByUserId(userId)
    if (activeRecords.length >= 5) {
      return { success: false, message: "Maximum borrow limit reached (5 books)." }
    }

    // Check if user has any overdue books
    const hasOverdue = activeRecords.some((record) => record.status === "overdue")
    if (hasOverdue) {
      return { success: false, message: "Cannot borrow new books while having overdue items." }
    }

    // Create borrow record
    const now = new Date()
    const dueDate = new Date(now)
    dueDate.setDate(dueDate.getDate() + 14) // 14 days loan period

    const newRecord: BorrowRecord = {
      id: `BOR${Date.now()}`,
      userId,
      bookId,
      borrowDate: now.toISOString(),
      dueDate: dueDate.toISOString(),
      status: "borrowed",
    }

    // Update book availability
    this.books[bookIndex] = {
      ...this.books[bookIndex],
      available: false,
    }

    // Add borrow record
    this.borrowRecords.push(newRecord)

    this.saveToStorage()
    this.notifyListeners()

    return {
      success: true,
      message: "Book borrowed successfully.",
      record: newRecord,
    }
  }

  // Return a book
  returnBook(borrowId: string): { success: boolean; message?: string; fine?: number } {
    // Find borrow record
    const recordIndex = this.borrowRecords.findIndex((record) => record.id === borrowId)

    if (recordIndex < 0) {
      return { success: false, message: "Borrow record not found." }
    }

    const record = this.borrowRecords[recordIndex]

    // Check if already returned
    if (record.status === "returned") {
      return { success: false, message: "Book has already been returned." }
    }

    // Calculate fine if overdue
    const now = new Date()
    const dueDate = new Date(record.dueDate)
    let fine = 0

    if (now > dueDate) {
      const daysOverdue = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
      fine = daysOverdue * 0.5 // $0.50 per day
    }

    // Update borrow record
    this.borrowRecords[recordIndex] = {
      ...record,
      returnDate: now.toISOString(),
      status: "returned",
      fine: fine > 0 ? fine : undefined,
    }

    // Update book availability
    const bookIndex = this.books.findIndex((book) => book.id === record.bookId)
    if (bookIndex >= 0) {
      this.books[bookIndex] = {
        ...this.books[bookIndex],
        available: true,
      }
    }

    this.saveToStorage()
    this.notifyListeners()

    return {
      success: true,
      message: fine > 0 ? `Book returned successfully. Fine: $${fine.toFixed(2)}` : "Book returned successfully.",
      fine: fine > 0 ? fine : undefined,
    }
  }

  // Get library records by user ID
  getLibraryRecordsByUserId(userId: string): LibraryRecord[] {
    return this.libraryRecords.filter((record) => record.userId === userId)
  }

  // Subscribe to changes
  subscribe(listener: () => void): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  // Notify all listeners of changes
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener())
  }
}

// Create a singleton instance
const libraryStore = new LibraryStore()

export default libraryStore
