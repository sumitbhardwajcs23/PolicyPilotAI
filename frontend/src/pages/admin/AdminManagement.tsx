import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/common/GlassCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { adminApi } from '@/services/api';
import {
  UserPlus, Crown, Lock, Edit3, RefreshCw,
  CheckSquare, Square
} from 'lucide-react';
import toast from 'react-hot-toast';

const ALL_PERMISSIONS = [
  { id: 'view_policies', label: 'View Policies', group: 'Policies' },
  { id: 'manage_policies', label: 'Approve/Reject Policies', group: 'Policies' },
  { id: 'view_claims', label: 'View Claims', group: 'Claims' },
  { id: 'manage_claims', label: 'Approve/Reject Claims', group: 'Claims' },
  { id: 'view_users', label: 'View Users', group: 'Users' },
  { id: 'manage_users', label: 'Edit Users / KYC', group: 'Users' },
  { id: 'manage_parametric', label: 'Manage Parametric Events', group: 'System' },
];

const PERMISSION_GROUPS = ['Policies', 'Claims', 'Users', 'System'];

interface AdminUser {
  _id: string;
  name: string;
  email?: string;
  mobile?: string;
  role: string;
  adminType: 'master' | 'slave';
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export function AdminManagement() {
  // const { user } = useAuth();
  const [adminInfo, setAdminInfo] = useState<any>(null);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [editActive, setEditActive] = useState(true);

  // Create form state
  const [form, setForm] = useState({ name: '', email: '', mobile: '', role: 'insurer', permissions: [] as string[] });

  const isMaster = adminInfo?.adminType === 'master';

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [meRes, adminsRes] = await Promise.all([adminApi.getMe(), adminApi.getAdmins()]) as any[];
      setAdminInfo(meRes?.data);
      setAdmins(adminsRes?.data || []);
    } catch (e: any) {
      if (e?.response?.status === 403) {
        toast.error('Master admin privileges required');
      }
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!form.name.trim()) return toast.error('Name is required');
    if (!form.email.trim() && !form.mobile.trim()) return toast.error('Email or mobile required');
    try {
      // Strip empty strings so Zod optional fields work correctly
      const payload: any = {
        name: form.name.trim(),
        role: form.role,
        permissions: form.permissions,
      }
      if (form.email.trim()) payload.email = form.email.trim()
      if (form.mobile.trim()) payload.mobile = form.mobile.trim()

      await adminApi.createAdmin(payload);
      toast.success('Slave admin created');
      setShowCreateForm(false);
      setForm({ name: '', email: '', mobile: '', role: 'insurer', permissions: [] });
      loadAll();
    } catch (e: any) {
      const zodErrors = e?.response?.data?.errors;
      const firstErr = zodErrors?.[0];
      const field = firstErr?.path?.join('.') || 'unknown field';
      const reason = firstErr?.message || e?.response?.data?.message || 'Failed to create admin';
      toast.error(`${field}: ${reason}`);
      console.error('createAdmin failed:', e?.response?.data);
    }
  };

  const handleUpdatePermissions = async (id: string) => {
    try {
      await adminApi.updateAdminPermissions(id, editPermissions, editActive);
      toast.success('Permissions updated');
      setEditId(null);
      loadAll();
    } catch { }
  };

  const togglePerm = (perm: string, list: string[], setList: (p: string[]) => void) => {
    if (list.includes(perm)) setList(list.filter(p => p !== perm));
    else setList([...list, perm]);
  };

  if (!isMaster && adminInfo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
          <Lock className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-white">Master Admin Only</h2>
        <p className="text-white/60 text-sm text-center max-w-sm">
          This section is restricted to the Master Admin. Contact your system administrator for access.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Admin Management
            <span className="text-xs font-semibold text-amber-400 bg-amber-500/20 border border-amber-500/30 rounded-full px-2 py-0.5 flex items-center gap-1">
              <Crown className="w-3 h-3" /> Master Only
            </span>
          </h1>
          <p className="text-sm text-white/60">Create slave admins and manage their permissions</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadAll} disabled={loading} className="p-2 rounded-lg border border-white/10 text-white/60 hover:text-white transition-all">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:shadow-lg hover:scale-105 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            Add Slave Admin
          </button>
        </div>
      </div>

      {/* Create Admin Modal */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className="border-purple-500/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Create New Slave Admin</h3>
              <button onClick={() => setShowCreateForm(false)} className="text-white/40 hover:text-white">✕</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs text-white/60 mb-1 block">Full Name *</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Admin name"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50"
                />
              </div>
              <div>
                <label className="text-xs text-white/60 mb-1 block">Role</label>
                <select
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50"
                >
                  <option value="insurer" className="bg-gray-900">Insurer (Slave)</option>
                  <option value="admin" className="bg-gray-900">Admin (Slave)</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-white/60 mb-1 block">Email (optional)</label>
                <input
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="admin@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50"
                />
              </div>
              <div>
                <label className="text-xs text-white/60 mb-1 block">Mobile (optional)</label>
                <input
                  value={form.mobile}
                  onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))}
                  placeholder="10-digit mobile"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50"
                />
              </div>
            </div>

            {/* Initial Permissions */}
            <div className="mb-4">
              <p className="text-sm font-medium text-white/80 mb-3">Assign Permissions</p>
              {PERMISSION_GROUPS.map(group => (
                <div key={group} className="mb-3">
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-2">{group}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {ALL_PERMISSIONS.filter(p => p.group === group).map(perm => {
                      const active = form.permissions.includes(perm.id);
                      return (
                        <button
                          key={perm.id}
                          onClick={() => togglePerm(perm.id, form.permissions, p => setForm(f => ({ ...f, permissions: p })))}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                            active ? 'bg-purple-500/20 border border-purple-500/40 text-purple-300' : 'bg-white/5 border border-white/5 text-white/60 hover:bg-white/10'
                          }`}
                        >
                          {active ? <CheckSquare className="w-4 h-4 flex-shrink-0" /> : <Square className="w-4 h-4 flex-shrink-0" />}
                          {perm.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowCreateForm(false)} className="px-4 py-2 text-sm text-white/60 hover:text-white border border-white/10 rounded-lg transition-colors">
                Cancel
              </button>
              <button onClick={handleCreate} className="px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:shadow-lg transition-all">
                Create Admin
              </button>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Admins Table */}
      <GlassCard>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white">All Admins</h3>
          <p className="text-sm text-white/60">{admins.length} admin account(s)</p>
        </div>
        <div className="space-y-3">
          {admins.map((admin) => {
            const isEditing = editId === admin._id;
            const canEdit = admin.adminType !== 'master';
            return (
              <div key={admin._id} className={`p-4 rounded-xl border transition-colors ${isEditing ? 'bg-white/10 border-purple-500/30' : 'bg-white/5 border-white/5 hover:bg-white/[0.07]'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-white">{admin.name}</span>
                      {admin.adminType === 'master' ? (
                        <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/20 border border-amber-500/30 rounded-full px-2 py-0.5">
                          <Crown className="w-3 h-3" /> Master
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-blue-400 bg-blue-500/20 border border-blue-500/30 rounded-full px-2 py-0.5">
                          <Lock className="w-3 h-3" /> Slave
                        </span>
                      )}
                      {admin.isActive ? (
                        <StatusBadge status="success">Active</StatusBadge>
                      ) : (
                        <StatusBadge status="danger">Disabled</StatusBadge>
                      )}
                    </div>
                    <p className="text-xs text-white/40 mt-1">
                      {admin.email || admin.mobile} · {admin.role} · Joined {new Date(admin.createdAt).toLocaleDateString('en-IN')}
                    </p>

                    {/* Permissions list */}
                    {!isEditing && admin.adminType !== 'master' && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {admin.permissions.length === 0 ? (
                          <span className="text-xs text-white/30">No permissions assigned</span>
                        ) : admin.permissions.map(p => {
                          const perm = ALL_PERMISSIONS.find(x => x.id === p);
                          return (
                            <span key={p} className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-md px-2 py-0.5">
                              {perm?.label || p}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Edit Permissions */}
                    {isEditing && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-medium text-white/60">Edit Permissions</p>
                          <label className="flex items-center gap-2 text-xs text-white/60 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editActive}
                              onChange={e => setEditActive(e.target.checked)}
                              className="w-3 h-3"
                            />
                            Active
                          </label>
                        </div>
                        {PERMISSION_GROUPS.map(group => (
                          <div key={group} className="mb-2">
                            <p className="text-xs text-white/30 uppercase tracking-wider mb-1">{group}</p>
                            <div className="flex flex-wrap gap-1">
                              {ALL_PERMISSIONS.filter(p => p.group === group).map(perm => {
                                const active = editPermissions.includes(perm.id);
                                return (
                                  <button
                                    key={perm.id}
                                    onClick={() => togglePerm(perm.id, editPermissions, setEditPermissions)}
                                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors ${
                                      active ? 'bg-purple-500/30 border border-purple-500/50 text-purple-300' : 'bg-white/5 border border-white/5 text-white/50 hover:bg-white/10'
                                    }`}
                                  >
                                    {active ? <CheckSquare className="w-3 h-3" /> : <Square className="w-3 h-3" />}
                                    {perm.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleUpdatePermissions(admin._id)}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-purple-600 text-white hover:bg-purple-500 transition-colors"
                          >
                            Save Changes
                          </button>
                          <button
                            onClick={() => setEditId(null)}
                            className="px-3 py-1.5 text-xs text-white/60 hover:text-white border border-white/10 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {canEdit && !isEditing && (
                    <button
                      onClick={() => {
                        setEditId(admin._id);
                        setEditPermissions([...admin.permissions]);
                        setEditActive(admin.isActive);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all flex-shrink-0"
                    >
                      <Edit3 className="w-3 h-3" />
                      Edit
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {admins.length === 0 && !loading && (
            <div className="text-center py-10">
              <UserPlus className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="text-sm text-white/40">No slave admins yet</p>
              <button onClick={() => setShowCreateForm(true)} className="mt-2 text-sm text-purple-400 hover:text-purple-300">
                + Create first slave admin
              </button>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
