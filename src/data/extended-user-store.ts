// This file extends the user store with additional information needed for the security gate system
import userStore, { type RegisteredUser } from "./user-store"

export interface Foul {
  id: string
  userId: string
  timestamp: string
  type: "after_hours_entry" | "after_hours_exit" | "other"
  description: string
  reportedBy?: string
}

export interface ExtendedUser extends RegisteredUser {
  photo?: string
  idIssueDate?: string
  idExpiryDate?: string
  status?: "active" | "inactive" | "suspended"
  accessLevel?: "student" | "staff" | "visitor" | "contractor"
  lastEntry?: string
  lastExit?: string
  fouls?: Foul[]
  suspensionDate?: string
  suspensionReason?: string
}

// Sample user photos (base64 encoded or URLs)
const samplePhotos = [
  "https://randomuser.me/api/portraits/men/1.jpg",
  "https://randomuser.me/api/portraits/women/2.jpg",
  "https://randomuser.me/api/portraits/men/3.jpg",
  "https://randomuser.me/api/portraits/women/4.jpg",
  "https://randomuser.me/api/portraits/men/5.jpg",
  "https://randomuser.me/api/portraits/women/6.jpg",
]

// Mock implementation of an extended user store
class ExtendedUserStore {
  private extendedUsers: Record<string, Partial<ExtendedUser>> = {}
  private fouls: Foul[] = []
  private listeners: (() => void)[] = []

  // Load initial data from localStorage if available
  constructor() {
    try {
      const savedExtendedUsers = localStorage.getItem("dormitory_extended_users")
      if (savedExtendedUsers) {
        this.extendedUsers = JSON.parse(savedExtendedUsers)
      } else {
        // Initialize with sample data
        this.initializeSampleData()
      }

      const savedFouls = localStorage.getItem("dormitory_fouls")
      if (savedFouls) {
        this.fouls = JSON.parse(savedFouls)
      }
    } catch (error) {
      console.error("Failed to load extended users from localStorage:", error)
      // Initialize with sample data if loading fails
      this.initializeSampleData()
    }
  }

  // Initialize with sample data
  private initializeSampleData() {
    // Create sample student users
    const sampleStudentIds = ["STU001", "STU002", "STU003", "STU004", "STU005"]

    sampleStudentIds.forEach((id, index) => {
      const now = new Date()
      const issueDate = new Date(now)
      issueDate.setFullYear(now.getFullYear() - 1)

      const expiryDate = new Date(now)
      expiryDate.setFullYear(now.getFullYear() + 3)

      this.extendedUsers[id] = {
        id,
        name: `Student ${index + 1}`,
        email: `student${index + 1}@example.com`,
        phoneNumber: `123-456-${7890 + index}`,
        role: {
          type: "student",
          details: {
            grade: `${10 + (index % 3)}`,
            admissionNumber: `ADM${10000 + index}`,
            department: ["Science", "Arts", "Commerce", "Engineering", "Medicine"][index % 5],
          },
        },
        entryDate: issueDate.toISOString(),
        photo: samplePhotos[index % samplePhotos.length],
        idIssueDate: issueDate.toISOString(),
        idExpiryDate: expiryDate.toISOString(),
        status: "active",
        accessLevel: "student",
        lastEntry: index % 2 === 0 ? new Date().toISOString() : undefined,
        lastExit: index % 2 === 1 ? new Date().toISOString() : undefined,
        fouls: [],
      }
    })

    // Create sample staff users
    const staffRoles = ["security", "cafe", "library", "dormitory", "discipline"]

    staffRoles.forEach((role, index) => {
      const id = `STAFF${index + 1}`
      const now = new Date()
      const issueDate = new Date(now)
      issueDate.setFullYear(now.getFullYear() - 2)

      const expiryDate = new Date(now)
      expiryDate.setFullYear(now.getFullYear() + 5)

      this.extendedUsers[id] = {
        id,
        name: `${role.charAt(0).toUpperCase() + role.slice(1)} Staff ${index + 1}`,
        email: `${role}${index + 1}@example.com`,
        phoneNumber: `987-654-${3210 - index}`,
        role: {
          type: role as any,
          details: {
            employeeId: `EMP${20000 + index}`,
            position: `Senior ${role.charAt(0).toUpperCase() + role.slice(1)} Officer`,
          },
        },
        entryDate: issueDate.toISOString(),
        photo: samplePhotos[(index + 3) % samplePhotos.length],
        idIssueDate: issueDate.toISOString(),
        idExpiryDate: expiryDate.toISOString(),
        status: "active",
        accessLevel: "staff",
        lastEntry: index % 2 === 0 ? new Date().toISOString() : undefined,
        lastExit: index % 2 === 1 ? new Date().toISOString() : undefined,
        fouls: [],
      }
    })

    this.saveToStorage()
  }

  // Save extended users to localStorage
  private saveToStorage() {
    try {
      localStorage.setItem("dormitory_extended_users", JSON.stringify(this.extendedUsers))
      localStorage.setItem("dormitory_fouls", JSON.stringify(this.fouls))
    } catch (error) {
      console.error("Failed to save extended users to localStorage:", error)
    }
  }

  // Get all extended users
  getAllExtendedUsers(): ExtendedUser[] {
    // Combine base user data with extended data
    const baseUsers = userStore.getUsers()
    const extendedUsers: ExtendedUser[] = []

    // First add users from the base store
    baseUsers.forEach((user) => {
      const extendedData = this.extendedUsers[user.id] || {}
      extendedUsers.push({
        ...user,
        ...extendedData,
      })
    })

    // Then add sample users that might not be in the base store
    Object.values(this.extendedUsers).forEach((extendedUser) => {
      if (extendedUser.id && !extendedUsers.some((u) => u.id === extendedUser.id)) {
        extendedUsers.push(extendedUser as ExtendedUser)
      }
    })

    return extendedUsers
  }

  // Get an extended user by ID
  getExtendedUserById(id: string): ExtendedUser | undefined {
    // Try to get from base store first
    const baseUser = userStore.getUserById(id)
    const extendedData = this.extendedUsers[id] || {}

    if (baseUser) {
      return {
        ...baseUser,
        ...extendedData,
      }
    } else if (extendedData.id) {
      // Return sample user if not in base store
      return extendedData as ExtendedUser
    }

    return undefined
  }

  // Update extended user data
  updateExtendedUser(id: string, updates: Partial<ExtendedUser>): void {
    this.extendedUsers[id] = {
      ...this.extendedUsers[id],
      ...updates,
    }

    this.saveToStorage()
    this.notifyListeners()
  }

  // Check if current time is within allowed hours (6am to 12am)
  private isWithinAllowedHours(): boolean {
    const now = new Date()
    const hours = now.getHours()

    // Allowed hours: 6am to 12am (midnight)
    return hours >= 6 && hours < 24
  }

  // Record entry
  recordEntry(id: string): { success: boolean; message?: string; foul?: Foul } {
    const now = new Date()
    const user = this.getExtendedUserById(id)

    // Check if user exists and is not suspended
    if (!user) {
      return { success: false, message: "User not found" }
    }

    if (user.status === "suspended") {
      return { success: false, message: "ID is suspended. Please contact the discipline department." }
    }

    // Update last entry time
    this.extendedUsers[id] = {
      ...this.extendedUsers[id],
      lastEntry: now.toISOString(),
    }

    // Check if entry is within allowed hours
    if (!this.isWithinAllowedHours()) {
      // Create a foul record
      const foul: Foul = {
        id: `FOUL${Date.now()}`,
        userId: id,
        timestamp: now.toISOString(),
        type: "after_hours_entry",
        description: `After-hours entry at ${now.toLocaleTimeString()}`,
      }

      // Add foul to the user's record
      if (!this.extendedUsers[id].fouls) {
        this.extendedUsers[id].fouls = []
      }
      this.extendedUsers[id].fouls!.push(foul)
      this.fouls.push(foul)

      // Check if user has 3 or more fouls
      if (this.extendedUsers[id].fouls!.length >= 3) {
        // Suspend the user
        this.extendedUsers[id].status = "suspended"
        this.extendedUsers[id].suspensionDate = now.toISOString()
        this.extendedUsers[id].suspensionReason = "Three after-hours violations"

        // In a real system, this would trigger a notification to the discipline department
        console.log(`User ${id} has been suspended for three after-hours violations`)
      }

      this.saveToStorage()
      this.notifyListeners()

      return {
        success: true,
        message: "Entry recorded, but outside allowed hours (6am-12am). This has been registered as a foul.",
        foul,
      }
    }

    this.saveToStorage()
    this.notifyListeners()

    return { success: true }
  }

  // Record exit
  recordExit(id: string): { success: boolean; message?: string; foul?: Foul } {
    const now = new Date()
    const user = this.getExtendedUserById(id)

    // Check if user exists and is not suspended
    if (!user) {
      return { success: false, message: "User not found" }
    }

    if (user.status === "suspended") {
      return { success: false, message: "ID is suspended. Please contact the discipline department." }
    }

    // Update last exit time
    this.extendedUsers[id] = {
      ...this.extendedUsers[id],
      lastExit: now.toISOString(),
    }

    // Check if exit is within allowed hours
    if (!this.isWithinAllowedHours()) {
      // Create a foul record
      const foul: Foul = {
        id: `FOUL${Date.now()}`,
        userId: id,
        timestamp: now.toISOString(),
        type: "after_hours_exit",
        description: `After-hours exit at ${now.toLocaleTimeString()}`,
      }

      // Add foul to the user's record
      if (!this.extendedUsers[id].fouls) {
        this.extendedUsers[id].fouls = []
      }
      this.extendedUsers[id].fouls!.push(foul)
      this.fouls.push(foul)

      // Check if user has 3 or more fouls
      if (this.extendedUsers[id].fouls!.length >= 3) {
        // Suspend the user
        this.extendedUsers[id].status = "suspended"
        this.extendedUsers[id].suspensionDate = now.toISOString()
        this.extendedUsers[id].suspensionReason = "Three after-hours violations"

        // In a real system, this would trigger a notification to the discipline department
        console.log(`User ${id} has been suspended for three after-hours violations`)
      }

      this.saveToStorage()
      this.notifyListeners()

      return {
        success: true,
        message: "Exit recorded, but outside allowed hours (6am-12am). This has been registered as a foul.",
        foul,
      }
    }

    this.saveToStorage()
    this.notifyListeners()

    return { success: true }
  }

  // Get all fouls
  getAllFouls(): Foul[] {
    return [...this.fouls]
  }

  // Get fouls by user ID
  getFoulsByUserId(userId: string): Foul[] {
    return this.fouls.filter((foul) => foul.userId === userId)
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
const extendedUserStore = new ExtendedUserStore()

export default extendedUserStore
