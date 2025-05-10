"use client"

import { useState } from "react"
import "./DisciplineSystem.css"

// Mock data for demonstration
const MOCK_COMPLAINTS = [
  {
    id: "C001",
    studentId: "STU001",
    studentName: "John Doe",
    source: "dormitory",
    category: "noise",
    description: "Loud music after quiet hours",
    severity: "minor",
    status: "pending",
    timestamp: "2023-05-15T14:30:00Z",
    reportedBy: "STAFF001",
  },
  {
    id: "C002",
    studentId: "STU002",
    studentName: "Jane Smith",
    source: "library",
    category: "property_damage",
    description: "Damaged library book",
    severity: "moderate",
    status: "under_review",
    timestamp: "2023-05-14T10:15:00Z",
    reportedBy: "STAFF002",
  },
  {
    id: "C003",
    studentId: "STU003",
    studentName: "Michael Johnson",
    source: "cafeteria",
    category: "misconduct",
    description: "Disrespectful behavior towards staff",
    severity: "severe",
    status: "action_taken",
    timestamp: "2023-05-13T09:45:00Z",
    reportedBy: "STAFF003",
    action: {
      type: "suspension",
      duration: "3 days",
      notes: "Student suspended for 3 days",
      timestamp: "2023-05-13T11:30:00Z",
      issuedBy: "STAFF004",
    },
  },
]

const MOCK_STUDENTS = [
  {
    id: "STU001",
    name: "John Doe",
    department: "Computer Science",
    year: 2,
    disciplinaryPoints: 3,
    disciplinaryHistory: [
      {
        id: "D001",
        type: "warning",
        description: "Verbal warning for noise violation",
        timestamp: "2023-04-10T14:30:00Z",
        issuedBy: "STAFF001",
      },
    ],
  },
  {
    id: "STU002",
    name: "Jane Smith",
    department: "Electrical Engineering",
    year: 3,
    disciplinaryPoints: 5,
    disciplinaryHistory: [
      {
        id: "D002",
        type: "warning",
        description: "Written warning for late return to dormitory",
        timestamp: "2023-03-15T09:30:00Z",
        issuedBy: "STAFF002",
      },
      {
        id: "D003",
        type: "fine",
        description: "Fine for damaging library property",
        amount: 50,
        timestamp: "2023-04-20T11:45:00Z",
        issuedBy: "STAFF003",
      },
    ],
  },
  {
    id: "STU003",
    name: "Michael Johnson",
    department: "Mechanical Engineering",
    year: 4,
    disciplinaryPoints: 12,
    disciplinaryHistory: [
      {
        id: "D004",
        type: "warning",
        description: "Written warning for unauthorized guest",
        timestamp: "2023-02-05T16:20:00Z",
        issuedBy: "STAFF001",
      },
      {
        id: "D005",
        type: "suspension",
        description: "3-day suspension for disrespectful behavior",
        duration: "3 days",
        timestamp: "2023-05-13T11:30:00Z",
        issuedBy: "STAFF004",
      },
    ],
  },
]

const DisciplineSystem = () => {
  const [activeTab, setActiveTab] = useState("complaints")
  const [complaints, setComplaints] = useState(MOCK_COMPLAINTS)
  const [students, setStudents] = useState(MOCK_STUDENTS)
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterSource, setFilterSource] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterSeverity, setFilterSeverity] = useState("all")

  // Filter complaints based on filters
  const filteredComplaints = complaints.filter((complaint) => {
    return (
      (filterSource === "all" || complaint.source === filterSource) &&
      (filterStatus === "all" || complaint.status === filterStatus) &&
      (filterSeverity === "all" || complaint.severity === filterSeverity)
    )
  })

  // Filter students based on search query
  const filteredStudents = students.filter((student) => {
    return (
      student.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  // Handle complaint selection
  const handleComplaintSelect = (complaint) => {
    setSelectedComplaint(complaint)
    // Find the student associated with this complaint
    const student = students.find((s) => s.id === complaint.studentId)
    setSelectedStudent(student)
    setActiveTab("complaint-details")
  }

  // Handle student selection
  const handleStudentSelect = (student) => {
    setSelectedStudent(student)
    setActiveTab("student-details")
  }

  // Handle taking disciplinary action
  const handleTakeAction = (actionType, details) => {
    if (!selectedStudent || !selectedComplaint) return

    // In a real app, this would call an API to update the database
    // For now, we'll just update our local state

    // Create a new action
    const newAction = {
      type: actionType,
      ...details,
      timestamp: new Date().toISOString(),
      issuedBy: "STAFF004", // This would be the current user's ID
    }

    // Update the complaint
    const updatedComplaints = complaints.map((c) => {
      if (c.id === selectedComplaint.id) {
        return {
          ...c,
          status: "action_taken",
          action: newAction,
        }
      }
      return c
    })
    setComplaints(updatedComplaints)
    setSelectedComplaint({ ...selectedComplaint, status: "action_taken", action: newAction })

    // Update the student's disciplinary history
    const updatedStudents = students.map((s) => {
      if (s.id === selectedStudent.id) {
        const pointsToAdd = actionType === "warning" ? 1 : actionType === "suspension" ? 5 : 10
        return {
          ...s,
          disciplinaryPoints: s.disciplinaryPoints + pointsToAdd,
          disciplinaryHistory: [
            ...s.disciplinaryHistory,
            {
              id: `D${Math.floor(Math.random() * 1000)}`,
              ...newAction,
            },
          ],
        }
      }
      return s
    })
    setStudents(updatedStudents)
    setSelectedStudent(updatedStudents.find((s) => s.id === selectedStudent.id))

    // Show success message (in a real app)
    alert(`${actionType.charAt(0).toUpperCase() + actionType.slice(1)} issued successfully.`)
  }

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  // Get status display text
  const getStatusDisplay = (status) => {
    switch (status) {
      case "pending":
        return "Pending"
      case "under_review":
        return "Under Review"
      case "action_taken":
        return "Action Taken"
      case "dismissed":
        return "Dismissed"
      default:
        return status
    }
  }

  // Get severity display text and class
  const getSeverityInfo = (severity) => {
    switch (severity) {
      case "minor":
        return { text: "Minor", className: "severity-minor" }
      case "moderate":
        return { text: "Moderate", className: "severity-moderate" }
      case "severe":
        return { text: "Severe", className: "severity-severe" }
      default:
        return { text: severity, className: "" }
    }
  }

  // Get source display text
  const getSourceDisplay = (source) => {
    switch (source) {
      case "dormitory":
        return "Dormitory"
      case "cafeteria":
        return "Cafeteria"
      case "library":
        return "Library"
      case "security":
        return "Security"
      default:
        return source
    }
  }

  return (
    <div className="discipline-system">
      <div className="discipline-header">
        <h1>Discipline Management System</h1>
        <div className="tabs">
          <button
            className={`tab-button ${activeTab === "complaints" ? "active" : ""}`}
            onClick={() => setActiveTab("complaints")}
          >
            Complaints
          </button>
          <button
            className={`tab-button ${activeTab === "students" ? "active" : ""}`}
            onClick={() => setActiveTab("students")}
          >
            Students
          </button>
          <button
            className={`tab-button ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </button>
        </div>
      </div>

      <div className="discipline-content">
        {/* Complaints List */}
        {activeTab === "complaints" && (
          <div className="complaints-container">
            <div className="filters">
              <div className="filter-group">
                <label>Source:</label>
                <select value={filterSource} onChange={(e) => setFilterSource(e.target.value)}>
                  <option value="all">All Sources</option>
                  <option value="dormitory">Dormitory</option>
                  <option value="cafeteria">Cafeteria</option>
                  <option value="library">Library</option>
                  <option value="security">Security</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Status:</label>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="action_taken">Action Taken</option>
                  <option value="dismissed">Dismissed</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Severity:</label>
                <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
                  <option value="all">All Severities</option>
                  <option value="minor">Minor</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                </select>
              </div>
            </div>

            <div className="complaints-list">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Student</th>
                    <th>Source</th>
                    <th>Description</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComplaints.map((complaint) => (
                    <tr key={complaint.id}>
                      <td>{complaint.id}</td>
                      <td>{complaint.studentName}</td>
                      <td>{getSourceDisplay(complaint.source)}</td>
                      <td className="description-cell">{complaint.description}</td>
                      <td>
                        <span className={`severity-badge ${getSeverityInfo(complaint.severity).className}`}>
                          {getSeverityInfo(complaint.severity).text}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge status-${complaint.status}`}>
                          {getStatusDisplay(complaint.status)}
                        </span>
                      </td>
                      <td>{formatDate(complaint.timestamp)}</td>
                      <td>
                        <button className="view-button" onClick={() => handleComplaintSelect(complaint)}>
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Students List */}
        {activeTab === "students" && (
          <div className="students-container">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search by ID or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="students-list">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Year</th>
                    <th>Disciplinary Points</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id}>
                      <td>{student.id}</td>
                      <td>{student.name}</td>
                      <td>{student.department}</td>
                      <td>{student.year}</td>
                      <td>
                        <span
                          className={`points-badge ${
                            student.disciplinaryPoints >= 10
                              ? "points-high"
                              : student.disciplinaryPoints >= 5
                                ? "points-medium"
                                : "points-low"
                          }`}
                        >
                          {student.disciplinaryPoints}
                        </span>
                      </td>
                      <td>
                        <button className="view-button" onClick={() => handleStudentSelect(student)}>
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Dashboard */}
        {activeTab === "dashboard" && (
          <div className="dashboard-container">
            <div className="stats-cards">
              <div className="stat-card">
                <h3>Pending Complaints</h3>
                <div className="stat-value">{complaints.filter((c) => c.status === "pending").length}</div>
              </div>
              <div className="stat-card">
                <h3>Under Review</h3>
                <div className="stat-value">{complaints.filter((c) => c.status === "under_review").length}</div>
              </div>
              <div className="stat-card">
                <h3>Actions Taken</h3>
                <div className="stat-value">{complaints.filter((c) => c.status === "action_taken").length}</div>
              </div>
              <div className="stat-card">
                <h3>Total Students</h3>
                <div className="stat-value">{students.length}</div>
              </div>
            </div>

            <div className="dashboard-sections">
              <div className="dashboard-section">
                <h3>Recent Complaints</h3>
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Student</th>
                      <th>Source</th>
                      <th>Severity</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .slice(0, 5)
                      .map((complaint) => (
                        <tr key={complaint.id}>
                          <td>{complaint.id}</td>
                          <td>{complaint.studentName}</td>
                          <td>{getSourceDisplay(complaint.source)}</td>
                          <td>
                            <span className={`severity-badge ${getSeverityInfo(complaint.severity).className}`}>
                              {getSeverityInfo(complaint.severity).text}
                            </span>
                          </td>
                          <td>
                            <span className={`status-badge status-${complaint.status}`}>
                              {getStatusDisplay(complaint.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <div className="dashboard-section">
                <h3>Students with High Points</h3>
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Department</th>
                      <th>Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students
                      .sort((a, b) => b.disciplinaryPoints - a.disciplinaryPoints)
                      .slice(0, 5)
                      .map((student) => (
                        <tr key={student.id}>
                          <td>{student.id}</td>
                          <td>{student.name}</td>
                          <td>{student.department}</td>
                          <td>
                            <span
                              className={`points-badge ${
                                student.disciplinaryPoints >= 10
                                  ? "points-high"
                                  : student.disciplinaryPoints >= 5
                                    ? "points-medium"
                                    : "points-low"
                              }`}
                            >
                              {student.disciplinaryPoints}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Complaint Details */}
        {activeTab === "complaint-details" && selectedComplaint && selectedStudent && (
          <div className="complaint-details">
            <div className="details-header">
              <h2>Complaint Details</h2>
              <button className="back-button" onClick={() => setActiveTab("complaints")}>
                Back to Complaints
              </button>
            </div>

            <div className="details-content">
              <div className="complaint-info">
                <h3>Complaint Information</h3>
                <div className="info-grid">
                  <div className="info-row">
                    <div className="info-label">Complaint ID:</div>
                    <div className="info-value">{selectedComplaint.id}</div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">Source:</div>
                    <div className="info-value">{getSourceDisplay(selectedComplaint.source)}</div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">Category:</div>
                    <div className="info-value">
                      {selectedComplaint.category.charAt(0).toUpperCase() + selectedComplaint.category.slice(1)}
                    </div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">Severity:</div>
                    <div className="info-value">
                      <span className={`severity-badge ${getSeverityInfo(selectedComplaint.severity).className}`}>
                        {getSeverityInfo(selectedComplaint.severity).text}
                      </span>
                    </div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">Status:</div>
                    <div className="info-value">
                      <span className={`status-badge status-${selectedComplaint.status}`}>
                        {getStatusDisplay(selectedComplaint.status)}
                      </span>
                    </div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">Date Reported:</div>
                    <div className="info-value">{formatDate(selectedComplaint.timestamp)}</div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">Reported By:</div>
                    <div className="info-value">{selectedComplaint.reportedBy}</div>
                  </div>
                </div>

                <div className="description-box">
                  <h4>Description:</h4>
                  <p>{selectedComplaint.description}</p>
                </div>

                {selectedComplaint.action && (
                  <div className="action-box">
                    <h4>Action Taken:</h4>
                    <div className="info-grid">
                      <div className="info-row">
                        <div className="info-label">Type:</div>
                        <div className="info-value">
                          {selectedComplaint.action.type.charAt(0).toUpperCase() +
                            selectedComplaint.action.type.slice(1)}
                        </div>
                      </div>
                      {selectedComplaint.action.duration && (
                        <div className="info-row">
                          <div className="info-label">Duration:</div>
                          <div className="info-value">{selectedComplaint.action.duration}</div>
                        </div>
                      )}
                      <div className="info-row">
                        <div className="info-label">Date:</div>
                        <div className="info-value">{formatDate(selectedComplaint.action.timestamp)}</div>
                      </div>
                      <div className="info-row">
                        <div className="info-label">Issued By:</div>
                        <div className="info-value">{selectedComplaint.action.issuedBy}</div>
                      </div>
                    </div>
                    {selectedComplaint.action.notes && (
                      <div className="notes-box">
                        <h4>Notes:</h4>
                        <p>{selectedComplaint.action.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="student-info">
                <h3>Student Information</h3>
                <div className="info-grid">
                  <div className="info-row">
                    <div className="info-label">Student ID:</div>
                    <div className="info-value">{selectedStudent.id}</div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">Name:</div>
                    <div className="info-value">{selectedStudent.name}</div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">Department:</div>
                    <div className="info-value">{selectedStudent.department}</div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">Year:</div>
                    <div className="info-value">{selectedStudent.year}</div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">Disciplinary Points:</div>
                    <div className="info-value">
                      <span
                        className={`points-badge ${
                          selectedStudent.disciplinaryPoints >= 10
                            ? "points-high"
                            : selectedStudent.disciplinaryPoints >= 5
                              ? "points-medium"
                              : "points-low"
                        }`}
                      >
                        {selectedStudent.disciplinaryPoints}
                      </span>
                    </div>
                  </div>
                </div>

                <h4>Disciplinary History:</h4>
                {selectedStudent.disciplinaryHistory.length === 0 ? (
                  <p>No previous disciplinary records.</p>
                ) : (
                  <div className="history-list">
                    {selectedStudent.disciplinaryHistory.map((record) => (
                      <div key={record.id} className="history-item">
                        <div className="history-header">
                          <span className={`history-type history-${record.type}`}>
                            {record.type.charAt(0).toUpperCase() + record.type.slice(1)}
                          </span>
                          <span className="history-date">{formatDate(record.timestamp)}</span>
                        </div>
                        <div className="history-description">{record.description}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {selectedComplaint.status !== "action_taken" && selectedComplaint.status !== "dismissed" && (
              <div className="action-section">
                <h3>Take Action</h3>
                <div className="action-buttons">
                  <button
                    className="action-button warning-action"
                    onClick={() =>
                      handleTakeAction("warning", {
                        description: "Warning issued for " + selectedComplaint.description,
                        notes: "Student has been warned about this behavior.",
                      })
                    }
                  >
                    Issue Warning
                  </button>
                  <button
                    className="action-button suspension-action"
                    onClick={() =>
                      handleTakeAction("suspension", {
                        description: "Suspension for " + selectedComplaint.description,
                        duration: "3 days",
                        notes: "Student has been suspended for 3 days.",
                      })
                    }
                  >
                    Issue Suspension
                  </button>
                  <button
                    className="action-button dismissal-action"
                    onClick={() =>
                      handleTakeAction("dismissal", {
                        description: "Academic dismissal for " + selectedComplaint.description,
                        notes: "Student has been academically dismissed due to severe violation.",
                      })
                    }
                  >
                    Academic Dismissal
                  </button>
                  <button
                    className="action-button dismiss-action"
                    onClick={() => {
                      // Update the complaint status to dismissed
                      const updatedComplaints = complaints.map((c) => {
                        if (c.id === selectedComplaint.id) {
                          return {
                            ...c,
                            status: "dismissed",
                          }
                        }
                        return c
                      })
                      setComplaints(updatedComplaints)
                      setSelectedComplaint({ ...selectedComplaint, status: "dismissed" })
                      alert("Complaint has been dismissed.")
                    }}
                  >
                    Dismiss Complaint
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Student Details */}
        {activeTab === "student-details" && selectedStudent && (
          <div className="student-details">
            <div className="details-header">
              <h2>Student Details</h2>
              <button className="back-button" onClick={() => setActiveTab("students")}>
                Back to Students
              </button>
            </div>

            <div className="details-content">
              <div className="student-info-full">
                <h3>Student Information</h3>
                <div className="info-grid">
                  <div className="info-row">
                    <div className="info-label">Student ID:</div>
                    <div className="info-value">{selectedStudent.id}</div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">Name:</div>
                    <div className="info-value">{selectedStudent.name}</div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">Department:</div>
                    <div className="info-value">{selectedStudent.department}</div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">Year:</div>
                    <div className="info-value">{selectedStudent.year}</div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">Disciplinary Points:</div>
                    <div className="info-value">
                      <span
                        className={`points-badge ${
                          selectedStudent.disciplinaryPoints >= 10
                            ? "points-high"
                            : selectedStudent.disciplinaryPoints >= 5
                              ? "points-medium"
                              : "points-low"
                        }`}
                      >
                        {selectedStudent.disciplinaryPoints}
                      </span>
                    </div>
                  </div>
                </div>

                <h3>Disciplinary History</h3>
                {selectedStudent.disciplinaryHistory.length === 0 ? (
                  <p>No disciplinary records found.</p>
                ) : (
                  <div className="history-timeline">
                    {selectedStudent.disciplinaryHistory.map((record) => (
                      <div key={record.id} className="timeline-item">
                        <div className="timeline-marker"></div>
                        <div className="timeline-content">
                          <div className="timeline-header">
                            <span className={`timeline-type timeline-${record.type}`}>
                              {record.type.charAt(0).toUpperCase() + record.type.slice(1)}
                            </span>
                            <span className="timeline-date">{formatDate(record.timestamp)}</span>
                          </div>
                          <div className="timeline-description">{record.description}</div>
                          {record.duration && <div className="timeline-duration">Duration: {record.duration}</div>}
                          {record.amount && <div className="timeline-amount">Amount: ${record.amount}</div>}
                          <div className="timeline-issuer">Issued by: {record.issuedBy}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <h3>Related Complaints</h3>
                {complaints.filter((c) => c.studentId === selectedStudent.id).length === 0 ? (
                  <p>No complaints found for this student.</p>
                ) : (
                  <table className="related-complaints-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Source</th>
                        <th>Description</th>
                        <th>Severity</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {complaints
                        .filter((c) => c.studentId === selectedStudent.id)
                        .map((complaint) => (
                          <tr key={complaint.id}>
                            <td>{complaint.id}</td>
                            <td>{getSourceDisplay(complaint.source)}</td>
                            <td className="description-cell">{complaint.description}</td>
                            <td>
                              <span className={`severity-badge ${getSeverityInfo(complaint.severity).className}`}>
                                {getSeverityInfo(complaint.severity).text}
                              </span>
                            </td>
                            <td>
                              <span className={`status-badge status-${complaint.status}`}>
                                {getStatusDisplay(complaint.status)}
                              </span>
                            </td>
                            <td>{formatDate(complaint.timestamp)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DisciplineSystem
