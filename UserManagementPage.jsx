// UserManagementPage: Manage user accounts (Admin only)
import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Alert,
  Chip,
} from "@mui/material";
import { Users, Plus, Edit, Trash2, Key, AlertCircle } from "lucide-react";
import SectionTitle from "./SectionTitle.jsx";
import HintTooltip from "./HintTooltip.jsx";
import { getAllUsers, createUser, updateUserPassword, updateUserRole, deleteUser } from "./userService.js";
import { logUserCreated, logUserRoleChanged, logUserPasswordChanged, logUserDeleted } from "./auditService.js";
import { validatePasswordStrength } from "./passwordService.js";
import { getSession } from "./sessionService.js";

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  // Form states
  const [newUser, setNewUser] = useState({ email: "", password: "", role: "Staff" });
  const [editingUser, setEditingUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Load current user session
  useEffect(() => {
    (async () => {
      const session = await getSession();
      setCurrentUser(session);
    })();
  }, []);

  // Load users
  const loadUsers = async () => {
    setLoading(true);
    try {
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    } catch (err) {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Add new user
  const handleAddUser = async () => {
    setError("");
    setSuccess("");

    // Validate
    if (!newUser.email || !newUser.password) {
      setError("Email and password are required");
      return;
    }

    const passwordValidation = validatePasswordStrength(newUser.password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.message);
      return;
    }

    try {
      await createUser(newUser.email, newUser.password, newUser.role);
      try { await logUserCreated(newUser.email, newUser.role); } catch {}
      setSuccess(`User ${newUser.email} created successfully`);
      setAddDialogOpen(false);
      setNewUser({ email: "", password: "", role: "Staff" });
      await loadUsers();
    } catch (err) {
      setError(err.message || "Failed to create user");
    }
  };

  // Update user role
  const handleUpdateRole = async () => {
    if (!editingUser) return;

    try {
      const oldRole = users.find(u => u.id === editingUser.id)?.role || "";
      await updateUserRole(editingUser.id, editingUser.role);
      try { await logUserRoleChanged(editingUser.email, oldRole, editingUser.role); } catch {}
      setSuccess(`Role updated for ${editingUser.email}`);
      setEditDialogOpen(false);
      setEditingUser(null);
      await loadUsers();
    } catch (err) {
      setError("Failed to update user role");
    }
  };

  // Update user password
  const handleUpdatePassword = async () => {
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      setError(passwordValidation.message);
      return;
    }

    try {
      await updateUserPassword(editingUser.id, newPassword);
      try { await logUserPasswordChanged(editingUser.email); } catch {}
      setSuccess(`Password updated for ${editingUser.email}`);
      setPasswordDialogOpen(false);
      setEditingUser(null);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError("Failed to update password");
    }
  };

  // Delete user
  const handleDeleteUser = async () => {
    if (!editingUser) return;

    // Prevent deleting yourself
    if (currentUser && editingUser.email === currentUser.email) {
      setError("You cannot delete your own account");
      return;
    }

    try {
      await deleteUser(editingUser.id);
      try { await logUserDeleted(editingUser.email, editingUser.role); } catch {}
      setSuccess(`User ${editingUser.email} deleted`);
      setDeleteDialogOpen(false);
      setEditingUser(null);
      await loadUsers();
    } catch (err) {
      setError("Failed to delete user");
    }
  };

  // Check if current user is admin
  const isAdmin = currentUser?.role === 'Admin';

  if (!isAdmin) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning" icon={<AlertCircle />}>
          <Typography variant="h6" fontWeight={600}>Access Denied</Typography>
          <Typography variant="body2">
            You need Admin privileges to access user management.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}>
      <SectionTitle
        icon={Users}
        title="User Management"
        action={
          <HintTooltip title="Add a new user account with email, password, and role">
            <Button
              variant="contained"
              startIcon={<Plus size={18} />}
              onClick={() => setAddDialogOpen(true)}
              sx={{ borderRadius: '10px' }}
            >
              Add User
            </Button>
          </HintTooltip>
        }
      />

      {error && (
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      <Card sx={{ borderRadius: '12px' }}>
        <CardContent sx={{ p: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {user.email}
                      {currentUser?.email === user.email && (
                        <Chip label="You" size="small" color="primary" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      size="small"
                      color={user.role === 'Admin' ? 'error' : user.role === 'Manager' ? 'warning' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <HintTooltip title="Change user role">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setEditingUser(user);
                            setEditDialogOpen(true);
                          }}
                        >
                          <Edit size={16} />
                        </IconButton>
                      </HintTooltip>
                      <HintTooltip title="Reset password">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setEditingUser(user);
                            setPasswordDialogOpen(true);
                          }}
                        >
                          <Key size={16} />
                        </IconButton>
                      </HintTooltip>
                      <HintTooltip title="Delete user">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setEditingUser(user);
                            setDeleteDialogOpen(true);
                          }}
                          disabled={currentUser?.email === user.email}
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      </HintTooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              helperText="Minimum 6 characters. Use a mix of letters, numbers, and symbols."
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={newUser.role}
                label="Role"
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              >
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="Manager">Manager</MenuItem>
                <MenuItem value="Staff">Staff</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddUser}>Create User</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User Role</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Email"
              value={editingUser?.email || ""}
              disabled
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={editingUser?.role || "Staff"}
                label="Role"
                onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
              >
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="Manager">Manager</MenuItem>
                <MenuItem value="Staff">Staff</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateRole}>Update Role</Button>
        </DialogActions>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="User"
              value={editingUser?.email || ""}
              disabled
              fullWidth
            />
            <TextField
              label="New Password"
              type="password"
              fullWidth
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <TextField
              label="Confirm Password"
              type="password"
              fullWidth
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdatePassword}>Update Password</Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete user <strong>{editingUser?.email}</strong>?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteUser}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagementPage;
