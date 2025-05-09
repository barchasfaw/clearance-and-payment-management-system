// This file serves as a mock database for storing meal records
// In a real application, this would be replaced with a proper database

export type MealType = "breakfast" | "lunch" | "dinner"

export interface MealRecord {
  id: string
  userId: string
  mealType: MealType
  timestamp: string
  cafeteriaId?: string
  serverId?: string
}

export interface MealTimeWindow {
  mealType: MealType
  startTime: string // Format: "HH:MM" in 24-hour format
  endTime: string // Format: "HH:MM" in 24-hour format
  displayName: string
}

// Define meal time windows
export const MEAL_TIME_WINDOWS: MealTimeWindow[] = [
  {
    mealType: "breakfast",
    startTime: "06:00",
    endTime: "08:30",
    displayName: "Breakfast",
  },
  {
    mealType: "lunch",
    startTime: "11:30",
    endTime: "13:15",
    displayName: "Lunch",
  },
  {
    mealType: "dinner",
    startTime: "17:15",
    endTime: "19:00",
    displayName: "Dinner",
  },
]

// Mock implementation of a meal record store
class MealStore {
  private mealRecords: MealRecord[] = []
  private listeners: (() => void)[] = []

  // Load initial data from localStorage if available
  constructor() {
    try {
      const savedMealRecords = localStorage.getItem("dormitory_meal_records")
      if (savedMealRecords) {
        this.mealRecords = JSON.parse(savedMealRecords)
      } else {
        // Initialize with sample data
        this.initializeSampleData()
      }
    } catch (error) {
      console.error("Failed to load meal records from localStorage:", error)
      // Initialize with sample data if loading fails
      this.initializeSampleData()
    }
  }

  // Initialize with sample data
  private initializeSampleData() {
    // Create some sample meal records for the past few days
    const sampleUserIds = ["STU001", "STU002", "STU003", "STU004", "STU005"]
    const now = new Date()

    // Generate records for the past 3 days
    for (let day = 0; day < 3; day++) {
      const date = new Date(now)
      date.setDate(date.getDate() - day)

      // Reset time to start of day
      date.setHours(0, 0, 0, 0)

      // For each user, create some random meal records
      sampleUserIds.forEach((userId) => {
        // Breakfast (around 7 AM)
        if (Math.random() > 0.3) {
          const breakfastTime = new Date(date)
          breakfastTime.setHours(7, Math.floor(Math.random() * 30), 0, 0)

          this.mealRecords.push({
            id: `MEAL${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            userId,
            mealType: "breakfast",
            timestamp: breakfastTime.toISOString(),
            cafeteriaId: "CAFE001",
            serverId: "STAFF2",
          })
        }

        // Lunch (around 12 PM)
        if (Math.random() > 0.2) {
          const lunchTime = new Date(date)
          lunchTime.setHours(12, Math.floor(Math.random() * 45), 0, 0)

          this.mealRecords.push({
            id: `MEAL${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            userId,
            mealType: "lunch",
            timestamp: lunchTime.toISOString(),
            cafeteriaId: "CAFE001",
            serverId: "STAFF2",
          })
        }

        // Dinner (around 6 PM)
        if (Math.random() > 0.25) {
          const dinnerTime = new Date(date)
          dinnerTime.setHours(18, Math.floor(Math.random() * 45), 0, 0)

          this.mealRecords.push({
            id: `MEAL${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            userId,
            mealType: "dinner",
            timestamp: dinnerTime.toISOString(),
            cafeteriaId: "CAFE001",
            serverId: "STAFF2",
          })
        }
      })
    }

    this.saveToStorage()
  }

  // Save meal records to localStorage
  private saveToStorage() {
    try {
      localStorage.setItem("dormitory_meal_records", JSON.stringify(this.mealRecords))
    } catch (error) {
      console.error("Failed to save meal records to localStorage:", error)
    }
  }

  // Get all meal records
  getAllMealRecords(): MealRecord[] {
    return [...this.mealRecords]
  }

  // Get meal records by user ID
  getMealRecordsByUserId(userId: string): MealRecord[] {
    return this.mealRecords.filter((record) => record.userId === userId)
  }

  // Get meal records by user ID and date
  getMealRecordsByUserIdAndDate(userId: string, date: Date): MealRecord[] {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    return this.mealRecords.filter((record) => {
      const recordDate = new Date(record.timestamp)
      return record.userId === userId && recordDate >= startOfDay && recordDate <= endOfDay
    })
  }

  // Check if user has already had a specific meal today
  hasUserHadMealToday(userId: string, mealType: MealType): boolean {
    const today = new Date()
    const startOfDay = new Date(today)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(today)
    endOfDay.setHours(23, 59, 59, 999)

    return this.mealRecords.some((record) => {
      const recordDate = new Date(record.timestamp)
      return (
        record.userId === userId && record.mealType === mealType && recordDate >= startOfDay && recordDate <= endOfDay
      )
    })
  }

  // Get current meal type based on time
  getCurrentMealType(): { mealType: MealType | null; timeWindow: MealTimeWindow | null; isWithinMealTime: boolean } {
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTimeString = `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`

    for (const timeWindow of MEAL_TIME_WINDOWS) {
      if (currentTimeString >= timeWindow.startTime && currentTimeString <= timeWindow.endTime) {
        return {
          mealType: timeWindow.mealType,
          timeWindow,
          isWithinMealTime: true,
        }
      }
    }

    // If not within any meal time, find the next upcoming meal
    let nextMeal: MealTimeWindow | null = null
    let minTimeDiff = Number.POSITIVE_INFINITY

    for (const timeWindow of MEAL_TIME_WINDOWS) {
      const [startHour, startMinute] = timeWindow.startTime.split(":").map(Number)
      const startTotalMinutes = startHour * 60 + startMinute
      const currentTotalMinutes = currentHour * 60 + currentMinute

      // Calculate time difference, considering next day if needed
      let timeDiff = startTotalMinutes - currentTotalMinutes
      if (timeDiff < 0) {
        timeDiff += 24 * 60 // Add a day's worth of minutes
      }

      if (timeDiff < minTimeDiff) {
        minTimeDiff = timeDiff
        nextMeal = timeWindow
      }
    }

    return {
      mealType: null,
      timeWindow: nextMeal,
      isWithinMealTime: false,
    }
  }

  // Record a new meal
  recordMeal(
    userId: string,
    mealType: MealType,
    serverId?: string,
    cafeteriaId?: string,
  ): { success: boolean; message?: string } {
    // Check if user has already had this meal today
    if (this.hasUserHadMealToday(userId, mealType)) {
      return {
        success: false,
        message: `This student has already had ${mealType} today.`,
      }
    }

    // Check if it's the correct time for this meal
    const { mealType: currentMealType, isWithinMealTime } = this.getCurrentMealType()
    if (!isWithinMealTime || currentMealType !== mealType) {
      return {
        success: false,
        message: `It is not ${mealType} time right now.`,
      }
    }

    // Create a new meal record
    const newMealRecord: MealRecord = {
      id: `MEAL${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      mealType,
      timestamp: new Date().toISOString(),
      cafeteriaId,
      serverId,
    }

    // Add the record
    this.mealRecords.push(newMealRecord)
    this.saveToStorage()
    this.notifyListeners()

    return {
      success: true,
      message: `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} recorded successfully.`,
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
}

// Create a singleton instance
const mealStore = new MealStore()

export default mealStore
