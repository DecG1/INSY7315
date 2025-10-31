// UserManagementPage: Admin-only page for managing users
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
  Chip,
  Alert,
  InputAdornment,
} from "@mui/material";
import { UserPlus, Edit, Trash2, Key, Eye, EyeOff, Users } from "lucide-react";
import SectionTitle from "./SectionTitle.jsx";
import HintTooltip from "./HintTooltip.jsx";
import { getSession } from "./sessionService.js";
import {
  getAllUsers,
  createUser,
  updateUserRole,
  updateUserPassword,
  deleteUser,
  emailExists,
} from "./userService.js";
import { generatePassword, validatePasswordStrength } from "./passwordService.js";
import { logUserCreated, logUserRoleChanged, logUserPasswordChanged, logUserDeleted } from "./auditService.js";

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openPassword, setOpenPassword] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({ email: "", password: "", role: "staff" });
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCurrentUser();
    loadUsers();
  }, []);

  const loadCurrentUser = async () => {
    const session = await getSession();
    setCurrentUser(session);
  };

  const loadUsers = async () => {
    const allUsers = await getAllUsers();
    setUsers(allUsers);
  };

  const handleAddUser = async () => {
    setError("");
    setLoading(true);

    // Validate email
    if (await emailExists(newUser.email)) {
      setError("Email already exists");
      setLoading(false);
      return;
    }

    // Validate password
    const validation = validatePasswordStrength(newUser.password);
    if (!validation.isValid) {
      setError(validation.messages.join(". "));
      setLoading(false);
      return;
    }

    try {
      await createUser(newUser.email, newUser.password, newUser.role);
      try { await logUserCreated(newUser.email, newUser.role); } catch {}
      await loadUsers();
      setOpenAdd(false);
      setNewUser({ email: "", password: "", role: "staff" });
    } catch (err) {
      setError("Failed to create user: " + err.message);
    }
    setLoading(false);
  };

  const handleUpdateRole = async () => {
    setError("");
    setLoading(true);

    try {
      const oldRole = users.find(u => u.id === editingUser.id)?.role;
      await updateUserRole(editingUser.id, editingUser.role);
      try { await logUserRoleChanged(editingUser.email, oldRole, editingUser.role); } catch {}
      await loadUsers();
      setOpenEdit(false);
      setEditingUser(null);
    } catch (err) {
      setError("Failed to update role: " + err.message);
    }
    setLoading(false);
  };

  const handleChangePassword = async () => {
    setError("");
    setLoading(true);

    // Validate password
    const validation = validatePasswordStrength(newPassword);
    if (!validation.isValid) {
      setError(validation.messages.join(". "));
      setLoading(false);
      return;
    }

    try {
      await updateUserPassword(editingUser.id, newPassword);
      try { await logUserPasswordChanged(editingUser.email); } catch {}
      setOpenPassword(false);
      setEditingUser(null);
      setNewPassword("");
    } catch (err) {
      setError("Failed to change password: " + err.message);
    }
    setLoading(false);
  };

  const handleDeleteUser = async (user) => {
    if (user.id === currentUser?.userId) {
      alert("You cannot delete yourself!");
      return;
    }

    if (!confirm(`Are you sure you want to delete user ${user.email}?`)) {
      return;
    }

    setLoading(true);
    try {
      await deleteUser(user.id);
      try { await logUserDeleted(user.email, user.role); } catch {}
      await loadUsers();
    } catch (err) {
      alert("Failed to delete user: " + err.message);
    }
    setLoading(false);
  };

  const handleGeneratePassword = () => {
    const generated = generatePassword(12);
    if (openAdd) {
      setNewUser({ ...newUser, password: generated });
    } else {
      setNewPassword(generated);
    }
    setShowPassword(true);
  };

  // Check if current user is admin
  if (currentUser?.role !== 'admin') {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Access denied. Only administrators can manage users.
        </Alert>
      </Box>
    );
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'manager': return 'warning';
      case 'staff': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <SectionTitle
        icon={Users}
        title="User Management"
        hint="Create, edit, and manage user accounts with different access levels. Admin users have full system access, managers can view reports and analytics, and staff have basic operational access."
        action={
          <HintTooltip hint="Add a new user account with email, password, and role assignment">
            <Button
              variant="contained"
              startIcon={<UserPlus size={18} />}
              onClick={() => setOpenAdd(true)}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
              }}
            >
              Add User
            </Button>
          </HintTooltip>
        }
      />

      <Card sx={{ borderRadius: '16px' }}>
        <CardContent sx={{ p: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <HintTooltip hint="User's login email address">
                    Email
                  </HintTooltip>
                </TableCell>
                <TableCell>
                  <HintTooltip hint="Access level: Admin (full access), Manager (reports & analytics), Staff (basic operations)">
                    Role
                  </HintTooltip>
                </TableCell>
                <TableCell>
                  <HintTooltip hint="Date when the user account was created">
                    Created At
                  </HintTooltip>
                </TableCell>
                <TableCell align="right">
                  <HintTooltip hint="Edit role, change password, or delete user account">
                    Actions
                  </HintTooltip>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {user.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={user.role.toUpperCase()} 
                      color={getRoleColor(user.role)} 
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <HintTooltip hint="Change user's role (admin, manager, or staff)">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setEditingUser(user);
                          setOpenEdit(true);
                        }}
                        sx={{ mr: 1 }}
                      >
                        <Edit size={18} />
                      </IconButton>
                    </HintTooltip>
                    <HintTooltip hint="Reset user's password or generate a new secure password">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setEditingUser(user);
                          setNewPassword("");
                          setShowPassword(false);
                          setOpenPassword(true);
                        }}
                        sx={{ mr: 1 }}
                      >
                        <Key size={18} />
                      </IconButton>
                    </HintTooltip>
                    <HintTooltip hint={user.id === currentUser?.userId ? "You cannot delete your own account" : "Permanently delete this user account"}>
                      <span>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteUser(user)}
                          disabled={user.id === currentUser?.userId}
                          color="error"
                        >
                          <Trash2 size={18} />
                        </IconButton>
                      </span>
                    </HintTooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={openAdd} onClose={() => !loading && setOpenAdd(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <HintTooltip hint="Create a new user account by providing an email, password, and selecting their access level">
            Add New User
          </HintTooltip>
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <HintTooltip hint="User's email address for login. Must be unique.">
              <TextField
                label="Email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                fullWidth
                required
              />
            </HintTooltip>
            <HintTooltip hint="Password must be at least 8 characters with uppercase, lowercase, number, and special character">
              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                fullWidth
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </HintTooltip>
            <HintTooltip hint="Click to automatically create a strong 12-character password">
              <Button variant="outlined" onClick={handleGeneratePassword} size="small">
                Generate Secure Password
              </Button>
            </HintTooltip>
            <HintTooltip hint="Admin: Full access | Manager: Reports & analytics | Staff: Basic operations">
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={newUser.role}
                  label="Role"
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                  <MenuItem value="staff">Staff - Basic operational access</MenuItem>
                  <MenuItem value="manager">Manager - Reports & analytics access</MenuItem>
                  <MenuItem value="admin">Admin - Full system access</MenuItem>
                </Select>
              </FormControl>
            </HintTooltip>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleAddUser} variant="contained" disabled={loading}>
            {loading ? "Adding..." : "Add User"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={openEdit} onClose={() => !loading && setOpenEdit(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <HintTooltip hint="Change the user's access level to grant or restrict system permissions">
            Edit User Role
          </HintTooltip>
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              User: {editingUser?.email}
            </Typography>
            <HintTooltip hint="Admin: Full access | Manager: Reports & analytics | Staff: Basic operations">
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={editingUser?.role || ''}
                  label="Role"
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                >
                  <MenuItem value="staff">Staff - Basic operational access</MenuItem>
                  <MenuItem value="manager">Manager - Reports & analytics access</MenuItem>
                  <MenuItem value="admin">Admin - Full system access</MenuItem>
                </Select>
              </FormControl>
            </HintTooltip>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleUpdateRole} variant="contained" disabled={loading}>
            {loading ? "Updating..." : "Update Role"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={openPassword} onClose={() => !loading && setOpenPassword(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <HintTooltip hint="Reset this user's password to a new secure password">
            Change Password
          </HintTooltip>
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              User: {editingUser?.email}
            </Typography>
            <HintTooltip hint="Password must be at least 8 characters with uppercase, lowercase, number, and special character">
              <TextField
                label="New Password"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                fullWidth
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </HintTooltip>
            <HintTooltip hint="Click to automatically create a strong 12-character password">
              <Button variant="outlined" onClick={handleGeneratePassword} size="small" sx={{ mt: 2 }}>
                Generate Secure Password
              </Button>
            </HintTooltip>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPassword(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleChangePassword} variant="contained" disabled={loading}>
            {loading ? "Changing..." : "Change Password"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagementPage;
