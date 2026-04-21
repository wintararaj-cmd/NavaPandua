import { useState, useEffect } from 'react';
import { 
    Video, Plus, Calendar, Clock, Link as LinkIcon, Users, 
    BookOpen, Trash2, X, Monitor, MessageSquare, Shield,
    ExternalLink, MapPin, Search, Filter, ArrowUpRight
} from 'lucide-react';
import { liveClassService } from '../services/academicServices';
import { classService } from '../services/classService';
import { subjectService } from '../services/subjectService';
import toast from 'react-hot-toast';

/* ─────────────────────────────────────────────────────────
   Live Class Modal
───────────────────────────────────────────────────────── */
function LiveClassModal({ isOpen, onClose, onSuccess, liveClass }: any) {
    const [classes, setClasses] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    
    const [form, setForm] = useState({
        title: '', description: '', platform: 'ZOOM', meeting_url: '',
        target_class: '', section: '', subject: '', scheduled_at: '', duration_minutes: 60
    });

    useEffect(() => {
        if (isOpen) {
            classService.getClasses().then(res => setClasses(res.results || []));
            subjectService.getAll().then(res => setSubjects(res.results || []));
        }
        if (liveClass) {
            setForm({
                ...liveClass,
                scheduled_at: liveClass.scheduled_at?.substring(0, 16) || ''
            });
        } else {
            setForm({
                title: '', description: '', platform: 'ZOOM', meeting_url: '',
                target_class: '', section: '', subject: '', 
                scheduled_at: new Date().toISOString().substring(0, 16), 
                duration_minutes: 60
            });
        }
    }, [isOpen, liveClass]);

    useEffect(() => {
        if (form.target_class) {
            classService.getSections({ class_id: form.target_class }).then(res => setSections(res.results || []));
        }
    }, [form.target_class]);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            if (liveClass) await liveClassService.updateLiveClass(liveClass.id, form);
            else await liveClassService.createLiveClass(form);
            toast.success(liveClass ? 'Class updated' : 'Class scheduled');
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err?.response?.data?.detail || 'Failed to save class');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h3 className="text-xl font-bold text-gray-900">{liveClass ? 'Edit Live Class' : 'Schedule Live Class'}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition"><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Class Title</label>
                            <input required type="text" className="w-full mt-1 px-3 py-2 border rounded-lg" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Platform</label>
                            <select className="w-full mt-1 px-3 py-2 border rounded-lg" value={form.platform} onChange={e => setForm({...form, platform: e.target.value})}>
                                <option value="ZOOM">Zoom</option>
                                <option value="GOOGLE_MEET">Google Meet</option>
                                <option value="MICROSOFT_TEAMS">Microsoft Teams</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Meeting URL</label>
                            <input required type="url" className="w-full mt-1 px-3 py-2 border rounded-lg" value={form.meeting_url} onChange={e => setForm({...form, meeting_url: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Class / Course</label>
                            <select required className="w-full mt-1 px-3 py-2 border rounded-lg" value={form.target_class} onChange={e => setForm({...form, target_class: e.target.value, section: ''})}>
                                <option value="">Select...</option>
                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Section</label>
                            <select className="w-full mt-1 px-3 py-2 border rounded-lg" value={form.section} onChange={e => setForm({...form, section: e.target.value})} disabled={!form.target_class}>
                                <option value="">All Sections</option>
                                {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Subject</label>
                            <select required className="w-full mt-1 px-3 py-2 border rounded-lg" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})}>
                                <option value="">Select...</option>
                                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Duration (Mins)</label>
                            <input required type="number" className="w-full mt-1 px-3 py-2 border rounded-lg" value={form.duration_minutes} onChange={e => setForm({...form, duration_minutes: parseInt(e.target.value)})} />
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Scheduled At</label>
                            <input required type="datetime-local" className="w-full mt-1 px-3 py-2 border rounded-lg" value={form.scheduled_at} onChange={e => setForm({...form, scheduled_at: e.target.value})} />
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                            <textarea rows={3} className="w-full mt-1 px-3 py-2 border rounded-lg resize-none" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                        </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg font-bold transition">Cancel</button>
                        <button className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition">
                            {liveClass ? 'Update Class' : 'Schedule Class'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   Main Live Classes Page
───────────────────────────────────────────────────────── */
export default function LiveClasses() {
    const [liveClasses, setLiveClasses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState<any>(null);

    useEffect(() => {
        fetchLiveClasses();
    }, []);

    const fetchLiveClasses = async () => {
        try {
            setLoading(true);
            const response = await liveClassService.getLiveClasses();
            setLiveClasses(response.results || response);
        } catch (error) {
            toast.error('Failed to load live classes');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete this scheduled class?')) {
            try {
                await liveClassService.deleteLiveClass(id);
                toast.success('Deleted');
                fetchLiveClasses();
            } catch { toast.error('Failed to delete'); }
        }
    };

    const getStatus = (scheduledAt: string, duration: number) => {
        const start = new Date(scheduledAt).getTime();
        const now = new Date().getTime();
        const end = start + (duration * 60 * 1000);
        
        if (now < start) return { label: 'Upcoming', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' };
        if (now >= start && now <= end) return { label: 'Ongoing', color: 'bg-emerald-100 text-emerald-700 border-emerald-200 animate-pulse' };
        return { label: 'Past', color: 'bg-gray-100 text-gray-600 border-gray-200' };
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Live Classes</h1>
                    <p className="text-gray-600 mt-1">Virtual classroom session management</p>
                </div>
                <button 
                    onClick={() => { setSelectedClass(null); setIsModalOpen(true); }}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-md transition"
                >
                    <Plus className="w-4 h-4" />
                    Schedule Class
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {liveClasses.map((session) => {
                    const status = getStatus(session.scheduled_at, session.duration_minutes);
                    return (
                        <div key={session.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition-all group overflow-hidden flex flex-col">
                            <div className="p-5 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${status.color}`}>
                                        {status.label}
                                    </span>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => { setSelectedClass(session); setIsModalOpen(true); }} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"><ArrowUpRight className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete(session.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 mb-4">
                                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                                        <Monitor className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-lg font-bold text-gray-900 truncate">{session.title}</h3>
                                        <p className="text-xs text-indigo-600 font-bold">{session.platform}</p>
                                    </div>
                                </div>
                                
                                <p className="text-sm text-gray-500 mb-6 line-clamp-2 min-h-[40px] italic">
                                    "{session.description || 'No description provided.'}"
                                </p>

                                <div className="space-y-3 pb-4">
                                    <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span className="font-medium">{new Date(session.scheduled_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <span className="font-medium">
                                            {new Date(session.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            <span className="text-gray-400 font-normal ml-2">({session.duration_minutes} mins)</span>
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                                        <BookOpen className="w-4 h-4 text-gray-400" />
                                        <span className="font-medium truncate">{session.subject_name} • {session.class_name}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="px-5 pb-5 mt-auto">
                                <a
                                    href={session.meeting_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-indigo-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold shadow-sm hover:bg-indigo-700 transition"
                                >
                                    <LinkIcon className="w-4 h-4" />
                                    Join Meeting
                                </a>
                            </div>
                        </div>
                    );
                })}

                {liveClasses.length === 0 && !loading && (
                    <div className="col-span-full py-24 bg-white rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
                        <Video className="w-16 h-16 mb-4 opacity-10" />
                        <h3 className="text-xl font-bold text-gray-900 mb-1">No sessions scheduled</h3>
                        <p className="text-sm">Click 'Schedule Class' to add your first virtual session.</p>
                    </div>
                )}
            </div>

            <LiveClassModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchLiveClasses} liveClass={selectedClass} />
        </div>
    );
}

