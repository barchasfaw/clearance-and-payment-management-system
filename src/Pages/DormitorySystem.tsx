"use client"

import type React from "react"
import { useState, useEffect } from "react"
import extendedUserStore, { type ExtendedUser } from "../data/extended-user-store"
import dormitoryStore, { type DormitoryBlock, type Room, type DisciplinaryIssue } from "../data/dormitory-store"
import "./DormitorySystem.css"

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

// Block Selector Component
const BlockSelector = ({
  blocks,
  selectedBlockId,
  onSelectBlock,
}: {
  blocks: DormitoryBlock[]
  selectedBlockId: string
  onSelectBlock: (blockId: string) => void
}) => {
  return (
    <div className="block-selector">
      <h3>Managed Blocks</h3>
      <div className="block-list">
        {blocks.map((block) => (
          <button
            key={block.id}
            className={`block-button ${selectedBlockId === block.id ? "selected" : ""}`}
            onClick={() => onSelectBlock(block.id)}
          >
            {block.name}
          </button>
        ))}
      </div>
    </div>
  )
}

// Student Information Display Component
const StudentInfoDisplay = ({
  student,
  room,
  onRegisterIssue,
}: {
  student: ExtendedUser
  room?: Room
  onRegisterIssue: () => void
}) => {
  const [disciplinaryIssues, setDisciplinaryIssues] = useState<DisciplinaryIssue[]>([])

  // Load disciplinary issues
  useEffect(() => {
    const issues = dormitoryStore.getDisciplinaryIssuesByStudentId(student.id)
    setDisciplinaryIssues(issues)

    // Subscribe to changes
    const unsubscribe = dormitoryStore.subscribe(() => {
      const updatedIssues = dormitoryStore.getDisciplinaryIssuesByStudentId(student.id)
      setDisciplinaryIssues(updatedIssues)
    })

    return unsubscribe
  }, [student.id])

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  // Count active issues (pending or addressed)
  const activeIssuesCount = disciplinaryIssues.filter(
    (issue) => issue.status === "pending" || issue.status === "addressed",
  ).length

  return (
    <div className="student-info-container">
      <div className="student-header">
        <h2>Student Information</h2>
        <div className={`status-badge ${room ? "status-assigned" : "status-unassigned"}`}>
          {room ? "Assigned to Room" : "Not Assigned"}
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
            <div className="info-label">Room Assignment:</div>
            <div className="info-value">
              {room ? (
                <span className="room-assignment">
                  {room.blockId.replace("BLOCK-", "Block ")} - Room {room.roomNumber}
                </span>
              ) : (
                <span className="no-room">Not assigned to any room</span>
              )}
            </div>
          </div>

          <div className="info-row">
            <div className="info-label">Disciplinary Issues:</div>
            <div className="info-value">
              <span className={`issue-count ${activeIssuesCount > 0 ? "has-issues" : ""}`}>
                {activeIssuesCount} active, {disciplinaryIssues.length - activeIssuesCount} resolved
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="student-actions">
        <button className="register-issue-button" onClick={onRegisterIssue}>
          Register Disciplinary Issue
        </button>
      </div>
    </div>
  )
}

// Room Management Component
const RoomManagement = ({
  blockId,
  onRoomClick,
  selectedRoom,
}: {
  blockId: string
  onRoomClick: (room: Room) => void
  selectedRoom?: Room
}) => {
  const [rooms, setRooms] = useState<Room[]>([])
  const [floors, setFloors] = useState<number[]>([])
  const [selectedFloor, setSelectedFloor] = useState<number>(1)
  const [block, setBlock] = useState<DormitoryBlock | undefined>(undefined)

  // Load rooms for the selected block
  useEffect(() => {
    const blockRooms = dormitoryStore.getRoomsByBlockId(blockId)
    setRooms(blockRooms)

    const block = dormitoryStore.getBlockById(blockId)
    setBlock(block)

    if (block) {
      const floorNumbers = Array.from({ length: block.floors }, (_, i) => i + 1)
      setFloors(floorNumbers)
    }

    // Subscribe to changes
    const unsubscribe = dormitoryStore.subscribe(() => {
      const updatedRooms = dormitoryStore.getRoomsByBlockId(blockId)
      setRooms(updatedRooms)
    })

    return unsubscribe
  }, [blockId])

  // Filter rooms by floor
  const roomsOnFloor = rooms.filter((room) => room.floor === selectedFloor)

  // Get status class for room
  const getRoomStatusClass = (status: Room["status"]) => {
    switch (status) {
      case "occupied":
        return "room-occupied"
      case "partially_occupied":
        return "room-partially-occupied"
      case "vacant":
        return "room-vacant"
      case "maintenance":
        return "room-maintenance"
      default:
        return ""
    }
  }

  return (
    <div className="room-management-container">
      <div className="room-management-header">
        <h3>{block?.name || "Block"} Room Management</h3>
        <div className="floor-selector">
          <label htmlFor="floor-select">Floor:</label>
          <select
            id="floor-select"
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(Number(e.target.value))}
            className="floor-select"
          >
            {floors.map((floor) => (
              <option key={floor} value={floor}>
                Floor {floor}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="room-status-legend">
        <div className="legend-item">
          <div className="legend-color room-vacant"></div>
          <span>Vacant</span>
        </div>
        <div className="legend-item">
          <div className="legend-color room-partially-occupied"></div>
          <span>Partially Occupied</span>
        </div>
        <div className="legend-item">
          <div className="legend-color room-occupied"></div>
          <span>Fully Occupied</span>
        </div>
        <div className="legend-item">
          <div className="legend-color room-maintenance"></div>
          <span>Maintenance</span>
        </div>
      </div>

      <div className="room-grid">
        {roomsOnFloor.map((room) => (
          <div
            key={room.id}
            className={`room-card ${getRoomStatusClass(room.status)} ${
              selectedRoom?.id === room.id ? "room-selected" : ""
            }`}
            onClick={() => onRoomClick(room)}
          >
            <div className="room-number">{room.roomNumber}</div>
            <div className="room-occupancy">
              {room.occupants.length}/{room.capacity}
            </div>
            <div className="room-type">{room.type}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Room Details Component
const RoomDetails = ({
  room,
  onClose,
  onAssignStudent,
  onRemoveStudent,
  onUpdateStatus,
}: {
  room: Room
  onClose: () => void
  onAssignStudent: (studentId: string) => void
  onRemoveStudent: (studentId: string) => void
  onUpdateStatus: (status: Room["status"]) => void
}) => {
  const [occupants, setOccupants] = useState<ExtendedUser[]>([])
  const [newStudentId, setNewStudentId] = useState("")
  const [error, setError] = useState("")

  // Load occupant details
  useEffect(() => {
    const loadOccupants = async () => {
      const occupantDetails = await Promise.all(
        room.occupants.map(async (id) => {
          const user = extendedUserStore.getExtendedUserById(id)
          return user || null
        }),
      )

      setOccupants(occupantDetails.filter((user): user is ExtendedUser => user !== null))
    }

    loadOccupants()
  }, [room.occupants])

  // Handle assigning a new student
  const handleAssignStudent = () => {
    if (!newStudentId.trim()) {
      setError("Please enter a student ID")
      return
    }

    onAssignStudent(newStudentId)
    setNewStudentId("")
  }

  return (
    <div className="room-details-container">
      <div className="room-details-header">
        <h3>
          Room {room.roomNumber} Details
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </h3>
      </div>

      <div className="room-details-content">
        <div className="room-info">
          <div className="info-row">
            <div className="info-label">Room Number:</div>
            <div className="info-value">{room.roomNumber}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Type:</div>
            <div className="info-value">{room.type.charAt(0).toUpperCase() + room.type.slice(1)}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Capacity:</div>
            <div className="info-value">{room.capacity}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Status:</div>
            <div className="info-value">
              <select
                value={room.status}
                onChange={(e) => onUpdateStatus(e.target.value as Room["status"])}
                className="status-select"
              >
                <option value="vacant">Vacant</option>
                <option value="partially_occupied">Partially Occupied</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>
          <div className="info-row">
            <div className="info-label">Amenities:</div>
            <div className="info-value">
              <div className="amenities-list">
                {room.amenities?.map((amenity) => (
                  <span key={amenity} className="amenity-tag">
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="occupants-section">
          <h4>
            Occupants ({occupants.length}/{room.capacity})
          </h4>
          {occupants.length === 0 ? (
            <p className="no-occupants">No students assigned to this room</p>
          ) : (
            <div className="occupants-list">
              {occupants.map((occupant) => (
                <div key={occupant.id} className="occupant-item">
                  <div className="occupant-photo">
                    <img
                      src={occupant.photo || "/placeholder.svg?height=50&width=50"}
                      alt={`Photo of ${occupant.name}`}
                      className="occupant-image"
                    />
                  </div>
                  <div className="occupant-info">
                    <div className="occupant-name">{occupant.name}</div>
                    <div className="occupant-id">{occupant.id}</div>
                  </div>
                  <button
                    className="remove-occupant-button"
                    onClick={() => onRemoveStudent(occupant.id)}
                    title="Remove from room"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}

          {room.status !== "maintenance" && occupants.length < room.capacity && (
            <div className="add-occupant-section">
              <h4>Assign New Student</h4>
              {error && <div className="error-message">{error}</div>}
              <div className="add-occupant-form">
                <input
                  type="text"
                  placeholder="Enter Student ID"
                  value={newStudentId}
                  onChange={(e) => setNewStudentId(e.target.value)}
                  className="student-id-input"
                />
                <button className="assign-button" onClick={handleAssignStudent}>
                  Assign
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Disciplinary Issue Form Component
const DisciplinaryIssueForm = ({
  studentId,
  reporterId,
  onSubmit,
  onCancel,
}: {
  studentId: string
  reporterId: string
  onSubmit: (issue: Omit<DisciplinaryIssue, "id">) => void
  onCancel: () => void
}) => {
  const [category, setCategory] = useState<DisciplinaryIssue["category"]>("noise")
  const [description, setDescription] = useState("")
  const [severity, setSeverity] = useState<DisciplinaryIssue["severity"]>("minor")
  const [error, setError] = useState("")

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!description.trim()) {
      setError("Please provide a description of the issue")
      return
    }

    const newIssue: Omit<DisciplinaryIssue, "id"> = {
      userId: studentId,
      reportedBy: reporterId,
      timestamp: new Date().toISOString(),
      category,
      description,
      severity,
      status: "pending",
    }

    onSubmit(newIssue)
  }

  return (
    <div className="disciplinary-form-container">
      <div className="disciplinary-form-header">
        <h3>Register Disciplinary Issue</h3>
      </div>

      <form onSubmit={handleSubmit} className="disciplinary-form">
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="category" className="form-label">
            Category <span className="required">*</span>
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as DisciplinaryIssue["category"])}
            className="form-select"
            required
          >
            <option value="noise">Noise Violation</option>
            <option value="cleanliness">Cleanliness Issue</option>
            <option value="property_damage">Property Damage</option>
            <option value="unauthorized_guest">Unauthorized Guest</option>
            <option value="curfew">Curfew Violation</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="severity" className="form-label">
            Severity <span className="required">*</span>
          </label>
          <select
            id="severity"
            value={severity}
            onChange={(e) => setSeverity(e.target.value as DisciplinaryIssue["severity"])}
            className="form-select"
            required
          >
            <option value="minor">Minor</option>
            <option value="moderate">Moderate</option>
            <option value="severe">Severe</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description" className="form-label">
            Description <span className="required">*</span>
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-textarea"
            rows={4}
            placeholder="Provide details about the disciplinary issue"
            required
          ></textarea>
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="submit-button">
            Submit Issue
          </button>
        </div>
      </form>
    </div>
  )
}

// Disciplinary Issues List Component
const DisciplinaryIssuesList = ({
  studentId,
  onUpdateIssue,
}: {
  studentId: string
  onUpdateIssue: (issueId: string, updates: Partial<DisciplinaryIssue>) => void
}) => {
  const [issues, setIssues] = useState<DisciplinaryIssue[]>([])
  const [selectedIssue, setSelectedIssue] = useState<DisciplinaryIssue | null>(null)
  const [resolution, setResolution] = useState("")
  const [isResolutionModalOpen, setIsResolutionModalOpen] = useState(false)

  // Load disciplinary issues
  useEffect(() => {
    const loadIssues = () => {
      const studentIssues = dormitoryStore.getDisciplinaryIssuesByStudentId(studentId)
      // Sort by timestamp (newest first)
      studentIssues.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      setIssues(studentIssues)
    }

    loadIssues()

    // Subscribe to changes
    const unsubscribe = dormitoryStore.subscribe(() => {
      loadIssues()
    })

    return unsubscribe
  }, [studentId])

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Get category display name
  const getCategoryDisplayName = (category: DisciplinaryIssue["category"]) => {
    switch (category) {
      case "noise":
        return "Noise Violation"
      case "cleanliness":
        return "Cleanliness Issue"
      case "property_damage":
        return "Property Damage"
      case "unauthorized_guest":
        return "Unauthorized Guest"
      case "curfew":
        return "Curfew Violation"
      case "other":
        return "Other Issue"
    }
  }

  // Get severity class
  const getSeverityClass = (severity: DisciplinaryIssue["severity"]) => {
    switch (severity) {
      case "minor":
        return "severity-minor"
      case "moderate":
        return "severity-moderate"
      case "severe":
        return "severity-severe"
      default:
        return ""
    }
  }

  // Handle status change
  const handleStatusChange = (issue: DisciplinaryIssue, newStatus: DisciplinaryIssue["status"]) => {
    if (newStatus === "resolved" && !issue.resolution) {
      // Open resolution modal
      setSelectedIssue(issue)
      setIsResolutionModalOpen(true)
    } else {
      // Update status directly
      onUpdateIssue(issue.id, { status: newStatus })
    }
  }

  // Handle resolution submission
  const handleResolutionSubmit = () => {
    if (!selectedIssue) return

    if (!resolution.trim()) {
      // Show error or validation message
      return
    }

    onUpdateIssue(selectedIssue.id, {
      status: "resolved",
      resolution,
      resolutionDate: new Date().toISOString(),
    })

    setIsResolutionModalOpen(false)
    setSelectedIssue(null)
    setResolution("")
  }

  return (
    <div className="disciplinary-issues-container">
      <div className="disciplinary-issues-header">
        <h3>Disciplinary History</h3>
      </div>

      {issues.length === 0 ? (
        <div className="no-issues-message">No disciplinary issues found for this student.</div>
      ) : (
        <div className="issues-list">
          {issues.map((issue) => (
            <div key={issue.id} className={`issue-card status-${issue.status}`}>
              <div className="issue-header">
                <div className="issue-date">{formatDate(issue.timestamp)}</div>
                <div className={`issue-severity ${getSeverityClass(issue.severity)}`}>
                  {issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)}
                </div>
              </div>
              <div className="issue-category">{getCategoryDisplayName(issue.category)}</div>
              <div className="issue-description">{issue.description}</div>

              {issue.resolution && (
                <div className="issue-resolution">
                  <div className="resolution-header">Resolution:</div>
                  <div className="resolution-text">{issue.resolution}</div>
                  {issue.resolutionDate && (
                    <div className="resolution-date">Resolved on: {formatDate(issue.resolutionDate)}</div>
                  )}
                </div>
              )}

              <div className="issue-footer">
                <div className="issue-status">
                  Status:
                  <select
                    value={issue.status}
                    onChange={(e) => handleStatusChange(issue, e.target.value as DisciplinaryIssue["status"])}
                    className="status-select"
                    disabled={issue.status === "resolved"}
                  >
                    <option value="pending">Pending</option>
                    <option value="addressed">Addressed</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resolution Modal */}
      {isResolutionModalOpen && selectedIssue && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Resolve Disciplinary Issue</h3>
            </div>
            <div className="modal-body">
              <p>Please provide resolution details for the following issue:</p>
              <p>
                <strong>Category:</strong> {getCategoryDisplayName(selectedIssue.category)}
              </p>
              <p>
                <strong>Description:</strong> {selectedIssue.description}
              </p>
              <div className="form-group">
                <label htmlFor="resolution" className="form-label">
                  Resolution <span className="required">*</span>
                </label>
                <textarea
                  id="resolution"
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  className="form-textarea"
                  rows={4}
                  placeholder="Describe how this issue was resolved"
                  required
                ></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="cancel-button"
                onClick={() => {
                  setIsResolutionModalOpen(false)
                  setSelectedIssue(null)
                  setResolution("")
                }}
              >
                Cancel
              </button>
              <button className="submit-button" onClick={handleResolutionSubmit}>
                Submit Resolution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Block Overview Component
const BlockOverview = ({ blockId }: { blockId: string }) => {
  const [block, setBlock] = useState<DormitoryBlock | undefined>(undefined)
  const [rooms, setRooms] = useState<Room[]>([])
  const [stats, setStats] = useState({
    totalRooms: 0,
    occupiedRooms: 0,
    partiallyOccupiedRooms: 0,
    vacantRooms: 0,
    maintenanceRooms: 0,
    totalCapacity: 0,
    totalOccupants: 0,
    occupancyRate: 0,
  })

  // Load block and rooms
  useEffect(() => {
    const blockData = dormitoryStore.getBlockById(blockId)
    setBlock(blockData)

    const roomsData = dormitoryStore.getRoomsByBlockId(blockId)
    setRooms(roomsData)

    // Calculate stats
    const totalRooms = roomsData.length
    const occupiedRooms = roomsData.filter((room) => room.status === "occupied").length
    const partiallyOccupiedRooms = roomsData.filter((room) => room.status === "partially_occupied").length
    const vacantRooms = roomsData.filter((room) => room.status === "vacant").length
    const maintenanceRooms = roomsData.filter((room) => room.status === "maintenance").length

    const totalCapacity = roomsData.reduce((sum, room) => sum + room.capacity, 0)
    const totalOccupants = roomsData.reduce((sum, room) => sum + room.occupants.length, 0)
    const occupancyRate = totalCapacity > 0 ? (totalOccupants / totalCapacity) * 100 : 0

    setStats({
      totalRooms,
      occupiedRooms,
      partiallyOccupiedRooms,
      vacantRooms,
      maintenanceRooms,
      totalCapacity,
      totalOccupants,
      occupancyRate,
    })

    // Subscribe to changes
    const unsubscribe = dormitoryStore.subscribe(() => {
      const updatedRooms = dormitoryStore.getRoomsByBlockId(blockId)
      setRooms(updatedRooms)

      // Recalculate stats
      const totalRooms = updatedRooms.length
      const occupiedRooms = updatedRooms.filter((room) => room.status === "occupied").length
      const partiallyOccupiedRooms = updatedRooms.filter((room) => room.status === "partially_occupied").length
      const vacantRooms = updatedRooms.filter((room) => room.status === "vacant").length
      const maintenanceRooms = updatedRooms.filter((room) => room.status === "maintenance").length

      const totalCapacity = updatedRooms.reduce((sum, room) => sum + room.capacity, 0)
      const totalOccupants = updatedRooms.reduce((sum, room) => sum + room.occupants.length, 0)
      const occupancyRate = totalCapacity > 0 ? (totalOccupants / totalCapacity) * 100 : 0

      setStats({
        totalRooms,
        occupiedRooms,
        partiallyOccupiedRooms,
        vacantRooms,
        maintenanceRooms,
        totalCapacity,
        totalOccupants,
        occupancyRate,
      })
    })

    return unsubscribe
  }, [blockId])

  return (
    <div className="block-overview-container">
      <div className="block-overview-header">
        <h3>{block?.name || "Block"} Overview</h3>
      </div>

      <div className="block-stats">
        <div className="stat-card">
          <div className="stat-value">{stats.totalRooms}</div>
          <div className="stat-label">Total Rooms</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalOccupants}</div>
          <div className="stat-label">Residents</div>
        </div>
        <div className="stat-value-card">
          <div className="stat-value">{stats.occupancyRate.toFixed(1)}%</div>
          <div className="stat-label">Occupancy Rate</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${stats.occupancyRate}%` }}></div>
          </div>
        </div>
      </div>

      <div className="room-status-stats">
        <div className="status-stat">
          <div className="status-color room-occupied"></div>
          <div className="status-details">
            <div className="status-value">{stats.occupiedRooms}</div>
            <div className="status-label">Fully Occupied</div>
          </div>
        </div>
        <div className="status-stat">
          <div className="status-color room-partially-occupied"></div>
          <div className="status-details">
            <div className="status-value">{stats.partiallyOccupiedRooms}</div>
            <div className="status-label">Partially Occupied</div>
          </div>
        </div>
        <div className="status-stat">
          <div className="status-color room-vacant"></div>
          <div className="status-details">
            <div className="status-value">{stats.vacantRooms}</div>
            <div className="status-label">Vacant</div>
          </div>
        </div>
        <div className="status-stat">
          <div className="status-color room-maintenance"></div>
          <div className="status-details">
            <div className="status-value">{stats.maintenanceRooms}</div>
            <div className="status-label">Maintenance</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main Dormitory System Component
const DormitorySystem = ({ currentUserId }: { currentUserId: string }) => {
  const [scannedUserId, setScannedUserId] = useState<string | null>(null)
  const [scannedStudent, setScannedStudent] = useState<ExtendedUser | null>(null)
  const [studentRoom, setStudentRoom] = useState<Room | undefined>(undefined)
  const [managedBlocks, setManagedBlocks] = useState<DormitoryBlock[]>([])
  const [selectedBlockId, setSelectedBlockId] = useState<string>("")
  const [selectedRoom, setSelectedRoom] = useState<Room | undefined>(undefined)
  const [isIssueFormOpen, setIsIssueFormOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"overview" | "rooms" | "issues">("overview")
  const [notification, setNotification] = useState<{
    show: boolean
    type: "success" | "warning" | "error"
    message: string
  }>({ show: false, type: "success", message: "" })

  // Load managed blocks
  useEffect(() => {
    const blocks = dormitoryStore.getBlocksByManager(currentUserId)
    setManagedBlocks(blocks)

    if (blocks.length > 0) {
      setSelectedBlockId(blocks[0].id)
    }
  }, [currentUserId])

  // Handle ID scan
  const handleScan = (userId: string) => {
    setScannedUserId(userId)
    const user = extendedUserStore.getExtendedUserById(userId)

    if (user) {
      setScannedStudent(user)

      // Check if student is assigned to a room
      const room = dormitoryStore.getRoomByStudentId(userId)
      setStudentRoom(room)

      // If student is in a room, check if it's in one of the managed blocks
      if (room && managedBlocks.some((block) => block.id === room.blockId)) {
        setSelectedBlockId(room.blockId)
      }
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

  // Handle room click
  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room)
  }

  // Handle assigning student to room
  const handleAssignStudent = (studentId: string) => {
    if (!selectedRoom) return

    const result = dormitoryStore.assignStudentToRoom(studentId, selectedRoom.id)

    if (result.success) {
      showNotification("success", result.message || "Student assigned to room successfully.")

      // If this is the scanned student, update their room
      if (scannedStudent && scannedStudent.id === studentId) {
        const updatedRoom = dormitoryStore.getRoomById(selectedRoom.id)
        setStudentRoom(updatedRoom)
      }
    } else {
      showNotification("error", result.message || "Failed to assign student to room.")
    }
  }

  // Handle removing student from room
  const handleRemoveStudent = (studentId: string) => {
    const result = dormitoryStore.removeStudentFromRoom(studentId)

    if (result.success) {
      showNotification("success", result.message || "Student removed from room successfully.")

      // If this is the scanned student, update their room
      if (scannedStudent && scannedStudent.id === studentId) {
        setStudentRoom(undefined)
      }
    } else {
      showNotification("error", result.message || "Failed to remove student from room.")
    }
  }

  // Handle updating room status
  const handleUpdateRoomStatus = (status: Room["status"]) => {
    if (!selectedRoom) return

    const result = dormitoryStore.updateRoomStatus(selectedRoom.id, status)

    if (result.success) {
      showNotification("success", result.message || "Room status updated successfully.")

      // If this room was assigned to the scanned student, update their room
      if (scannedStudent && studentRoom && studentRoom.id === selectedRoom.id && status === "maintenance") {
        setStudentRoom(undefined)
      }
    } else {
      showNotification("error", result.message || "Failed to update room status.")
    }
  }

  // Handle submitting a disciplinary issue
  const handleSubmitIssue = (issue: Omit<DisciplinaryIssue, "id">) => {
    const newIssue = dormitoryStore.addDisciplinaryIssue(issue)

    if (newIssue) {
      showNotification("success", "Disciplinary issue registered successfully.")
      setIsIssueFormOpen(false)
    } else {
      showNotification("error", "Failed to register disciplinary issue.")
    }
  }

  // Handle updating a disciplinary issue
  const handleUpdateIssue = (issueId: string, updates: Partial<DisciplinaryIssue>) => {
    const success = dormitoryStore.updateDisciplinaryIssue(issueId, updates)

    if (success) {
      showNotification("success", "Disciplinary issue updated successfully.")
    } else {
      showNotification("error", "Failed to update disciplinary issue.")
    }
  }

  return (
    <div className="dormitory-system-container">
      <div className="dormitory-header">
        <h1>Dormitory Management System</h1>
        <p>Manage dormitory blocks, rooms, and disciplinary issues</p>
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

      <div className="dormitory-content">
        <div className="left-panel">
          <BlockSelector blocks={managedBlocks} selectedBlockId={selectedBlockId} onSelectBlock={setSelectedBlockId} />

          <IDCardScanner onScan={handleScan} />
        </div>

        <div className="right-panel">
          {scannedStudent ? (
            <>
              <StudentInfoDisplay
                student={scannedStudent}
                room={studentRoom}
                onRegisterIssue={() => setIsIssueFormOpen(true)}
              />

              {isIssueFormOpen ? (
                <DisciplinaryIssueForm
                  studentId={scannedStudent.id}
                  reporterId={currentUserId}
                  onSubmit={handleSubmitIssue}
                  onCancel={() => setIsIssueFormOpen(false)}
                />
              ) : (
                <DisciplinaryIssuesList studentId={scannedStudent.id} onUpdateIssue={handleUpdateIssue} />
              )}
            </>
          ) : (
            <>
              <div className="tabs-container">
                <div className="tabs-header">
                  <button
                    className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
                    onClick={() => setActiveTab("overview")}
                  >
                    Block Overview
                  </button>
                  <button
                    className={`tab-button ${activeTab === "rooms" ? "active" : ""}`}
                    onClick={() => setActiveTab("rooms")}
                  >
                    Room Management
                  </button>
                </div>

                <div className="tabs-content">
                  {activeTab === "overview" && selectedBlockId && <BlockOverview blockId={selectedBlockId} />}
                  {activeTab === "rooms" && selectedBlockId && (
                    <RoomManagement
                      blockId={selectedBlockId}
                      onRoomClick={handleRoomClick}
                      selectedRoom={selectedRoom}
                    />
                  )}
                </div>
              </div>

              {selectedRoom && (
                <RoomDetails
                  room={selectedRoom}
                  onClose={() => setSelectedRoom(undefined)}
                  onAssignStudent={handleAssignStudent}
                  onRemoveStudent={handleRemoveStudent}
                  onUpdateStatus={handleUpdateRoomStatus}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default DormitorySystem
