// This file serves as a mock database for storing registered items
// In a real application, this would be replaced with a proper database

export interface RegisteredItem {
    id: string
    userId: string
    itemType: string
    brand: string
    model: string
    serialNumber: string
    description: string
    registrationDate: string
    expirationDate?: string
    status: "active" | "expired" | "checked-out"
    lastCheckIn?: string
    lastCheckOut?: string
  }
  
  // Mock implementation of an item store
  class ItemStore {
    private items: RegisteredItem[] = []
    private listeners: (() => void)[] = []
  
    // Load initial data from localStorage if available
    constructor() {
      try {
        const savedItems = localStorage.getItem("dormitory_registered_items")
        if (savedItems) {
          this.items = JSON.parse(savedItems)
        } else {
          // Add some sample items if no data exists
          this.initializeSampleItems()
        }
      } catch (error) {
        console.error("Failed to load items from localStorage:", error)
        // Add some sample items if loading fails
        this.initializeSampleItems()
      }
    }
  
    // Initialize with sample data
    private initializeSampleItems() {
      this.items = [
        {
          id: "ITEM001",
          userId: "STU001",
          itemType: "Laptop",
          brand: "Dell",
          model: "XPS 15",
          serialNumber: "DL123456789",
          description: "Silver laptop with university sticker",
          registrationDate: "2023-01-15T08:30:00Z",
          expirationDate: "2024-01-15T08:30:00Z",
          status: "active",
          lastCheckIn: "2023-05-20T17:45:00Z",
          lastCheckOut: "2023-05-20T08:15:00Z",
        },
        {
          id: "ITEM002",
          userId: "STU002",
          itemType: "Tablet",
          brand: "Apple",
          model: "iPad Pro",
          serialNumber: "AP987654321",
          description: "Space gray iPad with blue case",
          registrationDate: "2023-02-10T10:15:00Z",
          expirationDate: "2024-02-10T10:15:00Z",
          status: "active",
          lastCheckIn: "2023-05-19T16:30:00Z",
          lastCheckOut: "2023-05-19T07:45:00Z",
        },
        {
          id: "ITEM003",
          userId: "STU003",
          itemType: "Smartphone",
          brand: "Samsung",
          model: "Galaxy S22",
          serialNumber: "SG567891234",
          description: "Black smartphone with clear case",
          registrationDate: "2023-03-05T14:20:00Z",
          expirationDate: "2024-03-05T14:20:00Z",
          status: "active",
          lastCheckIn: "2023-05-21T18:10:00Z",
          lastCheckOut: "2023-05-21T08:30:00Z",
        },
      ]
      this.saveToStorage()
    }
  
    // Save items to localStorage
    private saveToStorage() {
      try {
        localStorage.setItem("dormitory_registered_items", JSON.stringify(this.items))
      } catch (error) {
        console.error("Failed to save items to localStorage:", error)
      }
    }
  
    // Get all items
    getAllItems(): RegisteredItem[] {
      return [...this.items]
    }
  
    // Get items by user ID
    getItemsByUserId(userId: string): RegisteredItem[] {
      return this.items.filter((item) => item.userId === userId)
    }
  
    // Get an item by ID
    getItemById(id: string): RegisteredItem | undefined {
      return this.items.find((item) => item.id === id)
    }
  
    // Add a new item
    addItem(item: RegisteredItem): void {
      // Check if item with same ID already exists
      const existingItemIndex = this.items.findIndex((i) => i.id === item.id)
  
      if (existingItemIndex >= 0) {
        // Update existing item
        this.items[existingItemIndex] = item
      } else {
        // Add new item
        this.items.push(item)
      }
  
      this.saveToStorage()
      this.notifyListeners()
    }
  
    // Update an existing item
    updateItem(id: string, updates: Partial<RegisteredItem>): void {
      const itemIndex = this.items.findIndex((item) => item.id === id)
  
      if (itemIndex >= 0) {
        this.items[itemIndex] = { ...this.items[itemIndex], ...updates }
        this.saveToStorage()
        this.notifyListeners()
      }
    }
  
    // Delete an item
    deleteItem(id: string): void {
      this.items = this.items.filter((item) => item.id !== id)
      this.saveToStorage()
      this.notifyListeners()
    }
  
    // Check in an item
    checkInItem(id: string): void {
      const itemIndex = this.items.findIndex((item) => item.id === id)
  
      if (itemIndex >= 0) {
        this.items[itemIndex] = {
          ...this.items[itemIndex],
          status: "active",
          lastCheckIn: new Date().toISOString(),
        }
        this.saveToStorage()
        this.notifyListeners()
      }
    }
  
    // Check out an item
    checkOutItem(id: string): void {
      const itemIndex = this.items.findIndex((item) => item.id === id)
  
      if (itemIndex >= 0) {
        this.items[itemIndex] = {
          ...this.items[itemIndex],
          status: "checked-out",
          lastCheckOut: new Date().toISOString(),
        }
        this.saveToStorage()
        this.notifyListeners()
      }
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
  
    // Generate a unique item ID
    generateItemId(): string {
      const prefix = "ITEM"
      const existingIds = this.items.map((item) => item.id)
      let counter = this.items.length + 1
      let newId = `${prefix}${counter.toString().padStart(3, "0")}`
  
      // Make sure the ID is unique
      while (existingIds.includes(newId)) {
        counter++
        newId = `${prefix}${counter.toString().padStart(3, "0")}`
      }
  
      return newId
    }
  }
  
  // Create a singleton instance
  const itemStore = new ItemStore()
  
  export default itemStore
  