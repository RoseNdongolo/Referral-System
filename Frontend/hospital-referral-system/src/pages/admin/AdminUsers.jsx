// src/pages/admin/AdminUsers.jsx
import { useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import './AdminUsers.css';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: 'patient',
    password: '',
    is_active: true,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await adminService.getAllUsers();
      setUsers(res.data);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        email: user.email,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        role: user.role,
        password: '',
        is_active: user.is_active,
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        role: 'patient',
        password: '',
        is_active: true,
      });
    }
    setShowModal(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password;
        await adminService.updateUser(editingUser.id, updateData);
      } else {
        await adminService.createUser(formData);
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      setError('Failed to save user');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try {
      await adminService.deleteUser(id);
      fetchUsers();
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  const handleToggleActive = async (user) => {
    try {
      await adminService.updateUser(user.id, { is_active: !user.is_active });
      fetchUsers();
    } catch (err) {
      setError('Failed to update user status');
    }
  };

  const roleLabels = {
    receptionist: 'Receptionist',
    doctor: 'Doctor',
    medical_director: 'Medical Director',
    patient: 'Patient',
    admin: 'Admin',
  };

  if (loading) return <div className="admin-loading">Loading users...</div>;

  return (
    <div className="admin-users-container">
      <div className="admin-header">
        <h1>Manage Users</h1>
        <button onClick={() => handleOpenModal()} className="btn-primary">+ Add User</button>
      </div>
      {error && <div className="error-message">{error}</div>}
      <div className="users-table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.first_name} {user.last_name}</td>
                <td>{user.email}</td>
                <td>{roleLabels[user.role] || user.role}</td>
                <td>
                  <button
                    className={`status-toggle ${user.is_active ? 'active' : 'inactive'}`}
                    onClick={() => handleToggleActive(user)}
                  >
                    {user.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="action-buttons">
                  <button onClick={() => handleOpenModal(user)} className="edit-btn">Edit</button>
                  <button onClick={() => handleDelete(user.id)} className="delete-btn">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingUser ? 'Edit User' : 'Create User'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Username *</label>
                <input name="username" value={formData.username} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input name="first_name" value={formData.first_name} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input name="last_name" value={formData.last_name} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label>Role</label>
                <select name="role" value={formData.role} onChange={handleChange}>
                  <option value="receptionist">Receptionist</option>
                  <option value="doctor">Doctor</option>
                  <option value="medical_director">Medical Director</option>
                  <option value="patient">Patient</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label>{editingUser ? 'Password (leave blank to keep unchanged)' : 'Password *'}</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required={!editingUser} />
              </div>
              <div className="form-group checkbox">
                <label>
                  <input type="checkbox" name="is_active" checked={formData.is_active} onChange={(e) => setFormData({...formData, is_active: e.target.checked})} />
                  Active
                </label>
              </div>
              <div className="modal-actions">
                <button type="submit" className="save-btn">Save</button>
                <button type="button" onClick={() => setShowModal(false)} className="cancel-btn">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}