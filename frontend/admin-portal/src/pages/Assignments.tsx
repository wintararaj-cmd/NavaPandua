import React, { useState, useEffect } from 'react';
import {
    Plus, Search, ClipboardList, CheckCircle, Clock, BookOpen,
    Users, Award, Trash2, Eye, Star, X, ChevronDown, ChevronUp,
    Upload, FileText, AlertCircle, User
} from 'lucide-react';
import {
    assignmentService,
    type Assignment,
    type AssignmentSubmission,
} from '../services/assignmentService';
import { classService, type Class, type Section } from '../services/classService';
import { subjectService, type Subject } from '../services/subjectService';
import toast from 'react-hot-toast';

/* ─────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────── */
function formatDate(dt: string) {
    if (!dt) return '—';
    return new Date(dt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function isDueSoon(due: string) {
    const diff = (new Date(due).getTime() - Date.now()) / 86400000;
    return diff >= 0 && diff <= 3;
}

function isOverdue(due: string) {
    return new Date(due) < new Date();
}

function DueBadge({ due }: { due: string }) {
    if (isOverdue(due)) return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-semibold">Overdue</span>;
    if (isDueSoon(due)) return <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-semibold">Due Soon</span>;
    return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full font-semibold">On Track</span>;
}

/* ─────────────────────────────────────────────────────────
   Create Assignment Modal
───────────────────────────────────────────────────────── */
function CreateAssignmentModal({
    classes,
    subjects,
    onClose,
    onSuccess,
}: {
    classes: Class[];
    subjects: Subject[];
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [form, setForm] = useState({
        target_class: '',
        section: '',
        subject: '',
        title: '',
        description: '',
        due_date: '',
        max_marks: 100,
    });
    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        if (form.target_class) {
            classService.getSections({ class_id: form.target_class }).then(d => setSections(d.results || []));
        } else { setSections([]); }
    }, [form.target_class]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.target_class || !form.subject || !form.title || !form.due_date) {
            toast.error('Please fill all required fields'); return;
        }
        try {
            setLoading(true);
            const payload: any = { ...form };
            if (file) payload.attachment = file;
            await assignmentService.createAssignment(payload);
            toast.success('Assignment created successfully');
            onSuccess();
            onClose();
        } catch (err: any) {
            const msg = err?.response?.data?.detail || 'Failed to create assignment';
            toast.error(msg);
        } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                            <ClipboardList className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Create Assignment</h2>
                            <p className="text-xs text-gray-500">Post a new assignment for students</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Class <span className="text-red-500">*</span></label>
                            <select required className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                                value={form.target_class} onChange={e => setForm(p => ({ ...p, target_class: e.target.value, section: '' }))}>
                                <option value="">Select Class</option>
                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Section</label>
                            <select className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                                value={form.section} onChange={e => setForm(p => ({ ...p, section: e.target.value }))} disabled={!form.target_class}>
                                <option value="">All Sections</option>
                                {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Subject <span className="text-red-500">*</span></label>
                        <select required className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                            value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}>
                            <option value="">Select Subject</option>
                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Assignment Title <span className="text-red-500">*</span></label>
                        <input required type="text"
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                            placeholder="e.g. Chapter 5 Exercise Problems"
                            value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Description / Instructions</label>
                        <textarea rows={4}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none resize-none"
                            placeholder="Describe what students need to do..."
                            value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Due Date & Time <span className="text-red-500">*</span></label>
                            <input required type="datetime-local"
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                                value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Max Marks</label>
                            <input type="number" min="1"
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                                value={form.max_marks} onChange={e => setForm(p => ({ ...p, max_marks: Number(e.target.value) }))} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Attachment (Optional)</label>
                        <label className="flex items-center gap-3 w-full px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition">
                            <Upload className="w-5 h-5 text-gray-400" />
                            <span className="text-sm text-gray-500">{file ? file.name : 'Click to upload file (PDF, DOC, etc.)'}</span>
                            <input type="file" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
                        </label>
                    </div>
                </form>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition font-medium">Cancel</button>
                    <button
                        onClick={handleSubmit as any}
                        disabled={loading}
                        className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 shadow-sm transition disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? <><Clock className="w-4 h-4 animate-spin" /> Creating...</> : <><Plus className="w-4 h-4" /> Create Assignment</>}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   Grade Submission Modal
───────────────────────────────────────────────────────── */
function GradeModal({
    submission,
    maxMarks,
    onClose,
    onSuccess,
}: {
    submission: AssignmentSubmission;
    maxMarks: number;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [marks, setMarks] = useState<string>(submission.marks_obtained?.toString() ?? '');
    const [feedback, setFeedback] = useState(submission.teacher_feedback ?? '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const m = parseFloat(marks);
        if (isNaN(m) || m < 0 || m > maxMarks) { toast.error(`Marks must be between 0 and ${maxMarks}`); return; }
        try {
            setLoading(true);
            await assignmentService.gradeSubmission(submission.id, { marks_obtained: m, teacher_feedback: feedback });
            toast.success('Submission graded!');
            onSuccess();
            onClose();
        } catch { toast.error('Failed to grade submission'); }
        finally { setLoading(false); }
    };

    const percent = marks ? Math.round((parseFloat(marks) / maxMarks) * 100) : 0;
    const grade = percent >= 90 ? 'A+' : percent >= 80 ? 'A' : percent >= 70 ? 'B' : percent >= 60 ? 'C' : percent >= 50 ? 'D' : 'F';

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-gray-900">Grade Submission</h3>
                        <p className="text-sm text-gray-500">Student: {submission.student_name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"><X className="w-4 h-4" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* File link */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-blue-800">Submitted File</p>
                            <a href={submission.submitted_file} target="_blank" rel="noreferrer"
                                className="text-xs text-blue-600 underline truncate block">
                                {submission.submitted_file?.split('/').pop() || 'View Submission'}
                            </a>
                        </div>
                    </div>

                    {submission.remarks && (
                        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                            <span className="font-semibold">Student note:</span> {submission.remarks}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Marks Obtained <span className="text-gray-400 font-normal">/ {maxMarks}</span>
                        </label>
                        <div className="relative">
                            <input type="number" min="0" max={maxMarks} step="0.5" required
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none pr-20"
                                value={marks} onChange={e => setMarks(e.target.value)} />
                            {marks && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                                    <span className={`text-sm font-black ${percent >= 50 ? 'text-emerald-600' : 'text-red-500'}`}>{percent}%</span>
                                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${percent >= 50 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{grade}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Feedback to Student</label>
                        <textarea rows={3}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none resize-none"
                            placeholder="Comments, suggestions, corrections..."
                            value={feedback} onChange={e => setFeedback(e.target.value)} />
                    </div>

                    <div className="flex gap-3 justify-end pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
                        <button type="submit" disabled={loading}
                            className="px-5 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2">
                            <Award className="w-4 h-4" />
                            {loading ? 'Saving...' : 'Save Grade'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   Submissions Panel (expandable)
───────────────────────────────────────────────────────── */
function SubmissionsPanel({ assignment }: { assignment: Assignment }) {
    const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [gradeTarget, setGradeTarget] = useState<AssignmentSubmission | null>(null);

    const load = async () => {
        setLoading(true);
        try {
            const data = await assignmentService.getSubmissionsByAssignment(assignment.id);
            setSubmissions(data.results ?? data);
        } catch { toast.error('Failed to load submissions'); }
        finally { setLoading(false); }
    };

    const toggle = () => {
        if (!open) load();
        setOpen(o => !o);
    };

    const gradedCount = submissions.filter(s => s.graded_at).length;

    return (
        <>
            <button
                onClick={toggle}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-indigo-50 rounded-xl border border-gray-100 hover:border-indigo-200 transition-all text-sm font-semibold text-gray-700"
            >
                <span className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-500" />
                    Submissions {submissions.length > 0 && `(${gradedCount}/${submissions.length} graded)`}
                </span>
                {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {open && (
                <div className="mt-2 border border-gray-100 rounded-xl overflow-hidden">
                    {loading ? (
                        <div className="py-8 text-center text-sm text-gray-400">Loading submissions...</div>
                    ) : submissions.length === 0 ? (
                        <div className="py-8 text-center">
                            <AlertCircle className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                            <p className="text-sm text-gray-400">No submissions yet</p>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                                <tr>
                                    <th className="px-4 py-3 text-left">Student</th>
                                    <th className="px-4 py-3 text-left">Submitted</th>
                                    <th className="px-4 py-3 text-left">File</th>
                                    <th className="px-4 py-3 text-left">Marks</th>
                                    <th className="px-4 py-3 text-left">Status</th>
                                    <th className="px-4 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-50">
                                {submissions.map(sub => (
                                    <tr key={sub.id} className="hover:bg-gray-50 transition">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 text-xs font-bold">
                                                    {sub.student_name?.charAt(0)}
                                                </div>
                                                <span className="text-sm font-medium text-gray-900">{sub.student_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-500">{formatDate(sub.created_at)}</td>
                                        <td className="px-4 py-3">
                                            <a href={sub.submitted_file} target="_blank" rel="noreferrer"
                                                className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
                                                <FileText className="w-3 h-3" /> View
                                            </a>
                                        </td>
                                        <td className="px-4 py-3">
                                            {sub.marks_obtained != null ? (
                                                <span className="text-sm font-bold text-gray-900">
                                                    {sub.marks_obtained}/{assignment.max_marks}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {sub.graded_at ? (
                                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full font-semibold">Graded</span>
                                            ) : (
                                                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-semibold">Pending</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => setGradeTarget(sub)}
                                                className="text-xs font-semibold text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-lg transition flex items-center gap-1 ml-auto"
                                            >
                                                <Star className="w-3 h-3" />
                                                {sub.graded_at ? 'Update' : 'Grade'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {gradeTarget && (
                <GradeModal
                    submission={gradeTarget}
                    maxMarks={assignment.max_marks}
                    onClose={() => setGradeTarget(null)}
                    onSuccess={load}
                />
            )}
        </>
    );
}

/* ─────────────────────────────────────────────────────────
   Assignment Card
───────────────────────────────────────────────────────── */
function AssignmentCard({
    assignment,
    onDelete,
}: {
    assignment: Assignment;
    onDelete: () => void;
}) {
    const [showPanel, setShowPanel] = useState(false);

    return (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all group flex flex-col">
            {/* Color accent top bar */}
            <div className="h-1 rounded-t-2xl bg-gradient-to-r from-indigo-500 to-purple-500" />
            <div className="p-5 flex-1 space-y-3">
                {/* Header row */}
                <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-base leading-tight truncate">{assignment.title}</h3>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <span className="text-xs text-gray-500">{assignment.subject_name}</span>
                            <span className="text-gray-300">•</span>
                            <span className="text-xs text-gray-500">{assignment.class_name}</span>
                            {assignment.teacher_name && (
                                <>
                                    <span className="text-gray-300">•</span>
                                    <span className="text-xs text-gray-400 flex items-center gap-0.5"><User className="w-3 h-3" />{assignment.teacher_name}</span>
                                </>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => { if (confirm('Delete this assignment?')) onDelete(); }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

                {/* Description */}
                {assignment.description && (
                    <p className="text-sm text-gray-500 line-clamp-2">{assignment.description}</p>
                )}

                {/* Meta pills */}
                <div className="flex items-center gap-2 flex-wrap">
                    <DueBadge due={assignment.due_date} />
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Due {formatDate(assignment.due_date)}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        {assignment.max_marks} marks
                    </span>
                </div>
            </div>

            {/* Submissions toggle */}
            <div className="px-5 pb-5">
                <SubmissionsPanel assignment={assignment} />
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   Main Page
───────────────────────────────────────────────────────── */
export default function Assignments() {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    // Filters
    const [search, setSearch] = useState('');
    const [filterClass, setFilterClass] = useState('');
    const [filterSubject, setFilterSubject] = useState('');

    useEffect(() => {
        fetchAll();
    }, [filterClass, filterSubject]);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (filterClass) params.target_class = filterClass;
            if (filterSubject) params.subject = filterSubject;

            const [aData, cData, sData] = await Promise.all([
                assignmentService.getAssignments(params),
                classService.getClasses(),
                subjectService.getAll(),
            ]);
            setAssignments(aData.results ?? aData);
            setClasses(cData.results ?? []);
            setSubjects(sData.results ?? []);
        } catch {
            toast.error('Failed to load assignments');
        } finally { setLoading(false); }
    };

    const handleDelete = async (id: string) => {
        try {
            await assignmentService.deleteAssignment(id);
            toast.success('Assignment deleted');
            fetchAll();
        } catch { toast.error('Failed to delete assignment'); }
    };

    const filtered = assignments.filter(a =>
        !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.subject_name?.toLowerCase().includes(search.toLowerCase())
    );

    // Stats
    const total = assignments.length;
    const overdue = assignments.filter(a => isOverdue(a.due_date)).length;
    const dueSoon = assignments.filter(a => isDueSoon(a.due_date)).length;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Create assignments, view submissions and grade students</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all"
                >
                    <Plus className="w-4 h-4" /> New Assignment
                </button>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Total', value: total, color: 'from-indigo-50 to-blue-50 border-indigo-100', text: 'text-indigo-700', icon: ClipboardList },
                    { label: 'Due Soon', value: dueSoon, color: 'from-amber-50 to-orange-50 border-amber-100', text: 'text-amber-700', icon: Clock },
                    { label: 'Overdue', value: overdue, color: 'from-red-50 to-pink-50 border-red-100', text: 'text-red-700', icon: AlertCircle },
                ].map(s => (
                    <div key={s.label} className={`bg-gradient-to-br ${s.color} border rounded-2xl p-5 flex items-center gap-4`}>
                        <s.icon className={`w-9 h-9 ${s.text}`} />
                        <div>
                            <p className="text-3xl font-black text-gray-900">{s.value}</p>
                            <p className={`text-xs font-semibold ${s.text}`}>{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-3 items-center">
                <div className="flex-1 min-w-48 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by title or subject..."
                        className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
                        value={search} onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <select
                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
                    value={filterClass} onChange={e => setFilterClass(e.target.value)}>
                    <option value="">All Classes</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select
                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
                    value={filterSubject} onChange={e => setFilterSubject(e.target.value)}>
                    <option value="">All Subjects</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                {(search || filterClass || filterSubject) && (
                    <button onClick={() => { setSearch(''); setFilterClass(''); setFilterSubject(''); }}
                        className="text-sm text-gray-500 hover:text-indigo-600 flex items-center gap-1 transition">
                        <X className="w-4 h-4" /> Clear
                    </button>
                )}
            </div>

            {/* Assignment Cards */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-56 bg-gray-100 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="py-24 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                    <ClipboardList className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-1">No Assignments Found</h3>
                    <p className="text-gray-400 mb-6">
                        {search || filterClass || filterSubject ? 'Try adjusting your filters.' : 'Create your first assignment to get started.'}
                    </p>
                    {!search && !filterClass && !filterSubject && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition shadow-sm"
                        >
                            <Plus className="w-4 h-4 inline mr-1" /> Create Assignment
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filtered.map(a => (
                        <AssignmentCard
                            key={a.id}
                            assignment={a}
                            onDelete={() => handleDelete(a.id)}
                        />
                    ))}
                </div>
            )}

            {showModal && (
                <CreateAssignmentModal
                    classes={classes}
                    subjects={subjects}
                    onClose={() => setShowModal(false)}
                    onSuccess={fetchAll}
                />
            )}
        </div>
    );
}
