import { useState, useEffect } from 'react';
import {
    Calendar, Users, CheckCircle, XCircle, Clock, Save, Search,
    Plus, ClipboardList, CheckSquare, XSquare, Trash2, ChevronDown,
    AlertCircle, UserCheck, FileText, UserPlus, BookOpen, GraduationCap, Briefcase
} from 'lucide-react';

import { attendanceService } from '../services/attendanceService';
import { leaveService, type LeaveApplication, type LeaveType } from '../services/leaveService';
import { studentService, type Student } from '../services/studentService';
import { classService, type Class, type Section } from '../services/classService';
import { teacherService } from '../services/teacherService';

import { useInstitutionTerms } from '../hooks/useInstitutionTerms';
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
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>
            {status}
        </span>
    );
}

/* ─────────────────────────────────────────────────────────
   Reject modal
───────────────────────────────────────────────────────── */
function RejectModal({ leave, onClose, onConfirm }: { leave: LeaveApplication; onClose: () => void; onConfirm: (reason: string) => void; }) {
    const [reason, setReason] = useState('');
    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 space-y-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                        <XSquare className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-gray-900 tracking-tight">Reject Application</h3>
                        <p className="text-sm font-bold text-gray-400">{leave.applicant_name}</p>
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Rejection Reason *</label>
                    <textarea
                        rows={4}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-red-400 outline-none resize-none font-medium"
                        placeholder="Explain why this application was rejected..."
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                    />
                </div>
                <div className="flex gap-3 justify-end pt-2">
                    <button onClick={onClose} className="px-6 py-3 text-sm font-bold text-gray-400 hover:bg-gray-50 rounded-2xl transition">Cancel</button>
                    <button
                        onClick={() => { if (reason.trim()) onConfirm(reason); else toast.error('Please provide a rejection reason'); }}
                        className="px-8 py-3 bg-red-600 text-white text-sm font-black rounded-2xl hover:bg-red-700 shadow-xl shadow-red-100 transition active:scale-95"
                    >
                        Confirm Rejection
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   Apply Leave Modal
───────────────────────────────────────────────────────── */
function ApplyLeaveModal({ leaveTypes, onClose, onSuccess }: { leaveTypes: LeaveType[]; onClose: () => void; onSuccess: () => void; }) {
    const [form, setForm] = useState({ leave_type: '', start_date: '', end_date: '', reason: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.leave_type || !form.start_date || !form.end_date || !form.reason) { toast.error('All fields are required'); return; }
        if (form.start_date > form.end_date) { toast.error('End date must be after start date'); return; }
        try {
            setLoading(true);
            await leaveService.createLeaveApplication(form);
            toast.success('Submitted successfully');
            onSuccess();
            onClose();
        } catch { toast.error('Submit failed'); } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="p-8 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
                            <FileText className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Apply for Leave</h2>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Official Request</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:bg-gray-100 p-2 rounded-full transition-colors">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Leave Category</label>
                        <select
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-400 outline-none font-bold"
                            value={form.leave_type}
                            onChange={e => setForm(p => ({ ...p, leave_type: e.target.value }))}
                            required
                        >
                            <option value="">Select type</option>
                            {leaveTypes.map(lt => <option key={lt.id} value={lt.id}>{lt.name} ({lt.days_allowed} days/yr)</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Start Date</label>
                            <input type="date" required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">End Date</label>
                            <input type="date" required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Reason for Absence</label>
                        <textarea rows={3} required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-400 outline-none resize-none font-medium" placeholder="Describe the reason for leave..." value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} />
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-4 text-sm font-bold text-gray-400 hover:bg-gray-50 rounded-2xl transition">Cancel</button>
                        <button type="submit" disabled={loading} className="flex-2 px-10 py-4 bg-indigo-600 text-white text-sm font-black rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition active:scale-95 disabled:opacity-50">
                            {loading ? 'Processing...' : 'Submit Request'}
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
    const terms = useInstitutionTerms();
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
        } catch { toast.error('Failed to load'); } finally { setLoading(false); }
    };

    const handleApprove = async (id: string) => {
        try { await leaveService.approveLeave(id); toast.success('Approved'); fetchData(); }
        catch { toast.error('Failed'); }
    };

    const handleReject = async (reason: string) => {
        if (!rejectTarget) return;
        try { await leaveService.rejectLeave(rejectTarget.id, reason); toast.success('Rejected'); setRejectTarget(null); fetchData(); }
        catch { toast.error('Failed'); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this request?')) return;
        try { await leaveService.deleteLeaveApplication(id); toast.success('Deleted'); fetchData(); }
        catch { toast.error('Failed'); }
    };

    const stats = {
        pending: applications.filter(a => a.status === 'PENDING').length,
        approved: applications.filter(a => a.status === 'APPROVED').length,
        rejected: applications.filter(a => a.status === 'REJECTED').length,
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Pending Approval', count: stats.pending, color: 'bg-amber-50/50 border-amber-100', text: 'text-amber-600', icon: AlertCircle },
                    { label: 'Total Approved', count: stats.approved, color: 'bg-emerald-50/50 border-emerald-100', text: 'text-emerald-600', icon: CheckSquare },
                    { label: 'Total Rejected', count: stats.rejected, color: 'bg-red-50/50 border-red-100', text: 'text-red-600', icon: XSquare },
                ].map(s => (
                    <div key={s.label} className={`${s.color} border-2 rounded-3xl p-6 flex items-center justify-between shadow-sm transition-all hover:scale-[1.02]`}>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{s.label}</p>
                            <p className={`text-4xl font-black ${s.text} leading-none tracking-tighter`}>{s.count}</p>
                        </div>
                        <s.icon className={`w-10 h-10 ${s.text} opacity-20`} />
                    </div>
                ))}
            </div>

            <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="flex bg-gray-100 p-1.5 rounded-2xl gap-1">
                    {['', 'PENDING', 'APPROVED', 'REJECTED'].map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${statusFilter === s
                                ? 'bg-white text-indigo-600 shadow-lg'
                                : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {s || 'All Requests'}
                        </button>
                    ))}
                </div>
                <button onClick={() => setShowApplyModal(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl text-sm font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition active:scale-95">
                    <Plus className="w-5 h-5" /> Request Leave
                </button>
            </div>

            <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-50">
                        <thead className="bg-gray-50/50">
                            <tr>
                                {['Applicant', 'Type', 'Period', 'Reason Summary', 'Status', 'Actions'].map(h => (
                                    <th key={h} className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
                            ) : applications.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-20 text-center text-gray-300">
                                    <ClipboardList className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                    <p className="font-bold text-sm">No applications found in this category.</p>
                                </td></tr>
                            ) : applications.map(app => (
                                <tr key={app.id} className="hover:bg-gray-50/50 transition group">
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-lg shadow-indigo-50">
                                                {app.applicant_name?.charAt(0) ?? '?'}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-900 leading-none mb-1">{app.applicant_name}</div>
                                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{terms.studentLabel}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <span className="text-xs font-bold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg">{app.leave_type_name}</span>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 font-bold">{app.start_date} <span className="text-gray-300 mx-1">→</span> {app.end_date}</div>
                                        <div className="text-[10px] font-black text-indigo-400 mt-1 uppercase tracking-widest">{app.duration} Day(s)</div>
                                    </td>
                                    <td className="px-6 py-5 max-w-xs">
                                        <p className="text-sm text-gray-500 font-medium truncate">{app.reason}</p>
                                        {app.rejection_reason && <p className="text-[10px] font-bold text-red-500 mt-1 italic italic">Rejected: {app.rejection_reason}</p>}
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <LeaveStatusBadge status={app.status} />
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                                            {app.status === 'PENDING' && (
                                                <>
                                                    <button onClick={() => handleApprove(app.id)} title="Approve" className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition"><CheckSquare className="w-5 h-5" /></button>
                                                    <button onClick={() => setRejectTarget(app)} title="Reject" className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition"><XSquare className="w-5 h-5" /></button>
                                                </>
                                            )}
                                            <button onClick={() => handleDelete(app.id)} title="Delete" className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition"><Trash2 className="w-5 h-5" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showApplyModal && <ApplyLeaveModal leaveTypes={leaveTypes} onClose={() => setShowApplyModal(false)} onSuccess={fetchData} />}
            {rejectTarget && <RejectModal leave={rejectTarget} onClose={() => setRejectTarget(null)} onConfirm={handleReject} />}
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   Staff Attendance Tab
 ───────────────────────────────────────────────────────── */
function StaffAttendanceTab() {
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [staffList, setStaffList] = useState<any[]>([]);
    const [attendanceData, setAttendanceData] = useState<Record<string, { status: string; remarks: string }>>({});

    useEffect(() => { loadStaff(); }, []);

    const loadStaff = async () => {
        try {
            setLoading(true);
            const [staffData, existingAttendance] = await Promise.all([
                teacherService.getAll(),
                attendanceService.getTeacherAttendance({ date })
            ]);
            const employees = staffData.results || [];
            setStaffList(employees);
            
            const initialData: Record<string, { status: string; remarks: string }> = {};
            employees.forEach((s: any) => { initialData[s.id] = { status: 'PRESENT', remarks: '' }; });
            (existingAttendance.results || []).forEach((att: any) => {
                initialData[att.teacher] = { status: att.status, remarks: att.remarks };
            });
            setAttendanceData(initialData);
        } catch { toast.error('Failed to load staff'); }
        finally { setLoading(false); }
    };

    const handleStatusChange = (staffId: string, status: string) => {
        setAttendanceData(prev => ({ ...prev, [staffId]: { ...prev[staffId], status } }));
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const payload = {
                date,
                attendance_data: Object.entries(attendanceData).map(([id, data]) => ({ teacher: id, status: data.status, remarks: data.remarks }))
            };
            await attendanceService.bulkSaveTeacherAttendance(payload);
            toast.success('Staff attendance saved');
        } catch { toast.error('Failed to save staff attendance'); }
        finally { setLoading(false); }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end bg-gray-50/50 p-6 rounded-3xl border border-gray-50">
                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Effective Date</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
                        <input type="date" className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold outline-none" value={date} onChange={e => setDate(e.target.value)} />
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={loadStaff} className="bg-white border border-gray-200 text-gray-600 px-8 py-3.5 rounded-2xl hover:bg-gray-50 text-sm font-black transition active:scale-95">
                        REFRESH
                    </button>
                    <button onClick={handleSave} disabled={loading} className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl hover:bg-indigo-700 flex items-center gap-3 text-sm font-black shadow-xl shadow-indigo-100 transition active:scale-95 disabled:opacity-50">
                        <Save className="h-5 w-5" /> SAVE STAFF RECORD
                    </button>
                </div>
            </div>

            <div className="border border-gray-100 rounded-[32px] overflow-hidden bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-50">
                    <thead className="bg-gray-50/50">
                        <tr>
                            <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Employee ID</th>
                            <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Staff Identity</th>
                            <th className="px-8 py-6 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Attendance Status</th>
                            <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Remarks</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan={4} className="py-12 text-center">Loading staff...</td></tr>
                        ) : staffList.length === 0 ? (
                            <tr><td colSpan={4} className="py-12 text-center text-gray-400">No staff members found.</td></tr>
                        ) : staffList.map(staff => (
                            <tr key={staff.id} className="hover:bg-gray-50/50 transition group">
                                <td className="px-8 py-6 whitespace-nowrap">
                                    <span className="text-sm font-black text-indigo-600 uppercase">{staff.employee_id}</span>
                                </td>
                                <td className="px-8 py-6 whitespace-nowrap">
                                    <div className="text-sm font-black text-gray-900 leading-none mb-1">{staff.user.first_name} {staff.user.last_name}</div>
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{staff.designation} | {staff.department}</div>
                                </td>
                                <td className="px-8 py-6 whitespace-nowrap">
                                    <div className="flex justify-center gap-3">
                                        {[
                                            { label: 'P', value: 'PRESENT', color: 'bg-emerald-500 text-white shadow-emerald-200' },
                                            { label: 'A', value: 'ABSENT', color: 'bg-red-500 text-white shadow-red-200' },
                                            { label: 'L', value: 'LATE', color: 'bg-amber-500 text-white shadow-amber-200' },
                                            { label: 'LV', value: 'ON_LEAVE', color: 'bg-indigo-500 text-white shadow-indigo-200' },
                                        ].map(opt => (
                                            <button key={opt.value}
                                                onClick={() => handleStatusChange(staff.id, opt.value)}
                                                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${attendanceData[staff.id]?.status === opt.value
                                                    ? `${opt.color} shadow-lg scale-110 -translate-y-1`
                                                    : 'bg-gray-50 text-gray-300 hover:bg-gray-100 hover:text-gray-400'}`}
                                            >
                                                <span className="text-sm font-black">{opt.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <input type="text" className="w-full px-4 py-2 text-xs font-bold border-gray-100 border-2 rounded-xl focus:border-indigo-200 outline-none transition-all" placeholder="Note..." value={attendanceData[staff.id]?.remarks || ''} onChange={e => setAttendanceData(prev => ({ ...prev, [staff.id]: { ...prev[staff.id], remarks: e.target.value } }))} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}


/* ─────────────────────────────────────────────────────────
   Main Attendance Page
───────────────────────────────────────────────────────── */
export default function Attendance() {
    const terms = useInstitutionTerms();
    const [activeTab, setActiveTab] = useState<'take' | 'staff' | 'report' | 'leave'>('take');

    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSection, setSelectedSection] = useState('');

    const [classes, setClasses] = useState<Class[]>([]);
    const [sections, setSections] = useState<Section[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [attendanceData, setAttendanceData] = useState<Record<string, { status: string; remarks: string }>>({});

    // Report states
    const [reportYear, setReportYear] = useState(new Date().getFullYear());
    const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
    const [monthlyReportData, setMonthlyReportData] = useState<any>(null);

    useEffect(() => { fetchInitialData(); }, []);

    const loadMonthlyReport = async () => {
        if (!selectedClass) { toast.error(`Please select a ${terms.classLabel.toLowerCase()}`); return; }
        try {
            setLoading(true);
            const data = await attendanceService.getMonthlyReport(reportYear, reportMonth, selectedClass);
            setMonthlyReportData(data);
        } catch { toast.error('Failed to load monthly report'); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        if (selectedClass) fetchSections(selectedClass);
        else { setSections([]); setSelectedSection(''); }
    }, [selectedClass]);

    const fetchInitialData = async () => {
        try {
            const classesData = await classService.getClasses();
            setClasses(classesData.results || []);
        } catch { toast.error(`Failed to load ${terms.classesLabel.toLowerCase()}`); }
    };

    const fetchSections = async (classId: string) => {
        try {
            const sectionsData = await classService.getSections({ class_group: classId });
            setSections(sectionsData.results || []);
        } catch { toast.error(`Failed to load ${terms.sectionsLabel.toLowerCase()}`); }
    };

    const loadStudents = async () => {
        if (!selectedClass || !selectedSection) { toast.error(`Please select both ${terms.classLabel.toLowerCase()} and ${terms.sectionLabel.toLowerCase()}`); return; }
        try {
            setLoading(true);
            const [studentsData, existingAttendance] = await Promise.all([
                studentService.getStudents({ current_class: selectedClass, section: selectedSection }),
                attendanceService.getStudentAttendance({ date, student__current_class: selectedClass, student__section: selectedSection })
            ]);
            const studentList = (studentsData.results || []) as Student[];
            setStudents(studentList);
            const initialData: Record<string, { status: string; remarks: string }> = {};
            studentList.forEach((s: Student) => { initialData[s.id] = { status: 'PRESENT', remarks: '' }; });
            (existingAttendance.results || []).forEach((att: any) => {
                initialData[att.student] = { status: att.status, remarks: att.remarks };
            });
            setAttendanceData(initialData);
        } catch { toast.error(`Failed to load ${terms.studentsLabel.toLowerCase()}`); }
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
            toast.success('Record updated successfully');
        } catch { toast.error('Check failed'); }
        finally { setLoading(false); }
    };

    const tabs = [
        { id: 'take', label: `${terms.studentsLabel} Attendance`, icon: Users },
        { id: 'staff', label: 'Staff Attendance', icon: Briefcase },
        { id: 'report', label: 'Analysis', icon: Calendar },
        { id: 'leave', label: 'Leave Center', icon: ClipboardList },
    ] as const;


    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Attendance System</h1>
                    <p className="text-sm font-bold text-gray-400 mt-1">Track presence and manage enrollment status officially.</p>
                </div>
                <div className="flex bg-gray-100/80 p-1.5 rounded-2xl gap-1 shadow-inner">
                    {tabs.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-2 transition-all ${activeTab === t.id
                                ? 'bg-white text-indigo-600 shadow-xl'
                                : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <t.icon className="h-4 w-4" />
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white shadow-2xl shadow-indigo-100/20 border border-gray-100 rounded-[32px] overflow-hidden p-2">
                <div className="p-8">
                {activeTab === 'leave' ? (
                    <LeaveManagement />
                ) : activeTab === 'staff' ? (
                    <StaffAttendanceTab />
                ) : (

                    <div className="space-y-10">
                        {/* Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end bg-gray-50/50 p-6 rounded-3xl border border-gray-50">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Effective Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
                                    <input type="date" className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold outline-none ring-offset-2 focus:ring-2 focus:ring-indigo-100 transition-all" value={date} onChange={e => setDate(e.target.value)} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{terms.classLabel}</label>
                                <select className="w-full px-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold outline-none" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
                                    <option value="">Select {terms.classLabel}</option>
                                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{terms.sectionLabel}</label>
                                <select className="w-full px-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold outline-none disabled:opacity-30" value={selectedSection} onChange={e => setSelectedSection(e.target.value)} disabled={!selectedClass}>
                                    <option value="">Select {terms.sectionLabel}</option>
                                    {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <button onClick={loadStudents} className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl hover:bg-indigo-700 flex items-center justify-center gap-3 text-sm font-black shadow-xl shadow-indigo-100 transition active:scale-95">
                                <Search className="h-5 w-5" /> LOAD {terms.studentsLabel.toUpperCase()}
                            </button>
                        </div>

                        {/* Attendance Grid */}
                        {activeTab === 'take' && students.length > 0 && (
                            <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
                                <div className="flex flex-wrap justify-between items-center gap-4 bg-indigo-600 rounded-3xl p-6 shadow-2xl shadow-indigo-200">
                                    <div className="flex gap-8">
                                        <div className="text-white">
                                            <p className="text-[10px] font-black uppercase opacity-60 mb-1">Total Count</p>
                                            <p className="text-3xl font-black">{students.length}</p>
                                        </div>
                                        <div className="text-white">
                                            <p className="text-[10px] font-black uppercase opacity-60 mb-1">Present</p>
                                            <p className="text-3xl font-black">{Object.values(attendanceData).filter(a => a.status === 'PRESENT').length}</p>
                                        </div>
                                        <div className="text-white/40">
                                            <p className="text-[10px] font-black uppercase mb-1">Absent</p>
                                            <p className="text-3xl font-black text-white">{Object.values(attendanceData).filter(a => a.status === 'ABSENT').length}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <button onClick={() => markAllStatus('PRESENT')} className="px-6 py-3 bg-indigo-500/20 text-white border border-white/10 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-white/10 transition">
                                            Mark All Present
                                        </button>
                                        <button onClick={handleSave} disabled={loading} className="bg-white text-indigo-600 px-8 py-3.5 rounded-2xl hover:bg-indigo-50 flex items-center gap-3 text-sm font-black shadow-xl transition active:scale-95 disabled:opacity-50">
                                            <Save className="h-5 w-5" /> SAVE RECORD
                                        </button>
                                    </div>
                                </div>

                                <div className="border border-gray-100 rounded-[32px] overflow-hidden bg-white shadow-sm">
                                    <table className="min-w-full divide-y divide-gray-50">
                                        <thead className="bg-gray-50/50">
                                            <tr>
                                                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Roll / Reg</th>
                                                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{terms.studentLabel} Identity</th>
                                                <th className="px-8 py-6 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Attendance Status</th>
                                                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Internal Remarks</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {students.map(student => (
                                                <tr key={student.id} className="hover:bg-gray-50/50 transition group">
                                                    <td className="px-8 py-6 whitespace-nowrap">
                                                        <span className="text-sm font-black text-gray-400 group-hover:text-indigo-600 transition-colors uppercase">{student.roll_number || 'TBD'}</span>
                                                    </td>
                                                    <td className="px-8 py-6 whitespace-nowrap">
                                                        <div className="text-sm font-black text-gray-900 leading-none mb-1">{student.first_name} {student.last_name}</div>
                                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{student.admission_number}</div>
                                                    </td>
                                                    <td className="px-8 py-6 whitespace-nowrap">
                                                        <div className="flex justify-center gap-3">
                                                            {[
                                                                { label: 'P', value: 'PRESENT', color: 'bg-emerald-500 text-white shadow-emerald-200' },
                                                                { label: 'A', value: 'ABSENT', color: 'bg-red-500 text-white shadow-red-200' },
                                                                { label: 'L', value: 'LATE', color: 'bg-amber-500 text-white shadow-amber-200' },
                                                                { label: 'H', value: 'HALF_DAY', color: 'bg-indigo-500 text-white shadow-indigo-200' },
                                                            ].map(opt => (
                                                                <button key={opt.value}
                                                                    onClick={() => handleStatusChange(student.id, opt.value)}
                                                                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${attendanceData[student.id]?.status === opt.value
                                                                        ? `${opt.color} shadow-lg scale-110 -translate-y-1`
                                                                        : 'bg-gray-50 text-gray-300 hover:bg-gray-100 hover:text-gray-400'}`}
                                                                >
                                                                    <span className="text-sm font-black">{opt.label}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <input type="text" className="w-full px-4 py-2 text-xs font-bold border-gray-100 border-2 rounded-xl focus:border-indigo-200 outline-none transition-all placeholder:font-medium" placeholder="Note for record..." value={attendanceData[student.id]?.remarks || ''} onChange={e => setAttendanceData(prev => ({ ...prev, [student.id]: { ...prev[student.id], remarks: e.target.value } }))} />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'take' && students.length === 0 && !loading && (
                            <div className="py-24 text-center animate-in fade-in duration-700">
                                <div className="w-24 h-24 bg-gray-50 rounded-[40px] flex items-center justify-center mx-auto mb-6 transform rotate-12">
                                    <UserCheck className="h-10 w-10 text-gray-200" />
                                </div>
                                <h4 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Records Awaiting Selection</h4>
                                <p className="text-gray-400 max-w-sm mx-auto font-medium">Please filter by {terms.classLabel.toLowerCase()} and {terms.sectionLabel.toLowerCase()} to begin the daily attendance process.</p>
                            </div>
                        )}

                        {activeTab === 'report' && (
                            <div className="space-y-8 animate-in fade-in duration-700">
                                <div className="flex flex-wrap gap-4 items-end bg-gray-50/50 p-6 rounded-3xl border border-gray-50">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Year</label>
                                        <select 
                                            className="w-full px-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold outline-none"
                                            value={reportYear}
                                            onChange={e => setReportYear(parseInt(e.target.value))}
                                        >
                                            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Month</label>
                                        <select 
                                            className="w-full px-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold outline-none"
                                            value={reportMonth}
                                            onChange={e => setReportMonth(parseInt(e.target.value))}
                                        >
                                            {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                                                <option key={m} value={m}>{new Date(0, m-1).toLocaleString('default', {month: 'long'})}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <button 
                                        onClick={loadMonthlyReport}
                                        className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl hover:bg-indigo-700 flex items-center justify-center gap-3 text-sm font-black shadow-xl shadow-indigo-100 transition active:scale-95"
                                    >
                                        <ClipboardList className="h-5 w-5" /> GENERATE REPORT
                                    </button>
                                </div>

                                {monthlyReportData ? (
                                    <div className="border border-gray-100 rounded-[32px] overflow-hidden bg-white shadow-sm overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-50">
                                            <thead className="bg-gray-50/50">
                                                <tr>
                                                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase sticky left-0 bg-gray-50 z-10">Student</th>
                                                    {Array.from({length: monthlyReportData.num_days}, (_, i) => i + 1).map(d => (
                                                        <th key={d} className="px-2 py-4 text-center text-[10px] font-black text-gray-400">{d}</th>
                                                    ))}
                                                    <th className="px-4 py-4 text-center text-[10px] font-black text-gray-400 uppercase">P</th>
                                                    <th className="px-4 py-4 text-center text-[10px] font-black text-gray-400 uppercase">A</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {monthlyReportData.report.map((row: any) => (
                                                    <tr key={row.student_id} className="hover:bg-gray-50/50 transition">
                                                        <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-white z-10 border-r border-gray-50">
                                                            <div className="text-sm font-bold text-gray-900">{row.name}</div>
                                                            <div className="text-[9px] font-black text-gray-400 uppercase">{row.roll_number || 'No Roll'}</div>
                                                        </td>
                                                        {Array.from({length: monthlyReportData.num_days}, (_, i) => i + 1).map(d => {
                                                            const status = row.days[d];
                                                            const colorMap: any = {
                                                                PRESENT: 'bg-emerald-500',
                                                                ABSENT: 'bg-red-500',
                                                                LATE: 'bg-amber-500',
                                                                HALF_DAY: 'bg-indigo-500',
                                                                EXCUSED: 'bg-blue-400'
                                                            };
                                                            return (
                                                                <td key={d} className="px-0.5 py-4 text-center">
                                                                    {status ? (
                                                                        <div className={`w-5 h-5 rounded-md mx-auto ${colorMap[status]} flex items-center justify-center text-[8px] font-black text-white`}>
                                                                            {status[0]}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="w-5 h-5 rounded-md mx-auto bg-gray-50 border border-gray-100"></div>
                                                                    )}
                                                                </td>
                                                            );
                                                        })}
                                                        <td className="px-4 py-4 text-center text-sm font-black text-emerald-600">{row.summary.PRESENT}</td>
                                                        <td className="px-4 py-4 text-center text-sm font-black text-red-600">{row.summary.ABSENT}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="py-24 text-center">
                                        <Calendar className="h-20 w-20 text-gray-100 mx-auto mb-6" />
                                        <h4 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Select month & {terms.classLabel.toLowerCase()}</h4>
                                        <p className="text-gray-400 font-medium max-w-sm mx-auto">Generate a complete presence matrix for historical analysis.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
                </div>
            </div>
        </div>
    );
}
