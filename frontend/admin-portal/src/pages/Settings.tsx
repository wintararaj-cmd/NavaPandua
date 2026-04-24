import React, { useState, useEffect } from 'react';
import { 
    Save, Building2, GraduationCap, CreditCard, Bell, Shield, 
    Upload, Globe, Phone, Mail, MapPin, Calendar, Clock, Trash2, Plus
} from 'lucide-react';
import toast from 'react-hot-toast';
import { masterDataService, type MasterDataItem } from '../services/masterDataService';
import { authStore } from '../stores/authStore';

export default function Settings() {
    const [activeTab, setActiveTab] = useState<'general' | 'academic' | 'financial' | 'notifications' | 'security'>('general');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            toast.success('Settings saved successfully!');
        }, 1000);
    };

    const tabs = [
        { id: 'general', label: 'General', icon: Building2 },
        { id: 'master_data', label: 'Master Data', icon: Globe },
        { id: 'academic', label: 'Academic', icon: GraduationCap },
        { id: 'financial', label: 'Financial', icon: CreditCard },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Shield },
    ] as const;

    const [activeMasterDataTab, setActiveMasterDataTab] = useState('category');
    const [masterDataItems, setMasterDataItems] = useState<MasterDataItem[]>([]);
    const [newItemValue, setNewItemValue] = useState('');
    const [isMasterDataLoading, setIsMasterDataLoading] = useState(false);
    const user = authStore(state => state.user);
    const schoolId = user?.school?.id || user?.school; // Handle both object and string ID

    useEffect(() => {
        if (activeTab === 'master_data' && schoolId) {
            fetchMasterData();
        }
    }, [activeTab, activeMasterDataTab, schoolId]);

    const fetchMasterData = async () => {
        if (!schoolId) return;
        try {
            setIsMasterDataLoading(true);
            const domainMap: Record<string, string> = {
                'category': 'Category',
                'house': 'House',
                'fee category': 'Fee Category',
                'transport type': 'Transport Type',
                'religion': 'Religion',
                'fee payment mode': 'Fee Payment Mode'
            };
            const domain = domainMap[activeMasterDataTab] || activeMasterDataTab;
            const data = await masterDataService.getByDomain(schoolId, domain);
            setMasterDataItems(data.results || data);
        } catch (error) {
            console.error('Error fetching master data:', error);
            toast.error('Failed to load master data');
        } finally {
            setIsMasterDataLoading(false);
        }
    };

    const handleAddMasterData = async () => {
        if (!newItemValue.trim() || !schoolId) return;
        try {
            const domainMap: Record<string, string> = {
                'category': 'Category',
                'house': 'House',
                'fee category': 'Fee Category',
                'transport type': 'Transport Type',
                'religion': 'Religion',
                'fee payment mode': 'Fee Payment Mode'
            };
            const domain = domainMap[activeMasterDataTab] || activeMasterDataTab;
            
            await masterDataService.create(schoolId, {
                domain: domain,
                identifier: domain.replace(/\s+/g, ''),
                description: newItemValue.trim()
            });
            
            setNewItemValue('');
            fetchMasterData();
            toast.success('Item added successfully');
        } catch (error) {
            console.error('Error adding master data:', error);
            toast.error('Failed to add item');
        }
    };

    const handleDeleteMasterData = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this item?') || !schoolId) return;
        try {
            await masterDataService.delete(schoolId, id);
            fetchMasterData();
            toast.success('Item deleted successfully');
        } catch (error) {
            console.error('Error deleting master data:', error);
            toast.error('Failed to delete item');
        }
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">System Settings</h1>
                    <p className="text-gray-500 mt-1">Manage organization defaults and application parameters.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSaving ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="-ml-1 mr-2 h-5 w-5" />
                            Save Changes
                        </>
                    )}
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 mt-8">
                {/* Sidebar Navigation */}
                <div className="lg:w-64 flex-shrink-0">
                    <nav className="space-y-1">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                                        isActive 
                                        ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' 
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                >
                                    <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {activeTab === 'general' && (
                        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="border-b border-gray-100 pb-5">
                                <h2 className="text-xl font-bold text-gray-900">Organization Identity</h2>
                                <p className="text-sm text-gray-500 mt-1">Configure your school's global brand presence.</p>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="h-24 w-24 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative overflow-hidden group">
                                    <Building2 className="h-8 w-8 text-gray-400 group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] text-gray-500 mt-2 font-medium uppercase tracking-wider">Upload Logo</span>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
                                    <input 
                                        type="text" 
                                        defaultValue="Springfield High School" 
                                        className="w-full rounded-xl border-gray-300 py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-gray-900" 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-gray-400" /> Support Email
                                    </label>
                                    <input type="email" defaultValue="admin@springfield.edu" className="w-full rounded-xl border-gray-300 py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-gray-400" /> Phone Number
                                    </label>
                                    <input type="text" defaultValue="+1 (555) 123-4567" className="w-full rounded-xl border-gray-300 py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-gray-400" /> Campus Address
                                    </label>
                                    <textarea rows={3} defaultValue="742 Evergreen Terrace\nSpringfield, IL 62704" className="w-full rounded-xl border-gray-300 py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                        <Globe className="h-4 w-4 text-gray-400" /> Timezone
                                    </label>
                                    <select className="w-full rounded-xl border-gray-300 py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm">
                                        <option>America/Chicago (CST)</option>
                                        <option>America/New_York (EST)</option>
                                        <option>America/Los_Angeles (PST)</option>
                                        <option>Asia/Kolkata (IST)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'master_data' && (
                        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="border-b border-gray-100 pb-5">
                                <h2 className="text-xl font-bold text-gray-900">Master Data Management</h2>
                                <p className="text-sm text-gray-500 mt-1">Configure global dropdowns and categorization parameters (e.g. Houses, Transport Types, Fee Categories).</p>
                            </div>
                            
                            <div className="flex border-b border-gray-200">
                                {['Category', 'House', 'Fee Category', 'Transport Type', 'Religion', 'Fee Payment Mode'].map(tab => (
                                    <button 
                                        key={tab}
                                        onClick={() => setActiveMasterDataTab(tab.toLowerCase())}
                                        className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
                                            activeMasterDataTab === tab.toLowerCase() 
                                            ? 'border-indigo-600 text-indigo-600' 
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={newItemValue}
                                        onChange={(e) => setNewItemValue(e.target.value)}
                                        placeholder={`Add new ${activeMasterDataTab}...`}
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddMasterData()}
                                        className="flex-1 rounded-xl border-gray-300 py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                                    />
                                    <button 
                                        onClick={handleAddMasterData}
                                        className="px-6 py-2 bg-indigo-600 text-white rounded-xl shadow-sm hover:bg-indigo-700 font-medium flex items-center gap-2"
                                    >
                                        <Plus className="h-4 w-4" /> Add
                                    </button>
                                </div>
                                
                                <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-black text-gray-400 uppercase tracking-wider">Value</th>
                                                <th className="px-6 py-3 text-right text-xs font-black text-gray-400 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {isMasterDataLoading ? (
                                                <tr>
                                                    <td colSpan={2} className="px-6 py-12 text-center text-sm text-gray-500">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                                            Loading data...
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : masterDataItems.length === 0 ? (
                                                <tr>
                                                    <td colSpan={2} className="px-6 py-12 text-center text-sm text-gray-500">
                                                        No items found in this category.
                                                    </td>
                                                </tr>
                                            ) : (
                                                masterDataItems.map((item) => (
                                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{item.description}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <button 
                                                                onClick={() => handleDeleteMasterData(item.id)}
                                                                className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                            >
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
                        </div>
                    )}

                    {activeTab === 'academic' && (
                        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="border-b border-gray-100 pb-5">
                                <h2 className="text-xl font-bold text-gray-900">Academic Parameters</h2>
                                <p className="text-sm text-gray-500 mt-1">Configure academic sessions, grading rules, and timetables.</p>
                            </div>
                            
                            <div className="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100 flex items-start gap-4">
                                <div className="p-3 bg-indigo-100 rounded-xl">
                                    <Calendar className="h-6 w-6 text-indigo-600" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-base font-bold text-gray-900">Active Academic Year</h4>
                                    <p className="text-sm text-gray-500 mb-4">Set the global context for all operations and reporting.</p>
                                    <div className="flex items-center gap-4">
                                        <select className="w-48 rounded-xl border-gray-300 py-2 px-3 text-sm font-bold text-indigo-700 shadow-sm">
                                            <option>2023 - 2024</option>
                                            <option selected>2024 - 2025</option>
                                            <option>2025 - 2026</option>
                                        </select>
                                        <button className="text-sm text-indigo-600 font-semibold hover:text-indigo-800">Manage Years &rarr;</button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-gray-400" /> Default Class Duration
                                    </label>
                                    <select className="w-full rounded-xl border-gray-300 py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm">
                                        <option>40 Minutes</option>
                                        <option selected>45 Minutes</option>
                                        <option>50 Minutes</option>
                                        <option>60 Minutes</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Grading System</label>
                                    <select className="w-full rounded-xl border-gray-300 py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm">
                                        <option>Absolute (Percentage)</option>
                                        <option selected>GPA (4.0 Scale)</option>
                                        <option>GPA (10.0 Scale)</option>
                                        <option>Letter Grades (A-F)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'financial' && (
                        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="border-b border-gray-100 pb-5">
                                <h2 className="text-xl font-bold text-gray-900">Financial Configurations</h2>
                                <p className="text-sm text-gray-500 mt-1">Manage payment gateways, currencies, and invoice templates.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Primary Currency</label>
                                    <select className="w-full rounded-xl border-gray-300 py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm">
                                        <option>USD ($)</option>
                                        <option selected>INR (₹)</option>
                                        <option>EUR (€)</option>
                                        <option>GBP (£)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Prefix</label>
                                    <input type="text" defaultValue="INV-2425-" className="w-full rounded-xl border-gray-300 py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm" />
                                </div>
                            </div>

                            <div className="mt-8 border border-gray-200 rounded-2xl overflow-hidden">
                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">R</div>
                                        <h3 className="font-bold text-gray-900">Razorpay Integration</h3>
                                    </div>
                                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wider">Connected</span>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Live Key ID</label>
                                        <input type="password" defaultValue="rzp_live_xxxxxxxxxxx" className="w-full rounded-xl border-gray-300 py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed" disabled />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Live Key Secret</label>
                                        <input type="password" defaultValue="************************" className="w-full rounded-xl border-gray-300 py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed" disabled />
                                    </div>
                                    <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">Update Credentials</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                             <div className="border-b border-gray-100 pb-5">
                                <h2 className="text-xl font-bold text-gray-900">Notification Preferences</h2>
                                <p className="text-sm text-gray-500 mt-1">Configure automated alerts and communication channels.</p>
                            </div>

                            <div className="space-y-4">
                                {['Fee Reminders', 'Exam Results Published', 'Attendance Absences', 'System Updates'].map((item, idx) => (
                                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors gap-4">
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{item}</h4>
                                            <p className="text-sm text-gray-500">Automatically notify parents & students.</p>
                                        </div>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer" />
                                                <span className="text-sm text-gray-700 font-medium">Email</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" defaultChecked={idx % 2 === 0} className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer" />
                                                <span className="text-sm text-gray-700 font-medium">SMS</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer" />
                                                <span className="text-sm text-gray-700 font-medium">Push</span>
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="border-b border-gray-100 pb-5">
                                <h2 className="text-xl font-bold text-gray-900">Security & Authentication</h2>
                                <p className="text-sm text-gray-500 mt-1">Protect your institutional data with advanced security layers.</p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-200">
                                    <Shield className="h-6 w-6 text-gray-600 mt-0.5" />
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900">Two-Factor Authentication (2FA)</h4>
                                        <p className="text-sm text-gray-500 mt-1">Require staff members to use an authenticator app for login.</p>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                                            <input type="checkbox" name="toggle" id="toggle1" defaultChecked className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" />
                                            <label htmlFor="toggle1" className="toggle-label block overflow-hidden h-6 rounded-full bg-indigo-600 cursor-pointer"></label>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password Expiry Policy</label>
                                    <select className="w-full md:w-1/2 rounded-xl border-gray-300 py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm">
                                        <option>Never Expire</option>
                                        <option selected>Every 90 Days</option>
                                        <option>Every 180 Days</option>
                                        <option>Every 365 Days</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            <style>{`
                .toggle-checkbox:checked {
                    right: 0;
                    border-color: #4f46e5;
                }
                .toggle-checkbox:checked + .toggle-label {
                    background-color: #4f46e5;
                }
                .toggle-checkbox {
                    right: 0;
                    z-index: 1;
                    border-color: #e5e7eb;
                    transition: all 0.3s;
                }
                .toggle-label {
                    background-color: #e5e7eb;
                    transition: all 0.3s;
                }
            `}</style>
        </div>
    );
}
