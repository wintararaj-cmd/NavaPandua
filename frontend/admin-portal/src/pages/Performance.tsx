import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Trophy, Users, BarChart3, Download, FileSpreadsheet, FileText } from 'lucide-react';
import { analyticsService } from '../services/analyticsService';
import toast from 'react-hot-toast';

export default function Performance() {
    const [performance, setPerformance] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const filter = { class_id: '' };

    const handleDownload = async (type: string, format: string) => {
        try {
            await analyticsService.downloadReport(type, format);
            toast.success(`${type} report downloaded successfully`);
        } catch (error) {
            toast.error(`Failed to download ${type} report`);
        }
    };

    useEffect(() => {
        const fetchPerformance = async () => {
            try {
                setLoading(true);
                const response = await analyticsService.getPerformanceStats(filter);
                if (response.success) {
                    setPerformance(response.data);
                }
            } catch (error) {
                toast.error('Failed to load performance analytics');
            } finally {
                setLoading(false);
            }
        };

        fetchPerformance();
    }, [filter]);

    const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

    if (loading && !performance) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Academic Performance</h1>
                    <p className="text-gray-600 mt-1">Analyze grades, averages and top performers</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Class Performance Chart */}
                <div className="lg:col-span-2 card">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary-600" />
                        Class Subject Averages
                    </h2>
                    <div className="h-96 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={performance?.class_performance}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                <XAxis
                                    dataKey="exam_schedule__subject__name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#6B7280' }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#6B7280' }}
                                />
                                <Tooltip
                                    cursor={{ fill: '#F9FAFB' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="avg_marks" radius={[4, 4, 0, 0]}>
                                    {performance?.class_performance.map((_: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Students List */}
                <div className="card">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        Top Performers
                    </h2>
                    <div className="space-y-4">
                        {performance?.top_students.map((student: any, index: number) => (
                            <div key={student.student__id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-primary-500'
                                    }`}>
                                    {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-900 truncate">
                                        {student.student__user__first_name} {student.student__user__last_name}
                                    </p>
                                    <p className="text-xs text-gray-500">{student.student__current_class__name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-primary-600">{Math.round(student.overall_avg)}%</p>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold">AVG</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Performance Metrics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card bg-primary-600 text-white border-none">
                    <p className="text-primary-100 text-sm mb-1 uppercase font-bold tracking-wider">Overall Success Rate</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-4xl font-black">94.2%</h3>
                        <Trophy className="w-10 h-10 opacity-20" />
                    </div>
                    <div className="mt-4 h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full" style={{ width: '94.2%' }}></div>
                    </div>
                </div>

                <div className="card bg-green-600 text-white border-none">
                    <p className="text-green-100 text-sm mb-1 uppercase font-bold tracking-wider">Pass Percentage</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-4xl font-black">98.5%</h3>
                        <Users className="w-10 h-10 opacity-20" />
                    </div>
                    <div className="mt-4 h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full" style={{ width: '98.5%' }}></div>
                    </div>
                </div>

                <div className="card bg-amber-600 text-white border-none">
                    <p className="text-amber-100 text-sm mb-1 uppercase font-bold tracking-wider">Distinction Holders</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-4xl font-black">24%</h3>
                        <BarChart3 className="w-10 h-10 opacity-20" />
                    </div>
                    <div className="mt-4 h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full" style={{ width: '24%' }}></div>
                    </div>
                </div>
            </div>
            {/* Report Exports */}
            <div className="card">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Download className="w-5 h-5 text-primary-600" />
                    Reports & Exports
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 border border-gray-100 rounded-2xl bg-gray-50 flex flex-col justify-between">
                        <div>
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="font-bold text-gray-900">Students Directory</h3>
                            <p className="text-xs text-gray-500 mt-1">Complete list of registered students with contact details.</p>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={() => handleDownload('students', 'csv')}
                                className="flex-1 btn btn-secondary py-2 text-xs flex items-center justify-center gap-1"
                            >
                                <FileText className="w-3 h-3" /> CSV
                            </button>
                            <button
                                onClick={() => handleDownload('students', 'excel')}
                                className="flex-1 btn btn-secondary py-2 text-xs flex items-center justify-center gap-1"
                            >
                                <FileSpreadsheet className="w-3 h-3" /> EXCEL
                            </button>
                        </div>
                    </div>

                    <div className="p-4 border border-gray-100 rounded-2xl bg-gray-50 flex flex-col justify-between">
                        <div>
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                                <Users className="w-6 h-6 text-green-600" />
                            </div>
                            <h3 className="font-bold text-gray-900">Staff Records</h3>
                            <p className="text-xs text-gray-500 mt-1">Teacher profiles, department and employee IDs.</p>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={() => handleDownload('teachers', 'csv')}
                                className="flex-1 btn btn-secondary py-2 text-xs flex items-center justify-center gap-1"
                            >
                                <FileText className="w-3 h-3" /> CSV
                            </button>
                            <button
                                onClick={() => handleDownload('teachers', 'excel')}
                                className="flex-1 btn btn-secondary py-2 text-xs flex items-center justify-center gap-1"
                            >
                                <FileSpreadsheet className="w-3 h-3" /> EXCEL
                            </button>
                        </div>
                    </div>

                    <div className="p-4 border border-gray-100 rounded-2xl bg-gray-50 flex flex-col justify-between">
                        <div>
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                                <BarChart3 className="w-6 h-6 text-purple-600" />
                            </div>
                            <h3 className="font-bold text-gray-900">Financial Reports</h3>
                            <p className="text-xs text-gray-500 mt-1">Fee collections, transaction IDs and payment modes.</p>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={() => handleDownload('finance', 'csv')}
                                className="flex-1 btn btn-secondary py-2 text-xs flex items-center justify-center gap-1"
                            >
                                <FileText className="w-3 h-3" /> CSV
                            </button>
                            <button
                                onClick={() => handleDownload('finance', 'excel')}
                                className="flex-1 btn btn-secondary py-2 text-xs flex items-center justify-center gap-1"
                            >
                                <FileSpreadsheet className="w-3 h-3" /> EXCEL
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
