import React, { useState, useEffect } from 'react';
import { 
    Save, Building2, GraduationCap, CreditCard, Bell, Shield, 
    Upload, Globe, Phone, Mail, MapPin, Calendar, Clock, Trash2, Plus,
    Layout, Palette, Image as ImageIcon, Eye, Loader2, BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast';
import { masterDataService, type MasterDataItem } from '../services/masterDataService';
import { settingsService, type SchoolSettings } from '../services/settingsService';
import { publicPageService, type SchoolPublicPage, type GalleryImage } from '../services/publicPageService';
import { authStore } from '../stores/authStore';


export default function Settings() {
    const [activeTab, setActiveTab] = useState<'general' | 'master_data' | 'public_page' | 'academic' | 'financial' | 'notifications' | 'security'>('general');
    const [isSaving, setIsSaving] = useState(false);
    const [settings, setSettings] = useState<SchoolSettings | null>(null);
    const [publicPage, setPublicPage] = useState<SchoolPublicPage | null>(null);
    const [loading, setLoading] = useState(true);

    const user = authStore(state => state.user);
    const schoolId = user?.school?.id || user?.school;

    useEffect(() => {
        if (schoolId) {
            fetchSettings();
            fetchPublicPage();
        }
    }, [schoolId]);

    const fetchSettings = async () => {
        if (!schoolId) return;
        try {
            setLoading(true);
            const data = await settingsService.getSettings(schoolId);
            setSettings(data);
        } catch (error) {
            console.error('Failed to fetch settings', error);
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const fetchPublicPage = async () => {
        if (!schoolId) return;
        try {
            const data = await publicPageService.getPublicPage(schoolId);
            setPublicPage(data);
        } catch (error) {
            console.error('Failed to fetch public page', error);
        }
    };

    const handleSave = async () => {
        if (!schoolId) return;
        try {
            setIsSaving(true);
            if (activeTab === 'public_page' && publicPage) {
                await publicPageService.updatePublicPage(schoolId, publicPage);
                toast.success('Public page updated successfully!');
            } else if (settings) {
                await settingsService.updateSettings(schoolId, settings);
                toast.success('Settings saved successfully!');
            }
        } catch (error) {
            console.error('Failed to save settings', error);
            toast.error('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };


    const tabs = [
        { id: 'general', label: 'General', icon: Building2 },
        { id: 'master_data', label: 'Master Data', icon: Palette },
        { id: 'public_page', label: 'Public Page', icon: Globe },
        { id: 'academic', label: 'Academic', icon: GraduationCap },
        { id: 'financial', label: 'Financial', icon: CreditCard },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Shield },
    ] as const;

    const [activeMasterDataTab, setActiveMasterDataTab] = useState('category');
    const [masterDataItems, setMasterDataItems] = useState<MasterDataItem[]>([]);
    const [newItemValue, setNewItemValue] = useState('');
    const [isMasterDataLoading, setIsMasterDataLoading] = useState(false);


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
                            </div>

                            <div className="border-t border-gray-100 pt-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">ID Generation Settings</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">App ID Prefix</label>
                                        <input 
                                            type="text" 
                                            value={settings?.application_id_prefix || ''} 
                                            onChange={(e) => setSettings(prev => prev ? {...prev, application_id_prefix: e.target.value} : null)}
                                            className="w-full rounded-xl border-gray-300 py-2 px-4 focus:ring-2 focus:ring-indigo-500 shadow-sm font-bold text-indigo-600" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Student ID Prefix</label>
                                        <input 
                                            type="text" 
                                            value={settings?.student_id_prefix || ''} 
                                            onChange={(e) => setSettings(prev => prev ? {...prev, student_id_prefix: e.target.value} : null)}
                                            className="w-full rounded-xl border-gray-300 py-2 px-4 focus:ring-2 focus:ring-indigo-500 shadow-sm font-bold text-indigo-600" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Teacher ID Prefix</label>
                                        <input 
                                            type="text" 
                                            value={settings?.teacher_id_prefix || ''} 
                                            onChange={(e) => setSettings(prev => prev ? {...prev, teacher_id_prefix: e.target.value} : null)}
                                            className="w-full rounded-xl border-gray-300 py-2 px-4 focus:ring-2 focus:ring-indigo-500 shadow-sm font-bold text-indigo-600" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">ID Number Length</label>
                                        <input 
                                            type="number" 
                                            value={settings?.id_number_length || 6} 
                                            onChange={(e) => setSettings(prev => prev ? {...prev, id_number_length: parseInt(e.target.value)} : null)}
                                            className="w-full rounded-xl border-gray-300 py-2 px-4 focus:ring-2 focus:ring-indigo-500 shadow-sm font-bold" 
                                        />
                                    </div>
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

                    {activeTab === 'public_page' && (
                        <div className="p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="border-b border-gray-100 pb-6 flex justify-between items-end">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Public Webpage Control</h2>
                                    <p className="text-sm text-gray-500 mt-2">Design and customize your institute's public identity.</p>
                                </div>
                                <div className="flex gap-4">
                                    <a 
                                        href={`http://localhost:5175/school/${publicPage?.school_code}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all shadow-sm active:scale-95"
                                    >
                                        <Eye className="h-4 w-4" /> Live Preview
                                    </a>
                                    <button 
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 disabled:opacity-50"
                                    >
                                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                        Save Changes
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                {/* Branding Section */}
                                <div className="lg:col-span-1 space-y-8">
                                    <div className="bg-gray-50 rounded-[32px] p-8 border border-gray-100">
                                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-8 flex items-center gap-2">
                                            <Shield className="h-4 w-4 text-indigo-500" /> School Identity
                                        </h3>
                                        
                                        <div className="space-y-8">
                                            <div className="flex flex-col items-center text-center">
                                                <div className="relative group">
                                                    <div className="h-32 w-32 bg-white rounded-3xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-indigo-400">
                                                        {publicPage?.school_logo ? (
                                                            <img src={publicPage.school_logo} alt="Logo" className="h-full w-full object-contain p-4" />
                                                        ) : (
                                                            <GraduationCap className="h-12 w-12 text-gray-300" />
                                                        )}
                                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                                            <span className="text-white text-[10px] font-black uppercase tracking-widest">Change Logo</span>
                                                        </div>
                                                        <input 
                                                            type="file" 
                                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                                            accept="image/*"
                                                            onChange={async (e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file && schoolId) {
                                                                    const formData = new FormData();
                                                                    formData.append('logo', file);
                                                                    try {
                                                                        await publicPageService.updateSchoolIdentity(schoolId, formData);
                                                                        toast.success('Logo updated!');
                                                                        fetchPublicPage();
                                                                    } catch (err) {
                                                                        toast.error('Failed to update logo');
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="mt-6">
                                                    <h4 className="text-sm font-bold text-gray-900">Official Logo</h4>
                                                    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">PNG or SVG, Max 2MB</p>
                                                </div>
                                            </div>

                                            <div className="space-y-4 pt-4 border-t border-gray-200/50">
                                                <div>
                                                    <label className="block text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Institute Name</label>
                                                    <input 
                                                        type="text" 
                                                        value={publicPage?.school_name || ''} 
                                                        readOnly
                                                        className="w-full bg-white rounded-xl border-gray-200 py-3 px-4 text-sm font-bold text-gray-700 shadow-sm cursor-not-allowed opacity-70"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">School Code</label>
                                                    <input 
                                                        type="text" 
                                                        value={publicPage?.school_code || ''} 
                                                        readOnly
                                                        className="w-full bg-white rounded-xl border-gray-200 py-3 px-4 text-sm font-mono text-gray-500 shadow-sm cursor-not-allowed"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-indigo-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -mr-16 -mt-16 rounded-full" />
                                        <h3 className="text-[10px] font-black uppercase tracking-widest mb-6 opacity-60">Branding Preview</h3>
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center">
                                                <div className="h-6 w-6 rounded-md" style={{ backgroundColor: publicPage?.primary_color }} />
                                            </div>
                                            <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center">
                                                <div className="h-6 w-6 rounded-md" style={{ backgroundColor: publicPage?.secondary_color }} />
                                            </div>
                                        </div>
                                        <p className="text-xs font-medium text-white/70 leading-relaxed">
                                            These colors will be used for buttons, links, and background accents on your public page.
                                        </p>
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="lg:col-span-2 space-y-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                            <Palette className="h-4 w-4 text-indigo-500" /> Theme Colors
                                        </label>
                                        <div className="grid grid-cols-2 gap-8">
                                            <div>
                                                <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest block mb-2">Primary Color</span>
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div 
                                                        className="h-12 w-12 rounded-xl shadow-inner border border-gray-100 flex-shrink-0 relative overflow-hidden"
                                                        style={{ backgroundColor: publicPage?.primary_color || '#1e40af' }}
                                                    >
                                                        <input 
                                                            type="color" 
                                                            value={publicPage?.primary_color || '#1e40af'} 
                                                            onChange={(e) => setPublicPage(prev => prev ? {...prev, primary_color: e.target.value} : null)}
                                                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                                        />
                                                    </div>
                                                    <input 
                                                        type="text" 
                                                        value={publicPage?.primary_color || ''} 
                                                        onChange={(e) => setPublicPage(prev => prev ? {...prev, primary_color: e.target.value} : null)}
                                                        className="flex-1 rounded-xl border-gray-300 py-2.5 px-4 text-sm font-mono focus:ring-2 focus:ring-indigo-500 shadow-sm"
                                                    />
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {['#1e40af', '#b91c1c', '#15803d', '#7c3aed', '#db2777', '#ea580c'].map(c => (
                                                        <button 
                                                            key={c}
                                                            onClick={() => setPublicPage(prev => prev ? {...prev, primary_color: c} : null)}
                                                            className="h-6 w-6 rounded-full border border-gray-200 hover:scale-110 transition-transform shadow-sm"
                                                            style={{ backgroundColor: c }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest block mb-2">Secondary Color</span>
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div 
                                                        className="h-12 w-12 rounded-xl shadow-inner border border-gray-100 flex-shrink-0 relative overflow-hidden"
                                                        style={{ backgroundColor: publicPage?.secondary_color || '#1e293b' }}
                                                    >
                                                        <input 
                                                            type="color" 
                                                            value={publicPage?.secondary_color || '#1e293b'} 
                                                            onChange={(e) => setPublicPage(prev => prev ? {...prev, secondary_color: e.target.value} : null)}
                                                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                                        />
                                                    </div>
                                                    <input 
                                                        type="text" 
                                                        value={publicPage?.secondary_color || ''} 
                                                        onChange={(e) => setPublicPage(prev => prev ? {...prev, secondary_color: e.target.value} : null)}
                                                        className="flex-1 rounded-xl border-gray-300 py-2.5 px-4 text-sm font-mono focus:ring-2 focus:ring-indigo-500 shadow-sm"
                                                    />
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {['#1e293b', '#334155', '#475569', '#0f172a', '#18181b', '#27272a'].map(c => (
                                                        <button 
                                                            key={c}
                                                            onClick={() => setPublicPage(prev => prev ? {...prev, secondary_color: c} : null)}
                                                            className="h-6 w-6 rounded-full border border-gray-200 hover:scale-110 transition-transform shadow-sm"
                                                            style={{ backgroundColor: c }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Slogan / Tagline</label>
                                        <input 
                                            type="text" 
                                            value={publicPage?.school?.slogan || publicPage?.school_slogan || ''} 
                                            onChange={(e) => setPublicPage(prev => prev ? {...prev, school: {...(prev.school || {}), slogan: e.target.value}} : null)}
                                            className="w-full rounded-xl border-gray-300 py-3 px-4 focus:ring-2 focus:ring-indigo-500 shadow-sm text-sm"
                                            placeholder="A short, catchy phrase about your school"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Vision Statement</label>
                                        <textarea 
                                            rows={3} 
                                            value={publicPage?.vision || ''} 
                                            onChange={(e) => setPublicPage(prev => prev ? {...prev, vision: e.target.value} : null)}
                                            className="w-full rounded-xl border-gray-300 py-3 px-4 focus:ring-2 focus:ring-indigo-500 shadow-sm text-sm"
                                            placeholder="Where do you see your institute in the future?"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Mission Statement</label>
                                        <textarea 
                                            rows={3} 
                                            value={publicPage?.mission || ''} 
                                            onChange={(e) => setPublicPage(prev => prev ? {...prev, mission: e.target.value} : null)}
                                            className="w-full rounded-xl border-gray-300 py-3 px-4 focus:ring-2 focus:ring-indigo-500 shadow-sm text-sm"
                                            placeholder="What is your current objective and approach?"
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Principal Name</label>
                                            <input 
                                                type="text" 
                                                value={publicPage?.school?.principal_name || publicPage?.school_principal_name || ''} 
                                                onChange={(e) => setPublicPage(prev => prev ? {...prev, school: {...(prev.school || {}), principal_name: e.target.value}} : null)}
                                                className="w-full rounded-xl border-gray-300 py-3 px-4 focus:ring-2 focus:ring-indigo-500 shadow-sm text-sm"
                                                placeholder="e.g. Dr. Jane Smith"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Established Year</label>
                                            <input 
                                                type="number" 
                                                value={publicPage?.school?.established_year || publicPage?.school_established_year || ''} 
                                                onChange={(e) => setPublicPage(prev => prev ? {...prev, school: {...(prev.school || {}), established_year: parseInt(e.target.value) || null}} : null)}
                                                className="w-full rounded-xl border-gray-300 py-3 px-4 focus:ring-2 focus:ring-indigo-500 shadow-sm text-sm"
                                                placeholder="e.g. 1995"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Official Website</label>
                                        <input 
                                            type="url" 
                                            value={publicPage?.school?.website || publicPage?.school_website || ''} 
                                            onChange={(e) => setPublicPage(prev => prev ? {...prev, school: {...(prev.school || {}), website: e.target.value}} : null)}
                                            className="w-full rounded-xl border-gray-300 py-3 px-4 focus:ring-2 focus:ring-indigo-500 shadow-sm text-sm"
                                            placeholder="https://www.yourschool.edu"
                                        />
                                    </div>
                                </div>

                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                            <BookOpen className="h-4 w-4 text-indigo-500" /> About Our Institute
                                        </label>
                                        <textarea 
                                            rows={14} 
                                            value={publicPage?.about_text || ''} 
                                            onChange={(e) => setPublicPage(prev => prev ? {...prev, about_text: e.target.value} : null)}
                                            className="w-full rounded-[24px] border-gray-200 py-4 px-6 focus:ring-2 focus:ring-indigo-500 shadow-sm text-sm leading-relaxed"
                                            placeholder="Tell the world about your institute's history, values, and facilities..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-8">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                            <ImageIcon className="h-5 w-5 text-indigo-500" /> Image Gallery
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">Showcase your campus, activities, and infrastructure.</p>
                                    </div>
                                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 cursor-pointer transition-colors shadow-md shadow-indigo-200">
                                        <Plus className="h-4 w-4" /> Add Image
                                        <input 
                                            type="file" 
                                            className="hidden" 
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file && schoolId) {
                                                    const formData = new FormData();
                                                    formData.append('image', file);
                                                    formData.append('caption', file.name.split('.')[0]);
                                                    try {
                                                        await publicPageService.uploadGalleryImage(schoolId, formData);
                                                        toast.success('Image uploaded!');
                                                        fetchPublicPage();
                                                    } catch (err) {
                                                        toast.error('Failed to upload image');
                                                    }
                                                }
                                            }}
                                        />
                                    </label>
                                </div>

                                {publicPage?.gallery_images && publicPage.gallery_images.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {publicPage?.gallery_images?.map((img) => (
                                            <div key={img.id} className="relative group aspect-square rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                                <img src={img.image} alt={img.caption} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    <button 
                                                        onClick={async () => {
                                                            if (window.confirm('Delete this image?') && schoolId) {
                                                                try {
                                                                    await publicPageService.deleteGalleryImage(schoolId, img.id);
                                                                    toast.success('Image deleted');
                                                                    fetchPublicPage();
                                                                } catch (err) {
                                                                    toast.error('Failed to delete');
                                                                }
                                                            }
                                                        }}
                                                        className="p-2 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-red-500 transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                                                    <p className="text-[10px] text-white truncate font-medium">{img.caption}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
                                        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                                            <ImageIcon className="h-6 w-6 text-gray-400" />
                                        </div>
                                        <p className="text-gray-500 font-medium">No images in your gallery yet.</p>
                                        <p className="text-xs text-gray-400 mt-1">Upload photos to showcase your institute to potential students.</p>
                                    </div>
                                )}
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
