"use client"

import type React from "react"

import { useState, useEffect } from "react"
import userStore, { type RegisteredUser } from "../data/user-store"
import "./UserManagement.css"

const UserManagement = () => {
  const [users, setUsers] = useState<RegisteredUser[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRole, setSelectedRole] = useState<string>("all")
  const [selectedUser, setSelectedUser] = useState<RegisteredUser | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  // Load users on component mount and when store changes
  useEffect(() => {
    // Initial load
    loadUsers()

    // Subscribe to changes
    const unsubscribe = userStore.subscribe(() => {
      loadUsers()
    })

    // Cleanup subscription on unmount
    return unsubscribe
  }, [])

  // Load users based on filters
  const loadUsers = () => {
    let filteredUsers = userStore.getUsers()

    // Filter by role if not 'all'
    if (selectedRole !== "all") {
      filteredUsers = filteredUsers.filter((user) => user.role.type === selectedRole)
    }

    // Filter by search query if present
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.id.toLowerCase().includes(query),
      )
    }

    setUsers(filteredUsers)
  }

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // Handle role filter change
  const handleRoleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(e.target.value)
  }

  // Apply filters when search or role selection changes
  useEffect(() => {
    loadUsers()
  }, [searchQuery, selectedRole])

  // Handle delete user
  const handleDeleteUser = (user: RegisteredUser) => {
    setSelectedUser(user)
    setIsDeleteModalOpen(true)
  }

  // Confirm delete user
  const confirmDeleteUser = () => {
    if (selectedUser) {
      userStore.deleteUser(selectedUser.id)
      setIsDeleteModalOpen(false)
      setSelectedUser(null)
    }
  }

  // Handle view user details
  const handleViewUser = (user: RegisteredUser) => {
    setSelectedUser(user)
    setIsViewModalOpen(true)
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  // Get role-specific details as formatted string
  const getRoleDetails = (user: RegisteredUser) => {
    const details = user.role.details
    if (!details || Object.keys(details).length === 0) {
      return "No additional details"
    }

    return Object.entries(details)
      .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
      .join(", ")
  }

  return (
    <div className="user-management-container">
      <div className="user-management-header">
        <h2>User Management</h2>
        <p>View and manage registered users in the system</p>
      </div>

      <div className="user-management-filters">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by name, email, or ID..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
        <div className="filter-container">
          <label htmlFor="role-filter">Filter by role:</label>
          <select id="role-filter" value={selectedRole} onChange={handleRoleFilterChange} className="role-filter">
            <option value="all">All Roles</option>
            <option value="student">Student</option>
            <option value="security">Security</option>
            <option value="cafe">Cafeteria</option>
            <option value="library">Library</option>
            <option value="dormitory">Dormitory</option>
            <option value="discipline">Discipline</option>
          </select>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="no-users-message">
          <p>
            No users found.{" "}
            {searchQuery || selectedRole !== "all" ? "Try adjusting your filters." : "Register users to see them here."}
          </p>
        </div>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Role</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Registration Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>
                    <span className={`role-badge role-${user.role.type}`}>
                      {user.role.type.charAt(0).toUpperCase() + user.role.type.slice(1)}
                    </span>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.phoneNumber}</td>
                  <td>{formatDate(user.entryDate)}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="view-button" onClick={() => handleViewUser(user)} title="View Details">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="action-icon"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      </button>
                      <button className="delete-button" onClick={() => handleDeleteUser(user)} title="Delete User">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="action-icon"
                        >
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Confirm Deletion</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete the following user?</p>
              <p>
                <strong>Name:</strong> {selectedUser.name}
              </p>
              <p>
                <strong>ID:</strong> {selectedUser.id}
              </p>
              <p>
                <strong>Role:</strong> {selectedUser.role.type}
              </p>
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </button>
              <button className="confirm-delete-button" onClick={confirmDeleteUser}>
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View User Details Modal */}
      {isViewModalOpen && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-container user-details-modal">
            <div className="modal-header">
              <h3>User Details</h3>
              <button className="close-button" onClick={() => setIsViewModalOpen(false)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="user-details">
                <div className="detail-row">
                  <div className="detail-label">ID:</div>
                  <div className="detail-value">{selectedUser.id}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Name:</div>
                  <div className="detail-value">{selectedUser.name}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Role:</div>
                  <div className="detail-value">
                    <span className={`role-badge role-${selectedUser.role.type}`}>
                      {selectedUser.role.type.charAt(0).toUpperCase() + selectedUser.role.type.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Email:</div>
                  <div className="detail-value">{selectedUser.email}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Phone:</div>
                  <div className="detail-value">{selectedUser.phoneNumber}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Registration Date:</div>
                  <div className="detail-value">{formatDate(selectedUser.entryDate)}</div>
                </div>

                <div className="detail-section">
                  <h4>Role-specific Details</h4>
                  <div className="role-details">
                    {Object.entries(selectedUser.role.details).length > 0 ? (
                      Object.entries(selectedUser.role.details).map(([key, value]) => (
                        <div className="detail-row" key={key}>
                          <div className="detail-label">{key.charAt(0).toUpperCase() + key.slice(1)}:</div>
                          <div className="detail-value">{value}</div>
                        </div>
                      ))
                    ) : (
                      <p>No additional details available</p>
                    )}
                  </div>
                </div>

                {selectedUser.attachmentUrl && (
                  <div className="detail-section">
                    <h4>Attachment</h4>
                    <div className="attachment-preview">
                      {selectedUser.attachmentType?.startsWith("image/") ? (
                        <img
                          src={selectedUser.attachmentUrl || "/placeholder.svg"}
                          alt="User attachment"
                          className="attachment-image"
                        />
                      ) : (
                        <div className="document-preview">
                          <p>{selectedUser.attachmentName}</p>
                          <a
                            href={selectedUser.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="download-link"
                          >
                            Download File
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="close-button" onClick={() => setIsViewModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserManagement
