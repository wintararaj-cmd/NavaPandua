import React, { useState, useEffect } from 'react';
import { 
    Search, User as UserIcon, Shield, Key, 
    Filter, MoreVertical, CheckCircle, XCircle, 
    RefreshCcw, Mail, Building2, UserCog
} from 'lucide-react';
import { userService, type User } from '../services/userService';
import { schoolService } from '../services/schoolService';
import toast from 'react-hot-toast';

export default function Users() {
    const [users, setUsers] = useState<User[]>([]);
    const [schools, setSchools] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [schoolFilter, setSchoolFilter] = useState('');
    
    // Modal states
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [isResetting, setIsResetting] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [usersData, schoolsData] = await Promise.all([
                userService.getUsers(),
                schoolService.getSchools()
            ]);
            setUsers(Array.isArray(usersData) ? usersData : usersData.results || []);
            setSchools(Array.isArray(schoolsData) ? schoolsData : schoolsData.results || []);
        } catch (error) {
            console.error('Failed to fetch data', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser || !newPassword) return;

        try {
            setIsResetting(true);
            await userService.resetPassword(selectedUser.id, newPassword);
            toast.success(`Password for ${selectedUser.email} reset successfully`);
            setIsResetModalOpen(false);
            setSelectedUser(null);
            setNewPassword('');
        } catch (error) {
            console.error('Reset failed', error);
            toast.error('Failed to reset password');
        } finally {
            setIsResetting(false);
        }
    };

    const toggleUserStatus = async (user: User) => {
        try {
            await userService.updateUser(user.id, { is_active: !user.is_active });
            setUsers(users.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u));
            toast.success(`User ${user.is_active ? 'deactivated' : 'activated'} successfully`);
        } catch (error) {
            toast.error('Failed to update user status');
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = 
            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesRole = !roleFilter || user.role === roleFilter;
        const matchesSchool = !schoolFilter || (typeof user.school === 'object' ? user.school?.id === schoolFilter : user.school === schoolFilter);
        
        return matchesSearch && matchesRole && matchesSchool;
    });

    const getRoleBadge = (role: string) => {
        const styles: Record<string, string> = {
            'SUPER_ADMIN': 'bg-purple-100 text-purple-700 border-purple-200',
            'SCHOOL_ADMIN': 'bg-blue-100 text-blue-700 border-blue-200',
            'TEACHER': 'bg-green-100 text-green-700 border-green-200',
            'STUDENT': 'bg-orange-100 text-orange-700 border-orange-200',
            'PARENT': 'bg-pink-100 text-pink-700 border-pink-200',
        };
        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${styles[role] || 'bg-gray-100 text-gray-700'}`}>
                {role.replace('_', ' ')}
            </span>
        );
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <UserCog className="h-8 w-8 text-indigo-600" />
                        User Management
                    </h1>
                    <p className="text-gray-500 mt-1">Manage accounts and security for all system users.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-sm">
                    <Shield className="h-4 w-4" />
                    Super Admin Access
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input 
                        type="text" 
                        placeholder="Search by name, email or username..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <select 
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm appearance-none font-medium text-gray-600"
                    >
                        <option value="">All Roles</option>
                        <option value="SUPER_ADMIN">Super Admin</option>
                        <option value="SCHOOL_ADMIN">School Admin</option>
                        <option value="TEACHER">Teacher</option>
                        <option value="STUDENT">Student</option>
                        <option value="PARENT">Parent</option>
                    </select>
                </div>
                <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <select 
                        value={schoolFilter}
                        onChange={(e) => setSchoolFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm appearance-none font-medium text-gray-600"
                    >
                        <option value="">All Schools</option>
                        {schools.map(school => (
                            <option key={school.id} value={school.id}>{school.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* User Table */}
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">User Details</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Role</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Affiliation</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                            <p className="text-gray-500 font-medium">Fetching secure records...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-gray-400">
                                        No users found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-indigo-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-black text-lg">
                                                    {user.first_name ? user.first_name[0] : (user.username ? user.username[0].toUpperCase() : '?')}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 leading-none">
                                                        {user.first_name} {user.last_name}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-1.5 text-gray-500 text-sm">
                                                        <Mail className="h-3 w-3" />
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getRoleBadge(user.role)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-700">
                                                {typeof user.school === 'object' ? user.school?.name : (user.school_name || 'System Wide')}
                                            </div>
                                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">
                                                {user.username}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center">
                                                {user.is_active ? (
                                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                                ) : (
                                                    <XCircle className="h-5 w-5 text-red-500" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setIsResetModalOpen(true);
                                                    }}
                                                    className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-indigo-600 transition-all border border-transparent hover:border-indigo-100 hover:shadow-sm"
                                                    title="Reset Password"
                                                >
                                                    <Key className="h-5 w-5" />
                                                </button>
                                                <button 
                                                    onClick={() => toggleUserStatus(user)}
                                                    className={`p-2 hover:bg-white rounded-xl transition-all border border-transparent hover:shadow-sm ${user.is_active ? 'text-gray-400 hover:text-red-600 hover:border-red-100' : 'text-gray-400 hover:text-green-600 hover:border-green-100'}`}
                                                    title={user.is_active ? "Deactivate" : "Activate"}
                                                >
                                                    <RefreshCcw className="h-5 w-5" />
                                                </button>
                                                <button className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-gray-900 transition-all border border-transparent hover:border-gray-200">
                                                    <MoreVertical className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Reset Password Modal */}
            {isResetModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsResetModalOpen(false)} />
                    <div className="relative bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-8">
                            <div className="h-16 w-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
                                <Key className="h-8 w-8" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Security Reset</h2>
                            <p className="text-gray-500 mt-2">
                                You are about to reset the password for <span className="font-bold text-gray-900">{selectedUser?.email}</span>.
                            </p>

                            <form onSubmit={handleResetPassword} className="mt-8 space-y-6">
                                <div>
                                    <label className="block text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">New Secure Password</label>
                                    <input 
                                        type="password"
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-5 py-4 bg-gray-50 rounded-2xl border-gray-100 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-mono"
                                        placeholder="••••••••"
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button 
                                        type="button"
                                        onClick={() => setIsResetModalOpen(false)}
                                        className="flex-1 px-6 py-4 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={isResetting || !newPassword}
                                        className="flex-[2] px-6 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
                                    >
                                        {isResetting ? "Updating..." : "Confirm Reset"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
