import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import { Plus, Edit2, Trash2, Search, Mail, Users as UsersIcon, Shield, MoreVertical } from 'lucide-react';
import apiService from '../services/api';

const UsersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<any | null>(null);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [form, setForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    role: 'EMPLOYEE',
    department: '',
    reportingManagerId: '',
    isActive: true
  });

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await apiService.getUsers();
        setUsers(response.data);
      } catch (error) {
        console.error('Failed to load users', error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const filteredUsers = useMemo(
    () => users.filter((user) => {
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim().toLowerCase();
      const email = (user.email || '').toLowerCase();
      const query = searchTerm.toLowerCase();
      return fullName.includes(query) || email.includes(query);
    }),
    [users, searchTerm]
  );

  const openCreateModal = () => {
    setEditingUser(null);
    setForm({
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      role: 'EMPLOYEE',
      department: '',
      reportingManagerId: '',
      isActive: true
    });
    setShowModal(true);
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setForm({
      email: user.email || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      password: '',
      role: user.role || 'EMPLOYEE',
      department: user.department || '',
      reportingManagerId: user.reportingManagerId || '',
      isActive: user.isActive !== false
    });
    setShowModal(true);
  };

  const saveUser = async () => {
    try {
      const payload = {
        ...form,
        reportingManagerId: form.reportingManagerId || null,
        password: form.password || undefined
      };

      if (editingUser) {
        await apiService.updateUser(editingUser.id, payload);
        setBanner({ type: 'success', text: 'User updated successfully.' });
      } else {
        await apiService.createUser(payload);
        setBanner({ type: 'success', text: 'User created successfully.' });
      }

      const response = await apiService.getUsers();
      setUsers(response.data);
      setShowModal(false);
    } catch (error: any) {
      setBanner({ type: 'error', text: error.response?.data?.message || 'Failed to save user' });
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await apiService.deleteUser(userId);
      setUsers(prev => prev.filter(user => user.id !== userId));
      setBanner({ type: 'success', text: 'User deleted successfully.' });
    } catch (error: any) {
      setBanner({ type: 'error', text: error.response?.data?.message || 'Failed to delete user' });
    }
    setDeleteCandidate(null);
  };

  const getRoleColor = (role: string) => {
    switch(role) {
      case 'ADMIN':
        return 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300';
      case 'MANAGER':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300';
      default:
        return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300';
    }
  };

  return (
    <Layout>
      <div className="flex-1 p-6 lg:p-8 overflow-auto bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 animate-fadeIn">
        {banner && (
          <div className={`mb-6 rounded-lg px-4 py-3 text-sm font-medium ${banner.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {banner.text}
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
            Users 👤
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Manage team members and permissions</p>
        </div>

        {/* Search and Action Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 outline-none transition-all"
            />
          </div>
          <Button variant="primary" onClick={openCreateModal}>
            <Plus size={18} />
            Add New User
          </Button>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card variant="gradient">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Total Users</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">28</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                <UsersIcon className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
            </div>
          </Card>

          <Card variant="gradient">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Active</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">26</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                <Shield className="text-green-600 dark:text-green-400" size={24} />
              </div>
            </div>
          </Card>

          <Card variant="gradient">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Managers</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">5</p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                <Shield className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
            </div>
          </Card>
        </div>

        {/* Users Table */}
        <Card variant="elevated">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Join Date</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {!loading && filteredUsers.map((user, index) => (
                  <tr
                    key={user.id}
                    className={`border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                      index === filteredUsers.length - 1 ? 'border-0' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                          {(user.firstName?.[0] || '') + (user.lastName?.[0] || '') || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{user.firstName} {user.lastName}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
                            <Mail size={14} /> {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {user.createdAt ? new Date(user.createdAt).toISOString().slice(0, 10) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors" onClick={() => openEditModal(user)}>
                          <Edit2 size={18} className="text-blue-600 dark:text-blue-400" />
                        </button>
                        <button className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors" onClick={() => setDeleteCandidate(user)}>
                          <Trash2 size={18} className="text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
              <h2 className="mb-4 text-2xl font-bold text-slate-900">{editingUser ? 'Edit User' : 'Add New User'}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input className="rounded-lg border border-slate-300 p-3" placeholder="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                <input className="rounded-lg border border-slate-300 p-3" placeholder="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                <input className="rounded-lg border border-slate-300 p-3 md:col-span-2" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <input className="rounded-lg border border-slate-300 p-3 md:col-span-2" type="password" placeholder={editingUser ? 'Password (leave blank to keep current)' : 'Password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                <select className="rounded-lg border border-slate-300 p-3" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="EMPLOYEE">EMPLOYEE</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
                <select className="rounded-lg border border-slate-300 p-3" value={String(form.isActive)} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
                <input className="rounded-lg border border-slate-300 p-3 md:col-span-2" placeholder="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
                <input className="rounded-lg border border-slate-300 p-3 md:col-span-2" placeholder="Reporting Manager ID" value={form.reportingManagerId} onChange={(e) => setForm({ ...form, reportingManagerId: e.target.value })} />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button className="rounded-lg border border-slate-300 px-4 py-2" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="rounded-lg bg-blue-600 px-4 py-2 text-white" onClick={saveUser}>{editingUser ? 'Save Changes' : 'Create User'}</button>
              </div>
            </div>
          </div>
        )}

        {deleteCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <h2 className="mb-2 text-2xl font-bold text-slate-900">Delete user?</h2>
              <p className="text-slate-600">
                This will permanently remove {deleteCandidate.firstName} {deleteCandidate.lastName} from the portal.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button className="rounded-lg border border-slate-300 px-4 py-2" onClick={() => setDeleteCandidate(null)}>Cancel</button>
                <button className="rounded-lg bg-red-600 px-4 py-2 text-white" onClick={() => deleteUser(deleteCandidate.id)}>Delete</button>
              </div>
            </div>
          </div>
        )}

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400 text-lg">{loading ? 'Loading users...' : 'No users found'}</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default UsersPage;
