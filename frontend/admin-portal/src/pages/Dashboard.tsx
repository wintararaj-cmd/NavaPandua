import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, School, GraduationCap, Building2, TrendingUp } from 'lucide-react';
import { analyticsService, type DashboardStats } from '../services/analyticsService';
import toast from 'react-hot-toast';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await analyticsService.getDashboardStats();
                if (response.success) {
                    setStats(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch dashboard stats:', error);
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
            value: stats?.total_students || 0,
            icon: Users,
            color: 'bg-blue-500',
        },
        {
            label: 'Total Teachers',
            value: stats?.total_teachers || 0,
            icon: GraduationCap,
            color: 'bg-green-500',
        },
        {
            label: 'Total Schools',
            value: stats?.total_schools || 0,
            icon: School,
            color: 'bg-purple-500',
        },
        {
            label: 'Total Organizations',
            value: stats?.total_organizations || 0,
            icon: Building2,
            color: 'bg-yellow-500',
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">Welcome to your school management dashboard</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => (
                    <div key={stat.label} className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                            <div className={`w-14 h-14 ${stat.color} rounded-lg flex items-center justify-center`}>
                                <stat.icon className="w-7 h-7 text-white" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Attendance Summary */}
                <div className="card">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Today's Attendance</h2>
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="h-48 w-48 shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Present', value: stats?.attendance_today.present || 0 },
                                            { name: 'Absent', value: stats?.attendance_today.absent || 0 },
                                            { name: 'Late', value: stats?.attendance_today.late || 0 },
                                        ]}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        <Cell fill="#10B981" />
                                        <Cell fill="#EF4444" />
                                        <Cell fill="#F59E0B" />
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-2 gap-4 flex-1">
                            <div className="text-center p-3 bg-green-50 rounded-2xl">
                                <p className="text-2xl font-bold text-green-600">{stats?.attendance_today.present || 0}</p>
                                <p className="text-[10px] text-gray-500 uppercase font-bold">Present</p>
                            </div>
                            <div className="text-center p-3 bg-red-50 rounded-2xl">
                                <p className="text-2xl font-bold text-red-600">{stats?.attendance_today.absent || 0}</p>
                                <p className="text-[10px] text-gray-500 uppercase font-bold">Absent</p>
                            </div>
                            <div className="text-center p-3 bg-yellow-50 rounded-2xl">
                                <p className="text-2xl font-bold text-yellow-600">{stats?.attendance_today.late || 0}</p>
                                <p className="text-[10px] text-gray-500 uppercase font-bold">Late</p>
                            </div>
                            <div className="text-center p-3 bg-primary-50 rounded-2xl">
                                <p className="text-2xl font-bold text-primary-600">{stats?.attendance_today.percentage || 0}%</p>
                                <p className="text-[10px] text-gray-500 uppercase font-bold">Rate</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Finance Summary */}
                <div className="card">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Monthly Collection</h2>
                    <div className="flex items-center justify-between p-4 bg-primary-50 rounded-xl">
                        <div>
                            <p className="text-sm text-primary-600 font-medium">This Month</p>
                            <p className="text-4xl font-bold text-gray-900">
                                {stats?.finance.currency} {stats?.finance.monthly_collection.toLocaleString()}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-primary-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Attendance Trend Chart */}
            <div className="card">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Attendance Trends</h2>
                        <p className="text-sm text-gray-500">Student participation for the last 7 days</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/reports')}
                            className="text-primary-600 text-sm font-bold hover:underline"
                        >
                            View Performance →
                        </button>
                        <div className="p-2 bg-primary-50 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-primary-600" />
                        </div>
                    </div>
                </div>
                <div className="h-80 w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats?.attendance_trend}>
                            <defs>
                                <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6B7280', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6B7280', fontSize: 12 }}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="present"
                                stroke="#4F46E5"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorPresent)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button onClick={() => navigate('/students')} className="btn btn-primary text-center">
                            + Add Student
                        </button>
                        <button onClick={() => navigate('/teachers')} className="btn btn-secondary text-center">
                            + Add Teacher
                        </button>
                        <button onClick={() => navigate('/classes')} className="btn btn-secondary text-center">
                            Manage Classes
                        </button>
                        <button onClick={() => navigate('/fees')} className="btn btn-secondary text-center">
                            Collect Fees
                        </button>
                    </div>
                </div>

                <div className="card">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Events</h2>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                            <div className="w-10 h-10 bg-blue-100 rounded flex flex-col items-center justify-center text-blue-700">
                                <span className="text-xs font-bold">FEB</span>
                                <span className="text-sm font-bold">20</span>
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">Annual Sports Meet</p>
                                <p className="text-xs text-gray-500">Starts at 9:00 AM • Main Ground</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                            <div className="w-10 h-10 bg-purple-100 rounded flex flex-col items-center justify-center text-purple-700">
                                <span className="text-xs font-bold">FEB</span>
                                <span className="text-sm font-bold">25</span>
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">Parent-Teacher Meeting</p>
                                <p className="text-xs text-gray-500">10:00 AM - 2:00 PM • Audiorium</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
