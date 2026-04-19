import { useState, useEffect } from 'react';
import { Video, Plus, Calendar, Clock, Link as LinkIcon } from 'lucide-react';
import { liveClassService } from '../services/academicServices';
import toast from 'react-hot-toast';

export default function LiveClasses() {
    const [liveClasses, setLiveClasses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Live Classes</h1>
                    <p className="text-gray-600 mt-1">Schedule and manage virtual classroom sessions</p>
                </div>
                <button className="btn btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Schedule Class
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {liveClasses.map((session) => (
                    <div key={session.id} className="card hover:shadow-lg transition-shadow border-t-4 border-primary-600">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-primary-100 rounded-lg">
                                <Video className="w-6 h-6 text-primary-600" />
                            </div>
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full uppercase">
                                {session.platform}
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-1">{session.title}</h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{session.description}</p>

                        <div className="space-y-2 mb-6">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(session.scheduled_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Clock className="w-4 h-4" />
                                <span>{new Date(session.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({session.duration} mins)</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <GraduationCap className="w-4 h-4" />
                                <span>{session.subject_name} • {session.class_name}</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <a
                                href={session.meeting_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full btn btn-primary flex items-center justify-center gap-2"
                            >
                                <LinkIcon className="w-4 h-4" />
                                Join Meeting
                            </a>
                            <button className="text-sm text-gray-500 hover:text-primary-600 font-medium py-2">
                                Edit Details
                            </button>
                        </div>
                    </div>
                ))}

                {liveClasses.length === 0 && !loading && (
                    <div className="col-span-full py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-500">
                        <Video className="w-12 h-12 mb-4 opacity-20" />
                        <p className="text-lg font-medium">No live classes scheduled</p>
                        <p className="text-sm">Click 'Schedule Class' to get started</p>
                    </div>
                )}
            </div>
        </div>
    );
}

import { GraduationCap } from 'lucide-react';
