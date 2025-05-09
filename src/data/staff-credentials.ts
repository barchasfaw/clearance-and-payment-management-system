// This file contains mock credentials for staff members
// In a real application, NEVER store passwords in plain text
// Always use proper authentication with hashed passwords in a secure database

export interface StaffCredential {
    username: string
    password: string
    role: string
    name: string
    email: string
  }
  
  const staffCredentials: Record<string, StaffCredential> = {
    admin: {
      username: "Admin",
      password: "Admin",
      role: "admin",
      name: "Admin Officer",
      email: "admin@dormitory.edu",
    },
    security: {
      username: "Security",
      password: "Security123",
      role: "security",
      name: "Security Officer",
      email: "security@dormitory.edu",
    },
    cafe: {
      username: "Cafe",
      password: "Cafe123",
      role: "cafe",
      name: "Cafeteria Manager",
      email: "cafe@dormitory.edu",
    },
    library: {
      username: "Library",
      password: "Library123",
      role: "library",
      name: "Library Manager",
      email: "library@dormitory.edu",
    },
    dormitory: {
      username: "Dormitory",
      password: "Dormitory123",
      role: "dormitory",
      name: "Dormitory Supervisor",
      email: "dormitory@dormitory.edu",
    },
    discipline: {
      username: "Discipline",
      password: "Discipline123",
      role: "discipline",
      name: "Discipline Officer",
      email: "discipline@dormitory.edu",
    },
  }
  
  export default staffCredentials
  
  // Helper function to authenticate a user
  export function authenticateStaff(username: string, password: string): StaffCredential | null {
    // Convert username to lowercase for case-insensitive comparison
    const normalizedUsername = username.toLowerCase()
  
    // Find the staff member by username (case-insensitive)
    const staffMember = Object.values(staffCredentials).find(
      (staff) => staff.username.toLowerCase() === normalizedUsername,
    )
  
    // If staff member exists and password matches, return the staff member
    if (staffMember && staffMember.password === password) {
      return staffMember
    }
  
    // Otherwise, return null (authentication failed)
    return null
  }
  