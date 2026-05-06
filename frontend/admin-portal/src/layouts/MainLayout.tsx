import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Building2, School, Users, UserCircle,
    GraduationCap, BookOpen, Calendar, DollarSign, BarChart3,
    Settings, LogOut, Menu, X, UserPlus, FileText, Video,
    ClipboardList, Bell, Package, ChevronRight, Zap, Library
} from 'lucide-react';
import { useState } from 'react';
import { authStore } from '../stores/authStore';
import { useInstitutionTerms } from '../hooks/useInstitutionTerms';
import SchoolSwitcher from '../components/SchoolSwitcher';
import toast from 'react-hot-toast';

interface NavItem {
    icon: React.ElementType;
    label: string;
    path: string;
    badge?: number;
}

interface NavSection {
    title: string;
    items: NavItem[];
}

export default function MainLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { user, logout } = authStore();
    const navigate = useNavigate();
    const location = useLocation();
    const terms = useInstitutionTerms();

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/login');
    };

    const navSections: NavSection[] = [
        {
            title: 'Overview',
            items: [
                { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
                { icon: Bell, label: 'Notifications', path: '/notifications', badge: user?.unread_notifications_count || 0 },
            ],
        },
        ...(user?.role === 'SUPER_ADMIN' ? [{
            title: 'Management',
            items: [
                { icon: Building2, label: 'Organizations', path: '/organizations' },
                { icon: School, label: 'Schools', path: '/schools' },
            ],
        }] : []),
        {
            title: 'People',
            items: [
                { icon: UserPlus, label: 'Admissions', path: '/admissions' },
                { icon: GraduationCap, label: terms.studentsLabel, path: '/students' },
                { icon: Users, label: 'Teachers', path: '/teachers' },
            ],
        },
        {
            title: 'Academics',
            items: [
                { icon: BookOpen, label: terms.classesLabel, path: '/classes' },
                { icon: FileText, label: terms.subjectsLabel, path: '/subjects' },
                { icon: Calendar, label: 'Timetable', path: '/timetable' },
                { icon: UserCircle, label: 'Attendance', path: '/attendance' },
                { icon: ClipboardList, label: 'Assignments', path: '/assignments' },
                { icon: FileText, label: 'Exams', path: '/exams' },
                { icon: Video, label: 'Live Classes', path: '/live-classes' },
            ],
        },
        {
            title: 'Finance & Resources',
            items: [
                { icon: DollarSign, label: 'Fees', path: '/fees' },
                { icon: Library, label: 'Library', path: '/library' },
                { icon: Package, label: 'Inventory', path: '/inventory' },
            ],
        },
        {
            title: 'Analytics',
            items: [
                { icon: BarChart3, label: 'Reports', path: '/reports' },
                { icon: Settings, label: 'Settings', path: '/settings' },
            ],
        },
    ];

    const isActive = (path: string) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    const initials = `${user?.first_name?.[0] ?? ''}${user?.last_name?.[0] ?? ''}`;

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* ═══ SIDEBAR ═══ */}
            <aside
                className={`${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'} transition-all duration-300 ease-in-out shrink-0`}
            >
                <div className="fixed top-0 left-0 h-screen w-64 bg-slate-900 flex flex-col border-r border-slate-800 z-40">
                    {/* Logo */}
                    <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800">
                        <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-white text-sm leading-tight">NavaPandua ERP</h1>
                            <p className="text-xs text-slate-500">School Management</p>
                        </div>
                    </div>

                    {/* School Switcher */}
                    <div className="px-3 py-3 border-b border-slate-800">
                        <SchoolSwitcher />
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
                        {navSections.map((section) => (
                            <div key={section.title}>
                                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-3 mt-4 mb-1.5">
                                    {section.title}
                                </p>
                                {section.items.map((item) => {
                                    const active = isActive(item.path);
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
                                                ${active
                                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                                }`}
                                        >
                                            <item.icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
                                            <span className="flex-1 truncate">{item.label}</span>
                                            {item.badge ? (
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-red-500 text-white'}`}>
                                                    {item.badge}
                                                </span>
                                            ) : active ? (
                                                <ChevronRight className="w-3.5 h-3.5 text-white/50" />
                                            ) : null}
                                        </Link>
                                    );
                                })}
                            </div>
                        ))}
                    </nav>

                    {/* User footer */}
                    <div className="px-3 py-4 border-t border-slate-800">
                        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-all cursor-pointer group">
                            <div className="w-9 h-9 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-full flex items-center justify-center shrink-0 shadow-sm">
                                <span className="text-white text-xs font-bold">{initials}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white truncate">{user?.full_name}</p>
                                <p className="text-xs text-slate-500 truncate">{user?.role?.replace('_', ' ')}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                title="Logout"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* ═══ MAIN CONTENT ═══ */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Bar */}
                <header className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm shadow-slate-200/50">
                    <div className="flex items-center justify-between px-6 py-3.5">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 rounded-xl transition-all"
                            >
                                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                            {/* Breadcrumb hint */}
                            <div className="hidden md:flex items-center gap-2 text-sm">
                                <Zap className="w-4 h-4 text-indigo-500" />
                                <span className="text-slate-400">Quick access:</span>
                                {[
                                    { label: 'Students', path: '/students' },
                                    { label: 'Fees', path: '/fees' },
                                    { label: 'Attendance', path: '/attendance' },
                                ].map((q) => (
                                    <Link
                                        key={q.path}
                                        to={q.path}
                                        className="px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition-all"
                                    >
                                        {q.label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Notifications bell */}
                            <Link to="/notifications" className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-all">
                                <Bell className="w-5 h-5" />
                                {(user?.unread_notifications_count ?? 0) > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border border-white rounded-full" />
                                )}
                            </Link>

                            {/* User chip */}
                            <div className="flex items-center gap-2 pl-3 border-l border-slate-100">
                                <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">{initials}</span>
                                </div>
                                <div className="hidden sm:block">
                                    <p className="text-sm font-semibold text-slate-800 leading-tight">{user?.first_name}</p>
                                    <p className="text-[11px] text-slate-400">{user?.role?.replace('_', ' ')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 animate-fade-in">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
