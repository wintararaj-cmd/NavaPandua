
import { useState, useEffect } from 'react';
import {
    Calendar, Users, CheckCircle, XCircle, Clock, Save, Search,
    Plus, ClipboardList, CheckSquare, XSquare, Trash2, ChevronDown,
    AlertCircle, UserCheck, FileText
} from 'lucide-react';
import { attendanceService } from '../services/attendanceService';
import { leaveService, type LeaveApplication, type LeaveType } from '../services/leaveService';
import { studentService, type Student } from '../services/studentService';
import { classService, type Class, type Section } from '../services/classService';
import toast from 'react-hot-toast';

/* ─────────────────────────────────────────────────────────
   Status badge helper
───────────────────────────────────────────────────────── */
function LeaveStatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
        APPROVED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        REJECTED: 'bg-red-100 text-red-700 border-red-200',
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>
            {status}
        </span>
    );
}

/* ─────────────────────────────────────────────────────────
   Reject modal
───────────────────────────────────────────────────────── */
function RejectModal({
    leave,
    onClose,
    onConfirm,
}: {
    leave: LeaveApplication;
    onClose: () => void;
    onConfirm: (reason: string) => void;
}) {
    const [reason, setReason] = useState('');
    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <XSquare className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Reject Leave</h3>
                        <p className="text-sm text-gray-500">{leave.applicant_name}</p>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Reason <span className="text-red-500">*</span></label>
                    <textarea
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none resize-none"
                        placeholder="Provide a reason for rejection..."
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                    />
                </div>
                <div className="flex gap-3 justify-end pt-2">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
                    <button
                        onClick={() => { if (reason.trim()) onConfirm(reason); else toast.error('Please provide a rejection reason'); }}
                        className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition"
                    >
                        Reject
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   Apply Leave Modal
───────────────────────────────────────────────────────── */
function ApplyLeaveModal({ leaveTypes, onClose, onSuccess }: {
    leaveTypes: LeaveType[];
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [form, setForm] = useState({ leave_type: '', start_date: '', end_date: '', reason: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.leave_type || !form.start_date || !form.end_date || !form.reason) {
            toast.error('All fields are required'); return;
        }
        if (form.start_date > form.end_date) { toast.error('End date must be after start date'); return; }
        try {
            setLoading(true);
            await leaveService.createLeaveApplication(form);
            toast.success('Leave application submitted');
            onSuccess();
            onClose();
        } catch {
            toast.error('Failed to submit application');
        } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <FileText className="w-5 h-5 text-indigo-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Apply for Leave</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                        <select
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                            value={form.leave_type}
                            onChange={e => setForm(p => ({ ...p, leave_type: e.target.value }))}
                            required
                        >
                            <option value="">Select leave type</option>
                            {leaveTypes.map(lt => (
                                <option key={lt.id} value={lt.id}>{lt.name} ({lt.days_allowed} days/yr)</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <input type="date" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                                value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <input type="date" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                                value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                        <textarea rows={3} required
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none resize-none"
                            placeholder="Explain your reason..."
                            value={form.reason}
                            onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
                        />
                    </div>
                    <div className="flex gap-3 justify-end pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
                        <button type="submit" disabled={loading}
                            className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition disabled:opacity-50">
                            {loading ? 'Submitting...' : 'Submit Application'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   Leave Management Tab
───────────────────────────────────────────────────────── */
function LeaveManagement() {
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [applications, setApplications] = useState<LeaveApplication[]>([]);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [rejectTarget, setRejectTarget] = useState<LeaveApplication | null>(null);

    useEffect(() => { fetchData(); }, [statusFilter]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [typesData, appsData] = await Promise.all([
                leaveService.getLeaveTypes(),
                leaveService.getLeaveApplications(statusFilter ? { status: statusFilter } : undefined),
            ]);
            setLeaveTypes(typesData.results ?? typesData);
            setApplications(appsData.results ?? appsData);
        } catch {
            toast.error('Failed to load leave data');
        } finally { setLoading(false); }
    };

    const handleApprove = async (id: string) => {
        try {
            await leaveService.approveLeave(id);
            toast.success('Leave approved');
            fetchData();
        } catch { toast.error('Failed to approve leave'); }
    };

    const handleReject = async (reason: string) => {
        if (!rejectTarget) return;
        try {
            await leaveService.rejectLeave(rejectTarget.id, reason);
            toast.success('Leave rejected');
            setRejectTarget(null);
            fetchData();
        } catch { toast.error('Failed to reject leave'); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this leave application?')) return;
        try {
            await leaveService.deleteLeaveApplication(id);
            toast.success('Deleted');
            fetchData();
        } catch { toast.error('Failed to delete'); }
    };

    const stats = {
        pending: applications.filter(a => a.status === 'PENDING').length,
        approved: applications.filter(a => a.status === 'APPROVED').length,
        rejected: applications.filter(a => a.status === 'REJECTED').length,
    };

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Pending', count: stats.pending, color: 'bg-amber-50 border-amber-200', text: 'text-amber-700', icon: AlertCircle },
                    { label: 'Approved', count: stats.approved, color: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', icon: CheckSquare },
                    { label: 'Rejected', count: stats.rejected, color: 'bg-red-50 border-red-200', text: 'text-red-700', icon: XSquare },
                ].map(s => (
                    <div key={s.label} className={`${s.color} border rounded-xl p-4 flex items-center gap-4`}>
                        <s.icon className={`w-8 h-8 ${s.text}`} />
                        <div>
                            <p className="text-2xl font-black text-gray-900">{s.count}</p>
                            <p className={`text-xs font-semibold ${s.text}`}>{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Controls */}
            <div className="flex flex-wrap justify-between items-center gap-3">
                <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700">Filter:</label>
                    {['', 'PENDING', 'APPROVED', 'REJECTED'].map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition ${statusFilter === s
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'text-gray-600 border-gray-200 hover:border-indigo-400 hover:text-indigo-600'}`}
                        >
                            {s || 'All'}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => setShowApplyModal(true)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 shadow-sm transition"
                >
                    <Plus className="w-4 h-4" /> Apply for Leave
                </button>
            </div>

            {/* Applications Table */}
            <div className="overflow-x-auto border border-gray-100 rounded-xl shadow-sm">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                        <tr>
                            {['Applicant', 'Leave Type', 'Duration', 'Reason', 'Status', 'Applied On', 'Actions'].map(h => (
                                <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">Loading...</td></tr>
                        ) : applications.length === 0 ? (
                            <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                                <ClipboardList className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                                <p>No leave applications found.</p>
                            </td></tr>
                        ) : applications.map(app => (
                            <tr key={app.id} className="hover:bg-gray-50 transition">
                                <td className="px-5 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 text-xs font-bold">
                                            {app.applicant_name?.charAt(0) ?? '?'}
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900">{app.applicant_name}</span>
                                    </div>
                                </td>
                                <td className="px-5 py-4 whitespace-nowrap">
                                    <span className="text-sm text-gray-700 font-medium">{app.leave_type_name}</span>
                                </td>
                                <td className="px-5 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 font-semibold">{app.start_date} → {app.end_date}</div>
                                    <div className="text-xs text-gray-400">{app.duration} day{app.duration !== 1 ? 's' : ''}</div>
                                </td>
                                <td className="px-5 py-4 max-w-xs">
                                    <p className="text-sm text-gray-600 truncate">{app.reason}</p>
                                    {app.rejection_reason && (
                                        <p className="text-xs text-red-500 mt-0.5">Reason: {app.rejection_reason}</p>
                                    )}
                                </td>
                                <td className="px-5 py-4 whitespace-nowrap">
                                    <LeaveStatusBadge status={app.status} />
                                    {app.approver_name && (
                                        <p className="text-xs text-gray-400 mt-0.5">by {app.approver_name}</p>
                                    )}
                                </td>
                                <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(app.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-5 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-1">
                                        {app.status === 'PENDING' && (
                                            <>
                                                <button
                                                    onClick={() => handleApprove(app.id)}
                                                    title="Approve"
                                                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                                                >
                                                    <CheckSquare className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setRejectTarget(app)}
                                                    title="Reject"
                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                                                >
                                                    <XSquare className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                        <button
                                            onClick={() => handleDelete(app.id)}
                                            title="Delete"
                                            className="p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showApplyModal && (
                <ApplyLeaveModal
                    leaveTypes={leaveTypes}
                    onClose={() => setShowApplyModal(false)}
                    onSuccess={fetchData}
                />
            )}
            {rejectTarget && (
                <RejectModal
                    leave={rejectTarget}
                    onClose={() => setRejectTarget(null)}
                    onConfirm={handleReject}
                />
            )}
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   Main Attendance Page
───────────────────────────────────────────────────────── */
export default function Attendance() {
    const [activeTab, setActiveTab] = useState<'take' | 'report' | 'leave'>('take');
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSection, setSelectedSection] = useState('');

    const [classes, setClasses] = useState<Class[]>([]);
    const [sections, setSections] = useState<Section[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [attendanceData, setAttendanceData] = useState<Record<string, { status: string; remarks: string }>>({});

    useEffect(() => { fetchInitialData(); }, []);

    useEffect(() => {
        if (selectedClass) {
            fetchSections(selectedClass);
        } else {
            setSections([]);
            setSelectedSection('');
        }
    }, [selectedClass]);

    const fetchInitialData = async () => {
        try {
            const classesData = await classService.getClasses();
            setClasses(classesData.results || []);
        } catch { toast.error('Failed to load classes'); }
    };

    const fetchSections = async (classId: string) => {
        try {
            const sectionsData = await classService.getSections({ class_id: classId });
            setSections(sectionsData.results || []);
        } catch { toast.error('Failed to load sections'); }
    };

    const loadStudents = async () => {
        if (!selectedClass || !selectedSection) { toast.error('Please select both class and section'); return; }
        try {
            setLoading(true);
            const [studentsData, existingAttendance] = await Promise.all([
                studentService.getStudents({ current_class: selectedClass, section: selectedSection }),
                attendanceService.getStudentAttendance({ date, student__class_assigned: selectedClass, student__section: selectedSection })
            ]);
            const studentList = (studentsData.results || []) as Student[];
            setStudents(studentList);
            const initialData: Record<string, { status: string; remarks: string }> = {};
            studentList.forEach((s: Student) => { initialData[s.id] = { status: 'PRESENT', remarks: '' }; });
            (existingAttendance.results || []).forEach((att: any) => {
                initialData[att.student] = { status: att.status, remarks: att.remarks };
            });
            setAttendanceData(initialData);
        } catch { toast.error('Failed to load students'); }
        finally { setLoading(false); }
    };

    const handleStatusChange = (studentId: string, status: string) => {
        setAttendanceData(prev => ({ ...prev, [studentId]: { ...prev[studentId], status } }));
    };

    const markAllStatus = (status: string) => {
        const newData = { ...attendanceData };
        students.forEach(s => { newData[s.id] = { ...newData[s.id], status }; });
        setAttendanceData(newData);
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const payload = {
                date,
                attendance_data: Object.entries(attendanceData).map(([id, data]) => ({ student: id, status: data.status, remarks: data.remarks }))
            };
            await attendanceService.bulkSaveStudentAttendance(payload);
            toast.success('Attendance saved successfully');
        } catch { toast.error('Failed to save attendance'); }
        finally { setLoading(false); }
    };

    const tabs = [
        { id: 'take', label: 'Take Attendance', icon: Users },
        { id: 'report', label: 'Reports', icon: Calendar },
        { id: 'leave', label: 'Leave Management', icon: ClipboardList },
    ] as const;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Track attendance & manage leave applications</p>
                </div>
                <div className="flex bg-white rounded-xl shadow-sm border border-gray-200 p-1 gap-1">
                    {tabs.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-all ${activeTab === t.id
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <t.icon className="h-4 w-4" />
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'leave' ? (
                <div className="bg-white shadow rounded-xl p-6">
                    <LeaveManagement />
                </div>
            ) : (
                <div className="bg-white shadow rounded-xl p-6">
                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input type="date" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                                value={date} onChange={e => setDate(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                            <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                                value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
                                <option value="">Select Class</option>
                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                            <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                                value={selectedSection} onChange={e => setSelectedSection(e.target.value)} disabled={!selectedClass}>
                                <option value="">Select Section</option>
                                {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button onClick={loadStudents}
                                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 text-sm font-semibold shadow-sm transition">
                                <Search className="h-4 w-4" /> Load Students
                            </button>
                        </div>
                    </div>

                    {/* Attendance Grid */}
                    {activeTab === 'take' && students.length > 0 && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <div className="flex gap-5">
                                    <span className="text-sm font-bold text-gray-700">Total: {students.length}</span>
                                    <span className="text-sm font-bold text-green-600">Present: {Object.values(attendanceData).filter(a => a.status === 'PRESENT').length}</span>
                                    <span className="text-sm font-bold text-red-600">Absent: {Object.values(attendanceData).filter(a => a.status === 'ABSENT').length}</span>
                                    <span className="text-sm font-bold text-amber-600">Late: {Object.values(attendanceData).filter(a => a.status === 'LATE').length}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => markAllStatus('PRESENT')}
                                        className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 transition">
                                        Mark All Present
                                    </button>
                                    <button onClick={handleSave} disabled={loading}
                                        className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm font-bold shadow-sm transition disabled:opacity-50">
                                        <Save className="h-4 w-4" /> Save Attendance
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto border border-gray-100 rounded-xl">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Roll No</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Student Name</th>
                                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Attendance</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {students.map(student => (
                                            <tr key={student.id} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{student.roll_number || '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{student.first_name} {student.last_name}</div>
                                                    <div className="text-xs text-gray-500">{student.admission_number}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex justify-center gap-2">
                                                        {[
                                                            { label: 'P', value: 'PRESENT', color: 'bg-green-100 text-green-700' },
                                                            { label: 'A', value: 'ABSENT', color: 'bg-red-100 text-red-700' },
                                                            { label: 'L', value: 'LATE', color: 'bg-yellow-100 text-yellow-700' },
                                                            { label: 'H', value: 'HALF_DAY', color: 'bg-blue-100 text-blue-700' },
                                                        ].map(opt => (
                                                            <button key={opt.value}
                                                                onClick={() => handleStatusChange(student.id, opt.value)}
                                                                title={opt.value}
                                                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${attendanceData[student.id]?.status === opt.value
                                                                    ? `${opt.color} ring-2 ring-offset-2 ring-indigo-500 shadow-sm scale-110`
                                                                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                                                            >
                                                                <span className="text-xs font-black">{opt.label}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <input type="text"
                                                        className="w-full px-3 py-1 text-sm border-gray-200 border rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                                                        placeholder="Add note..."
                                                        value={attendanceData[student.id]?.remarks || ''}
                                                        onChange={e => setAttendanceData(prev => ({ ...prev, [student.id]: { ...prev[student.id], remarks: e.target.value } }))}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'take' && students.length === 0 && !loading && (
                        <div className="py-20 text-center">
                            <UserCheck className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                            <h4 className="text-lg font-bold text-gray-900 mb-1">No Students Loaded</h4>
                            <p className="text-gray-500 max-w-sm mx-auto">Select a class and section then click "Load Students" to begin.</p>
                        </div>
                    )}

                    {activeTab === 'report' && (
                        <div className="py-20 text-center">
                            <Calendar className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                            <h4 className="text-lg font-bold text-gray-900 mb-1">Attendance Reports</h4>
                            <p className="text-gray-500">Select a class and section above, then load students to view attendance history.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
