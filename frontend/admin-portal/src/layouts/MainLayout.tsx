import { Outlet, Link, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Building2, School, Users, UserCircle,
    GraduationCap, BookOpen, Calendar, DollarSign, BarChart3,
    Settings, LogOut, Menu, X, UserPlus, FileText, Video, ClipboardList, Bell
} from 'lucide-react';
import { useState } from 'react';
import { authStore } from '../stores/authStore';
import { useInstitutionTerms } from '../hooks/useInstitutionTerms';
import SchoolSwitcher from '../components/SchoolSwitcher';
import toast from 'react-hot-toast';

export default function MainLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { user, logout } = authStore();
    const navigate = useNavigate();
    const terms = useInstitutionTerms();

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/login');
    };

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Building2, label: 'Organizations', path: '/organizations' },
        { icon: School, label: 'Schools', path: '/schools' },
        { icon: UserPlus, label: 'Admissions', path: '/admissions' },
        { icon: GraduationCap, label: terms.studentsLabel, path: '/students' },
        { icon: Users, label: 'Teachers', path: '/teachers' },
        { icon: BookOpen, label: terms.classesLabel, path: '/classes' },
        { icon: FileText, label: terms.subjectsLabel, path: '/subjects' },
        { icon: Calendar, label: 'Timetable', path: '/timetable' },
        { icon: UserCircle, label: 'Attendance', path: '/attendance' },
        { icon: ClipboardList, label: 'Assignments', path: '/assignments' },
        { icon: DollarSign, label: 'Fees', path: '/fees' },
        { icon: FileText, label: 'Exams', path: '/exams' },
        { icon: BookOpen, label: 'Library', path: '/library' },
        { icon: Video, label: 'Live Classes', path: '/live-classes' },
        { icon: BarChart3, label: 'Reports', path: '/reports' },
        { icon: Bell, label: 'Notifications', path: '/notifications' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-40 h-screen transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } bg-white border-r border-gray-200 w-64`}
            >
                {/* Logo */}
                <div className="flex items-center gap-3 p-6 border-b border-gray-200">
                    <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                        <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-gray-900">School MS</h1>
                        <p className="text-xs text-gray-500">Management System</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-180px)]">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-primary-50 hover:text-primary-700 transition-colors"
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* User Profile */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-700 font-semibold">
                                {user?.first_name?.[0]}{user?.last_name?.[0]}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {user?.full_name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className={`${sidebarOpen ? 'ml-64' : 'ml-0'} transition-all`}>
                {/* Top Bar */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                    <div className="flex items-center justify-between px-6 py-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>

                        <div className="flex items-center gap-6">
                            <Link to="/notifications" className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-all">
                                <Bell className="w-6 h-6" />
                                {user?.unread_notifications_count > 0 && (
                                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                                )}
                            </Link>
                            <SchoolSwitcher />
                            <span className="text-sm text-gray-600">
                                Welcome back, <strong>{user?.first_name}</strong>!
                            </span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
