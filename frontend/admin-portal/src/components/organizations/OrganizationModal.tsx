
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface OrganizationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    initialData?: any;
}

export default function OrganizationModal({ isOpen, onClose, onSave, initialData }: OrganizationModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        subdomain: '',
        phone: '',
        email: '',
        subscription_plan: 'BASIC',
        address_line1: '',
        city: '',
        state: '',
        country: 'India',
        postal_code: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    name: initialData.name || '',
                    subdomain: initialData.subdomain || '',
                    phone: initialData.phone || '',
                    email: initialData.email || '',
                    subscription_plan: initialData.subscription_plan || 'BASIC',
                    address_line1: initialData.address_line1 || '',
                    city: initialData.city || '',
                    state: initialData.state || '',
                    country: initialData.country || 'India',
                    postal_code: initialData.postal_code || ''
                });
            } else {
                setFormData({
                    name: '',
                    subdomain: '',
                    phone: '',
                    email: '',
                    subscription_plan: 'BASIC',
                    address_line1: '',
                    city: '',
                    state: '',
                    country: 'India',
                    postal_code: ''
                });
            }
        }
    }, [isOpen, initialData]);

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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {initialData ? 'Edit Organization' : 'New Organization'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Organization Name</label>
                        <input
                            type="text"
                            required
                            className="input w-full mt-1"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Subdomain</label>
                        <input
                            type="text"
                            required
                            className="input w-full mt-1"
                            value={formData.subdomain}
                            onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
                        />
                        <p className="text-xs text-gray-500 mt-1">Will be used as {formData.subdomain || 'subdomain'}.school.com</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                            <input
                                type="tel"
                                required
                                className="input w-full mt-1"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                required
                                className="input w-full mt-1"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Subscription Plan</label>
                        <select
                            className="input w-full mt-1"
                            value={formData.subscription_plan}
                            onChange={(e) => setFormData({ ...formData, subscription_plan: e.target.value })}
                        >
                            <option value="BASIC">Basic</option>
                            <option value="PREMIUM">Premium</option>
                            <option value="ENTERPRISE">Enterprise</option>
                        </select>
                    </div>

                    <div className="space-y-3 pt-2 border-t mt-2">
                        <h3 className="text-sm font-medium text-gray-900">Address</h3>
                        <div>
                            <input
                                type="text"
                                placeholder="Address Line 1"
                                className="input w-full"
                                value={formData.address_line1}
                                onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="City"
                                className="input w-full"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="State"
                                className="input w-full"
                                value={formData.state}
                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                placeholder="Postal Code"
                                required
                                className="input w-full"
                                value={formData.postal_code}
                                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Organization'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
