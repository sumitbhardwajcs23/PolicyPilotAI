import { useEffect, useState, useCallback } from 'react';
import { GlassCard } from '@/components/common/GlassCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { adminApi } from '@/services/api';
import {
  Users, Edit3, RefreshCw, Search,
  ChevronLeft, ChevronRight, CheckCircle2, XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

interface WorkerUser {
  _id: string;
  name: string;
  email?: string;
  mobile?: string;
  role: string;
  platform?: string;
  zone?: string;
  upiId?: string;
  kycStatus: 'pending' | 'verified' | 'rejected';
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<WorkerUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [search, setSearch] = useState('');
  
  // Edit modal state
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    kycStatus: 'pending' | 'verified' | 'rejected',
    isActive: boolean,
    zone: string,
    platform: string
  } | null>(null);

  const fetchUsers = useCallback(async (p: number, s: string) => {
    setLoading(true);
    try {
      const resp = await adminApi.getUsers({ page: p, limit: 10, role: 'worker', search: s }) as any;
      if (resp.success && resp.data) {
        setUsers(resp.data.data);
        setTotalPages(resp.data.totalPages);
        setTotalUsers(resp.data.total);
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to fetch users');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Debounce search slightly
    const timer = setTimeout(() => {
      fetchUsers(page, search);
    }, 300);
    return () => clearTimeout(timer);
  }, [page, search, fetchUsers]);

  const handleEditOpen = (user: WorkerUser) => {
    setEditId(user._id);
    setEditForm({
      kycStatus: user.kycStatus,
      isActive: user.isActive,
      zone: user.zone || '',
      platform: user.platform || ''
    });
  };

  const handleUpdateUser = async (id: string) => {
    if (!editForm) return;
    try {
      await adminApi.updateUser(id, editForm);
      toast.success('User updated successfully');
      setEditId(null);
      setEditForm(null);
      fetchUsers(page, search);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to update user');
    }
  };

  const StatusIcon = (props: { status: string }) => {
    if (props.status === 'verified') return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    if (props.status === 'rejected') return <XCircle className="w-4 h-4 text-red-400" />;
    return <RefreshCw className="w-4 h-4 text-amber-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-400" />
            User Management
          </h1>
          <p className="text-sm text-white/60">Manage worker accounts, KYC status, and activity</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search name, phone, email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1); // Reset to page 1 on search
              }}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          <button onClick={() => fetchUsers(page, search)} disabled={loading} className="p-2 rounded-lg border border-white/10 text-white/60 hover:text-white transition-all bg-white/5 disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Users Table */}
      <GlassCard className="p-0 overflow-hidden relative min-h-[400px]">
        {loading && users.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-10">
            <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="py-4 px-6 text-xs font-medium text-white/60 uppercase tracking-wider">Worker</th>
                <th className="py-4 px-6 text-xs font-medium text-white/60 uppercase tracking-wider">Contact</th>
                <th className="py-4 px-6 text-xs font-medium text-white/60 uppercase tracking-wider">Location/Platform</th>
                <th className="py-4 px-6 text-xs font-medium text-white/60 uppercase tracking-wider">KYC Status</th>
                <th className="py-4 px-6 text-xs font-medium text-white/60 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((u) => {
                const isEditing = editId === u._id;
                return (
                  <tr key={u._id} className={isEditing ? 'bg-purple-500/10' : 'hover:bg-white/[0.02] transition-colors'}>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/30 to-cyan-500/30 flex items-center justify-center font-bold text-white shadow-sm border border-white/10">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{u.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {u.isActive ? (
                              <StatusBadge status="success">Active</StatusBadge>
                            ) : (
                              <StatusBadge status="danger">Disabled</StatusBadge>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-white/80">{u.mobile || '—'}</p>
                      <p className="text-xs text-white/50">{u.email || '—'}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-white/80 capitalize">{u.zone || '—'}</p>
                      <p className="text-xs text-white/50 capitalize">{u.platform || '—'}</p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5">
                        <StatusIcon status={u.kycStatus} />
                        <span className={`text-sm ${
                          u.kycStatus === 'verified' ? 'text-emerald-400' :
                          u.kycStatus === 'rejected' ? 'text-red-400' : 'text-amber-400'
                        } capitalize font-medium`}>
                          {u.kycStatus}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {!isEditing ? (
                        <button
                          onClick={() => handleEditOpen(u)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                      ) : (
                        <span className="text-xs text-purple-400 font-medium tracking-wide animate-pulse">
                          EDITING...
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              
              {users.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <Users className="w-12 h-12 text-white/20 mx-auto mb-3" />
                    <p className="text-base text-white/60 font-medium">No users found</p>
                    <p className="text-sm text-white/40 mt-1">Try adjusting your search filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Info */}
        {!loading && users.length > 0 && (
          <div className="px-6 py-4 border-t border-white/10 bg-black/20 flex items-center justify-between mt-auto">
            <span className="text-sm text-white/50">
              Showing <span className="text-white/80 font-medium">{(page - 1) * 10 + 1}</span> to <span className="text-white/80 font-medium">{Math.min(page * 10, totalUsers)}</span> of <span className="text-white/80 font-medium">{totalUsers}</span> users
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="p-1.5 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Edit User Modal */}
      {editId && editForm && (
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="fixed right-6 bottom-6 w-[360px] z-50"
        >
          <GlassCard className="p-5 border-purple-500/40 shadow-2xl relative">
            <button 
              onClick={() => setEditId(null)}
              className="absolute top-4 right-4 text-white/40 hover:text-white"
            >
              ✕
            </button>
            
            <h3 className="text-lg font-semibold text-white mb-4">Edit User</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/60 mb-1.5 block uppercase tracking-wider font-semibold">KYC Status</label>
                <select
                  value={editForm.kycStatus}
                  onChange={e => setEditForm(f => ({ ...f!, kycStatus: e.target.value as any }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50"
                >
                  <option value="pending" className="bg-gray-900">Pending</option>
                  <option value="verified" className="bg-gray-900">Verified</option>
                  <option value="rejected" className="bg-gray-900">Rejected</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                <div>
                  <label className="text-sm font-medium text-white">Account Status</label>
                  <p className="text-xs text-white/50">{editForm.isActive ? 'User can log in and use app' : 'User account is disabled'}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={editForm.isActive}
                    onChange={e => setEditForm(f => ({ ...f!, isActive: e.target.checked }))}
                  />
                  <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white/30 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
                </label>
              </div>

              <div>
                <label className="text-xs text-white/60 mb-1.5 block uppercase tracking-wider font-semibold">Work Zone</label>
                <input
                  value={editForm.zone}
                  onChange={e => setEditForm(f => ({ ...f!, zone: e.target.value }))}
                  placeholder="e.g. Andheri West"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div>
                <label className="text-xs text-white/60 mb-1.5 block uppercase tracking-wider font-semibold">Platform Base</label>
                <input
                  value={editForm.platform}
                  onChange={e => setEditForm(f => ({ ...f!, platform: e.target.value }))}
                  placeholder="e.g. Swiggy, Zomato"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50"
                />
              </div>

            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button 
                onClick={() => setEditId(null)} 
                className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleUpdateUser(editId)} 
                className="px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:shadow-lg transition-all"
              >
                Save Edits
              </button>
            </div>
          </GlassCard>
        </motion.div>
      )}

    </div>
  );
}
