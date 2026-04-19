
import { useState, useEffect } from 'react';
import { Calendar, Users, CheckCircle, XCircle, Clock, Save, Search } from 'lucide-react';
import { attendanceService } from '../services/attendanceService';
import { studentService, type Student } from '../services/studentService';
import { classService, type Class, type Section } from '../services/classService';
import toast from 'react-hot-toast';

export default function Attendance() {
    const [activeTab, setActiveTab] = useState<'take' | 'report'>('take');
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSection, setSelectedSection] = useState('');

    const [classes, setClasses] = useState<Class[]>([]);
    const [sections, setSections] = useState<Section[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [attendanceData, setAttendanceData] = useState<Record<string, { status: string; remarks: string }>>({});

    useEffect(() => {
        fetchInitialData();
    }, []);

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
        } catch (error) {
            toast.error('Failed to load classes');
        }
    };

    const fetchSections = async (classId: string) => {
        try {
            const sectionsData = await classService.getSections({ class_id: classId });
            setSections(sectionsData.results || []);
        } catch (error) {
            toast.error('Failed to load sections');
        }
    };

    const loadStudents = async () => {
        if (!selectedClass || !selectedSection) {
            toast.error('Please select both class and section');
            return;
        }

        try {
            setLoading(true);
            const [studentsData, existingAttendance] = await Promise.all([
                studentService.getStudents({ current_class: selectedClass, section: selectedSection }),
                attendanceService.getStudentAttendance({ date, student__class_assigned: selectedClass, student__section: selectedSection })
            ]);

            const studentList = (studentsData.results || []) as Student[];
            setStudents(studentList);

            // Initialize attendance data
            const initialData: Record<string, { status: string; remarks: string }> = {};
            studentList.forEach((s: Student) => {
                initialData[s.id] = { status: 'PRESENT', remarks: '' };
            });

            // Override with existing attendance if any
            (existingAttendance.results || []).forEach((att: any) => {
                initialData[att.student] = { status: att.status, remarks: att.remarks };
            });

            setAttendanceData(initialData);
        } catch (error) {
            toast.error('Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (studentId: string, status: string) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], status }
        }));
    };

    const markAllStatus = (status: string) => {
        const newData = { ...attendanceData };
        students.forEach(s => {
            newData[s.id] = { ...newData[s.id], status };
        });
        setAttendanceData(newData);
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const payload = {
                date,
                attendance_data: Object.entries(attendanceData).map(([id, data]) => ({
                    student: id,
                    status: data.status,
                    remarks: data.remarks
                }))
            };
            await attendanceService.bulkSaveStudentAttendance(payload);
            toast.success('Attendance saved successfully');
        } catch (error) {
            toast.error('Failed to save attendance');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
                <div className="flex bg-white rounded-lg shadow-sm border p-1">
                    <button
                        onClick={() => setActiveTab('take')}
                        className={`px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 ${activeTab === 'take' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Users className="h-4 w-4" />
                        Take Attendance
                    </button>
                    <button
                        onClick={() => setActiveTab('report')}
                        className={`px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 ${activeTab === 'report' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Calendar className="h-4 w-4" />
                        Reports
                    </button>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                            type="date"
                            className="w-full px-3 py-2 border rounded-md"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                        <select
                            className="w-full px-3 py-2 border rounded-md"
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                        >
                            <option value="">Select Class</option>
                            {classes.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                        <select
                            className="w-full px-3 py-2 border rounded-md"
                            value={selectedSection}
                            onChange={(e) => setSelectedSection(e.target.value)}
                            disabled={!selectedClass}
                        >
                            <option value="">Select Section</option>
                            {sections.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={loadStudents}
                            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center justify-center gap-2 transition shadow-sm"
                        >
                            <Search className="h-4 w-4" /> Load Students
                        </button>
                    </div>
                </div>

                {activeTab === 'take' && students.length > 0 && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="flex gap-4">
                                <span className="text-sm font-bold text-gray-700">Total: {students.length}</span>
                                <span className="text-sm font-bold text-green-600">Present: {Object.values(attendanceData).filter(a => a.status === 'PRESENT').length}</span>
                                <span className="text-sm font-bold text-red-600">Absent: {Object.values(attendanceData).filter(a => a.status === 'ABSENT').length}</span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => markAllStatus('PRESENT')}
                                    className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 transition"
                                >
                                    All Present
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm font-bold shadow-md transition disabled:opacity-50"
                                >
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
                                                        { label: 'P', value: 'PRESENT', color: 'bg-green-100 text-green-700', icon: CheckCircle },
                                                        { label: 'A', value: 'ABSENT', color: 'bg-red-100 text-red-700', icon: XCircle },
                                                        { label: 'L', value: 'LATE', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
                                                        { label: 'H', value: 'HALF_DAY', color: 'bg-blue-100 text-blue-700', icon: Clock },
                                                    ].map(opt => (
                                                        <button
                                                            key={opt.value}
                                                            onClick={() => handleStatusChange(student.id, opt.value)}
                                                            title={opt.value}
                                                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${attendanceData[student.id]?.status === opt.value
                                                                ? `${opt.color} ring-2 ring-offset-2 ring-indigo-500 shadow-sm scale-110`
                                                                : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                                                                }`}
                                                        >
                                                            <span className="text-xs font-black">{opt.label}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <input
                                                    type="text"
                                                    className="w-full px-3 py-1 text-sm border-gray-200 border rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                                                    placeholder="Add note..."
                                                    value={attendanceData[student.id]?.remarks || ''}
                                                    onChange={(e) => setAttendanceData(prev => ({
                                                        ...prev,
                                                        [student.id]: { ...prev[student.id], remarks: e.target.value }
                                                    }))}
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
                        <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h4 className="text-lg font-bold text-gray-900 mb-1">No Students Loaded</h4>
                        <p className="text-gray-500 max-w-sm mx-auto">Select a class and section to begin taking attendance.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
