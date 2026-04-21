import React, { useState, useEffect } from 'react';
import { 
    Plus, Search, Bell, Send, Trash2, Edit2, Filter, 
    Calendar, Users, Info, ChevronRight, Speaker, Megaphone
} from 'lucide-react';
import { notificationService, type Announcement, type AnnouncementFormData } from '../services/notificationService';
import AnnouncementModal from '../components/notifications/AnnouncementModal';
import toast from 'react-hot-toast';

export default function Notifications() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | undefined>(undefined);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const data = await notificationService.getAnnouncements({ search: searchQuery });
            setAnnouncements(data.results || []);
        } catch (error) {
            toast.error('Failed to fetch announcements');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedAnnouncement(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (announcement: Announcement) => {
        setSelectedAnnouncement(announcement);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this announcement?')) {
            try {
                await notificationService.deleteAnnouncement(id);
                toast.success('Announcement deleted');
                fetchAnnouncements();
            } catch (error) {
                toast.error('Failed to delete');
            }
        }
    };

    const handleSubmit = async (data: AnnouncementFormData) => {
        try {
            setActionLoading(true);
            if (selectedAnnouncement) {
                await notificationService.updateAnnouncement(selectedAnnouncement.id, data);
                toast.success('Announcement updated');
            } else {
                await notificationService.createAnnouncement(data);
                toast.success('Announcement posted');
            }
            setIsModalOpen(false);
            fetchAnnouncements();
        } catch (error) {
            toast.error('Failed to save announcement');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Notices & Announcements</h1>
                    <p className="text-sm font-bold text-gray-400 mt-1">Broadcast official information across the institution.</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-6 py-3.5 bg-indigo-600 text-white font-black text-sm rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    New Announcement
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Stats / Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Total Posted</span>
                            <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg text-xs font-black">{announcements.length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Active Now</span>
                            <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg text-xs font-black">
                                {announcements.filter(a => a.is_active).length}
                            </span>
                        </div>
                    </div>

                    <div className="bg-indigo-600 p-6 rounded-3xl text-white shadow-xl shadow-indigo-200 relative overflow-hidden group">
                        <Megaphone className="absolute -bottom-2 -right-2 w-20 h-20 text-white/10 -rotate-12 group-hover:rotate-0 transition-transform duration-500" />
                        <h4 className="text-lg font-black leading-tight mb-2">Communication is key.</h4>
                        <p className="text-xs text-indigo-100 font-medium">Keep your students and teachers updated with real-time official notices.</p>
                    </div>
                </div>

                {/* Feed */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Search notices by title or content..." 
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all font-medium"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && fetchAnnouncements()}
                            />
                        </div>
                        <button 
                            onClick={fetchAnnouncements}
                            className="bg-gray-100 text-gray-600 px-6 py-3 rounded-xl text-xs font-black hover:bg-gray-200 transition-colors uppercase tracking-widest"
                        >
                            Filter
                        </button>
                    </div>

                    {loading ? (
                        <div className="py-20 text-center">
                            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-gray-400 font-bold text-sm">Synchronizing notices...</p>
                        </div>
                    ) : announcements.length === 0 ? (
                        <div className="bg-white py-24 text-center rounded-[32px] border border-dashed border-gray-200">
                            <Speaker className="w-16 h-16 text-gray-100 mx-auto mb-4" />
                            <h3 className="text-xl font-black text-gray-900 mb-1">Silence is golden?</h3>
                            <p className="text-gray-400 font-medium max-w-xs mx-auto text-sm">No announcements found. Click "New Announcement" to start broadcasting.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {announcements.map((announcement) => (
                                <div key={announcement.id} className="bg-white border border-gray-100 rounded-[32px] p-6 hover:shadow-xl hover:shadow-indigo-50/50 transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black">
                                                {announcement.target_audience === 'ALL' && <Users className="w-6 h-6" />}
                                                {announcement.target_audience === 'TEACHERS' && <Info className="w-6 h-6" />}
                                                {announcement.target_audience === 'STUDENTS' && <GraduationCap className="w-6 h-6" />}
                                                {announcement.target_audience === 'CLASS' && <Edit2 className="w-6 h-6" />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                                        announcement.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
                                                    }`}>
                                                        {announcement.is_active ? 'Active' : 'Expired'}
                                                    </span>
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded-full">
                                                        To: {announcement.target_audience === 'CLASS' ? announcement.target_class_name : announcement.target_audience}
                                                    </span>
                                                </div>
                                                <h3 className="text-lg font-black text-gray-900 group-hover:text-indigo-600 transition-colors leading-none">{announcement.title}</h3>
                                            </div>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleEdit(announcement)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(announcement.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6 whitespace-pre-wrap line-clamp-3">
                                        {announcement.content}
                                    </p>

                                    <div className="pt-6 border-t border-gray-50 flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5" />
                                            Posted on {new Date(announcement.created_at).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-black">
                                                {announcement.created_by_name?.charAt(0) || 'A'}
                                            </div>
                                            By {announcement.created_by_name || 'Administrator'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <AnnouncementModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                announcement={selectedAnnouncement}
                isLoading={actionLoading}
            />
        </div>
    );
}
