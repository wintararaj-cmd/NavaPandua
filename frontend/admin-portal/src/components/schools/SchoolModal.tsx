
import { useState, useEffect } from 'react';
import { X, Building2, MapPin, School as SchoolIcon, BookOpen, GraduationCap, Monitor } from 'lucide-react';
import { organizationService, type Organization } from '../../services/organizationService';

interface SchoolModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    initialData?: any;
}

export default function SchoolModal({ isOpen, onClose, onSave, initialData }: SchoolModalProps) {
    const [formData, setFormData] = useState({
        organization: '',
        name: '',
        code: '',
        institution_type: 'K12_SCHOOL',
        board: '',
        medium: 'English',
        phone: '',
        email: '',
        address_line1: '',
        city: '',
        state: '',
        country: 'India',
        postal_code: '',
        principal_name: '',
        chairman_name: '',
        chairman_email: '',
        chairman_phone: '',
        admin_email: '',
        admin_password: ''
    });
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchOrganizations();
            if (initialData) {
                setFormData({
                    organization: initialData.organization || '',
                    name: initialData.name || '',
                    code: initialData.code || '',
                    institution_type: initialData.institution_type || 'K12_SCHOOL',
                    board: initialData.board || '',
                    medium: initialData.medium || 'English',
                    phone: initialData.phone || '',
                    email: initialData.email || '',
                    address_line1: initialData.address_line1 || '',
                    city: initialData.city || '',
                    state: initialData.state || '',
                    country: initialData.country || 'India',
                    postal_code: initialData.postal_code || '',
                    principal_name: initialData.principal_name || '',
                    chairman_name: initialData.chairman_name || '',
                    chairman_email: initialData.chairman_email || '',
                    chairman_phone: initialData.chairman_phone || '',
                    admin_email: '', // Don't show password/admin email on edit
                    admin_password: ''
                });
            } else {
                setFormData({
                    organization: '',
                    name: '',
                    code: '',
                    institution_type: 'K12_SCHOOL',
                    board: '',
                    medium: 'English',
                    phone: '',
                    email: '',
                    address_line1: '',
                    city: '',
                    state: '',
                    country: 'India',
                    postal_code: '',
                    principal_name: '',
                    chairman_name: '',
                    chairman_email: '',
                    chairman_phone: '',
                    admin_email: '',
                    admin_password: ''
                });
            }
        }
    }, [isOpen, initialData]);

    const fetchOrganizations = async () => {
        try {
            const data = await organizationService.getOrganizations();
            const orgs = Array.isArray(data) ? data : data.results || [];
            console.log('Fetched organizations:', orgs);
            setOrganizations(orgs);
            
            // Auto-select if only one organization exists and none is selected
            if (orgs.length === 1 && !formData.organization && !initialData) {
                setFormData(prev => ({ ...prev, organization: orgs[0].id }));
            }
        } catch (error) {
            console.error('Failed to fetch organizations', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const institutionTypes = [
        { id: 'K12_SCHOOL', label: 'K-12 School', icon: GraduationCap },
        { id: 'TRAINING_CENTER', label: 'Computer/Training Center', icon: Monitor },
        { id: 'INSTITUTE', label: 'Institute', icon: BookOpen },
        { id: 'COLLEGE', label: 'College/University', icon: SchoolIcon }
    ];

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {initialData ? 'Edit Institution' : 'Register New Institution'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
                    {/* Organization Selection */}
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Parent Organization *</label>
                        <select
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                            value={formData.organization}
                            onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                            required
                        >
                            <option value="">Select Organization</option>
                            {organizations.map((org) => (
                                <option key={org.id} value={org.id}>
                                    {org.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Institution Type Card Selector */}
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Institution Type *</label>
                        <div className="grid grid-cols-2 gap-3">
                            {institutionTypes.map((type) => (
                                <button
                                    key={type.id}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, institution_type: type.id })}
                                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                                        formData.institution_type === type.id
                                            ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700'
                                            : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
                                    }`}
                                >
                                    <type.icon className={`w-5 h-5 ${formData.institution_type === type.id ? 'text-indigo-600' : 'text-gray-400'}`} />
                                    <span className="text-xs font-bold leading-tight">{type.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-1">Institution Name *</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g., Navadaya Computer Academy"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-1">Code *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g., NCA01"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all uppercase"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                />
                            </div>
                             <div>
                                 <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-1">Board/Affiliation</label>
                                 <select
                                     className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                     value={formData.board}
                                     onChange={(e) => setFormData({ ...formData, board: e.target.value })}
                                 >
                                     <option value="">Select Board</option>
                                     <option value="CBSE">CBSE</option>
                                     <option value="ICSE">ICSE</option>
                                     <option value="STATE">State Board</option>
                                     <option value="IB">IB</option>
                                     <option value="IGCSE">IGCSE</option>
                                 </select>
                             </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-1">Head of Institution / Principal Name</label>
                            <input
                                type="text"
                                placeholder="e.g., Dr. John Doe"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                value={formData.principal_name}
                                onChange={(e) => setFormData({ ...formData, principal_name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                        <div className="flex items-center gap-2 mb-4">
                            <Building2 className="w-4 h-4 text-indigo-600" />
                            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Chairman / Owner Details</h3>
                        </div>
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Chairman Name"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                value={formData.chairman_name}
                                onChange={(e) => setFormData({ ...formData, chairman_name: e.target.value })}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="email"
                                    placeholder="Chairman Email"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    value={formData.chairman_email}
                                    onChange={(e) => setFormData({ ...formData, chairman_email: e.target.value })}
                                />
                                <input
                                    type="tel"
                                    placeholder="Chairman Phone"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    value={formData.chairman_phone}
                                    onChange={(e) => setFormData({ ...formData, chairman_phone: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {!initialData && (
                        <div className="pt-6 border-t border-gray-100">
                            <div className="flex items-center gap-2 mb-4">
                                <X className="w-4 h-4 text-indigo-600" />
                                <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">School Admin Account</h3>
                            </div>
                            <div className="space-y-4">
                                <p className="text-xs text-gray-500 mb-2">This account will be used by the school to login and manage their institution.</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="email"
                                        required={!initialData}
                                        placeholder="Admin Email"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        value={formData.admin_email}
                                        onChange={(e) => setFormData({ ...formData, admin_email: e.target.value })}
                                    />
                                    <input
                                        type="password"
                                        required={!initialData}
                                        placeholder="Admin Password"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        value={formData.admin_password}
                                        onChange={(e) => setFormData({ ...formData, admin_password: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-1">Official Phone *</label>
                            <input
                                type="tel"
                                required
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-1">Official Email *</label>
                            <input
                                type="email"
                                required
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                        <div className="flex items-center gap-2 mb-4">
                            <MapPin className="w-4 h-4 text-indigo-600" />
                            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Address Details</h3>
                        </div>
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Street Address, Area"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                value={formData.address_line1}
                                onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="City"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="State"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    value={formData.state}
                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="ZIP / Postal Code"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono"
                                    value={formData.postal_code}
                                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="Country"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    value={formData.country}
                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-8 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : initialData ? 'Update Institution' : 'Register Institution'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
