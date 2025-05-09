// This file serves as a mock database for storing registered users
// In a real application, this would be replaced with a proper database

export interface UserRole {
  type: "student" | "security" | "cafe" | "library" | "dormitory" | "discipline"
  details: Record<string, string>
}

export interface RegisteredUser {
  id: string
  name: string
  email: string
  phoneNumber: string
  role: UserRole
  entryDate: string
  registeredBy?: string
  attachmentUrl?: string
  attachmentType?: string
  attachmentName?: string
}

// Mock implementation of a user store
class UserStore {
  private users: RegisteredUser[] = []
  private listeners: (() => void)[] = []

  // Load initial data from localStorage if available
  constructor() {
    try {
      const savedUsers = localStorage.getItem("dormitory_registered_users")
      if (savedUsers) {
        this.users = JSON.parse(savedUsers)
      }
    } catch (error) {
      console.error("Failed to load users from localStorage:", error)
    }
  }

  // Save users to localStorage
  private saveToStorage() {
    try {
      localStorage.setItem("dormitory_registered_users", JSON.stringify(this.users))
    } catch (error) {
      console.error("Failed to save users to localStorage:", error)
    }
  }

  // Get all users
  getUsers(): RegisteredUser[] {
    return [...this.users]
  }

  // Get a user by ID
  getUserById(id: string): RegisteredUser | undefined {
    return this.users.find((user) => user.id === id)
  }

  // Get users by role
  getUsersByRole(role: string): RegisteredUser[] {
    return this.users.filter((user) => user.role.type === role)
  }

  // Add a new user
  addUser(user: RegisteredUser): void {
    // Check if user with same ID already exists
    const existingUserIndex = this.users.findIndex((u) => u.id === user.id)

    if (existingUserIndex >= 0) {
      // Update existing user
      this.users[existingUserIndex] = user
    } else {
      // Add new user
      this.users.push(user)
    }

    this.saveToStorage()
    this.notifyListeners()
  }

  // Update an existing user
  updateUser(id: string, updates: Partial<RegisteredUser>): void {
    const userIndex = this.users.findIndex((user) => user.id === id)

    if (userIndex >= 0) {
      this.users[userIndex] = { ...this.users[userIndex], ...updates }
      this.saveToStorage()
      this.notifyListeners()
    }
  }

  // Delete a user
  deleteUser(id: string): void {
    this.users = this.users.filter((user) => user.id !== id)
    this.saveToStorage()
    this.notifyListeners()
  }

  // Search users by name or email
  searchUsers(query: string): RegisteredUser[] {
    const lowercaseQuery = query.toLowerCase()
    return this.users.filter(
      (user) => user.name.toLowerCase().includes(lowercaseQuery) || user.email.toLowerCase().includes(lowercaseQuery),
    )
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
const userStore = new UserStore()

export default userStore

  