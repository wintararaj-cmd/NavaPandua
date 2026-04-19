
import React, { useState, useEffect } from 'react';
import { Plus, Search, DollarSign, FileText, Settings, History, CreditCard, Layers, Tag } from 'lucide-react';
import { feeService, type FeeGroup, type FeeType, type FeeMaster, type FeeAllocation } from '../services/feeService';
import { studentService } from '../services/studentService';
import FeeMasterModal from '../components/fees/FeeMasterModal';
import FeeGroupModal from '../components/fees/FeeGroupModal';
import FeeTypeModal from '../components/fees/FeeTypeModal';
import FeePaymentModal from '../components/fees/FeePaymentModal';
import toast from 'react-hot-toast';

export default function Fees() {
    const [activeTab, setActiveTab] = useState<'config' | 'allocation' | 'collect' | 'history'>('collect');
    const [loading, setLoading] = useState(false);

    // Modal states
    const [showMasterModal, setShowMasterModal] = useState(false);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [showTypeModal, setShowTypeModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedAllocation, setSelectedAllocation] = useState<FeeAllocation | null>(null);

    // Config states
    const [groups, setGroups] = useState<FeeGroup[]>([]);
    const [types, setTypes] = useState<FeeType[]>([]);
    const [masters, setMasters] = useState<FeeMaster[]>([]);

    // Collection states
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [studentFees, setStudentFees] = useState<FeeAllocation[]>([]);

    useEffect(() => {
        if (activeTab === 'config') {
            fetchConfigData();
        }
    }, [activeTab]);

    const fetchConfigData = async () => {
        try {
            setLoading(true);
            const [groupsData, typesData, mastersData] = await Promise.all([
                feeService.getGroups(),
                feeService.getTypes(),
                feeService.getMasters()
            ]);
            setGroups(groupsData.results || []);
            setTypes(typesData.results || []);
            setMasters(mastersData.results || []);
        } catch (error) {
            toast.error('Failed to fetch fee configuration');
        } finally {
            setLoading(false);
        }
    };

    const handleStudentSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const data = await studentService.getStudents({ search: searchQuery });
            setSearchResults(data.results || []);
        } catch (error) {
            toast.error('Failed to search students');
        } finally {
            setLoading(false);
        }
    };

    const fetchStudentFees = async (studentId: string) => {
        try {
            setLoading(true);
            const data = await feeService.getAllocations({ student: studentId });
            setStudentFees(data.results || []);
        } catch (error) {
            toast.error('Failed to fetch student fees');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
                <div className="flex bg-white rounded-lg shadow-sm border p-1">
                    <button
                        onClick={() => setActiveTab('collect')}
                        className={`px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 ${activeTab === 'collect' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <DollarSign className="h-4 w-4" />
                        Collect Fees
                    </button>
                    <button
                        onClick={() => setActiveTab('allocation')}
                        className={`px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 ${activeTab === 'allocation' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <CreditCard className="h-4 w-4" />
                        Allocation
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 ${activeTab === 'history' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <History className="h-4 w-4" />
                        History
                    </button>
                    <button
                        onClick={() => setActiveTab('config')}
                        className={`px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 ${activeTab === 'config' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Settings className="h-4 w-4" />
                        Config
                    </button>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                {activeTab === 'collect' && (
                    <div className="space-y-6">
                        <div className="max-w-xl">
                            <form onSubmit={handleStudentSearch} className="flex gap-4">
                                <div className="flex-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search student by name or admission number..."
                                        className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700">
                                    Search
                                </button>
                            </form>
                        </div>

                        {searchResults.length > 0 && !selectedStudent && (
                            <div className="border rounded-md overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admission No</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {searchResults.map((student) => (
                                            <tr key={student.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">{student.first_name} {student.last_name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{student.admission_number}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{student.class_assigned_details?.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedStudent(student);
                                                            fetchStudentFees(student.id);
                                                        }}
                                                        className="text-indigo-600 hover:text-indigo-900 font-medium"
                                                    >
                                                        Select
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {selectedStudent && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-indigo-200 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xl text-center">
                                            {selectedStudent.first_name[0]}{selectedStudent.last_name[0]}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg">
                                                {selectedStudent.first_name} {selectedStudent.last_name}
                                            </h3>
                                            <p className="text-gray-500 text-sm">
                                                ID: {selectedStudent.admission_number} | Class: {selectedStudent.class_assigned_details?.name} {selectedStudent.section_details?.name}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedStudent(null)}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        Change Student
                                    </button>
                                </div>

                                <div className="border rounded-md overflow-hidden">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee Type</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {studentFees.map((fee) => (
                                                <tr key={fee.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{fee.fee_type_name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fee.due_date}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">₹{fee.amount}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">₹{fee.paid_amount}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-bold">₹{fee.remaining_amount}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${fee.status === 'PAID' ? 'bg-green-100 text-green-800' :
                                                            fee.status === 'PARTIAL' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-red-100 text-red-800'
                                                            }`}>
                                                            {fee.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                        {fee.status !== 'PAID' && (
                                                            <button
                                                                className="text-white bg-indigo-600 px-3 py-1 rounded hover:bg-indigo-700 transition shadow-sm font-bold text-xs uppercase"
                                                                onClick={() => {
                                                                    setSelectedAllocation(fee);
                                                                    setShowPaymentModal(true);
                                                                }}
                                                            >
                                                                Pay Now
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            {studentFees.length === 0 && (
                                                <tr>
                                                    <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                                                        No fees allocated to this student.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'config' && (
                    <div className="space-y-8">
                        <div className="flex justify-between items-center bg-gray-50 p-6 rounded-xl border border-gray-100 shadow-sm">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Fee Configuration</h3>
                                <p className="text-sm text-gray-500">Manage your fee groups, types, and overall structure.</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowGroupModal(true)}
                                    className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2 font-medium transition shadow-sm"
                                >
                                    <Layers className="h-4 w-4" /> Add Group
                                </button>
                                <button
                                    onClick={() => setShowTypeModal(true)}
                                    className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2 font-medium transition shadow-sm"
                                >
                                    <Tag className="h-4 w-4" /> Add Type
                                </button>
                                <button
                                    onClick={() => setShowMasterModal(true)}
                                    className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 font-semibold transition shadow-md"
                                >
                                    <Plus className="h-4 w-4" /> Add Structure
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {masters.map(master => (
                                <div key={master.id} className="border p-6 rounded-xl bg-white hover:shadow-lg transition-all border-gray-100 relative group overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500 group-hover:bg-indigo-600 transition-colors"></div>
                                    <div className="flex justify-between items-start mb-4">
                                        <h4 className="font-bold text-gray-900 text-lg leading-tight">{master.fee_type_name}</h4>
                                        <span className="text-xs font-bold bg-indigo-50 px-2.5 py-1 rounded-full text-indigo-700 uppercase tracking-wider">
                                            {master.fee_group_name}
                                        </span>
                                    </div>
                                    <div className="flex items-baseline gap-1 mb-6">
                                        <span className="text-3xl font-black text-gray-900">₹{master.amount}</span>
                                        <span className="text-gray-400 text-sm font-medium">per student</span>
                                    </div>
                                    <div className="pt-4 border-t border-gray-50 space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <FileText className="h-4 w-4 text-gray-400" />
                                            <span>Due: <span className="font-semibold text-gray-900">{master.due_date}</span></span>
                                        </div>
                                        {master.fine_type !== 'NONE' && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <CreditCard className="h-4 w-4 text-gray-400" />
                                                <span>Fine: <span className="font-semibold text-orange-600">{master.fine_type === 'FIXED' ? `₹${master.fine_amount}` : `${master.fine_amount}%`}</span></span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {masters.length === 0 && (
                                <div className="col-span-full py-20 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                    <DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                    <h4 className="text-lg font-bold text-gray-900 mb-1">No Fee Structures Defined</h4>
                                    <p className="text-gray-500 max-w-sm mx-auto">Start by creating fee groups and types, then define your fee structure using the button above.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <FeeMasterModal
                isOpen={showMasterModal}
                onClose={() => setShowMasterModal(false)}
                onSuccess={fetchConfigData}
            />
            <FeeGroupModal
                isOpen={showGroupModal}
                onClose={() => setShowGroupModal(false)}
                onSuccess={fetchConfigData}
            />
            <FeeTypeModal
                isOpen={showTypeModal}
                onClose={() => setShowTypeModal(false)}
                onSuccess={fetchConfigData}
            />
            <FeePaymentModal
                isOpen={showPaymentModal}
                allocation={selectedAllocation}
                onClose={() => {
                    setShowPaymentModal(false);
                    setSelectedAllocation(null);
                }}
                onSuccess={() => {
                    if (selectedStudent) fetchStudentFees(selectedStudent.id);
                }}
            />
        </div>
    );
}
