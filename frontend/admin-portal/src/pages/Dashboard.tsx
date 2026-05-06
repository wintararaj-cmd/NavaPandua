import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Users, School, GraduationCap, Building2, TrendingUp,
    DollarSign, AlertCircle, BookOpen, ArrowUpRight,
    ClipboardList, UserCircle, Video, BarChart3, Package,
    ChevronRight
} from 'lucide-react';
import { analyticsService, type DashboardStats } from '../services/analyticsService';
import toast from 'react-hot-toast';
import { authStore } from '../stores/authStore';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
    CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';

const COLORS = ['#10B981', '#EF4444', '#F59E0B', '#6366F1'];

function SkeletonCard() {
    return (
        <div className="card">
            <div className="skeleton h-4 w-24 mb-3 rounded-lg" />
            <div className="skeleton h-8 w-16 rounded-lg" />
        </div>
    );
}

interface StatCardProps {
    label: string;
    value: string | number;
    icon: React.ElementType;
    gradient: string;
    change?: string;
    positive?: boolean;
    path?: string;
}

function StatCard({ label, value, icon: Icon, gradient, change, positive, path }: StatCardProps) {
    const navigate = useNavigate();
    return (
        <div
            onClick={() => path && navigate(path)}
            className={`card flex items-center gap-4 group transition-all duration-200 ${path ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''}`}
        >
            <div className={`${gradient} w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
                <p className="text-2xl font-black text-slate-900 mt-0.5">{value.toLocaleString()}</p>
                {change && (
                    <p className={`text-xs font-semibold mt-1 flex items-center gap-1 ${positive ? 'text-emerald-600' : 'text-red-500'}`}>
                        <TrendingUp className={`w-3 h-3 ${!positive && 'rotate-180'}`} />
                        {change}
                    </p>
                )}
            </div>
            {path && (
                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors shrink-0" />
            )}
        </div>
    );
}

interface QuickLinkProps {
    icon: React.ElementType;
    label: string;
    description: string;
    path: string;
    color: string;
}

function QuickLink({ icon: Icon, label, description, path, color }: QuickLinkProps) {
    return (
        <Link
            to={path}
            className="flex items-center gap-3 p-3.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group"
        >
            <div className={`${color} w-9 h-9 rounded-xl flex items-center justify-center shrink-0`}>
                <Icon className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">{label}</p>
                <p className="text-xs text-slate-400 truncate">{description}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
        </Link>
    );
}

export default function Dashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const { user } = authStore();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await analyticsService.getDashboardStats();
                if (response.success) {
                    setStats(response.data);
                }
            } catch {
                toast.error('Failed to load dashboard statistics');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const statCards = [
        {
            label: 'Total Students',
            value: stats?.total_students ?? 0,
            icon: GraduationCap,
            gradient: 'gradient-brand',
            change: '+12 this month',
            positive: true,
            path: '/students',
        },
        {
            label: 'Total Teachers',
            value: stats?.total_teachers ?? 0,
            icon: Users,
            gradient: 'gradient-success',
            change: '+2 this month',
            positive: true,
            path: '/teachers',
        },
        {
            label: 'Total Schools',
            value: stats?.total_schools ?? 0,
            icon: School,
            gradient: 'gradient-purple',
            path: '/schools',
        },
        {
            label: 'Organizations',
            value: stats?.total_organizations ?? 0,
            icon: Building2,
            gradient: 'gradient-warning',
            path: '/organizations',
        },
    ];

    const pieData = [
        { name: 'Present', value: stats?.attendance_today?.present ?? 0 },
        { name: 'Absent', value: stats?.attendance_today?.absent ?? 0 },
        { name: 'Late', value: stats?.attendance_today?.late ?? 0 },
    ];

    const todayRate = stats?.attendance_today?.percentage ?? 0;

    return (
        <div className="space-y-6 max-w-7xl mx-auto animate-slide-up">

            {/* ─── Page Header ─── */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Good morning, {user?.first_name} 👋
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Here's what's happening at your school today.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="badge badge-green">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        System Live
                    </span>
                    <Link to="/reports" className="btn btn-secondary text-sm">
                        <BarChart3 className="w-4 h-4" />
                        View Reports
                    </Link>
                </div>
            </div>

            {/* ─── Stat Cards ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {loading
                    ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
                    : statCards.map((s) => <StatCard key={s.label} {...s} />)
                }
            </div>

            {/* ─── Middle Row ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* Attendance Donut */}
                <div className="card flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">Today's Attendance</h2>
                            <p className="text-xs text-slate-500">Live across all classes</p>
                        </div>
                        <Link to="/attendance" className="btn btn-ghost btn-icon">
                            <ArrowUpRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="flex items-center gap-6 flex-1">
                        <div className="relative w-36 h-36 shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        innerRadius={46}
                                        outerRadius={64}
                                        paddingAngle={3}
                                        dataKey="value"
                                        startAngle={90}
                                        endAngle={-270}
                                    >
                                        {pieData.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i]} stroke="none" />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(val) => [`${val} students`]} />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center label */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <p className="text-xl font-black text-slate-900">{todayRate}%</p>
                                <p className="text-[10px] text-slate-400 font-semibold">Rate</p>
                            </div>
                        </div>

                        <div className="space-y-3 flex-1">
                            {[
                                { label: 'Present', val: stats?.attendance_today?.present ?? 0, color: 'bg-emerald-500' },
                                { label: 'Absent', val: stats?.attendance_today?.absent ?? 0, color: 'bg-red-500' },
                                { label: 'Late', val: stats?.attendance_today?.late ?? 0, color: 'bg-amber-500' },
                            ].map((r) => (
                                <div key={r.label} className="flex items-center gap-2">
                                    <span className={`w-2.5 h-2.5 rounded-full ${r.color} shrink-0`} />
                                    <span className="text-xs text-slate-500 flex-1">{r.label}</span>
                                    <span className="text-sm font-bold text-slate-800">{r.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Fee Collection */}
                <div className="card lg:col-span-2 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">Fee Collection</h2>
                            <p className="text-xs text-slate-500">Monthly progress</p>
                        </div>
                        <Link to="/fees" className="btn btn-ghost btn-icon">
                            <ArrowUpRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-4">
                        {[
                            {
                                label: 'Collected',
                                value: `${stats?.finance?.currency ?? '₹'} ${(stats?.finance?.monthly_collection ?? 0).toLocaleString()}`,
                                color: 'text-emerald-600',
                                bg: 'bg-emerald-50',
                            },
                            {
                                label: 'Pending',
                                value: `${stats?.finance?.currency ?? '₹'} ${(stats?.finance?.pending_fees ?? 0).toLocaleString()}`,
                                color: 'text-red-600',
                                bg: 'bg-red-50',
                            },
                            {
                                label: 'Defaulters',
                                value: stats?.finance?.defaulters ?? 0,
                                color: 'text-amber-600',
                                bg: 'bg-amber-50',
                            },
                        ].map((f) => (
                            <div key={f.label} className={`${f.bg} rounded-xl p-3 text-center`}>
                                <p className={`text-lg font-black ${f.color}`}>{f.value}</p>
                                <p className="text-xs text-slate-500 font-semibold mt-0.5">{f.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Mini bar chart placeholder */}
                    <div className="flex-1 h-24">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                                { month: 'Jan', collected: 85000 },
                                { month: 'Feb', collected: 92000 },
                                { month: 'Mar', collected: 78000 },
                                { month: 'Apr', collected: 105000 },
                                { month: 'May', collected: stats?.finance?.monthly_collection ?? 0 },
                            ]} barSize={20}>
                                <CartesianGrid vertical={false} stroke="#F1F5F9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '12px' }}
                                    formatter={(val: number) => [`₹${val.toLocaleString()}`, 'Collected']}
                                />
                                <Bar dataKey="collected" fill="#6366F1" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* ─── Attendance Trend ─── */}
            <div className="card">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-base font-bold text-slate-900">Attendance Trends</h2>
                        <p className="text-xs text-slate-500">Student participation — last 7 days</p>
                    </div>
                    <Link
                        to="/attendance"
                        className="btn btn-secondary text-sm"
                    >
                        Full Report <ArrowUpRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats?.attendance_trend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94A3B8', fontSize: 11 }}
                                dy={8}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94A3B8', fontSize: 11 }}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.1)', fontSize: '12px' }}
                            />
                            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }} />
                            <Area
                                type="monotone"
                                dataKey="present"
                                stroke="#6366F1"
                                strokeWidth={2.5}
                                fillOpacity={1}
                                fill="url(#colorPresent)"
                                dot={{ r: 4, fill: '#6366F1', strokeWidth: 0 }}
                                activeDot={{ r: 6, fill: '#6366F1' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="absent"
                                stroke="#EF4444"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorAbsent)"
                                dot={{ r: 3, fill: '#EF4444', strokeWidth: 0 }}
                                activeDot={{ r: 5, fill: '#EF4444' }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* ─── Bottom Row ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* Quick Actions */}
                <div className="card">
                    <h2 className="text-base font-bold text-slate-900 mb-4">Quick Actions</h2>
                    <div className="space-y-1">
                        {[
                            { icon: GraduationCap, label: 'Add New Student', description: 'Enroll a new student', path: '/admissions', color: 'gradient-brand' },
                            { icon: Users, label: 'Add Teacher', description: 'Register new staff', path: '/teachers', color: 'gradient-success' },
                            { icon: DollarSign, label: 'Collect Fee', description: 'Record a fee payment', path: '/fees', color: 'gradient-warning' },
                            { icon: ClipboardList, label: 'Post Assignment', description: 'Create new homework', path: '/assignments', color: 'gradient-purple' },
                            { icon: UserCircle, label: 'Mark Attendance', description: 'Daily register', path: '/attendance', color: 'gradient-info' },
                        ].map((q) => (
                            <QuickLink key={q.path} {...q} />
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="card">
                    <h2 className="text-base font-bold text-slate-900 mb-4">System Overview</h2>
                    <div className="space-y-3">
                        {[
                            {
                                icon: AlertCircle,
                                label: 'Fee Defaulters',
                                value: stats?.finance?.defaulters ?? 0,
                                sub: 'students pending payment',
                                color: 'text-red-500 bg-red-50',
                            },
                            {
                                icon: BookOpen,
                                label: 'Active Classes',
                                value: '—',
                                sub: 'sections in session',
                                color: 'text-blue-500 bg-blue-50',
                            },
                            {
                                icon: Video,
                                label: 'Live Sessions Today',
                                value: '—',
                                sub: 'virtual classrooms',
                                color: 'text-purple-500 bg-purple-50',
                            },
                            {
                                icon: Package,
                                label: 'Library Books',
                                value: '—',
                                sub: 'issued this month',
                                color: 'text-amber-500 bg-amber-50',
                            },
                        ].map((item) => (
                            <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${item.color} shrink-0`}>
                                    <item.icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                                    <p className="text-xs text-slate-400">{item.sub}</p>
                                </div>
                                <span className="text-lg font-black text-slate-800">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
