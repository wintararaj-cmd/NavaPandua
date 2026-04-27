import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, FileText, UserPlus } from 'lucide-react';
import { admissionsService, type AdmissionEnquiry, type AdmissionApplication } from '../services/admissionsService';
import EnquiryModal from '../components/admissions/EnquiryModal';
import ApplicationModal from '../components/admissions/ApplicationModal';
import toast from 'react-hot-toast';

export default function Admissions() {
    const [enquiries, setEnquiries] = useState<AdmissionEnquiry[]>([]);
    const [applications, setApplications] = useState<AdmissionApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'enquiries' | 'applications'>('enquiries');
    
    // Enquiry state
    const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
    const [selectedEnquiry, setSelectedEnquiry] = useState<AdmissionEnquiry | undefined>(undefined);
    
    // Application state
    const [isAppModalOpen, setIsAppModalOpen] = useState(false);
    const [selectedApp, setSelectedApp] = useState<AdmissionApplication | undefined>(undefined);
    
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (activeTab === 'enquiries') {
            fetchEnquiries();
        } else {
            fetchApplications();
        }
    }, [activeTab]);

    const fetchEnquiries = async () => {
        try {
            setLoading(true);
            const data = await admissionsService.getEnquiries({ search: searchQuery });
            setEnquiries(Array.isArray(data) ? data : data.results || []);
        } catch (error) {
            toast.error('Failed to fetch enquiries');
        } finally {
            setLoading(false);
        }
    };

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const data = await admissionsService.getApplications({ search: searchQuery });
            setApplications(Array.isArray(data) ? data : data.results || []);
        } catch (error) {
            toast.error('Failed to fetch applications');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (activeTab === 'enquiries') fetchEnquiries();
        else fetchApplications();
    };

    const handleCreate = () => {
        if (activeTab === 'enquiries') {
            setSelectedEnquiry(undefined);
            setIsEnquiryModalOpen(true);
        } else {
            setSelectedApp(undefined);
            setIsAppModalOpen(true);
        }
    };

    const handleEditEnquiry = (enquiry: AdmissionEnquiry) => {
        setSelectedEnquiry(enquiry);
        setIsEnquiryModalOpen(true);
    };

    const handleEditApp = (app: AdmissionApplication) => {
        setSelectedApp(app);
        setIsAppModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        const item = activeTab === 'enquiries' ? 'enquiry' : 'application';
        if (window.confirm(`Are you sure you want to delete this ${item}?`)) {
            try {
                if (activeTab === 'enquiries') {
                    await admissionsService.deleteEnquiry(id);
                    fetchEnquiries();
                } else {
                    await admissionsService.deleteApplication(id);
                    fetchApplications();
                }
                toast.success(`${item.charAt(0).toUpperCase() + item.slice(1)} deleted successfully`);
            } catch (error) {
                toast.error(`Failed to delete ${item}`);
            }
        }
    };

    const handleSaveEnquiry = async (data: any) => {
        try {
            setActionLoading(true);
            if (activeTab === 'enquiries') {
                if (selectedEnquiry) {
                    await admissionsService.updateEnquiry(selectedEnquiry.id, data);
                    toast.success('Enquiry updated successfully');
                } else {
                    await admissionsService.createEnquiry(data);
                    toast.success('Enquiry created successfully');
                }
                fetchEnquiries();
            }
            setIsEnquiryModalOpen(false);
        } catch (error) {
            toast.error('Failed to save enquiry');
            throw error;
        } finally {
            setActionLoading(false);
        }
    };

    const downloadPdf = (blob: Blob, filename: string) => {
        const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    const handleSaveApp = async (data: any) => {
        try {
            setActionLoading(true);
            let savedApp;
            if (selectedApp) {
                savedApp = await admissionsService.updateApplication(selectedApp.id, data);
                toast.success('Application updated successfully');
            } else {
                savedApp = await admissionsService.createApplication(data);
                toast.success('Application created successfully');
            }
            
            // Download the form and invoice
            try {
                if (savedApp && savedApp.id) {
                    const formBlob = await admissionsService.downloadApplicationForm(savedApp.id);
                    downloadPdf(formBlob, `admission_form_${savedApp.application_number || 'new'}.pdf`);
                    
                    // Add a small delay so browser doesn't block multiple downloads
                    setTimeout(async () => {
                        try {
                            const invoiceBlob = await admissionsService.downloadApplicationInvoice(savedApp.id);
                            downloadPdf(invoiceBlob, `admission_invoice_${savedApp.application_number || 'new'}.pdf`);
                        } catch (invErr) {
                            console.error('Failed to download invoice:', invErr);
                            toast.error('Failed to download invoice automatically');
                        }
                    }, 500);
                }
            } catch (dlErr) {
                console.error('Failed to download form:', dlErr);
                toast.error('Failed to download form automatically');
            }

            fetchApplications();
            setIsAppModalOpen(false);
        } catch (error) {
            console.error('Error in handleSaveApp:', error);
            throw error;
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'NEW':
            case 'SUBMITTED':
                return 'bg-blue-100 text-blue-800';
            case 'CONTACTED':
            case 'UNDER_REVIEW':
                return 'bg-yellow-100 text-yellow-800';
            case 'VISITED':
            case 'INTERVIEW_SCHEDULED':
                return 'bg-purple-100 text-purple-800';
            case 'APPLICATION_PURCHASED':
            case 'SELECTED':
                return 'bg-green-100 text-green-800';
            case 'ADMITTED':
                return 'bg-green-600 text-white';
            case 'REJECTED':
            case 'CLOSED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Admissions</h1>
                <button
                    onClick={handleCreate}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition"
                >
                    <Plus className="-ml-1 mr-2 h-5 w-5" />
                    {activeTab === 'enquiries' ? 'New Enquiry' : 'New Application'}
                </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('enquiries')}
                        className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition ${activeTab === 'enquiries'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Enquiries
                    </button>
                    <button
                        onClick={() => setActiveTab('applications')}
                        className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition ${activeTab === 'applications'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Applications
                    </button>
                </nav>
            </div>

            {/* Content */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="flex-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2"
                                placeholder={activeTab === 'enquiries' ? "Search enquiries..." : "Search applications..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-6 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition"
                        >
                            Search
                        </button>
                    </form>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    {activeTab === 'enquiries' ? 'Student Name' : 'App No / Name'}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Parent
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Contact
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                                        <div className="flex flex-col items-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                                            Loading data...
                                        </div>
                                    </td>
                                </tr>
                            ) : activeTab === 'enquiries' ? (
                                enquiries.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                                            No enquiries found
                                        </td>
                                    </tr>
                                ) : (
                                    enquiries.map((enquiry) => (
                                        <tr key={enquiry.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                                        {enquiry.student_name[0]}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-semibold text-gray-900">{enquiry.student_name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {enquiry.parent_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 font-medium">{enquiry.phone}</div>
                                                <div className="text-sm text-gray-500">{enquiry.email || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${getStatusColor(enquiry.status)}`}>
                                                    {enquiry.status.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(enquiry.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => handleEditEnquiry(enquiry)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => handleDelete(enquiry.id)} className="text-red-600 hover:text-red-900">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )
                            ) : applications.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                                        No applications found
                                    </td>
                                </tr>
                            ) : (
                                applications.map((app) => (
                                    <tr key={app.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                                                    <FileText className="h-5 w-5" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-gray-900">{app.application_number}</div>
                                                    <div className="text-xs text-gray-500 font-medium">{app.first_name} {app.last_name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {/* We should ideally have parent name in service interface too */}
                                            { (app as any).father_name || 'Guardian' }
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 font-medium">{ (app as any).father_phone || '-' }</div>
                                            <div className="text-sm text-gray-500 font-medium">{ (app as any).father_email || '-' }</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${getStatusColor(app.status)}`}>
                                                {app.status.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(app.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => handleEditApp(app)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => handleDelete(app.id)} className="text-red-600 hover:text-red-900">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <EnquiryModal
                isOpen={isEnquiryModalOpen}
                onClose={() => {
                    setIsEnquiryModalOpen(false);
                    setSelectedEnquiry(undefined);
                }}
                onSave={handleSaveEnquiry}
                initialData={selectedEnquiry}
            />

            <ApplicationModal
                isOpen={isAppModalOpen}
                onClose={() => {
                    setIsAppModalOpen(false);
                    setSelectedApp(undefined);
                }}
                onSave={handleSaveApp}
                initialData={selectedApp}
            />
        </div>
    );
}
