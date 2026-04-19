import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { timetableService } from '../services/academicServices';
import TimetableModal from '../components/academic/TimetableModal';
import toast from 'react-hot-toast';

export default function Timetable() {
    const [entries, setEntries] = useState<any[]>([]);
    const [periods, setPeriods] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ class_group: '', section: '' });
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<any | undefined>(undefined);

    useEffect(() => {
        fetchPeriods();
        fetchTimetable();
    }, [filter]);

    const fetchPeriods = async () => {
        try {
            const data = await timetableService.getPeriods();
            setPeriods(data.results || data);
        } catch (error) {
            console.error('Failed to load periods');
        }
    };

    const fetchTimetable = async () => {
        try {
            setLoading(true);
            const response = await timetableService.getEntries(filter);
            setEntries(response.results || response);
        } catch (error) {
            toast.error('Failed to load timetable');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedEntry(undefined);
        setIsModalOpen(true);
    };

    const handleSave = async (data: any) => {
        try {
            if (selectedEntry) {
                toast.error('Update not implemented yet');
            } else {
                await timetableService.createEntry(data);
                toast.success('Entry added successfully');
            }
            fetchTimetable();
            setIsModalOpen(false);
        } catch (error) {
            toast.error('Failed to save timetable entry');
            throw error;
        }
    };

    const days = [
        { id: 0, label: 'MONDAY' },
        { id: 1, label: 'TUESDAY' },
        { id: 2, label: 'WEDNESDAY' },
        { id: 3, label: 'THURSDAY' },
        { id: 4, label: 'FRIDAY' },
        { id: 5, label: 'SATURDAY' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Class Timetable</h1>
                    <p className="text-gray-500 mt-1">Manage and view weekly academic schedules</p>
                </div>
                <button 
                    onClick={handleCreate}
                    className="inline-flex items-center px-6 py-2.5 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all"
                >
                    <Plus className="-ml-1 mr-2 h-5 w-5" />
                    Add Entry
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="max-w-md relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Filter by class name..."
                            className="w-full rounded-xl border-gray-200 pl-10 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            value={filter.class_group}
                            onChange={(e) => setFilter({ ...filter, class_group: e.target.value })}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="p-4 border-b border-r bg-gray-50 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Day / Period</th>
                                {periods.map((p, i) => (
                                    <th key={p.id} className="p-4 border-b border-r bg-gray-50 text-center">
                                        <p className="text-xs font-bold text-gray-900 uppercase tracking-wider">{p.name}</p>
                                        <p className="text-[10px] text-gray-500 font-medium mt-1">{p.start_time.substring(0,5)} - {p.end_time.substring(0,5)}</p>
                                    </th>
                                ))}
                                {periods.length === 0 && Array.from({ length: 8 }).map((_, i) => (
                                    <th key={i} className="p-4 border-b border-r bg-gray-50 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        P{i + 1}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {days.map((day) => (
                                <tr key={day.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4 border-r bg-gray-50/30 font-extrabold text-[11px] text-gray-900">{day.label}</td>
                                    {(periods.length > 0 ? periods : Array.from({ length: 8 })).map((p, i) => {
                                        const periodId = periods.length > 0 ? p.id : (i + 1);
                                        const entry = entries.find(e => e.day_of_week === day.id && (e.period === periodId || e.period_id === periodId));
                                        
                                        return (
                                            <td key={i} className="p-4 border-r min-w-[140px] vertical-top">
                                                {entry ? (
                                                    <div className="group relative">
                                                        <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                                                            <p className="font-bold text-indigo-700 text-xs truncate">{entry.subject_name}</p>
                                                            <p className="text-[10px] text-indigo-500 mt-1 font-medium italic">{entry.teacher_name || 'No Teacher'}</p>
                                                            {entry.room_number && (
                                                                <p className="text-[9px] text-gray-400 mt-2 font-bold uppercase tracking-tighter">Room: {entry.room_number}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-gray-300 italic text-[10px] font-medium py-4">
                                                        Free
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <TimetableModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={selectedEntry}
            />
        </div>
    );
}
