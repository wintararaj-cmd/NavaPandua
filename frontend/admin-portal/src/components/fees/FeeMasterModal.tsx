
import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { feeService, type FeeGroup, type FeeType } from '../../services/feeService';
import toast from 'react-hot-toast';

interface FeeMasterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function FeeMasterModal({ isOpen, onClose, onSuccess }: FeeMasterModalProps) {
    const [loading, setLoading] = useState(false);
    const [groups, setGroups] = useState<FeeGroup[]>([]);
    const [types, setTypes] = useState<FeeType[]>([]);

    const [formData, setFormData] = useState({
        fee_group: '',
        fee_type: '',
        amount: '',
        due_date: '',
        fine_type: 'NONE',
        fine_amount: '0'
    });

    useEffect(() => {
        if (isOpen) {
            fetchDependencies();
        }
    }, [isOpen]);

    const fetchDependencies = async () => {
        try {
            const [groupsData, typesData] = await Promise.all([
                feeService.getGroups(),
                feeService.getTypes()
            ]);
            setGroups(groupsData.results || []);
            setTypes(typesData.results || []);
        } catch (error) {
            toast.error('Failed to load fee groups or types');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            await feeService.createMaster({
                ...formData,
                amount: parseFloat(formData.amount),
                fine_amount: parseFloat(formData.fine_amount)
            });
            toast.success('Fee structure created successfully');
            onSuccess();
            onClose();
            setFormData({
                fee_group: '',
                fee_type: '',
                amount: '',
                due_date: '',
                fine_type: 'NONE',
                fine_amount: '0'
            });
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create fee structure');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Add Fee Structure</h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fee Group</label>
                                    <select
                                        className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                        value={formData.fee_group}
                                        onChange={(e) => setFormData({ ...formData, fee_group: e.target.value })}
                                    >
                                        <option value="">Select Group</option>
                                        {groups.map(g => (
                                            <option key={g.id} value={g.id}>{g.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fee Type</label>
                                    <select
                                        className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                        value={formData.fee_type}
                                        onChange={(e) => setFormData({ ...formData, fee_type: e.target.value })}
                                    >
                                        <option value="">Select Type</option>
                                        {types.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                                    <input
                                        type="number"
                                        className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="0.00"
                                        required
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                        value={formData.due_date}
                                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Fine Type</label>
                                        <select
                                            className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                            value={formData.fine_type}
                                            onChange={(e) => setFormData({ ...formData, fine_type: e.target.value })}
                                        >
                                            <option value="NONE">None</option>
                                            <option value="FIXED">Fixed Amount</option>
                                            <option value="PERCENTAGE">Percentage</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Fine Value</label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                            disabled={formData.fine_type === 'NONE'}
                                            value={formData.fine_amount}
                                            onChange={(e) => setFormData({ ...formData, fine_amount: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                                >
                                    {loading ? (
                                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <Save className="h-4 w-4" />
                                    )}
                                    Save Structure
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
