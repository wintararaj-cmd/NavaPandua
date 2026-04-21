
import { useState, useEffect } from 'react';
import { 
    Bell, CheckCircle, Info, AlertTriangle, XCircle, 
    Trash2, Check, ExternalLink, Calendar, Filter, 
    MoreVertical, Search, MousePointerClick
} from 'lucide-react';
import { notificationService, type Notification } from '../services/notificationService';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function TypeIcon({ type }: { type: string }) {
    switch (type) {
        case 'SUCCESS': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
        case 'WARNING': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
        case 'ERROR': return <XCircle className="w-5 h-5 text-red-500" />;
        case 'ALERT': return <Bell className="w-5 h-5 text-indigo-500" />;
        default: return <Info className="w-5 h-5 text-blue-500" />;
    }
}

function TypeBg({ type }: { type: string }) {
    switch (type) {
        case 'SUCCESS': return 'bg-emerald-50 border-emerald-100';
        case 'WARNING': return 'bg-amber-50 border-amber-100';
        case 'ERROR': return 'bg-red-50 border-red-100';
        case 'ALERT': return 'bg-indigo-50 border-indigo-100';
        default: return 'bg-blue-50 border-blue-100';
    }
}

export default function Notifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotifications();
    }, [filter]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const params = filter === 'UNREAD' ? { is_read: false } : {};
            const res = await notificationService.getNotifications(params);
            setNotifications(res.results || res);
        } catch {
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id: string) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch { toast.error('Error updating notification'); }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            toast.success('Marked all as read');
        } catch { toast.error('Error marking all as read'); }
    };

    const handleDelete = async (id: string) => {
        try {
            await notificationService.deleteNotification(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            toast.success('Removed');
        } catch { toast.error('Failed to delete'); }
    };

    const handleNotificationClick = (n: Notification) => {
        if (!n.is_read) handleMarkAsRead(n.id);
        if (n.link) navigate(n.link);
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                    <p className="text-gray-600 mt-1">Stay updated with system activities</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={handleMarkAllRead}
                        disabled={unreadCount === 0}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-indigo-600 bg-white border border-indigo-100 rounded-xl hover:bg-indigo-50 transition-all disabled:opacity-50"
                    >
                        <Check className="w-4 h-4" /> Mark All Read
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex bg-gray-50 p-1 rounded-xl gap-1">
                        <button 
                            onClick={() => setFilter('ALL')}
                            className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all ${filter === 'ALL' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            ALL
                        </button>
                        <button 
                            onClick={() => setFilter('UNREAD')}
                            className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all ${filter === 'UNREAD' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            UNREAD {unreadCount > 0 && `(${unreadCount})`}
                        </button>
                    </div>
                    <div className="text-xs text-gray-400 font-medium">
                        Showing {notifications.length} notifications
                    </div>
                </div>

                <div className="divide-y divide-gray-50">
                    {loading ? (
                        [...Array(5)].map((_, i) => (
                            <div key={i} className="p-6 flex gap-4 animate-pulse">
                                <div className="w-10 h-10 bg-gray-100 rounded-full shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-100 rounded w-1/4" />
                                    <div className="h-3 bg-gray-100 rounded w-full" />
                                </div>
                            </div>
                        ))
                    ) : notifications.length === 0 ? (
                        <div className="py-24 text-center">
                            <Bell className="w-16 h-16 text-gray-100 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-gray-900">All caught up!</h3>
                            <p className="text-gray-400">No {filter === 'UNREAD' ? 'unread' : ''} notifications at the moment.</p>
                        </div>
                    ) : (
                        notifications.map(n => (
                            <div 
                                key={n.id} 
                                className={`p-5 flex gap-4 transition-all group relative border-l-4 ${n.is_read ? 'border-transparent opacity-75' : 'border-indigo-600 bg-indigo-50/30'}`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border uppercase font-black text-[10px] ${TypeBg({type: n.notification_type})}`}>
                                    <TypeIcon type={n.notification_type} />
                                </div>
                                
                                <div className="flex-1 min-w-0 pr-10">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <h4 className={`text-sm font-bold truncate ${n.is_read ? 'text-gray-700' : 'text-gray-900'}`}>{n.title}</h4>
                                        {!n.is_read && <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />}
                                    </div>
                                    <p className="text-sm text-gray-500 line-clamp-2 mb-2">{n.message}</p>
                                    <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
                                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(n.created_at).toLocaleString()}</span>
                                        {n.link && (
                                            <button onClick={() => navigate(n.link)} className="text-indigo-600 hover:underline flex items-center gap-1 font-bold">
                                                <MousePointerClick className="w-3 h-3" /> View Details
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {!n.is_read && (
                                        <button 
                                            onClick={() => handleMarkAsRead(n.id)}
                                            title="Mark as read"
                                            className="p-2 bg-white text-emerald-600 shadow-sm border border-emerald-50 rounded-lg hover:bg-emerald-50 transition"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => handleDelete(n.id)}
                                        title="Delete"
                                        className="p-2 bg-white text-red-500 shadow-sm border border-red-50 rounded-lg hover:bg-red-50 transition"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
