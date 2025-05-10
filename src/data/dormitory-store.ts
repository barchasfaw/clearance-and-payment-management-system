// This file serves as a mock database for storing dormitory records
// In a real application, this would be replaced with a proper database

export interface DormitoryBlock {
    id: string
    name: string
    floors: number
    roomsPerFloor: number
    manager?: string // userId of the manager
  }
  
  export interface Room {
    id: string
    blockId: string
    floor: number
    roomNumber: string
    capacity: number
    occupants: string[] // Array of userIds
    type: "single" | "double" | "triple" | "quad"
    status: "occupied" | "partially_occupied" | "vacant" | "maintenance"
    amenities?: string[]
  }
  
  export interface DisciplinaryIssue {
    id: string
    userId: string
    reportedBy: string
    timestamp: string
    category: "noise" | "cleanliness" | "property_damage" | "unauthorized_guest" | "curfew" | "other"
    description: string
    severity: "minor" | "moderate" | "severe"
    status: "pending" | "addressed" | "resolved"
    resolution?: string
    resolutionDate?: string
  }
  
  // Mock implementation of a dormitory store
  class DormitoryStore {
    private blocks: DormitoryBlock[] = []
    private rooms: Room[] = []
    private disciplinaryIssues: DisciplinaryIssue[] = []
    private listeners: (() => void)[] = []
  
    // Load initial data from localStorage if available
    constructor() {
      try {
        const savedBlocks = localStorage.getItem("dormitory_blocks")
        if (savedBlocks) {
          this.blocks = JSON.parse(savedBlocks)
        } else {
          // Initialize with sample blocks
          this.initializeSampleBlocks()
        }
  
        const savedRooms = localStorage.getItem("dormitory_rooms")
        if (savedRooms) {
          this.rooms = JSON.parse(savedRooms)
        } else {
          // Initialize with sample rooms
          this.initializeSampleRooms()
        }
  
        const savedDisciplinaryIssues = localStorage.getItem("dormitory_disciplinary_issues")
        if (savedDisciplinaryIssues) {
          this.disciplinaryIssues = JSON.parse(savedDisciplinaryIssues)
        } else {
          // Initialize with sample disciplinary issues
          this.initializeSampleDisciplinaryIssues()
        }
      } catch (error) {
        console.error("Failed to load dormitory data from localStorage:", error)
        // Initialize with sample data if loading fails
        this.initializeSampleBlocks()
        this.initializeSampleRooms()
        this.initializeSampleDisciplinaryIssues()
      }
    }
  
    // Initialize with sample blocks
    private initializeSampleBlocks() {
      this.blocks = [
        {
          id: "BLOCK-A",
          name: "Block A",
          floors: 4,
          roomsPerFloor: 7,
          manager: "dormitory",
        },
        {
          id: "BLOCK-B",
          name: "Block B",
          floors: 4,
          roomsPerFloor: 7,
          manager: "STAFF5",
        },
        {
          id: "BLOCK-C",
          name: "Block C",
          floors: 4,
          roomsPerFloor: 7,
        },
        {
          id: "BLOCK-D",
          name: "Block D",
          floors: 4,
          roomsPerFloor: 7,
        },
      ]
      this.saveToStorage()
    }
  
    // Initialize with sample rooms
    private initializeSampleRooms() {
      this.rooms = []
  
      // Generate rooms for each block
      this.blocks.forEach((block) => {
        for (let floor = 1; floor <= block.floors; floor++) {
          for (let room = 1; room <= block.roomsPerFloor; room++) {
            const roomNumber = `${floor}${room.toString().padStart(2, "0")}`
            const roomType = this.getRandomRoomType()
            const capacity = this.getRoomCapacity(roomType)
  
            // Generate random occupants
            const occupants: string[] = []
            const occupancyRate = Math.random() // 0 to 1
            const numOccupants = Math.floor(occupancyRate * capacity)
  
            for (let i = 0; i < numOccupants; i++) {
              const studentId = `STU${Math.floor(Math.random() * 900) + 100}`
              occupants.push(studentId)
            }
  
            // Determine room status
            let status: Room["status"]
            if (occupants.length === 0) {
              status = "vacant"
            } else if (occupants.length < capacity) {
              status = "partially_occupied"
            } else {
              status = "occupied"
            }
  
            // Randomly set some rooms to maintenance
            if (Math.random() < 0.05) {
              // 5% chance
              status = "maintenance"
              occupants.length = 0 // Clear occupants if in maintenance
            }
  
            // Create room
            this.rooms.push({
              id: `${block.id}-${roomNumber}`,
              blockId: block.id,
              floor,
              roomNumber,
              capacity,
              occupants,
              type: roomType,
              status,
              amenities: this.getRandomAmenities(),
            })
          }
        }
      })
  
      // Ensure STU001-STU005 are assigned to Block A
      const blockARooms = this.rooms.filter((room) => room.blockId === "BLOCK-A" && room.status !== "maintenance")
  
      // Assign STU001-STU005 to random rooms in Block A
      for (let i = 1; i <= 5; i++) {
        const studentId = `STU00${i}`
  
        // Remove student from any existing room
        this.rooms.forEach((room) => {
          room.occupants = room.occupants.filter((id) => id !== studentId)
        })
  
        // Assign to a random room in Block A
        const randomRoomIndex = Math.floor(Math.random() * blockARooms.length)
        const room = blockARooms[randomRoomIndex]
  
        // Only add if there's space
        if (room.occupants.length < room.capacity) {
          room.occupants.push(studentId)
  
          // Update room status
          if (room.occupants.length === room.capacity) {
            room.status = "occupied"
          } else if (room.occupants.length > 0) {
            room.status = "partially_occupied"
          }
        }
      }
  
      this.saveToStorage()
    }
  
    // Initialize with sample disciplinary issues
    private initializeSampleDisciplinaryIssues() {
      const categories: DisciplinaryIssue["category"][] = [
        "noise",
        "cleanliness",
        "property_damage",
        "unauthorized_guest",
        "curfew",
        "other",
      ]
  
      const severities: DisciplinaryIssue["severity"][] = ["minor", "moderate", "severe"]
      const statuses: DisciplinaryIssue["status"][] = ["pending", "addressed", "resolved"]
  
      this.disciplinaryIssues = []
  
      // Generate random disciplinary issues for STU001-STU005
      for (let i = 1; i <= 5; i++) {
        const numIssues = Math.floor(Math.random() * 3) // 0-2 issues per student
  
        for (let j = 0; j < numIssues; j++) {
          const category = categories[Math.floor(Math.random() * categories.length)]
          const severity = severities[Math.floor(Math.random() * severities.length)]
          const status = statuses[Math.floor(Math.random() * statuses.length)]
  
          // Create a date within the last 30 days
          const daysAgo = Math.floor(Math.random() * 30)
          const date = new Date()
          date.setDate(date.getDate() - daysAgo)
  
          const issue: DisciplinaryIssue = {
            id: `DISC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            userId: `STU00${i}`,
            reportedBy: "dormitory",
            timestamp: date.toISOString(),
            category,
            description: this.getRandomDescription(category),
            severity,
            status,
          }
  
          // Add resolution for addressed/resolved issues
          if (status === "addressed" || status === "resolved") {
            const resolutionDate = new Date(date)
            resolutionDate.setDate(resolutionDate.getDate() + Math.floor(Math.random() * 5) + 1)
  
            issue.resolution = this.getRandomResolution(category, severity)
            issue.resolutionDate = resolutionDate.toISOString()
          }
  
          this.disciplinaryIssues.push(issue)
        }
      }
  
      this.saveToStorage()
    }
  
    // Helper method to get random room type
    private getRandomRoomType(): Room["type"] {
      const types: Room["type"][] = ["single", "double", "triple", "quad"]
      const weights = [0.2, 0.4, 0.3, 0.1] // Probability weights
  
      const random = Math.random()
      let sum = 0
  
      for (let i = 0; i < types.length; i++) {
        sum += weights[i]
        if (random < sum) {
          return types[i]
        }
      }
  
      return "double" // Default
    }
  
    // Helper method to get room capacity based on type
    private getRoomCapacity(type: Room["type"]): number {
      switch (type) {
        case "single":
          return 1
        case "double":
          return 2
        case "triple":
          return 3
        case "quad":
          return 4
        default:
          return 2
      }
    }
  
    // Helper method to get random amenities
    private getRandomAmenities(): string[] {
      const allAmenities = [
        "Air Conditioning",
        "Private Bathroom",
        "Study Desk",
        "Wardrobe",
        "Bookshelf",
        "Mini Fridge",
        "Microwave",
        "TV",
        "Internet",
      ]
  
      const numAmenities = Math.floor(Math.random() * 5) + 3 // 3-7 amenities
      const amenities: string[] = []
  
      // Always include these basic amenities
      amenities.push("Study Desk", "Wardrobe", "Internet")
  
      // Add random additional amenities
      const additionalAmenities = allAmenities.filter((a) => !amenities.includes(a))
      for (let i = 0; i < numAmenities - 3 && i < additionalAmenities.length; i++) {
        const randomIndex = Math.floor(Math.random() * additionalAmenities.length)
        const amenity = additionalAmenities.splice(randomIndex, 1)[0]
        amenities.push(amenity)
      }
  
      return amenities
    }
  
    // Helper method to get random description for disciplinary issues
    private getRandomDescription(category: DisciplinaryIssue["category"]): string {
      const descriptions: Record<DisciplinaryIssue["category"], string[]> = {
        noise: [
          "Playing loud music after quiet hours",
          "Excessive noise during study hours",
          "Loud gathering in room disturbing neighbors",
          "Shouting in hallways late at night",
        ],
        cleanliness: [
          "Room failed cleanliness inspection",
          "Garbage left in common areas",
          "Unwashed dishes attracting pests",
          "Bathroom not maintained properly",
        ],
        property_damage: ["Damage to room furniture", "Holes in walls", "Broken window", "Damaged door lock"],
        unauthorized_guest: [
          "Non-resident found in room after visiting hours",
          "Unauthorized overnight guest",
          "Visitor without proper registration",
          "Exceeding allowed number of guests",
        ],
        curfew: [
          "Returned to dormitory after curfew hours",
          "Left dormitory during restricted hours",
          "Multiple curfew violations in same week",
          "Failed to sign in upon return",
        ],
        other: [
          "Smoking in non-smoking area",
          "Possession of prohibited items",
          "Failure to attend mandatory dorm meeting",
          "Inappropriate behavior towards staff",
        ],
      }
  
      const options = descriptions[category]
      return options[Math.floor(Math.random() * options.length)]
    }
  
    // Helper method to get random resolution for disciplinary issues
    private getRandomResolution(
      category: DisciplinaryIssue["category"],
      severity: DisciplinaryIssue["severity"],
    ): string {
      const resolutions: Record<DisciplinaryIssue["severity"], string[]> = {
        minor: [
          "Verbal warning issued",
          "Student acknowledged issue and promised to improve",
          "Educational materials provided",
          "Referred to dormitory rules and regulations",
        ],
        moderate: [
          "Written warning placed in student file",
          "Meeting with dormitory supervisor",
          "Community service assigned",
          "Restriction of privileges for 1 week",
        ],
        severe: [
          "Formal disciplinary hearing conducted",
          "Probationary status for remainder of semester",
          "Mandatory counseling sessions",
          "Relocation to different dormitory block",
          "Recommendation for suspension from dormitory",
        ],
      }
  
      const options = resolutions[severity]
      return options[Math.floor(Math.random() * options.length)]
    }
  
    // Save data to localStorage
    private saveToStorage() {
      try {
        localStorage.setItem("dormitory_blocks", JSON.stringify(this.blocks))
        localStorage.setItem("dormitory_rooms", JSON.stringify(this.rooms))
        localStorage.setItem("dormitory_disciplinary_issues", JSON.stringify(this.disciplinaryIssues))
      } catch (error) {
        console.error("Failed to save dormitory data to localStorage:", error)
      }
    }
  
    // Get all blocks
    getAllBlocks(): DormitoryBlock[] {
      return [...this.blocks]
    }
  
    // Get block by ID
    getBlockById(blockId: string): DormitoryBlock | undefined {
      return this.blocks.find((block) => block.id === blockId)
    }
  
    // Get blocks managed by a specific user
    getBlocksByManager(userId: string): DormitoryBlock[] {
      return this.blocks.filter((block) => block.manager === userId)
    }
  
    // Get all rooms
    getAllRooms(): Room[] {
      return [...this.rooms]
    }
  
    // Get rooms by block ID
    getRoomsByBlockId(blockId: string): Room[] {
      return this.rooms.filter((room) => room.blockId === blockId)
    }
  
    // Get room by ID
    getRoomById(roomId: string): Room | undefined {
      return this.rooms.find((room) => room.id === roomId)
    }
  
    // Get room by block ID and room number
    getRoomByBlockAndNumber(blockId: string, roomNumber: string): Room | undefined {
      return this.rooms.find((room) => room.blockId === blockId && room.roomNumber === roomNumber)
    }
  
    // Get room by student ID
    getRoomByStudentId(studentId: string): Room | undefined {
      return this.rooms.find((room) => room.occupants.includes(studentId))
    }
  
    // Get all disciplinary issues
    getAllDisciplinaryIssues(): DisciplinaryIssue[] {
      return [...this.disciplinaryIssues]
    }
  
    // Get disciplinary issues by student ID
    getDisciplinaryIssuesByStudentId(studentId: string): DisciplinaryIssue[] {
      return this.disciplinaryIssues.filter((issue) => issue.userId === studentId)
    }
  
    // Get disciplinary issues by block ID
    getDisciplinaryIssuesByBlockId(blockId: string): DisciplinaryIssue[] {
      // Get all students in the block
      const studentsInBlock = new Set<string>()
      this.rooms
        .filter((room) => room.blockId === blockId)
        .forEach((room) => room.occupants.forEach((studentId) => studentsInBlock.add(studentId)))
  
      // Get issues for those students
      return this.disciplinaryIssues.filter((issue) => studentsInBlock.has(issue.userId))
    }
  
    // Add a new disciplinary issue
    addDisciplinaryIssue(issue: Omit<DisciplinaryIssue, "id">): DisciplinaryIssue {
      const newIssue: DisciplinaryIssue = {
        ...issue,
        id: `DISC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      }
  
      this.disciplinaryIssues.push(newIssue)
      this.saveToStorage()
      this.notifyListeners()
  
      return newIssue
    }
  
    // Update a disciplinary issue
    updateDisciplinaryIssue(issueId: string, updates: Partial<DisciplinaryIssue>): boolean {
      const index = this.disciplinaryIssues.findIndex((issue) => issue.id === issueId)
  
      if (index >= 0) {
        this.disciplinaryIssues[index] = {
          ...this.disciplinaryIssues[index],
          ...updates,
        }
  
        this.saveToStorage()
        this.notifyListeners()
        return true
      }
  
      return false
    }
  
    // Assign a student to a room
    assignStudentToRoom(studentId: string, roomId: string): { success: boolean; message?: string } {
      // Check if student is already assigned to a room
      const currentRoom = this.getRoomByStudentId(studentId)
      if (currentRoom) {
        // Remove from current room
        const index = this.rooms.findIndex((room) => room.id === currentRoom.id)
        if (index >= 0) {
          this.rooms[index].occupants = this.rooms[index].occupants.filter((id) => id !== studentId)
  
          // Update room status
          if (this.rooms[index].occupants.length === 0) {
            this.rooms[index].status = "vacant"
          } else if (this.rooms[index].occupants.length < this.rooms[index].capacity) {
            this.rooms[index].status = "partially_occupied"
          }
        }
      }
  
      // Find the new room
      const roomIndex = this.rooms.findIndex((room) => room.id === roomId)
  
      if (roomIndex < 0) {
        return { success: false, message: "Room not found." }
      }
  
      const room = this.rooms[roomIndex]
  
      // Check if room is in maintenance
      if (room.status === "maintenance") {
        return { success: false, message: "Cannot assign student to a room under maintenance." }
      }
  
      // Check if room is full
      if (room.occupants.length >= room.capacity) {
        return { success: false, message: "Room is already at full capacity." }
      }
  
      // Assign student to room
      this.rooms[roomIndex].occupants.push(studentId)
  
      // Update room status
      if (this.rooms[roomIndex].occupants.length === this.rooms[roomIndex].capacity) {
        this.rooms[roomIndex].status = "occupied"
      } else {
        this.rooms[roomIndex].status = "partially_occupied"
      }
  
      this.saveToStorage()
      this.notifyListeners()
  
      return { success: true, message: "Student successfully assigned to room." }
    }
  
    // Remove a student from a room
    removeStudentFromRoom(studentId: string): { success: boolean; message?: string } {
      // Find the room the student is in
      const roomIndex = this.rooms.findIndex((room) => room.occupants.includes(studentId))
  
      if (roomIndex < 0) {
        return { success: false, message: "Student is not assigned to any room." }
      }
  
      // Remove student from room
      this.rooms[roomIndex].occupants = this.rooms[roomIndex].occupants.filter((id) => id !== studentId)
  
      // Update room status
      if (this.rooms[roomIndex].occupants.length === 0) {
        this.rooms[roomIndex].status = "vacant"
      } else if (this.rooms[roomIndex].occupants.length < this.rooms[roomIndex].capacity) {
        this.rooms[roomIndex].status = "partially_occupied"
      }
  
      this.saveToStorage()
      this.notifyListeners()
  
      return { success: true, message: "Student successfully removed from room." }
    }
  
    // Update room status
    updateRoomStatus(roomId: string, status: Room["status"]): { success: boolean; message?: string } {
      const roomIndex = this.rooms.findIndex((room) => room.id === roomId)
  
      if (roomIndex < 0) {
        return { success: false, message: "Room not found." }
      }
  
      // If setting to maintenance, remove all occupants
      if (status === "maintenance") {
        this.rooms[roomIndex].occupants = []
      }
  
      // Update status
      this.rooms[roomIndex].status = status
  
      this.saveToStorage()
      this.notifyListeners()
  
      return { success: true, message: "Room status updated successfully." }
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
  const dormitoryStore = new DormitoryStore()
  
  export default dormitoryStore
  