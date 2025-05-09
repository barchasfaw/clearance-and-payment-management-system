"use client"

import { useState, useEffect, type FormEvent, type ChangeEvent } from "react"
import "./AdminRegistration.css"
import { generateId } from "../utils/idGenerator"
import userStore from "../data/user-store"

// Icon components
const UserPlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="header-icon"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <line x1="19" y1="8" x2="19" y2="14"></line>
    <line x1="16" y1="11" x2="22" y2="11"></line>
  </svg>
)

// Types
type UserRole = "student" | "security" | "cafe" | "library" | "dormitory" | "discipline"

interface UserData {
  id: string
  name: string
  role: UserRole
  email: string
  phoneNumber: string
  entryDate: string
  roleSpecificData: Record<string, string>
  file?: File | null
}

const AdminRegistration = () => {
  const [userData, setUserData] = useState<UserData>({
    id: generateId(),
    name: "",
    role: "student" as UserRole,
    email: "",
    phoneNumber: "",
    entryDate: new Date().toISOString(),
    roleSpecificData: {},
    file: null,
  })

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")
  const [filePreview, setFilePreview] = useState<string>("")

  // Reset role-specific data when role changes
  useEffect(() => {
    setUserData((prev) => ({
      ...prev,
      roleSpecificData: {},
    }))
  }, [userData.role])

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleRoleSpecificChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setUserData((prev) => ({
      ...prev,
      roleSpecificData: {
        ...prev.roleSpecificData,
        [name]: value,
      },
    }))
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setUserData((prev) => ({
        ...prev,
        file,
      }))

      // Create a preview URL for the file
      const reader = new FileReader()
      reader.onloadend = () => {
        setFilePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validate form
    if (!userData.name || !userData.email || !userData.phoneNumber) {
      setError("Please fill in all required fields")
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userData.email)) {
      setError("Please enter a valid email address")
      return
    }

    // Validate phone number (simple validation)
    const phoneRegex = /^\d{10,15}$/
    if (!phoneRegex.test(userData.phoneNumber.replace(/[-()\s]/g, ""))) {
      setError("Please enter a valid phone number")
      return
    }

    setIsSubmitting(true)

    try {
      // Filter out any undefined values from roleSpecificData
      const cleanedRoleSpecificData: Record<string, string> = {}

      // Only include properties with defined string values
      Object.entries(userData.roleSpecificData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          cleanedRoleSpecificData[key] = value
        }
      })

      // Create the user object to save
      const userToSave = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        role: {
          type: userData.role,
          details: cleanedRoleSpecificData, // Use the cleaned data
        },
        entryDate: userData.entryDate,
        registeredBy: "Admin", // This could be the current user's name
        attachmentUrl: filePreview || undefined,
        attachmentType: userData.file?.type,
        attachmentName: userData.file?.name,
      }

      // Save the user to the store
      userStore.addUser(userToSave)

      console.log("Registration data:", userToSave)

      // Reset form after successful submission
      setSuccess("User registered successfully!")
      setUserData({
        id: generateId(),
        name: "",
        role: "student" as UserRole,
        email: "",
        phoneNumber: "",
        entryDate: new Date().toISOString(),
        roleSpecificData: {},
        file: null,
      })
      setFilePreview("")
    } catch (err) {
      setError("Failed to register user. Please try again.")
      console.error("Registration error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Render role-specific fields based on selected role
  const renderRoleSpecificFields = () => {
    switch (userData.role) {
      case "student":
        return (
          <div className="role-specific-fields">
            <h3>Student Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="grade" className="form-label">
                  Grade
                </label>
                <input
                  type="text"
                  id="grade"
                  name="grade"
                  className="form-input"
                  value={userData.roleSpecificData["grade"] || ""}
                  onChange={handleRoleSpecificChange}
                  placeholder="e.g., 12"
                />
              </div>
              <div className="form-group">
                <label htmlFor="admissionNumber" className="form-label">
                  Admission Number
                </label>
                <input
                  type="text"
                  id="admissionNumber"
                  name="admissionNumber"
                  className="form-input"
                  value={userData.roleSpecificData["admissionNumber"] || ""}
                  onChange={handleRoleSpecificChange}
                  placeholder="e.g., ADM12345"
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="department" className="form-label">
                Department
              </label>
              <input
                type="text"
                id="department"
                name="department"
                className="form-input"
                value={userData.roleSpecificData["department"] || ""}
                onChange={handleRoleSpecificChange}
                placeholder="e.g., Science"
              />
            </div>
          </div>
        )

      case "security":
        return (
          <div className="role-specific-fields">
            <h3>Security Staff Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="badgeNumber" className="form-label">
                  Badge Number
                </label>
                <input
                  type="text"
                  id="badgeNumber"
                  name="badgeNumber"
                  className="form-input"
                  value={userData.roleSpecificData["badgeNumber"] || ""}
                  onChange={handleRoleSpecificChange}
                  placeholder="e.g., SEC12345"
                />
              </div>
              <div className="form-group">
                <label htmlFor="shift" className="form-label">
                  Shift
                </label>
                <select
                  id="shift"
                  name="shift"
                  className="form-input"
                  value={userData.roleSpecificData["shift"] || ""}
                  onChange={handleRoleSpecificChange}
                >
                  <option value="">Select Shift</option>
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="night">Night</option>
                </select>
              </div>
            </div>
          </div>
        )

      case "cafe":
        return (
          <div className="role-specific-fields">
            <h3>Cafeteria Staff Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="employeeId" className="form-label">
                  Employee ID
                </label>
                <input
                  type="text"
                  id="employeeId"
                  name="employeeId"
                  className="form-input"
                  value={userData.roleSpecificData["employeeId"] || ""}
                  onChange={handleRoleSpecificChange}
                  placeholder="e.g., CAF12345"
                />
              </div>
              <div className="form-group">
                <label htmlFor="position" className="form-label">
                  Position
                </label>
                <input
                  type="text"
                  id="position"
                  name="position"
                  className="form-input"
                  value={userData.roleSpecificData["position"] || ""}
                  onChange={handleRoleSpecificChange}
                  placeholder="e.g., Chef, Server"
                />
              </div>
            </div>
          </div>
        )

      case "library":
        return (
          <div className="role-specific-fields">
            <h3>Library Staff Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="employeeId" className="form-label">
                  Employee ID
                </label>
                <input
                  type="text"
                  id="employeeId"
                  name="employeeId"
                  className="form-input"
                  value={userData.roleSpecificData["employeeId"] || ""}
                  onChange={handleRoleSpecificChange}
                  placeholder="e.g., LIB12345"
                />
              </div>
              <div className="form-group">
                <label htmlFor="section" className="form-label">
                  Section
                </label>
                <input
                  type="text"
                  id="section"
                  name="section"
                  className="form-input"
                  value={userData.roleSpecificData["section"] || ""}
                  onChange={handleRoleSpecificChange}
                  placeholder="e.g., Reference, Circulation"
                />
              </div>
            </div>
          </div>
        )

      case "dormitory":
        return (
          <div className="role-specific-fields">
            <h3>Dormitory Staff Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="buildingNumber" className="form-label">
                  Building Number
                </label>
                <input
                  type="text"
                  id="buildingNumber"
                  name="buildingNumber"
                  className="form-input"
                  value={userData.roleSpecificData["buildingNumber"] || ""}
                  onChange={handleRoleSpecificChange}
                  placeholder="e.g., B12"
                />
              </div>
              <div className="form-group">
                <label htmlFor="position" className="form-label">
                  Position
                </label>
                <input
                  type="text"
                  id="position"
                  name="position"
                  className="form-input"
                  value={userData.roleSpecificData["position"] || ""}
                  onChange={handleRoleSpecificChange}
                  placeholder="e.g., Supervisor, Warden"
                />
              </div>
            </div>
          </div>
        )

      case "discipline":
        return (
          <div className="role-specific-fields">
            <h3>Discipline Officer Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="employeeId" className="form-label">
                  Employee ID
                </label>
                <input
                  type="text"
                  id="employeeId"
                  name="employeeId"
                  className="form-input"
                  value={userData.roleSpecificData["employeeId"] || ""}
                  onChange={handleRoleSpecificChange}
                  placeholder="e.g., DIS12345"
                />
              </div>
              <div className="form-group">
                <label htmlFor="position" className="form-label">
                  Position
                </label>
                <input
                  type="text"
                  id="position"
                  name="position"
                  className="form-input"
                  value={userData.roleSpecificData["position"] || ""}
                  onChange={handleRoleSpecificChange}
                  placeholder="e.g., Head Officer, Assistant"
                />
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="header-icon-container">
          <UserPlusIcon />
        </div>
        <h1 className="admin-title">User Registration</h1>
        <p className="admin-subtitle">Register new users in the dormitory clearance system</p>
      </div>

      <div className="admin-card">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-section">
            <h2 className="section-title">Basic Information</h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="id" className="form-label">
                  ID (Auto-generated)
                </label>
                <input type="text" id="id" name="id" className="form-input" value={userData.id} readOnly disabled />
              </div>
              <div className="form-group">
                <label htmlFor="entryDate" className="form-label">
                  Entry Date
                </label>
                <input
                  type="text"
                  id="entryDate"
                  name="entryDate"
                  className="form-input"
                  value={new Date(userData.entryDate).toLocaleString()}
                  readOnly
                  disabled
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Full Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-input"
                value={userData.name}
                onChange={handleInputChange}
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  value={userData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="phoneNumber" className="form-label">
                  Phone Number <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  className="form-input"
                  value={userData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="role" className="form-label">
                Role <span className="required">*</span>
              </label>
              <select
                id="role"
                name="role"
                className="form-input"
                value={userData.role}
                onChange={handleInputChange}
                required
              >
                <option value="student">Student</option>
                <option value="security">Security</option>
                <option value="cafe">Cafeteria Staff</option>
                <option value="library">Library Staff</option>
                <option value="dormitory">Dormitory Staff</option>
                <option value="discipline">Discipline Officer</option>
              </select>
            </div>
          </div>

          {/* Role-specific fields */}
          <div className="form-section">{renderRoleSpecificFields()}</div>

          <div className="form-section">
            <h2 className="section-title">Document Upload</h2>
            <div className="form-group">
              <label htmlFor="file" className="form-label">
                Attach Document
              </label>
              <div className="file-input-container">
                <input type="file" id="file" name="file" className="file-input" onChange={handleFileChange} />
                <label htmlFor="file" className="file-input-label">
                  {userData.file ? userData.file.name : "Choose a file"}
                </label>
              </div>
              {filePreview && (
                <div className="file-preview">
                  <p>File Preview:</p>
                  {userData.file?.type.startsWith("image/") ? (
                    <img src={filePreview || "/placeholder.svg"} alt="Preview" className="image-preview" />
                  ) : (
                    <div className="document-preview">
                      <p>{userData.file?.name}</p>
                      <p className="file-type">{userData.file?.type}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={() => {
                setUserData({
                  id: generateId(),
                  name: "",
                  role: "student" as UserRole,
                  email: "",
                  phoneNumber: "",
                  entryDate: new Date().toISOString(),
                  roleSpecificData: {},
                  file: null,
                })
                setFilePreview("")
                setError("")
                setSuccess("")
              }}
            >
              Cancel
            </button>
            <button type="submit" className="submit-button" disabled={isSubmitting}>
              {isSubmitting ? "Registering..." : "Register User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminRegistration

