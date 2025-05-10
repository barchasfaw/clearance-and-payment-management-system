// This file serves as a mock database for storing discipline records
// In a real application, this would be replaced with a proper database

import dormitoryStore, { type DisciplinaryIssue } from "./dormitory-store"
import { makeAutoObservable } from "mobx"
import userStore from "./user-store"

// Complaint severity levels
export enum ComplaintSeverity {
  MINOR = "Minor",
  MODERATE = "Moderate",
  MAJOR = "Major",
  SEVERE = "Severe",
}

// Disciplinary action types
export enum DisciplinaryActionType {
  WARNING = "Warning",
  PROBATION = "Probation",
  SUSPENSION = "Suspension",
  DISMISSAL = "Academic Dismissal",
}

// Source of the complaint
export enum ComplaintSource {
  DORMITORY = "Dormitory",
  CAFETERIA = "Cafeteria",
  LIBRARY = "Library",
  SECURITY = "Security",
  ACADEMIC = "Academic",
  OTHER = "Other",
}

// Status of the complaint
export enum ComplaintStatus {
  PENDING = "Pending",
  UNDER_REVIEW = "Under Review",
  ACTION_TAKEN = "Action Taken",
  DISMISSED = "Dismissed",
  APPEALED = "Appealed",
}

// Interface for a complaint
export interface Complaint {
  id: string
  studentId: string
  source: ComplaintSource
  severity: ComplaintSeverity
  description: string
  dateReported: Date
  reportedBy: string
  status: ComplaintStatus
  evidence?: string[]
  notes?: string[]
}

// Interface for a disciplinary action
export interface DisciplinaryAction {
  id: string
  complaintId: string
  studentId: string
  type: DisciplinaryActionType
  description: string
  startDate: Date
  endDate?: Date // Optional for warnings
  issuedBy: string
  dateIssued: Date
  appealable: boolean
  appealed: boolean
  appealDate?: Date
  appealStatus?: string
  notes?: string[]
}

export interface DisciplineNote {
  id: string
  studentId: string
  createdBy: string
  timestamp: string
  content: string
  isPrivate: boolean
}

// Mock implementation of a discipline store
class DisciplineStore {
  complaints: Complaint[] = []
  disciplinaryActions: DisciplinaryAction[] = []
  disciplineNotes: DisciplineNote[] = []
  activeComplaintId: string | null = null
  activeStudentId: string | null = null
  private listeners: (() => void)[] = []

  // Load initial data from localStorage if available
  constructor() {
    makeAutoObservable(this)
    try {
      const savedComplaints = localStorage.getItem("discipline_complaints")
      if (savedComplaints) {
        this.complaints = JSON.parse(savedComplaints)
      } else {
        // Initialize with sample complaints
        //this.initializeSampleComplaints()
      }

      const savedActions = localStorage.getItem("discipline_actions")
      if (savedActions) {
        this.disciplinaryActions = JSON.parse(savedActions)
      } else {
        // Initialize with sample actions
        //this.initializeSampleActions()
      }

      const savedNotes = localStorage.getItem("discipline_notes")
      if (savedNotes) {
        this.disciplineNotes = JSON.parse(savedNotes)
      } else {
        // Initialize with sample notes
        //this.initializeSampleNotes()
      }

      // Import dormitory disciplinary issues as complaints
      //this.importDormitoryIssues()
    } catch (error) {
      console.error("Failed to load discipline data from localStorage:", error)
      // Initialize with sample data if loading fails
      //this.initializeSampleComplaints()
      //this.initializeSampleActions()
      //this.initializeSampleNotes()
      //this.importDormitoryIssues()
    }
    this.loadMockData()
  }

  // Load mock data for testing
  loadMockData() {
    // Mock complaints
    this.complaints = [
      {
        id: "C001",
        studentId: "STU001",
        source: ComplaintSource.DORMITORY,
        severity: ComplaintSeverity.MODERATE,
        description: "Violation of quiet hours for the third time this week",
        dateReported: new Date(2023, 4, 15),
        reportedBy: "John Doe (Dormitory Manager)",
        status: ComplaintStatus.PENDING,
        notes: ["Student has been verbally warned twice before"],
      },
      {
        id: "C002",
        studentId: "STU002",
        source: ComplaintSource.LIBRARY,
        severity: ComplaintSeverity.MINOR,
        description: "Returned damaged book",
        dateReported: new Date(2023, 4, 16),
        reportedBy: "Jane Smith (Librarian)",
        status: ComplaintStatus.PENDING,
      },
      {
        id: "C003",
        studentId: "STU003",
        source: ComplaintSource.SECURITY,
        severity: ComplaintSeverity.MAJOR,
        description: "Unauthorized access to restricted area",
        dateReported: new Date(2023, 4, 14),
        reportedBy: "Mike Johnson (Security Officer)",
        status: ComplaintStatus.UNDER_REVIEW,
        notes: ["Security camera footage available"],
      },
      {
        id: "C004",
        studentId: "STU001",
        source: ComplaintSource.CAFETERIA,
        severity: ComplaintSeverity.MINOR,
        description: "Food waste and leaving mess on table",
        dateReported: new Date(2023, 4, 13),
        reportedBy: "Lisa Wong (Cafeteria Staff)",
        status: ComplaintStatus.ACTION_TAKEN,
      },
      {
        id: "C005",
        studentId: "STU004",
        source: ComplaintSource.ACADEMIC,
        severity: ComplaintSeverity.SEVERE,
        description: "Cheating on final exam",
        dateReported: new Date(2023, 4, 10),
        reportedBy: "Prof. Robert Brown",
        status: ComplaintStatus.ACTION_TAKEN,
      },
    ]

    // Mock disciplinary actions
    this.disciplinaryActions = [
      {
        id: "DA001",
        complaintId: "C004",
        studentId: "STU001",
        type: DisciplinaryActionType.WARNING,
        description: "Formal warning for cafeteria misconduct",
        startDate: new Date(2023, 4, 14),
        issuedBy: "Discipline Committee",
        dateIssued: new Date(2023, 4, 14),
        appealable: true,
        appealed: false,
        notes: ["First offense"],
      },
      {
        id: "DA002",
        complaintId: "C005",
        studentId: "STU004",
        type: DisciplinaryActionType.SUSPENSION,
        description: "Two-week suspension for academic dishonesty",
        startDate: new Date(2023, 4, 12),
        endDate: new Date(2023, 4, 26),
        issuedBy: "Academic Discipline Board",
        dateIssued: new Date(2023, 4, 11),
        appealable: true,
        appealed: true,
        appealDate: new Date(2023, 4, 12),
        appealStatus: "Denied",
        notes: ["Second offense of academic dishonesty"],
      },
    ]
  }

  // Import dormitory disciplinary issues as complaints
  private importDormitoryIssues() {
    const dormitoryIssues = dormitoryStore.getAllDisciplinaryIssues()

    // Check if we already imported these issues (avoid duplicates)
    const existingOriginalIds = new Set(this.complaints.filter((c) => c.originalIssueId).map((c) => c.originalIssueId))

    // Filter out issues that have already been imported
    const newIssues = dormitoryIssues.filter((issue) => !existingOriginalIds.has(issue.id))

    // Convert dormitory issues to complaints
    const newComplaints = newIssues.map((issue) => this.convertDormitoryIssueToDisciplineComplaint(issue))

    // Add new complaints
    if (newComplaints.length > 0) {
      this.complaints = [...this.complaints, ...newComplaints]
      this.saveToStorage()
    }
  }

  // Convert dormitory issue to discipline complaint
  private convertDormitoryIssueToDisciplineComplaint(issue: DisciplinaryIssue): Complaint {
    // Map severity
    let severity: ComplaintSeverity
    switch (issue.severity) {
      case "minor":
        severity = ComplaintSeverity.MINOR
        break
      case "moderate":
        severity = ComplaintSeverity.MODERATE
        break
      case "severe":
        severity = ComplaintSeverity.SEVERE
        break
      default:
        severity = ComplaintSeverity.MINOR
    }

    // Map status
    let status: ComplaintStatus
    switch (issue.status) {
      case "pending":
        status = ComplaintStatus.PENDING
        break
      case "addressed":
        status = ComplaintStatus.UNDER_REVIEW
        break
      case "resolved":
        status = ComplaintStatus.ACTION_TAKEN
        break
      default:
        status = ComplaintStatus.PENDING
    }

    return {
      id: `COMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      studentId: issue.userId,
      reportedBy: issue.reportedBy,
      source: ComplaintSource.DORMITORY,
      severity,
      description: issue.description,
      dateReported: new Date(issue.timestamp),
      status,
      evidence: [],
      notes: issue.resolution
        ? [
            `Resolution from dormitory: ${issue.resolution} (${new Date(issue.resolutionDate || "").toLocaleDateString()})`,
          ]
        : undefined,
    }
  }

  // Initialize with sample complaints
  private initializeSampleComplaints() {
    const sources: ComplaintSource[] = [
      ComplaintSource.SECURITY,
      ComplaintSource.DORMITORY,
      ComplaintSource.CAFETERIA,
      ComplaintSource.LIBRARY,
      ComplaintSource.ACADEMIC,
      ComplaintSource.OTHER,
    ]
    const severities: ComplaintSeverity[] = [
      ComplaintSeverity.MINOR,
      ComplaintSeverity.MODERATE,
      ComplaintSeverity.SEVERE,
      ComplaintSeverity.MAJOR,
    ]
    const statuses: ComplaintStatus[] = [
      ComplaintStatus.PENDING,
      ComplaintStatus.UNDER_REVIEW,
      ComplaintStatus.ACTION_TAKEN,
      ComplaintStatus.DISMISSED,
    ]

    const securityCategories = ["Unauthorized Access", "Item Smuggling", "Curfew Violation", "ID Misuse"]
    const dormitoryCategories = ["Noise Complaint", "Property Damage", "Unauthorized Guest", "Cleanliness"]
    const cafeteriaCategories = ["Food Waste", "Cutting Line", "Disruptive Behavior", "Unauthorized Access"]
    const libraryCategories = ["Noise Disturbance", "Book Damage", "Late Returns", "Unauthorized Access"]
    const disciplineCategories = ["Academic Dishonesty", "Harassment", "Substance Abuse", "Repeated Violations"]

    const categoryMap: Record<ComplaintSource, string[]> = {
      [ComplaintSource.SECURITY]: securityCategories,
      [ComplaintSource.DORMITORY]: dormitoryCategories,
      [ComplaintSource.CAFETERIA]: cafeteriaCategories,
      [ComplaintSource.LIBRARY]: libraryCategories,
      [ComplaintSource.ACADEMIC]: disciplineCategories,
      [ComplaintSource.OTHER]: ["Behavioral Issue", "Policy Violation", "Misconduct", "Other Violation"],
    }

    this.complaints = []

    // Generate random complaints for STU001-STU005
    for (let i = 1; i <= 5; i++) {
      const studentId = `STU00${i}`
      const numComplaints = Math.floor(Math.random() * 4) + 1 // 1-4 complaints per student

      for (let j = 0; j < numComplaints; j++) {
        const source = sources[Math.floor(Math.random() * sources.length)]
        const categories = categoryMap[source]
        const category = categories[Math.floor(Math.random() * categories.length)]
        const severity = severities[Math.floor(Math.random() * severities.length)]

        // More serious complaints are more likely to be resolved
        let statusProbabilities: [ComplaintStatus, number][]
        if (severity === ComplaintSeverity.MAJOR || severity === ComplaintSeverity.SEVERE) {
          statusProbabilities = [
            [ComplaintStatus.PENDING, 0.1],
            [ComplaintStatus.UNDER_REVIEW, 0.2],
            [ComplaintStatus.ACTION_TAKEN, 0.6],
            [ComplaintStatus.DISMISSED, 0.1],
          ]
        } else {
          statusProbabilities = [
            [ComplaintStatus.PENDING, 0.3],
            [ComplaintStatus.UNDER_REVIEW, 0.3],
            [ComplaintStatus.ACTION_TAKEN, 0.3],
            [ComplaintStatus.DISMISSED, 0.1],
          ]
        }

        // Select status based on weighted probabilities
        const random = Math.random()
        let cumulativeProbability = 0
        let status: ComplaintStatus = ComplaintStatus.PENDING

        for (const [s, probability] of statusProbabilities) {
          cumulativeProbability += probability
          if (random < cumulativeProbability) {
            status = s
            break
          }
        }

        // Create a date within the last 60 days
        const daysAgo = Math.floor(Math.random() * 60)
        const date = new Date()
        date.setDate(date.getDate() - daysAgo)

        const complaint: Complaint = {
          id: `COMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          studentId,
          reportedBy: this.getRandomReporterBySource(source),
          source,
          severity,
          description: this.getRandomDescription(source, category),
          dateReported: date,
          status,
          notes: status !== ComplaintStatus.PENDING ? [this.getRandomNote(status)] : undefined,
        }

        this.complaints.push(complaint)
      }
    }

    // Sort by timestamp (newest first)
    this.complaints.sort((a, b) => new Date(b.dateReported).getTime() - new Date(a.dateReported).getTime())

    this.saveToStorage()
  }

  // Initialize with sample disciplinary actions
  private initializeSampleActions() {
    const actionTypes: DisciplinaryActionType[] = [
      DisciplinaryActionType.WARNING,
      DisciplinaryActionType.PROBATION,
      DisciplinaryActionType.SUSPENSION,
      DisciplinaryActionType.DISMISSAL,
      "other" as any,
    ]

    this.disciplinaryActions = []

    // For each student, check if they have resolved severe/critical complaints
    for (let i = 1; i <= 5; i++) {
      const studentId = `STU00${i}`
      const severeComplaints = this.complaints.filter(
        (c) =>
          c.studentId === studentId &&
          (c.severity === ComplaintSeverity.SEVERE || c.severity === ComplaintSeverity.MAJOR) &&
          c.status === ComplaintStatus.ACTION_TAKEN,
      )

      if (severeComplaints.length > 0) {
        // Determine action type based on number of severe complaints
        let actionType: DisciplinaryActionType
        if (severeComplaints.length >= 3) {
          actionType = Math.random() < 0.3 ? DisciplinaryActionType.DISMISSAL : DisciplinaryActionType.SUSPENSION
        } else if (severeComplaints.length === 2) {
          actionType = Math.random() < 0.7 ? DisciplinaryActionType.SUSPENSION : DisciplinaryActionType.PROBATION
        } else {
          actionType = Math.random() < 0.7 ? DisciplinaryActionType.PROBATION : DisciplinaryActionType.WARNING
        }

        // Create dates for the action
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 30))

        let endDate: Date | undefined
        if (actionType === DisciplinaryActionType.PROBATION || actionType === DisciplinaryActionType.SUSPENSION) {
          endDate = new Date(startDate)
          if (actionType === DisciplinaryActionType.PROBATION) {
            endDate.setMonth(endDate.getMonth() + Math.floor(Math.random() * 3) + 1) // 1-3 months
          } else {
            endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 14) + 7) // 1-3 weeks
          }
        }

        const action: DisciplinaryAction = {
          id: `ACTION-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          complaintId: severeComplaints[0].id,
          studentId,
          issuedBy: "discipline",
          dateIssued: startDate,
          type: actionType,
          description: this.getRandomActionDescription(actionType),
          startDate: startDate,
          endDate: endDate,
          appealable: true,
          appealed: false,
          notes: actionType !== DisciplinaryActionType.DISMISSAL ? this.getRandomConditions(actionType) : undefined,
        }

        this.disciplinaryActions.push(action)
      } else {
        // Check for moderate complaints
        const moderateComplaints = this.complaints.filter(
          (c) =>
            c.studentId === studentId &&
            c.severity === ComplaintSeverity.MODERATE &&
            c.status === ComplaintStatus.ACTION_TAKEN,
        )

        if (moderateComplaints.length >= 2) {
          // Issue a warning or probation
          const actionType = Math.random() < 0.7 ? DisciplinaryActionType.WARNING : DisciplinaryActionType.PROBATION

          // Create dates for the action
          const startDate = new Date()
          startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 30))

          let endDate: Date | undefined
          if (actionType === DisciplinaryActionType.PROBATION) {
            endDate = new Date(startDate)
            endDate.setMonth(endDate.getMonth() + 1) // 1 month
          }

          const action: DisciplinaryAction = {
            id: `ACTION-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            complaintId: moderateComplaints[0].id,
            studentId,
            issuedBy: "discipline",
            dateIssued: startDate,
            type: actionType,
            description: this.getRandomActionDescription(actionType),
            startDate: startDate,
            endDate: endDate,
            appealable: true,
            appealed: false,
            notes: this.getRandomConditions(actionType),
          }

          this.disciplinaryActions.push(action)
        }
      }
    }

    // Sort by timestamp (newest first)
    this.disciplinaryActions.sort((a, b) => new Date(b.dateIssued).getTime() - new Date(a.dateIssued).getTime())

    this.saveToStorage()
  }

  // Initialize with sample notes
  private initializeSampleNotes() {
    this.disciplineNotes = []

    // For each student with disciplinary actions
    const studentsWithActions = new Set(this.disciplinaryActions.map((a) => a.studentId))

    studentsWithActions.forEach((studentId) => {
      const numNotes = Math.floor(Math.random() * 3) + 1 // 1-3 notes per student

      for (let i = 0; i < numNotes; i++) {
        const date = new Date()
        date.setDate(date.getDate() - Math.floor(Math.random() * 60))

        const note: DisciplineNote = {
          id: `NOTE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          studentId,
          createdBy: "discipline",
          timestamp: date.toISOString(),
          content: this.getRandomNoteContent(),
          isPrivate: Math.random() < 0.3, // 30% chance of being private
        }

        this.disciplineNotes.push(note)
      }
    })

    // Sort by timestamp (newest first)
    this.disciplineNotes.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    this.saveToStorage()
  }

  // Helper method to get random reporter based on source
  private getRandomReporterBySource(source: ComplaintSource): string {
    switch (source) {
      case ComplaintSource.SECURITY:
        return "security"
      case ComplaintSource.DORMITORY:
        return "dormitory"
      case ComplaintSource.CAFETERIA:
        return "cafe"
      case ComplaintSource.LIBRARY:
        return "library"
      case ComplaintSource.ACADEMIC:
        return "discipline"
      case ComplaintSource.OTHER:
        const reporters = ["security", "dormitory", "cafe", "library", "discipline"]
        return reporters[Math.floor(Math.random() * reporters.length)]
    }
  }

  // Helper method to get random description for complaints
  private getRandomDescription(source: ComplaintSource, category: string): string {
    const securityDescriptions: Record<string, string[]> = {
      "Unauthorized Access": [
        "Student attempted to enter restricted area without permission",
        "Found in secure location after hours without authorization",
        "Used another student's ID to gain access to restricted area",
        "Bypassed security checkpoint",
      ],
      "Item Smuggling": [
        "Attempted to bring prohibited items into campus",
        "Found with contraband during routine check",
        "Concealed unauthorized items during entry inspection",
        "Helped another student smuggle prohibited items",
      ],
      "Curfew Violation": [
        "Returned to dormitory 2 hours after curfew",
        "Found outside campus boundaries after curfew hours",
        "Multiple instances of late return to dormitory",
        "Left campus during restricted hours without permission",
      ],
      "ID Misuse": [
        "Using another student's ID card",
        "Allowed another person to use their ID",
        "Attempted to create counterfeit ID",
        "Modified ID card to bypass security systems",
      ],
    }

    const dormitoryDescriptions: Record<string, string[]> = {
      "Noise Complaint": [
        "Excessive noise during quiet hours",
        "Playing loud music after 10 PM",
        "Disturbing other residents with loud gathering",
        "Repeated noise violations despite warnings",
      ],
      "Property Damage": [
        "Damaged dormitory furniture",
        "Graffiti on dormitory walls",
        "Broke window during horseplay",
        "Intentional damage to common area facilities",
      ],
      "Unauthorized Guest": [
        "Non-resident found in room after visiting hours",
        "Hosting overnight guest without permission",
        "Exceeded allowed number of visitors",
        "Guest violated dormitory policies",
      ],
      Cleanliness: [
        "Failed room inspection due to unsanitary conditions",
        "Improper disposal of waste",
        "Persistent cleanliness issues despite warnings",
        "Caused pest infestation due to poor hygiene",
      ],
    }

    const cafeteriaDescriptions: Record<string, string[]> = {
      "Food Waste": [
        "Excessive food waste observed repeatedly",
        "Taking more food than consumed",
        "Improper disposal of food",
        "Intentional food waste as prank",
      ],
      "Cutting Line": [
        "Repeatedly cutting in front of other students",
        "Allowing friends to join in line",
        "Aggressive behavior when confronted about line cutting",
        "Disrupting orderly food service",
      ],
      "Disruptive Behavior": [
        "Loud and disruptive behavior in cafeteria",
        "Food fight involvement",
        "Harassment of cafeteria staff",
        "Creating disturbance during meal time",
      ],
      "Unauthorized Access": [
        "Attempting to get meals outside designated times",
        "Using another student's meal card",
        "Entering food preparation areas without permission",
        "Helping unauthorized persons access cafeteria",
      ],
    }

    const libraryDescriptions: Record<string, string[]> = {
      "Noise Disturbance": [
        "Loud conversation in quiet study area",
        "Disruptive behavior affecting other students",
        "Playing audio without headphones",
        "Repeated noise violations despite warnings",
      ],
      "Book Damage": [
        "Returned book with significant damage",
        "Writing/highlighting in library materials",
        "Improper handling causing damage to rare materials",
        "Intentional vandalism of library resources",
      ],
      "Late Returns": [
        "Multiple books overdue by more than 30 days",
        "Persistent pattern of late returns",
        "Failure to respond to overdue notices",
        "Keeping high-demand materials beyond allowed period",
      ],
      "Unauthorized Access": [
        "Found in library after closing hours",
        "Accessing restricted collections without permission",
        "Using another student's credentials for library services",
        "Attempting to remove security tags from materials",
      ],
    }

    const disciplineDescriptions: Record<string, string[]> = {
      "Academic Dishonesty": [
        "Caught cheating during examination",
        "Plagiarism in submitted assignment",
        "Unauthorized collaboration on individual project",
        "Falsifying research data",
      ],
      Harassment: [
        "Verbal harassment of fellow student",
        "Cyberbullying through social media",
        "Creating hostile environment for peers",
        "Intimidating behavior towards staff",
      ],
      "Substance Abuse": [
        "Found in possession of prohibited substances",
        "Under influence during class activities",
        "Distributing controlled substances on campus",
        "Smoking in non-designated areas",
      ],
      "Repeated Violations": [
        "Multiple minor violations across departments",
        "Failure to comply with previous disciplinary measures",
        "Pattern of disregard for institutional policies",
        "Escalating severity of violations",
      ],
    }

    const otherDescriptions: Record<string, string[]> = {
      "Behavioral Issue": [
        "Disrespectful behavior towards staff",
        "Disruptive conduct during official events",
        "Inappropriate language in academic setting",
        "Refusal to comply with staff instructions",
      ],
      "Policy Violation": [
        "Violation of dress code policy",
        "Unauthorized use of institutional resources",
        "Failure to follow safety protocols",
        "Misuse of campus facilities",
      ],
      Misconduct: [
        "Inappropriate behavior during field trip",
        "Misrepresentation of facts to administration",
        "Interfering with institutional operations",
        "Violation of technology acceptable use policy",
      ],
      "Other Violation": [
        "Unauthorized fundraising on campus",
        "Violation of posting/advertising policies",
        "Inappropriate use of institutional name/logo",
        "Failure to identify oneself to institutional officials",
      ],
    }

    const descriptionMap: Record<ComplaintSource, Record<string, string[]>> = {
      [ComplaintSource.SECURITY]: securityDescriptions,
      [ComplaintSource.DORMITORY]: dormitoryDescriptions,
      [ComplaintSource.CAFETERIA]: cafeteriaDescriptions,
      [ComplaintSource.LIBRARY]: libraryDescriptions,
      [ComplaintSource.ACADEMIC]: disciplineDescriptions,
      [ComplaintSource.OTHER]: otherDescriptions,
    }

    // Get descriptions for this source and category
    const descriptions = descriptionMap[source][category] || otherDescriptions["Other Violation"]

    return descriptions[Math.floor(Math.random() * descriptions.length)]
  }

  // Helper method to get random note based on status
  private getRandomNote(status: ComplaintStatus): string {
    if (status === ComplaintStatus.UNDER_REVIEW) {
      const underReviewNotes = [
        "Investigating the incident. Contacted witnesses for statements.",
        "Reviewing security footage related to the incident.",
        "Scheduled meeting with the student to discuss the complaint.",
        "Gathering additional evidence from the reporting department.",
        "Consulting with department head about appropriate response.",
      ]
      return underReviewNotes[Math.floor(Math.random() * underReviewNotes.length)]
    } else if (status === ComplaintStatus.ACTION_TAKEN) {
      const resolvedNotes = [
        "Student admitted to the violation and accepted responsibility.",
        "Evidence confirmed the violation. Appropriate action has been taken.",
        "Student completed required remedial actions.",
        "Mediation session conducted with all involved parties.",
        "Formal warning issued and documented in student record.",
      ]
      return resolvedNotes[Math.floor(Math.random() * resolvedNotes.length)]
    } else if (status === ComplaintStatus.DISMISSED) {
      const dismissedNotes = [
        "Insufficient evidence to support the complaint.",
        "Investigation revealed misunderstanding rather than violation.",
        "Witness accounts contradicted the initial report.",
        "Student provided evidence refuting the allegations.",
        "Complaint withdrawn by reporting party.",
      ]
      return dismissedNotes[Math.floor(Math.random() * dismissedNotes.length)]
    }

    return "Note added during processing."
  }

  // Helper method to get random action description
  private getRandomActionDescription(type: DisciplinaryActionType): string {
    const warningDescriptions = [
      "Formal warning issued due to violation of institutional policies.",
      "Written warning for misconduct with notice that future violations will result in more severe consequences.",
      "Official caution regarding behavior that violates community standards.",
      "Warning issued following multiple minor infractions.",
      "Formal notice of unacceptable conduct with expectations for improvement.",
    ]

    const probationDescriptions = [
      "Disciplinary probation for policy violations. Any further infractions during this period will result in suspension.",
      "Placed on probationary status with specific behavioral requirements.",
      "Probation with mandatory participation in behavioral improvement program.",
      "Disciplinary probation with restricted privileges.",
      "Probationary period with regular check-ins with discipline officer.",
    ]

    const suspensionDescriptions = [
      "Temporary suspension from all academic and extracurricular activities.",
      "Suspended for remainder of semester due to serious policy violations.",
      "Two-week suspension with required reflection essay before readmission.",
      "Suspension with mandatory counseling before return.",
      "Temporary removal from campus with specific conditions for return.",
    ]

    const dismissalDescriptions = [
      "Academic dismissal due to severe violations of institutional policies.",
      "Permanent dismissal following multiple serious infractions.",
      "Dismissal due to actions that threatened campus safety and security.",
      "Academic dismissal with option to reapply after two years.",
      "Permanent separation from the institution due to egregious misconduct.",
    ]

    const otherDescriptions = [
      "Required community service and reflection paper.",
      "Mandatory participation in educational program related to the violation.",
      "Restitution for damages and formal apology.",
      "Loss of specific privileges with opportunity to earn reinstatement.",
      "Required counseling sessions and behavioral contract.",
    ]

    switch (type) {
      case DisciplinaryActionType.WARNING:
        return warningDescriptions[Math.floor(Math.random() * warningDescriptions.length)]
      case DisciplinaryActionType.PROBATION:
        return probationDescriptions[Math.floor(Math.random() * probationDescriptions.length)]
      case DisciplinaryActionType.SUSPENSION:
        return suspensionDescriptions[Math.floor(Math.random() * suspensionDescriptions.length)]
      case DisciplinaryActionType.DISMISSAL:
        return dismissalDescriptions[Math.floor(Math.random() * dismissalDescriptions.length)]
      default:
        return otherDescriptions[Math.floor(Math.random() * otherDescriptions.length)]
    }
  }

  // Helper method to get random conditions for disciplinary actions
  private getRandomConditions(type: DisciplinaryActionType): string[] {
    const warningConditions = [
      "Must meet with academic advisor weekly",
      "Required to write reflection essay",
      "Must attend conduct awareness workshop",
      "Regular check-ins with discipline officer",
    ]

    const probationConditions = [
      "Must maintain satisfactory academic progress",
      "Prohibited from participating in certain extracurricular activities",
      "Required to complete community service hours",
      "Must attend counseling sessions",
      "Regular meetings with discipline committee",
      "Restricted access to certain campus facilities",
    ]

    const suspensionConditions = [
      "Must complete reflection assignment before return",
      "Required to submit formal apology letter",
      "Must meet with discipline committee before reinstatement",
      "Mandatory counseling upon return",
      "Academic improvement plan must be approved before return",
      "Community service requirement upon return",
    ]

    let conditions: string[] = []
    let pool: string[] = []

    switch (type) {
      case DisciplinaryActionType.WARNING:
        pool = warningConditions
        break
      case DisciplinaryActionType.PROBATION:
        pool = probationConditions
        break
      case DisciplinaryActionType.SUSPENSION:
        pool = suspensionConditions
        break
      default:
        return []
    }

    // Select 2-3 random conditions
    const numConditions = Math.floor(Math.random() * 2) + 2
    const shuffled = [...pool].sort(() => 0.5 - Math.random())
    conditions = shuffled.slice(0, numConditions)

    return conditions
  }

  // Helper method to get random note content
  private getRandomNoteContent(): string {
    const noteContents = [
      "Student showed genuine remorse during disciplinary meeting.",
      "Recommend close monitoring of academic performance following incident.",
      "Student has shown improvement in behavior since disciplinary action.",
      "Faculty have reported positive changes in classroom conduct.",
      "Student may benefit from additional counseling resources.",
      "Consider leniency for future minor infractions given positive response to intervention.",
      "Student appears to have difficulty understanding impact of actions on community.",
      "Recommend follow-up meeting at end of semester to assess progress.",
      "Student has complied with all conditions of disciplinary action.",
      "Concerns about student's peer relationships that may contribute to behavioral issues.",
      "Student's academic performance has declined following disciplinary action - may need support.",
      "Mentor program recommended to provide additional guidance.",
    ]

    return noteContents[Math.floor(Math.random() * noteContents.length)]
  }

  // Save data to localStorage
  private saveToStorage() {
    try {
      localStorage.setItem("discipline_complaints", JSON.stringify(this.complaints))
      localStorage.setItem("discipline_actions", JSON.stringify(this.disciplinaryActions))
      localStorage.setItem("discipline_notes", JSON.stringify(this.disciplineNotes))
    } catch (error) {
      console.error("Failed to save discipline data to localStorage:", error)
    }
  }

  // Get all complaints
  get allComplaints() {
    return this.complaints
  }

  // Get pending complaints
  get pendingComplaints() {
    return this.complaints.filter(
      (c) => c.status === ComplaintStatus.PENDING || c.status === ComplaintStatus.UNDER_REVIEW,
    )
  }

  // Get complaints by student ID
  getComplaintsByStudent(studentId: string) {
    return this.complaints.filter((c) => c.studentId === studentId)
  }

  // Get disciplinary actions by student ID
  getActionsByStudent(studentId: string) {
    return this.disciplinaryActions.filter((a) => a.studentId === studentId)
  }

  // Get complaint by ID
  getComplaintById(id: string) {
    return this.complaints.find((c) => c.id === id) || null
  }

  // Get action by ID
  getActionById(id: string) {
    return this.disciplinaryActions.find((a) => a.id === id) || null
  }

  // Set active complaint
  setActiveComplaint(id: string | null) {
    this.activeComplaintId = id
    if (id) {
      const complaint = this.getComplaintById(id)
      if (complaint) {
        this.activeStudentId = complaint.studentId
      }
    }
  }

  // Set active student
  setActiveStudent(id: string | null) {
    this.activeStudentId = id
  }

  // Get active complaint
  get activeComplaint() {
    return this.activeComplaintId ? this.getComplaintById(this.activeComplaintId) : null
  }

  // Get student name by ID
  getStudentName(studentId: string) {
    const student = userStore.getUserById(studentId)
    return student ? `${student.firstName} ${student.lastName}` : "Unknown Student"
  }

  // Add a new complaint
  addComplaint(complaint: Omit<Complaint, "id" | "dateReported" | "status">) {
    const newComplaint: Complaint = {
      id: `C${String(this.complaints.length + 1).padStart(3, "0")}`,
      dateReported: new Date(),
      status: ComplaintStatus.PENDING,
      ...complaint,
    }
    this.complaints.push(newComplaint)
    return newComplaint.id
  }

  // Update complaint status
  updateComplaintStatus(id: string, status: ComplaintStatus) {
    const complaint = this.getComplaintById(id)
    if (complaint) {
      complaint.status = status
    }
  }

  // Add a note to a complaint
  addNoteToComplaint(id: string, note: string) {
    const complaint = this.getComplaintById(id)
    if (complaint) {
      if (!complaint.notes) {
        complaint.notes = []
      }
      complaint.notes.push(note)
    }
  }

  // Take disciplinary action
  takeDisciplinaryAction(action: Omit<DisciplinaryAction, "id" | "dateIssued">) {
    const newAction: DisciplinaryAction = {
      id: `DA${String(this.disciplinaryActions.length + 1).padStart(3, "0")}`,
      dateIssued: new Date(),
      ...action,
    }
    this.disciplinaryActions.push(newAction)

    // Update the complaint status
    this.updateComplaintStatus(action.complaintId, ComplaintStatus.ACTION_TAKEN)

    return newAction.id
  }

  // Record an appeal
  recordAppeal(actionId: string, appealDate: Date) {
    const action = this.getActionById(actionId)
    if (action && action.appealable) {
      action.appealed = true
      action.appealDate = appealDate
      action.appealStatus = "Pending"
    }
  }

  // Update appeal status
  updateAppealStatus(actionId: string, status: string) {
    const action = this.getActionById(actionId)
    if (action && action.appealed) {
      action.appealStatus = status
    }
  }

  // Get statistics
  get statistics() {
    return {
      totalComplaints: this.complaints.length,
      pendingComplaints: this.pendingComplaints.length,
      totalActions: this.disciplinaryActions.length,
      warningsIssued: this.disciplinaryActions.filter((a) => a.type === DisciplinaryActionType.WARNING).length,
      suspensionsIssued: this.disciplinaryActions.filter((a) => a.type === DisciplinaryActionType.SUSPENSION).length,
      dismissalsIssued: this.disciplinaryActions.filter((a) => a.type === DisciplinaryActionType.DISMISSAL).length,
      appealsFiled: this.disciplinaryActions.filter((a) => a.appealed).length,
    }
  }

  // Dismiss a complaint
  dismissComplaint(id: string, reason: string) {
    const complaint = this.getComplaintById(id)
    if (complaint) {
      complaint.status = ComplaintStatus.DISMISSED
      this.addNoteToComplaint(id, `Dismissed: ${reason}`)
    }
  }

  // Get all complaints
  getAllComplaints(): Complaint[] {
    return [...this.complaints]
  }

  // Get complaints by student ID
  getComplaintsByStudentId(studentId: string): Complaint[] {
    return this.complaints.filter((complaint) => complaint.studentId === studentId)
  }

  // Get complaint by ID
  getComplaintByIdOld(complaintId: string): Complaint | undefined {
    return this.complaints.find((complaint) => complaint.id === complaintId)
  }

  // Get pending complaints
  getPendingComplaintsOld(): Complaint[] {
    return this.complaints.filter((complaint) => complaint.status === ComplaintStatus.PENDING)
  }

  // Get complaints under review
  getComplaintsUnderReview(): Complaint[] {
    return this.complaints.filter((complaint) => complaint.status === ComplaintStatus.UNDER_REVIEW)
  }

  // Get complaints by source
  getComplaintsBySource(source: ComplaintSource): Complaint[] {
    return this.complaints.filter((complaint) => complaint.source === source)
  }

  // Get complaints by severity
  getComplaintsBySeverity(severity: ComplaintSeverity): Complaint[] {
    return this.complaints.filter((complaint) => complaint.severity === severity)
  }

  // Add a new complaint
  addComplaintOld(complaint: Omit<Complaint, "id">): Complaint {
    const newComplaint: Complaint = {
      ...complaint,
      id: `COMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }

    this.complaints.push(newComplaint)
    this.saveToStorage()
    this.notifyListeners()

    return newComplaint
  }

  // Update a complaint
  updateComplaint(complaintId: string, updates: Partial<Complaint>): boolean {
    const index = this.complaints.findIndex((complaint) => complaint.id === complaintId)

    if (index >= 0) {
      this.complaints[index] = {
        ...this.complaints[index],
        ...updates,
      }

      this.saveToStorage()
      this.notifyListeners()
      return true
    }

    return false
  }

  // Add a note to a complaint
  addNoteToComplaintOld(complaintId: string, note: string): boolean {
    const index = this.complaints.findIndex((complaint) => complaint.id === complaintId)

    if (index >= 0) {
      const complaint = this.complaints[index]
      const notes = complaint.notes || []

      this.complaints[index] = {
        ...complaint,
        notes: [...notes, note],
      }

      this.saveToStorage()
      this.notifyListeners()
      return true
    }

    return false
  }

  // Get all disciplinary actions
  getAllDisciplinaryActions(): DisciplinaryAction[] {
    return [...this.disciplinaryActions]
  }

  // Get disciplinary actions by student ID
  getDisciplinaryActionsByStudentId(studentId: string): DisciplinaryAction[] {
    return this.disciplinaryActions.filter((action) => action.studentId === studentId)
  }

  // Get disciplinary action by ID
  getDisciplinaryActionByIdOld(actionId: string): DisciplinaryAction | undefined {
    return this.disciplinaryActions.find((action) => action.id === actionId)
  }

  // Get active disciplinary actions
  getActiveDisciplinaryActions(): DisciplinaryAction[] {
    const now = new Date().toISOString()

    return this.disciplinaryActions.filter((action) => {
      // Warnings and dismissals are always considered "active"
      if (action.type === DisciplinaryActionType.WARNING || action.type === DisciplinaryActionType.DISMISSAL) {
        return true
      }

      // For probation and suspension, check if current date is between start and end dates
      return action.startDate <= new Date(now) && (!action.endDate || action.endDate >= new Date(now))
    })
  }

  // Add a new disciplinary action
  addDisciplinaryActionOld(action: Omit<DisciplinaryAction, "id">): DisciplinaryAction {
    const newAction: DisciplinaryAction = {
      ...action,
      id: `ACTION-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }

    this.disciplinaryActions.push(newAction)
    this.saveToStorage()
    this.notifyListeners()

    return newAction
  }

  // Update a disciplinary action
  updateDisciplinaryActionOld(actionId: string, updates: Partial<DisciplinaryAction>): boolean {
    const index = this.disciplinaryActions.findIndex((action) => action.id === actionId)

    if (index >= 0) {
      this.disciplinaryActions[index] = {
        ...this.disciplinaryActions[index],
        ...updates,
      }

      this.saveToStorage()
      this.notifyListeners()
      return true
    }

    return false
  }

  // Get all discipline notes
  getAllDisciplineNotes(): DisciplineNote[] {
    return [...this.disciplineNotes]
  }

  // Get discipline notes by student ID
  getDisciplineNotesByStudentId(studentId: string): DisciplineNote[] {
    return this.disciplineNotes.filter((note) => note.studentId === studentId)
  }

  // Add a new discipline note
  addDisciplineNote(note: Omit<DisciplineNote, "id">): DisciplineNote {
    const newNote: DisciplineNote = {
      ...note,
      id: `NOTE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }

    this.disciplineNotes.push(newNote)
    this.saveToStorage()
    this.notifyListeners()

    return newNote
  }

  // Update a discipline note
  updateDisciplineNote(noteId: string, updates: Partial<DisciplineNote>): boolean {
    const index = this.disciplineNotes.findIndex((note) => note.id === noteId)

    if (index >= 0) {
      this.disciplineNotes[index] = {
        ...this.disciplineNotes[index],
        ...updates,
      }

      this.saveToStorage()
      this.notifyListeners()
      return true
    }

    return false
  }

  // Delete a discipline note
  deleteDisciplineNote(noteId: string): boolean {
    const index = this.disciplineNotes.findIndex((note) => note.id === noteId)

    if (index >= 0) {
      this.disciplineNotes.splice(index, 1)
      this.saveToStorage()
      this.notifyListeners()
      return true
    }

    return false
  }

  // Get student disciplinary summary
  getStudentDisciplinarySummary(studentId: string): {
    totalComplaints: number
    pendingComplaints: number
    resolvedComplaints: number
    dismissedComplaints: number
    activeWarnings: number
    onProbation: boolean
    onSuspension: boolean
    dismissed: boolean
    mostRecentAction?: DisciplinaryAction
  } {
    const complaints = this.getComplaintsByStudentId(studentId)
    const actions = this.getDisciplinaryActionsByStudentId(studentId)

    // Count complaints by status
    const pendingComplaints = complaints.filter((c) => c.status === ComplaintStatus.PENDING).length
    const underReviewComplaints = complaints.filter((c) => c.status === ComplaintStatus.UNDER_REVIEW).length
    const resolvedComplaints = complaints.filter((c) => c.status === ComplaintStatus.ACTION_TAKEN).length
    const dismissedComplaints = complaints.filter((c) => c.status === ComplaintStatus.DISMISSED).length

    // Check current disciplinary status
    const now = new Date().toISOString()

    // Sort actions by date (newest first)
    const sortedActions = [...actions].sort(
      (a, b) => new Date(b.dateIssued).getTime() - new Date(a.dateIssued).getTime(),
    )

    const mostRecentAction = sortedActions.length > 0 ? sortedActions[0] : undefined

    // Check for dismissal
    const dismissed = actions.some((a) => a.type === DisciplinaryActionType.DISMISSAL)

    // Check for active suspension
    const onSuspension =
      !dismissed &&
      actions.some(
        (a) =>
          a.type === DisciplinaryActionType.SUSPENSION &&
          a.startDate <= new Date(now) &&
          (!a.endDate || a.endDate >= new Date(now)),
      )

    // Check for active probation
    const onProbation =
      !dismissed &&
      !onSuspension &&
      actions.some(
        (a) =>
          a.type === DisciplinaryActionType.PROBATION &&
          a.startDate <= new Date(now) &&
          (!a.endDate || a.endDate >= new Date(now)),
      )

    // Count active warnings (all warnings are considered "active")
    const activeWarnings = actions.filter((a) => a.type === DisciplinaryActionType.WARNING).length

    return {
      totalComplaints: complaints.length,
      pendingComplaints: pendingComplaints + underReviewComplaints,
      resolvedComplaints,
      dismissedComplaints,
      activeWarnings,
      onProbation,
      onSuspension,
      dismissed,
      mostRecentAction,
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
export const disciplineStore = new DisciplineStore()
